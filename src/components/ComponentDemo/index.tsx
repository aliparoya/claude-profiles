import type { ReactNode } from "react";

import BrowserOnly from "@docusaurus/BrowserOnly";
import Box from "@mui/material/Box";
import ScopedCssBaseline from "@mui/material/ScopedCssBaseline";

interface ComponentDemoProps {
  children: ReactNode;
  /** Optional align override; default centers content. */
  align?: "start" | "center" | "end";
  /** Visual height hint; useful for tall components like data grids. */
  minHeight?: number;
}

const FALLBACK_HEIGHT = 80;

export default function ComponentDemo({
  children,
  align = "center",
  minHeight = FALLBACK_HEIGHT,
}: ComponentDemoProps): React.JSX.Element {
  return (
    <BrowserOnly
      fallback={
        <DemoFrame align={align} minHeight={minHeight}>
          <em>Loading demo…</em>
        </DemoFrame>
      }
    >
      {() => (
        <ScopedCssBaseline enableColorScheme>
          <DemoFrame align={align} minHeight={minHeight}>
            {children}
          </DemoFrame>
        </ScopedCssBaseline>
      )}
    </BrowserOnly>
  );
}

interface DemoFrameProps {
  children: ReactNode;
  align: "start" | "center" | "end";
  minHeight: number;
}

function DemoFrame({
  children,
  align,
  minHeight,
}: DemoFrameProps): React.JSX.Element {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : `flex-${align}`,
        justifyContent: "center",
        gap: 2,
        p: 3,
        my: 2,
        minHeight,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      {children}
    </Box>
  );
}
