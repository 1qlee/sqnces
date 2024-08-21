import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'sqnces',
    short_name: 'sqnces',
    description: 'Game where you guess words using a 3 letter sequence.',
    display: 'minimal-ui',
    theme_color: '#fff',
  }
}