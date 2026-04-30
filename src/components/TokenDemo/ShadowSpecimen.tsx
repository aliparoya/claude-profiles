import type { Theme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface ShadowSpecimenProps {
  /** Token name, e.g. "z8" or "card". */
  name: string;
  /** How the shadow is reached in code, e.g. "theme.customShadows.z8". */
  accessor: string;
  /** Theme resolver; the box pulls its shadow from the theme rather than a literal string. */
  resolve: (theme: Theme) => string;
}

const SHADOW_BOX_SPACING = 10;

export default function ShadowSpecimen({
  name,
  accessor,
  resolve,
}: ShadowSpecimenProps): React.JSX.Element {
  return (
    <Stack spacing={1} alignItems="flex-start" sx={{ minWidth: 140 }}>
      <Box
        sx={(theme) => ({
          width: theme.spacing(SHADOW_BOX_SPACING),
          height: theme.spacing(SHADOW_BOX_SPACING),
          borderRadius: 2,
          backgroundColor: theme.palette.background.paper,
          boxShadow: resolve(theme),
        })}
      />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {accessor}
      </Typography>
    </Stack>
  );
}
