import cities from './cities'

const randomIndex = Math.round(Math.random() * (cities.length - 1))
const randomCity = cities[randomIndex]

console.log(`Initial city is ${randomCity.name}, ${randomCity.country}`)

export const INITIAL_CENTER = [randomCity.lng, randomCity.lat]
