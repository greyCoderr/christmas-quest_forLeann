// Replace the placeholder image with your own photos.
// Tip: put images in `src/assets/photos/` and update the `src` fields below.

const placeholder = new URL('../assets/photos/placeholder.svg', import.meta.url).href
const photo1 = new URL('../assets/photos/photo1.jpg', import.meta.url).href
const photo2 = new URL('../assets/photos/photo2.jpg', import.meta.url).href
const photo3 = new URL('../assets/photos/photo3.jpg', import.meta.url).href
const photo4 = new URL('../assets/photos/photo4.jpg', import.meta.url).href
const photo7 = new URL('../assets/photos/photo4.jpg', import.meta.url).href
const photo5 = new URL('../assets/photos/photo5.jpg', import.meta.url).href
const photo6 = new URL('../assets/photos/photo6.jpg', import.meta.url).href

export const photos = [
  {
    src: photo1,
    caption: 'Those eyes never fails to caught my heart.'
  },
  {
    src: photo2,
    caption: 'Yours smile is the most precious thing I have.'
  },
  {
    src: photo3,
    caption: 'I’ll always be here, in your best moments and your hardest ones.'
  },
  {
    src: photo7,
    caption: 'Even the flowers would feel jealous, because you’re far more adorable than they could ever be.'
  },
  {
    src: photo4,
    caption: 'You make even the simplest moments feel like something worth keeping.'
  },
  {
    src: photo5,
    caption: 'This memory lives in my heart forever. Thank you for everything, mwaa!'
  },
  {
    src: photo6,
    caption: 'You’re unbelievably stunning in the way you exist. Ilysm!'
  }
]
