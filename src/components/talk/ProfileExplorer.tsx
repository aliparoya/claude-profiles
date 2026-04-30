import { useState } from "react";
import { Box, Typography } from "@mui/material";
import {
  profiles,
  fileForProfile,
  expansionForProfile,
  type Profile,
} from "./profiles";

const monoStack = "ui-monospace, Menlo, monospace";

interface ProfileRowProps {
  profile: Profile;
  expanded: boolean;
  onToggle: () => void;
  isLast: boolean;
}

const ProfileRow = ({ profile, expanded, onToggle, isLast }: ProfileRowProps) => (
  <Box>
    <Box
      onClick={onToggle}
      sx={{
        cursor: "pointer",
        px: 2,
        py: 1.1,
        display: "flex",
        gap: 1.5,
        alignItems: "baseline",
        bgcolor: expanded ? "#eef1f4" : "transparent",
        borderBottom:
          expanded || !isLast ? "1px solid rgba(0, 0, 0, 0.06)" : "none",
        "&:hover": { bgcolor: expanded ? "#eef1f4" : "#fafbfc" },
      }}
    >
      <Box
        sx={{
          fontFamily: monoStack,
          fontWeight: 700,
          fontSize: "clamp(0.85rem, 1vw, 1.1rem)",
          color: "#1c252e",
          minWidth: "5em",
        }}
      >
        {profile.name}
      </Box>
      <Box
        sx={{
          fontSize: "clamp(0.8rem, 0.9vw, 1rem)",
          color: "#637381",
          flex: 1,
        }}
      >
        {profile.description}
      </Box>
      <Box
        aria-hidden
        sx={{
          fontFamily: monoStack,
          fontSize: "clamp(0.85rem, 1vw, 1.1rem)",
          color: "#919eab",
          width: "1em",
          textAlign: "center",
        }}
      >
        {expanded ? "−" : "+"}
      </Box>
    </Box>
    {expanded ? (
      <Box
        sx={{
          bgcolor: "#fafbfc",
          borderBottom: isLast ? "none" : "1px solid rgba(0, 0, 0, 0.06)",
          px: 2.5,
          py: 1.5,
        }}
      >
        <Box
          component="pre"
          sx={{
            margin: 0,
            fontFamily: monoStack,
            fontSize: "clamp(0.72rem, 0.82vw, 0.9rem)",
            lineHeight: 1.55,
            color: "#1c252e",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {fileForProfile(profile)}
        </Box>
        {profile.systemPromptContent ? (
          <Box sx={{ mt: 2 }}>
            <Box
              sx={{
                fontFamily: monoStack,
                fontSize: "clamp(0.7rem, 0.78vw, 0.85rem)",
                color: "#637381",
                mb: 0.75,
                pb: 0.5,
                borderBottom: "1px dashed rgba(0, 0, 0, 0.1)",
              }}
            >
              {profile.systemPromptFile}
            </Box>
            <Box
              component="pre"
              sx={{
                margin: 0,
                fontFamily: monoStack,
                fontSize: "clamp(0.72rem, 0.82vw, 0.9rem)",
                lineHeight: 1.55,
                color: "#1c252e",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {profile.systemPromptContent}
            </Box>
          </Box>
        ) : null}
      </Box>
    ) : null}
  </Box>
);

interface PanelHeaderProps {
  title: string;
  caption?: string;
}

const PanelHeader = ({ title, caption }: PanelHeaderProps) => (
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
          fontFamily: monoStack,
          fontSize: "clamp(0.65rem, 0.7vw, 0.8rem)",
          color: "rgba(28, 37, 46, 0.5)",
        }}
      >
        {caption}
      </Typography>
    ) : null}
  </Box>
);

export default function ProfileExplorer() {
  const [selected, setSelected] = useState<string>("cody");
  const current =
    profiles.find((p) => p.name === selected) ?? profiles[0];

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        py: "3%",
        display: "flex",
        gap: "2%",
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <PanelHeader
          title="profiles"
          caption={`${profiles.length} files`}
        />
        <Box
          className="talk-prompt-panel"
          sx={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}
        >
          {profiles.map((p, i) => (
            <ProfileRow
              key={p.name}
              profile={p}
              expanded={selected === p.name}
              onToggle={() =>
                setSelected(selected === p.name ? "" : p.name)
              }
              isLast={i === profiles.length - 1}
            />
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          bgcolor: "#ffffff",
          border: "1px solid rgba(0, 0, 0, 0.1)",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <PanelHeader
          title="what runs"
          caption={current ? `ccp ${current.name}` : ""}
        />
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
          {current ? (
            <Box
              component="pre"
              sx={{
                margin: 0,
                fontFamily: monoStack,
                fontSize: "clamp(0.78rem, 0.9vw, 1.05rem)",
                lineHeight: 1.55,
                color: "#1c252e",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {expansionForProfile(current)}
            </Box>
          ) : (
            <Box sx={{ color: "rgba(28, 37, 46, 0.5)" }}>
              Pick a profile on the left.
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
