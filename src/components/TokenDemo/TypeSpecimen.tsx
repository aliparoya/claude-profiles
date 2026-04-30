import type { TypographyProps } from "@mui/material/Typography";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

interface TypeSpecimenProps {
  /** MUI typography variant, e.g. "h1", "body1". */
  variant: TypographyProps["variant"];
  /** Short hint about the at-rest font size. */
  size: string;
  /** Sample text to render in the variant. */
  sample?: string;
}

const DEFAULT_SAMPLE = "The quick brown fox jumps over the lazy dog.";

export default function TypeSpecimen({
  variant,
  size,
  sample = DEFAULT_SAMPLE,
}: TypeSpecimenProps): React.JSX.Element {
  return (
    <Stack spacing={0.25} sx={{ width: "100%" }}>
      <Stack direction="row" spacing={1} alignItems="baseline">
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          {variant}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {size}
        </Typography>
      </Stack>
      <Typography variant={variant} sx={{ m: 0 }}>
        {sample}
      </Typography>
    </Stack>
  );
}
