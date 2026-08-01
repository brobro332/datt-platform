import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DATT - Workspace & Map',
    short_name: 'DATT',
    description: 'A platform connecting anchors, spaces, and crews together.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#4f46e5',
    icons: [
      {
        src: '/next.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/next.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}
