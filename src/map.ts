import * as turf from '@turf/turf'
import mapboxgl from 'mapbox-gl'

import { INITIAL_CENTER, MAPBOXGL_ACCESS_TOKEN } from './constants'
import * as MapBoxGL from './map/mapboxgl'
import { BoundingBox, LngLat } from './types'

export const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  showUserLocation: false
})

const map = new MapBoxGL.Map(INITIAL_CENTER, { accessToken: MAPBOXGL_ACCESS_TOKEN })
map.instance.addControl(geolocate)

export default map

export function fitBounds(bbox: BoundingBox) {
  map.flyTo(bbox)
}

export function circle(center: LngLat, size: number) {
  return turf.circle(center, size, { steps: 80, units: 'kilometers' })
}

export function ellipse(center: LngLat, semiMajorAxis: number, semiMinorAxis: number) {
  return turf.ellipse(center, semiMajorAxis, semiMinorAxis, { steps: 180, units: 'kilometers' })
}

export interface GeolocateResultEvent {
  type: 'geolocate'
  coords: GeolocationCoordinates
}

export function isGeolocateResultEvent(event: any): event is GeolocateResultEvent {
  return event.type && event.type === 'geolocate'
}
