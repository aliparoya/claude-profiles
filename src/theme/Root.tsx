import { useEffect, useMemo, type ReactNode } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { ThemeProvider } from "@mui/material/styles";
import { LicenseInfo } from "@mui/x-license";

import { createAppTheme } from "./mui/create-theme";

import "@fontsource-variable/public-sans";
import "@fontsource/barlow";

interface RootProps {
  children: ReactNode;
}

interface CustomFields {
  muiXLicenseKey?: string;
}

export default function Root({ children }: RootProps): React.JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  const licenseKey = (siteConfig.customFields as CustomFields | undefined)
    ?.muiXLicenseKey;

  useEffect(() => {
    if (licenseKey && licenseKey.length > 0) {
      LicenseInfo.setLicenseKey(licenseKey);
    }
  }, [licenseKey]);

  const theme = useMemo(() => createAppTheme(), []);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
