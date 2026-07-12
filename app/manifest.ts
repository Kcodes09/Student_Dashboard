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
        sizes: '32x32',
        type: 'image/x-icon',
      },
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      }
    ],
    screenshots: [
      {
        src: '/screenshot-desktop.png',
        sizes: '1280x720',
        type: 'image/png',
        // @ts-ignore - next.js types might not have form_factor yet
        form_factor: 'wide',
      },
      {
        src: '/screenshot-mobile.png',
        sizes: '720x1280',
        type: 'image/png',
        // @ts-ignore
        form_factor: 'narrow',
      }
    ]
  };
}
