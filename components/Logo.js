export default function Logo({ dark = false }) {
  const stroke = dark ? '#F7F6F1' : '#0E1B2A';
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="28" height="28" rx="6" stroke="#C08A3E" strokeWidth="1.4" />
        <path
          d="M6 22 V8 L15 18 L24 8 V22"
          stroke={stroke}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="15" cy="18" r="1.6" fill="#C08A3E" />
      </svg>
      <span className={`font-display font-medium tracking-wideish text-[15px] ${dark ? 'text-fog' : 'text-ink'}`}>
        MERIDIAN <span className="text-brass">OPERATIONS</span>
      </span>
    </div>
  );
}
