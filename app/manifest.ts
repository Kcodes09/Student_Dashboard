import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Student Dashboard',
    short_name: 'Dashboard',
    description: 'Track your schedule, classes, and exams.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/favicon.ico',
        sizes: '256x256',
        type: 'image/x-icon',
      },
      {
        src: '/globe.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ],
    screenshots: [
      {
        src: '/screenshot-desktop.svg',
        sizes: '1280x720',
        type: 'image/svg+xml',
        // @ts-ignore - next.js types might not have form_factor yet
        form_factor: 'wide',
      },
      {
        src: '/screenshot-mobile.svg',
        sizes: '720x1280',
        type: 'image/svg+xml',
        // @ts-ignore
        form_factor: 'narrow',
      }
    ]
  };
}
