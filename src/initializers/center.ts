import cities from '../constants/cities'
import { LngLat } from '../types'
import { setupFromURL } from './setupFromURL'

function getRandomCityLngLat(): LngLat {
  const randomIndex = Math.round(Math.random() * (cities.length - 1))
  const randomCity = cities[randomIndex]
  return [randomCity.lng, randomCity.lat]
}

export const initialCenter = setupFromURL ? setupFromURL.center : getRandomCityLngLat()
