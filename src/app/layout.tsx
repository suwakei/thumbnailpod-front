import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/lib/providers';

export const metadata: Metadata = {
  title: 'ThumbnailPod — AI Thumbnail Studio',
  description: 'Generate YouTube thumbnails that match your unique style with AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
