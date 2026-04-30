import { useEffect, type ReactNode } from "react";
import { Box } from "@mui/material";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import useBaseUrl from "@docusaurus/useBaseUrl";

const TALK_HEAD_STYLES = `
  .navbar, .footer { display: none !important; }
  :root { --ifm-navbar-height: 0px !important; }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    overflow-x: hidden !important;
  }
  body .main-wrapper,
  body main.container,
  body main.container--fluid,
  body main.margin-vert--lg,
  body main.margin-vert--md,
  body main.margin-vert--sm {
    margin: 0 !important;
    padding: 0 !important;
    min-height: 0 !important;
  }
  .row, [class*="mdxPageWrapper"] { margin: 0 !important; padding: 0 !important; }
  html { -ms-overflow-style: none; scrollbar-width: none; }
  html::-webkit-scrollbar { display: none; }
  .talk-prompt-panel::-webkit-scrollbar { width: 8px; }
  .talk-prompt-panel::-webkit-scrollbar-track { background: transparent; }
  .talk-prompt-panel::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
  .talk-prompt-panel::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
  }
`;

const StripChrome = () => {
  useEffect(() => {
    const main = document.querySelector("main");
    if (main) {
      main.classList.remove("margin-vert--lg", "container", "container--fluid");
      main.style.margin = "0";
      main.style.padding = "0";
      main.style.maxWidth = "none";
    }
    const row = document.querySelector('[class*="mdxPageWrapper"]');
    if (row instanceof HTMLElement) {
      row.style.margin = "0";
      row.style.padding = "0";
    }
  }, []);
  return null;
};

interface SlideFrameProps {
  prev?: string;
  next?: string;
  imageSlug?: string;
  letterbox?: string;
  fullBleed?: boolean;
  navWidth?: string;
  children: ReactNode;
}

export default function SlideFrame({
  prev,
  next,
  imageSlug,
  letterbox = "#0a0a0a",
  fullBleed = false,
  navWidth = "50%",
  children,
}: SlideFrameProps) {
  const hero = useBaseUrl(imageSlug ? `/img/generated/${imageSlug}.jpg` : "");

  const contentSx = fullBleed
    ? {
        position: "absolute" as const,
        top: 0,
        bottom: 0,
        left: navWidth,
        right: navWidth,
        zIndex: 1,
      }
    : {
        position: "absolute" as const,
        left: { xs: "4%", md: "6%" },
        right: { xs: "4%", md: "6%" },
        bottom: { xs: "6%", md: "8%" },
        zIndex: 1,
        maxWidth: "70%",
      };

  return (
    <>
      <Head>
        <style>{TALK_HEAD_STYLES}</style>
      </Head>
      <StripChrome />
      <Box
        component="section"
        sx={{
          height: "100vh",
          width: "100vw",
          bgcolor: letterbox,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "relative",
            aspectRatio: "16 / 9",
            width: "min(100vw, calc(100vh * 16 / 9))",
            height: "min(100vh, calc(100vw * 9 / 16))",
            overflow: "hidden",
            color: "common.white",
          }}
        >
          {imageSlug ? (
            <>
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${hero})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0) 65%, rgba(0,0,0,0.65) 100%)",
                }}
              />
            </>
          ) : null}
          <Box sx={contentSx}>{children}</Box>
          {prev ? (
            <Box
              component={Link}
              to={prev}
              aria-label="Previous slide"
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: navWidth,
                zIndex: 2,
                cursor: "pointer",
              }}
            />
          ) : (
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                bottom: 0,
                width: navWidth,
                zIndex: 2,
              }}
            />
          )}
          {next ? (
            <Box
              component={Link}
              to={next}
              aria-label="Next slide"
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: navWidth,
                zIndex: 2,
                cursor: "pointer",
              }}
            />
          ) : (
            <Box
              aria-hidden
              sx={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                width: navWidth,
                zIndex: 2,
              }}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
