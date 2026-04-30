import Layout from "@theme/Layout";
import SlideFrame from "@site/src/components/talk/SlideFrame";
import ProfileExplorer from "@site/src/components/talk/ProfileExplorer";

export default function Slide3() {
  return (
    <Layout title="Profiles" noFooter>
      <SlideFrame
        prev="/talk/slide-2"
        letterbox="#f4f6f8"
        fullBleed
        navWidth="6%"
      >
        <ProfileExplorer />
      </SlideFrame>
    </Layout>
  );
}
