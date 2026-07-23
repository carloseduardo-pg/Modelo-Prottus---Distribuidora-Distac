type IconName = 'home' | 'users' | 'box' | 'cart' | 'logout';

const paths: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1v-10.5z',
  users:
    'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0zm-4 5c-4 0-7 2-7 4v1h14v-1c0-2-3-4-7-4z',
  box: 'M3 7l9-4 9 4-9 4-9-4zm0 5 9 4 9-4M3 17l9 4 9-4',
  cart: 'M3 4h2l2.5 11h10l2-8H7M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  logout: 'M10 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h5M15 16l5-4-5-4M20 12H9',
};

/** Ícone SVG outline — sem emojis (padrão Prottus). */
export function Icon({
  name,
  size = 18,
}: {
  name: IconName;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={paths[name]} />
    </svg>
  );
}
