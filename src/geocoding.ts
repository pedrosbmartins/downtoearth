import { LngLat } from './types'

export async function reverseGeocoding(lngLat: LngLat) {
  try {
    const [lng, lat] = lngLat
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10`
    const response = await fetch(url)
    const json = await response.json()
    if (json.error) {
      return lngLat.map(v => v.toFixed(4)).toString()
    }
    return json.display_name
  } catch (e) {
    console.error(e)
    return undefined
  }
}
