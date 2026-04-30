import type { ReactNode } from "react";
import clsx from "clsx";
import Heading from "@theme/Heading";
import styles from "./styles.module.css";

interface FeatureItem {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<"svg">>;
  description: ReactNode;
}

const FeatureList: FeatureItem[] = [
  {
    title: "One canonical source",
    Svg: require("@site/static/img/undraw_docusaurus_mountain.svg").default,
    description: (
      <>
        Standards, decisions, specs, and guidance for the project in a single
        searchable place instead of scattered markdown across repos.
      </>
    ),
  },
  {
    title: "Diagrams, math, slides",
    Svg: require("@site/static/img/undraw_docusaurus_react.svg").default,
    description: (
      <>
        Mermaid for diagrams, KaTeX for LaTeX, and inline slide decks authored as MDX.
        A page, a formula, or a presentation all take the same authoring path.
      </>
    ),
  },
];

function Feature({ title, Svg, description }: FeatureItem): ReactNode {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
