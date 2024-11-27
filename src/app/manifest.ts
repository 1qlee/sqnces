import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'sqnces',
    short_name: 'sqnces',
    description: 'A word-guessing game where you use a 3-letter sequence to uncover the hidden word.',
    display: 'minimal-ui',
    theme_color: '#1d211c',
    icons: [
      {
        "src": "icon-192.png",
        "sizes": "192x192",
        "type": "image/png"
      },
      {
        "src": "icon-512.png",
        "sizes": "512x512",
        "type": "image/png"
      },
    ],
  }
}