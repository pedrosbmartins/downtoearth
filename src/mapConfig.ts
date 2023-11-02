import * as turf from '@turf/turf'

import { INITIAL_CENTER, MAPBOXGL_ACCESS_TOKEN } from './constants'
import * as MapBoxGL from './map/mapboxgl'
import { BoundingBox, LngLat } from './types'

const map = new MapBoxGL.Map(INITIAL_CENTER, { accessToken: MAPBOXGL_ACCESS_TOKEN })

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
