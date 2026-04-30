import type { Theme } from "@mui/material/styles";

import { createTheme as createMuiTheme } from "@mui/material/styles";

import { mixins } from "./core/mixins";
import { opacity } from "./core/opacity";
import { shadows } from "./core/shadows";
import { palette } from "./core/palette";
import { themeConfig } from "./theme-config";
import { components } from "./core/components";
import { typography } from "./core/typography";
import { customShadows } from "./core/custom-shadows";

/**
 * The docs site renders demos in a single, consistent light scheme so the
 * MUI CSS-vars layer doesn't fight Docusaurus's own dark-mode switching.
 * Docusaurus drives its own `data-theme` for the chrome; MUI scopes its
 * variables to `:root` only (no `[data-color-scheme="dark"]` selector,
 * no `color-scheme: dark` propagation to <html>).
 *
 * For an app that wants both light and dark plus a settings-driven toggle,
 * build the theme from the same `palette` / `shadows` / etc. but register
 * `colorSchemes.{light,dark}` and wire a settings provider.
 */
export function createAppTheme(): Theme {
  return createMuiTheme({
    cssVariables: themeConfig.cssVariables,
    palette: palette.light,
    shadows: shadows.light,
    customShadows: customShadows.light,
    opacity,
    mixins,
    components,
    typography,
    shape: { borderRadius: 8 },
    direction: themeConfig.direction,
  });
}
