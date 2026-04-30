import { Children, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import type { ReactElement, ReactNode, KeyboardEvent } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

interface SlideProps {
  children: ReactNode;
}

export function Slide({ children }: SlideProps): ReactElement {
  return <>{children}</>;
}

interface SlideTitleProps {
  children: ReactNode;
  as?: "h2" | "h3";
}

export function SlideTitle({ children, as = "h2" }: SlideTitleProps): ReactElement {
  const Tag = as;
  return <Tag className={styles.slideTitle}>{children}</Tag>;
}

interface SlideDeckProps {
  children: ReactNode;
}

export function SlideDeck({ children }: SlideDeckProps): ReactElement {
  const slides = Children.toArray(children).filter(
    (child): child is ReactElement<SlideProps> =>
      isValidElement(child) && child.type === Slide,
  );

  const total = slides.length;
  const [index, setIndex] = useState(0);
  const deckRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (next: number) => {
      setIndex((prev) => Math.max(0, Math.min(total - 1, next)));
    },
    [total],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (index > total - 1) {
      setIndex(Math.max(0, total - 1));
    }
  }, [index, total]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "ArrowRight" || event.key === " ") {
      event.preventDefault();
      next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      prev();
    } else if (event.key === "Home") {
      event.preventDefault();
      goTo(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goTo(total - 1);
    }
  };

  if (total === 0) {
    return <div className={styles.deck}>No slides</div>;
  }

  return (
    <div
      ref={deckRef}
      className={styles.deck}
      role="region"
      aria-roledescription="slide deck"
      aria-label={`Slide deck, ${total} slides`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className={styles.stage}>
        {slides.map((slide, i) => (
          <div
            key={i}
            className={clsx(styles.slide, i === index && styles.slideActive)}
            aria-hidden={i !== index}
          >
            {slide.props.children}
          </div>
        ))}
      </div>

      <button
        type="button"
        className={clsx(styles.zone, styles.zonePrev)}
        onClick={prev}
        disabled={index === 0}
        aria-label="Previous slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="15 6 9 12 15 18" />
        </svg>
      </button>
      <button
        type="button"
        className={clsx(styles.zone, styles.zoneNext)}
        onClick={next}
        disabled={index === total - 1}
        aria-label="Next slide"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <polyline points="9 6 15 12 9 18" />
        </svg>
      </button>

      <div className={styles.footer}>
        <div className={styles.dots} role="tablist" aria-label="Slide navigation">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              className={clsx(styles.dot, i === index && styles.dotActive)}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              aria-selected={i === index}
              role="tab"
            />
          ))}
        </div>
        <div className={styles.counter}>
          {index + 1} / {total}
        </div>
      </div>
    </div>
  );
}

Slide.displayName = "Slide";

export default SlideDeck;
