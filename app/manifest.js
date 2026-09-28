export default function manifest() {
  return {
    name: 'Just Us',
    short_name: 'Just Us',
    description: 'Our little space',
    start_url: '/',
    display: 'standalone',
    background_color: '#f5e6ea',
    theme_color: '#d68fa3',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
    ],
  }
}
