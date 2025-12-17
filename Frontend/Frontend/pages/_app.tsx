
// pages/_app.tsx
import type { AppProps } from "next/app";
import "../styles/globals.css"; // ensure this file exists
import React from "react";

export default function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}
