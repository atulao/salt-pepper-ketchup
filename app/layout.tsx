import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Salt-Pepper-Ketchup | NJIT Campus Engagement',
  description: 'AI-powered campus engagement platform for NJIT students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="ui-mode-script" strategy="afterInteractive">
          {`
            (function() {
              try {
                const savedMode = localStorage.getItem('uiMode');
                if (savedMode === 'dark') {
                  document.documentElement.classList.add('dark');
                  document.body.classList.add('dark-mode');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.body.classList.remove('dark-mode');
                }
              } catch (e) {
                console.error('Failed to set UI mode:', e);
              }
            })()
          `}
        </Script>
      </head>
      <body className={`${inter.className} transition-colors duration-300`}>
        {children}
      </body>
    </html>
  );
}