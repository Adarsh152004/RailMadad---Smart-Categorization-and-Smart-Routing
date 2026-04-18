import type { Metadata } from 'next';
import { Space_Grotesk, Manrope } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['300', '400', '500', '600', '700'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['200', '300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'RailAssist Pro | AI-Powered Railway Grievance System',
  description: 'Official initiative for high-performance railway management leveraging decentralized AI categorization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${manrope.variable} dark`}>
      <body className="min-h-screen bg-background text-text-main font-body antialiased">
        <main className="mesh-bg min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
