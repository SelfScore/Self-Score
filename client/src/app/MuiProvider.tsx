"use client";

import { CacheProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import createEmotionCache from "./emotion-cache";

const clientSideEmotionCache = createEmotionCache();

export default function MuiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <CssBaseline />
      {children}
    </CacheProvider>
  );
}
