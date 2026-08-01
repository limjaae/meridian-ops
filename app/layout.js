import { Inter, Space_Grotesk, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap', weight: ['500', '700'] });
const plex = IBM_Plex_Mono({ subsets: ['latin'], variable: '--font-plex', display: 'swap', weight: ['400', '500', '600'] });

export const metadata = {
  title: 'Meridian Operations — Turning operational complexity into coordinated action',
  description:
    'A decision-support platform for supply chain disruption: live port conditions, an operational ontology, and a human-in-the-loop decision register for freight forwarders, importers, and cargo insurers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${plex.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
