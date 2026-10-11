const icons = {
  home:'<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  movie:'<rect x="3" y="8" width="18" height="13" rx="2"/><path d="m3 8-1-5 18-2 1 5M7 2l3 4m4-5 3 4M3 12h18"/>',
  series:'<rect x="2" y="3" width="20" height="15" rx="2"/><path d="M8 22h8m-4-4v4"/>',
  genres:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  user:'<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>',
  plus:'<path d="M12 4v16M4 12h16"/>',check:'<path d="m4 12 5 5L20 6"/>',
  play:'<path d="m8 4 13 8-13 8Z" fill="currentColor" stroke="none"/>',
  left:'<path d="m14 5-7 7 7 7"/>',right:'<path d="m10 5 7 7-7 7"/>',close:'<path d="m5 5 14 14M19 5 5 19"/>',
  eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',logout:'<path d="M9 3H3v18h6M9 12h12m-4-4 4 4-4 4"/>',
  list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
  admin:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6Z"/><path d="m8 12 3 3 5-6"/>',
};
export const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.genres}</svg>`;
