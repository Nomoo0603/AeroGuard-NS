import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'AeroGuard-NS — Open-source CFD reliability',
  description:
    'An open-source specification and C++ API draft for conservative high-vorticity CFD monitoring, bounded recovery, and auditable solver integration.',
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
