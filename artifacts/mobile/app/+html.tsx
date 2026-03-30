import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LNT Paris" />
        <meta name="application-name" content="LNT Paris" />
        <meta name="theme-color" content="#C9AD71" />
        
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        <link
          href="https://cdn.jsdelivr.net/npm/@expo/vector-icons@13.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.ttf"
          rel="preload"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        
        <ScrollViewStyleReset />
        
        <style dangerouslySetInnerHTML={{ __html: mobileOptimizedStyles }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const mobileOptimizedStyles = `
@font-face {
  font-family: 'Feather';
  src: url('https://cdn.jsdelivr.net/npm/@expo/vector-icons@13.0.0/build/vendor/react-native-vector-icons/Fonts/Feather.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

body {
  background-color: #F9FAFB;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#root {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100vw;
  position: relative;
}

/* Improve touch interactions */
button, a {
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
  touch-action: manipulation;
}

/* Prevent text selection on interactive elements */
button, a, [role="button"] {
  -webkit-user-select: none;
  user-select: none;
}

/* Ensure vector icons render properly */
[data-expo-vector-icon] {
  font-family: 'Feather' !important;
}
`;
