import type { Theme } from "@mui/material/styles";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Swatch from "./Swatch";

interface PaletteShade {
  label: string;
  resolve: (theme: Theme) => string;
}

interface PaletteRowProps {
  /** Palette key, e.g. "primary", "secondary", "grey". */
  name: string;
  /** Shades to render left to right; each pulls its value from the theme at render time. */
  shades: ReadonlyArray<PaletteShade>;
}

export default function PaletteRow({ name, shades }: PaletteRowProps): React.JSX.Element {
  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
        {name}
      </Typography>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {shades.map((shade) => (
          <Swatch key={`${name}-${shade.label}`} label={shade.label} resolve={shade.resolve} />
        ))}
      </Stack>
    </Stack>
  );
}
