import type { Theme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

interface SwatchProps {
  /** What to call the token, e.g. "primary.main", "grey.500", "background.neutral". */
  label: string;
  /** Theme accessor; the swatch resolves the color from the theme rather than restating it. */
  resolve: (theme: Theme) => string;
  /** Optional secondary line shown under the resolved value. */
  meta?: string;
  /** Spacing-scale size of the colored square. */
  sizeSpacing?: number;
}

const DEFAULT_SWATCH_SPACING = 7;

export default function Swatch({
  label,
  resolve,
  meta,
  sizeSpacing = DEFAULT_SWATCH_SPACING,
}: SwatchProps): React.JSX.Element {
  const theme = useTheme();
  const resolved = resolve(theme);
  return (
    <Stack spacing={0.5} alignItems="flex-start" sx={{ minWidth: 96 }}>
      <Box
        sx={(t) => ({
          width: t.spacing(sizeSpacing),
          height: t.spacing(sizeSpacing),
          borderRadius: 1,
          backgroundColor: resolve(t),
          border: `1px solid ${t.palette.divider}`,
        })}
      />
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {resolved}
      </Typography>
      {meta ? (
        <Typography variant="caption" color="text.secondary">
          {meta}
        </Typography>
      ) : null}
    </Stack>
  );
}
