import Layout from "@theme/Layout";
import SlideFrame from "@site/src/components/talk/SlideFrame";
import PromptCompare from "@site/src/components/talk/PromptCompare";

export default function Slide2() {
  return (
    <Layout title="Two prompts" noFooter>
      <SlideFrame
        prev="/talk/slide-1"
        next="/talk/slide-3"
        letterbox="#f4f6f8"
        fullBleed
        navWidth="6%"
      >
        <PromptCompare />
      </SlideFrame>
    </Layout>
  );
}
