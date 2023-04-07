import cities from './cities'

const randomIndex = Math.round(Math.random() * (cities.length - 1))
const randomCity = cities[randomIndex]

console.log(`Initial city is ${randomCity.name}, ${randomCity.country}`)

export const INITIAL_CITY = randomCity
export const INITIAL_CENTER = [randomCity.lng, randomCity.lat]
export const MAPBOXGL_ACCESS_TOKEN =
  'pk.eyJ1IjoicGVkcm9zYm1hcnRpbnMiLCJhIjoiY2tiazY3bDM3MDQ2MzJwbWUzdmFqZXp0dSJ9.wyh0b-cWtDFg7MhOuHJwhg'
