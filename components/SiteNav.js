'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

const LINKS = [
  { href: '/', label: 'Mission Control' },
  { href: '/network', label: 'Network' },
  { href: '/incidents', label: 'Incidents' },
  { href: '/decisions', label: 'Decisions' },
  { href: '/demo', label: 'Demo Mode' },
];

export default function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-hairline">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar text-sm">
          {LINKS.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  active ? 'bg-navy text-white' : 'text-slateline hover:bg-black/5'
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
