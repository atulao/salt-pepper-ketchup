import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthSessionProvider from './components/auth/AuthSessionProvider';
// import Script from 'next/script'; // No longer needed for theme init

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Salt-Pepper-Ketchup | NJIT Campus Engagement',
  description: 'AI-powered campus engagement platform for NJIT students',
};

// Remove themeInitScript constant
// const themeInitScript = ` ... `; 

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Remove the initial class from <html> if it was added, ensure suppressHydrationWarning is present
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Remove the immediate theme application script */}
        {/* <script dangerouslySetInnerHTML={{ __html: themeInitScript }} /> */}
        
        {/* Remove the Next Script component used for theme init */}
        {/* <Script id="ui-mode-script" strategy="beforeInteractive"> ... </Script> */}
      </head>
      {/* Ensure body doesn't have default dark classes server-side */}
      <body className={`${inter.className} transition-colors duration-300`}>
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  );
}