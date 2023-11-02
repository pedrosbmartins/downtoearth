import { MAPBOXGL_ACCESS_TOKEN } from './constants'
import { LngLat } from './types'

export async function reverseGeocoding(lngLat: LngLat) {
  try {
    const [lng, lat] = lngLat
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOXGL_ACCESS_TOKEN}`
    )
    const json = await response.json()

    const query = json.query.toString() as string
    if (json.features.length === 0) {
      return query
    }

    const mainFeature = json.features[0]
    const context = mainFeature.context as Array<{ id: string; text: string }>
    const locality = context.find(c => c.id.startsWith('locality'))?.text
    const place = context.find(c => c.id.startsWith('place'))?.text
    const region = context.find(c => c.id.startsWith('region'))?.text
    const country = context.find(c => c.id.startsWith('country'))?.text

    if (region && country) {
      return `${region}, ${country}`
    }
    if (locality && place) {
      return `${locality}, ${place}`
    }
    if (mainFeature.place_name) {
      return mainFeature.place_name as string
    }
  } catch (e) {
    console.error(e)
    return undefined
  }
}
