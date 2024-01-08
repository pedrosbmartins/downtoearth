import cities from '../constants/cities'
import { LngLat } from '../types'
import { URLData } from './urldata'

function getRandomCityLngLat(): LngLat {
  const randomIndex = Math.round(Math.random() * (cities.length - 1))
  const randomCity = cities[randomIndex]
  return [randomCity.lng, randomCity.lat]
}

export const initialCenter = URLData?.location ? URLData.location : getRandomCityLngLat()
