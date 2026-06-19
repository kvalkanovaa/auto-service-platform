// Кастъм лого на платформата — градиентна значка с диагностичен уред (спидометър):
// бяла дъга, оранжева стрелка и център — символ на AI диагностиката на автомобила.
export default function Logo({ size = 38, gid = 'asLogo' }: { size?: number; gid?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e3a5f" />
          <stop offset="1" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill={`url(#${gid})`} />
      {/* дъга на уреда */}
      <path d="M11.5 24a8.5 8.5 0 0 1 17 0" stroke="#ffffff" strokeWidth="2.6" strokeLinecap="round" />
      {/* стрелка */}
      <path d="M20 24 L25.6 16" stroke="#f97316" strokeWidth="2.8" strokeLinecap="round" />
      {/* център */}
      <circle cx="20" cy="24" r="2.4" fill="#ffffff" />
    </svg>
  );
}
