import * as turf from '@turf/turf'
import mapboxgl, { LngLatLike } from 'mapbox-gl'

import { INITIAL_CENTER, MAPBOXGL_ACCESS_TOKEN } from './constants'
import { BoundingBox } from './store'

const map = new mapboxgl.Map({
  accessToken: MAPBOXGL_ACCESS_TOKEN,
  style: 'mapbox://styles/pedrosbmartins/ckxorrc2q6hzp15p9b9kojnvj',
  center: INITIAL_CENTER as LngLatLike,
  zoom: 10,
  container: 'map',
  projection: {
    name: 'globe'
  }
})

export const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  showUserLocation: false
})

map.addControl(geolocate)

export default map

export function fitBounds(boundingBox: BoundingBox) {
  map.fitBounds(boundingBox, { padding: 20 })
}

export function circle(center: number[], size: number) {
  return turf.circle(center, size, { steps: 80, units: 'kilometers' })
}

export function ellipse(center: number[], semiMajorAxis: number, semiMinorAxis: number) {
  return turf.ellipse(center, semiMajorAxis, semiMinorAxis, { steps: 180, units: 'kilometers' })
}

export interface GeolocateResultEvent {
  type: 'geolocate'
  coords: GeolocationCoordinates
}

export function isGeolocateResultEvent(event: any): event is GeolocateResultEvent {
  return event.type && event.type === 'geolocate'
}
