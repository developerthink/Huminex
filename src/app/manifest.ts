import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Huminex - AI-Powered Interview Platform',
    short_name: 'Huminex',
    description: 'Transform your hiring process with AI-driven interviews that identify top talent efficiently and fairly.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#7C3AED',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/Hx_logo.png',
        sizes: 'any',
        type: 'image/png',
      }
    ],
  };
} 