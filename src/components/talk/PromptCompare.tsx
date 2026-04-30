import { useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import useBaseUrl from "@docusaurus/useBaseUrl";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { normalizePrompt } from "./normalizePrompt";

interface PromptColumnProps {
  title: string;
  body: string;
}

const markdownComponents = {
  h1: (props: any) => (
    <Box
      component="h1"
      sx={{
        fontFamily: '"Barlow", sans-serif',
        fontSize: "1.05rem",
        fontWeight: 700,
        mt: 2.5,
        mb: 1,
        color: "#1c252e",
        letterSpacing: "-0.01em",
      }}
      {...props}
    />
  ),
  h2: (props: any) => (
    <Box
      component="h2"
      sx={{
        fontFamily: '"Barlow", sans-serif',
        fontSize: "0.95rem",
        fontWeight: 700,
        mt: 2,
        mb: 0.75,
        color: "#1c252e",
      }}
      {...props}
    />
  ),
  h3: (props: any) => (
    <Box
      component="h3"
      sx={{
        fontFamily: '"Barlow", sans-serif',
        fontSize: "0.85rem",
        fontWeight: 700,
        mt: 1.5,
        mb: 0.5,
        color: "#1c252e",
      }}
      {...props}
    />
  ),
  p: (props: any) => (
    <Box
      component="p"
      sx={{
        my: 0.75,
        color: "#37424a",
        lineHeight: 1.55,
      }}
      {...props}
    />
  ),
  ul: (props: any) => (
    <Box
      component="ul"
      sx={{
        my: 0.75,
        pl: 2.5,
        color: "#37424a",
        "& li": { mb: 0.25 },
      }}
      {...props}
    />
  ),
  ol: (props: any) => (
    <Box
      component="ol"
      sx={{
        my: 0.75,
        pl: 2.5,
        color: "#37424a",
        "& li": { mb: 0.25 },
      }}
      {...props}
    />
  ),
  li: (props: any) => (
    <Box component="li" sx={{ lineHeight: 1.5 }} {...props} />
  ),
  strong: (props: any) => (
    <Box
      component="strong"
      sx={{ fontWeight: 700, color: "#1c252e" }}
      {...props}
    />
  ),
  em: (props: any) => (
    <Box component="em" sx={{ fontStyle: "italic" }} {...props} />
  ),
  code: ({ inline, ...props }: any) =>
    inline ? (
      <Box
        component="code"
        sx={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "0.85em",
          bgcolor: "rgba(0, 0, 0, 0.05)",
          px: 0.6,
          py: 0.15,
          borderRadius: 0.5,
          color: "#1c252e",
        }}
        {...props}
      />
    ) : (
      <Box
        component="code"
        sx={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "inherit",
          color: "inherit",
          whiteSpace: "pre",
        }}
        {...props}
      />
    ),
  pre: (props: any) => (
    <Box
      component="pre"
      sx={{
        my: 1,
        p: 1.25,
        bgcolor: "#f4f6f8",
        border: "1px solid rgba(0, 0, 0, 0.06)",
        borderRadius: 0.75,
        overflowX: "auto",
        fontFamily: "ui-monospace, Menlo, monospace",
        fontSize: "0.78em",
        lineHeight: 1.5,
        color: "#1c252e",
      }}
      {...props}
    />
  ),
  hr: () => (
    <Box
      component="hr"
      sx={{
        my: 1.5,
        border: 0,
        borderTop: "1px solid rgba(0, 0, 0, 0.08)",
      }}
    />
  ),
  blockquote: (props: any) => (
    <Box
      component="blockquote"
      sx={{
        my: 1,
        pl: 1.5,
        borderLeft: "3px solid rgba(0, 0, 0, 0.12)",
        color: "#454f5b",
        fontStyle: "italic",
      }}
      {...props}
    />
  ),
  a: (props: any) => (
    <Box
      component="a"
      sx={{
        color: "#00A76F",
        textDecoration: "underline",
        textDecorationColor: "rgba(0, 167, 111, 0.4)",
      }}
      {...props}
    />
  ),
};

const PromptColumn = ({ title, body }: PromptColumnProps) => (
  <Box
    sx={{
      flex: 1,
      minWidth: 0,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      bgcolor: "#ffffff",
      border: "1px solid rgba(0, 0, 0, 0.1)",
      borderRadius: 1,
      overflow: "hidden",
    }}
  >
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
        bgcolor: "#fafbfc",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
      }}
    >
      <Typography
        sx={{
          fontFamily: '"Barlow", sans-serif',
          fontSize: "clamp(0.75rem, 0.95vw, 1rem)",
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: "#1c252e",
        }}
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "clamp(0.65rem, 0.7vw, 0.8rem)",
          color: "rgba(28, 37, 46, 0.5)",
        }}
      >
        {body ? `${body.split("\n").length} lines` : "loading..."}
      </Typography>
    </Box>
    <Box
      className="talk-prompt-panel"
      sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        px: 2.5,
        py: 1.5,
        fontSize: "clamp(0.7rem, 0.78vw, 0.92rem)",
      }}
    >
      {body ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {body}
        </ReactMarkdown>
      ) : (
        <Box sx={{ color: "rgba(28, 37, 46, 0.5)" }}>loading...</Box>
      )}
    </Box>
  </Box>
);

export default function PromptCompare() {
  const ccUrl = useBaseUrl("/talk/claude-code-baseline.txt");
  const caiUrl = useBaseUrl("/talk/claude-ai-baseline.txt");
  const [code, setCode] = useState("");
  const [chat, setChat] = useState("");

  useEffect(() => {
    fetch(ccUrl)
      .then((r) => r.text())
      .then(setCode)
      .catch(() => {});
    fetch(caiUrl)
      .then((r) => r.text())
      .then(setChat)
      .catch(() => {});
  }, [ccUrl, caiUrl]);

  const codeFmt = useMemo(() => (code ? normalizePrompt(code) : ""), [code]);
  const chatFmt = useMemo(() => (chat ? normalizePrompt(chat) : ""), [chat]);

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        py: "3%",
        display: "flex",
        flexDirection: "column",
        gap: "1.5%",
      }}
    >
      <Box sx={{ flex: 1, display: "flex", gap: "2%", minHeight: 0 }}>
        <PromptColumn title="claude.ai" body={chatFmt} />
        <PromptColumn title="claude code" body={codeFmt} />
      </Box>
    </Box>
  );
}
