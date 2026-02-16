import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const raleway = Raleway({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Arketa — Community Wellness Platform',
  description: 'Build and grow your wellness community. Run programs, host classes, engage your people.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={raleway.className}>
      <body className="min-h-screen bg-gray-50 antialiased text-gray-900">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
