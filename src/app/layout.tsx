import "~/styles/globals.css";

import Script from 'next/script'
import { GeistSans } from "geist/font/sans";
import { type Metadata, type Viewport } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import "~/styles/toast.css";


export const metadata: Metadata = {
  title: "sqnces",
  description: "Game where you guess words using a 3 letter sequence.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'var(--olive-1)' },
    { media: '(prefers-color-scheme: dark)', color: 'var(--olive-12)' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning >
      <Script defer src="https://umami-d8k0o0kso0s44ckw0w0ccwk4.sqnces.com/script.js" data-website-id="20bf5cd1-7624-4e0d-99f5-f352e661064f" />
      <body className={GeistSans.className}>
        <ThemeProvider enableSystem={false}>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </ThemeProvider>
        <Toaster
          position="top-center"
          reverseOrder={false}
          gutter={8}
          containerClassName=""
          containerStyle={{
            top: 24,
          }}
          toastOptions={{
            // Define default options
            className: '',
            duration: 1500,
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              userSelect: 'none',
            },
            error: {
              style: {
                background: 'var(--red)',
                color: '#fee2e2',
                animation: "headShake 0.5s",
              },
              icon: null,
              iconTheme: {
                primary: "#fee2e2",
                secondary: "var(--red)",
              }
            }
          }}
        />
      </body>
    </html>
  );
}
