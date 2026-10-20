import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every
// web page during static render.
// The contents of this function only run on the server/build time, not in the browser.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, viewport-fit=cover" />
        <title>Chow - Authentic Nigerian Delicacies Delivered Fast</title>
        <meta
          name="description"
          content="Hot smokey jollof, tender beef suya, rich egusi soup, and authentic Nigerian comfort food delivered fast. Prepaid cashless online ordering."
        />
        <meta name="theme-color" content="#FEFAE0" />

        {/* OpenGraph & Social Cards */}
        <meta property="og:title" content="Chow - Taste of Naija Delivered Fast" />
        <meta
          property="og:description"
          content="Authentic Nigerian flavours, smoky jollof rice, savory egusi, and beef suya delivered straight to your door."
        />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="en_NG" />

        {/* Google Fonts Preconnect & Load */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;0,900;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Expo ScrollView web reset */}
        <ScrollViewStyleReset />

        <style dangerouslySetInnerHTML={{
          __html: `
            body {
              background-color: #FEFAE0;
              margin: 0;
              padding: 0;
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
            }
          `
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
