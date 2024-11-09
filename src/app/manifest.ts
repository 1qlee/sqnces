import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'sqnces',
    short_name: 'sqnces',
    description: 'Game where you guess words using a 3 letter sequence.',
    display: 'minimal-ui',
    theme_color: '#fff',
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