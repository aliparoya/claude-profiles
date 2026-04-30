import { Box, Typography } from "@mui/material";

interface CodePanelProps {
  title: string;
  caption?: string;
  body: string;
}

const CodePanel = ({ title, caption, body }: CodePanelProps) => (
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
      {caption ? (
        <Typography
          sx={{
            fontFamily: "ui-monospace, Menlo, monospace",
            fontSize: "clamp(0.65rem, 0.7vw, 0.8rem)",
            color: "rgba(28, 37, 46, 0.5)",
          }}
        >
          {caption}
        </Typography>
      ) : null}
    </Box>
    <Box
      className="talk-prompt-panel"
      sx={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
        px: 2.5,
        py: 1.5,
      }}
    >
      <Box
        component="pre"
        sx={{
          margin: 0,
          fontFamily: "ui-monospace, Menlo, monospace",
          fontSize: "clamp(0.8rem, 0.95vw, 1.1rem)",
          lineHeight: 1.55,
          color: "#1c252e",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {body}
      </Box>
    </Box>
  </Box>
);

interface CodeCompareProps {
  left: CodePanelProps;
  right: CodePanelProps;
}

export default function CodeCompare({ left, right }: CodeCompareProps) {
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
        <CodePanel {...left} />
        <CodePanel {...right} />
      </Box>
    </Box>
  );
}
