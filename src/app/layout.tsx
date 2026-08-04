import React from 'react';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-shadow-dark text-shadow-text selection:bg-shadow-purple selection:text-white">
        {children}
      </body>
    </html>
  );
}
