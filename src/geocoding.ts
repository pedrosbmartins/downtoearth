import MapboxGeocoder, { Result } from '@mapbox/mapbox-gl-geocoder'
import mapboxgl from 'mapbox-gl'
import { MAPBOXGL_ACCESS_TOKEN } from './constants'
import map from './map'

const MAPBOXGL_GEOCODER_INPUT_CLASS = '.mapboxgl-ctrl-geocoder--input'

type ResultEventHandler = (event: { result: Result }) => void

export function buildGeocoder($container: HTMLElement, onResult?: ResultEventHandler) {
  const geocoder = new MapboxGeocoder({
    accessToken: MAPBOXGL_ACCESS_TOKEN,
    mapboxgl: mapboxgl,
    marker: false,
    flyTo: false,
    trackProximity: false
  })
  if (onResult) geocoder.on('result', onResult)
  const $geocoderElement = $container.querySelector<HTMLElement>('#geocoder')!
  $geocoderElement.appendChild(geocoder.onAdd(map))
  const $geocoderInput = extractInputElement($geocoderElement)
  return { geocoder, $geocoderElement, $geocoderInput }
}

function extractInputElement($geocoderElement: HTMLElement) {
  return $geocoderElement.querySelector<HTMLInputElement>(MAPBOXGL_GEOCODER_INPUT_CLASS)!
}

export async function reverseGeocoding(lngLat: number[]) {
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
