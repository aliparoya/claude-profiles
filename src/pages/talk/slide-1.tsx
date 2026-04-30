import Layout from "@theme/Layout";
import { Typography } from "@mui/material";
import SlideFrame from "@site/src/components/talk/SlideFrame";

export default function Slide1() {
  return (
    <Layout title="Context is context" noFooter>
      <SlideFrame
        next="/talk/slide-2"
        imageSlug="talk-slide-1"
        letterbox="#e6dcc6"
      >
        <Typography
          sx={{
            fontFamily: '"Barlow", sans-serif',
            fontWeight: 700,
            fontSize: "clamp(2.5rem, 6.5vw, 6rem)",
            lineHeight: 1.02,
            letterSpacing: "-0.02em",
            textShadow: "0 2px 24px rgba(0, 0, 0, 0.5)",
          }}
        >
          Context is context.
        </Typography>
        <Typography
          sx={{
            mt: 1.5,
            fontSize: "clamp(1rem, 1.8vw, 1.75rem)",
            fontWeight: 400,
            opacity: 0.92,
            textShadow: "0 1px 12px rgba(0, 0, 0, 0.5)",
          }}
        >
          Regardless of where it comes from.
        </Typography>
      </SlideFrame>
    </Layout>
  );
}
