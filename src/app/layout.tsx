import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Project Evo — Community Events Board',
  description:
    'Discover local events in your city — music nights, workshops, food fairs, sports events and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh bg-void-black text-bone-white font-inter antialiased">
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
