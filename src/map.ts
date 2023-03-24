import * as turf from '@turf/turf'
import mapboxgl, { LngLatLike } from 'mapbox-gl'

import { INITIAL_CENTER } from './constants'
import { BoundingBox } from './store'

const map = new mapboxgl.Map({
  accessToken:
    'pk.eyJ1IjoicGVkcm9zYm1hcnRpbnMiLCJhIjoiY2tiazY3bDM3MDQ2MzJwbWUzdmFqZXp0dSJ9.wyh0b-cWtDFg7MhOuHJwhg',
  style: 'mapbox://styles/pedrosbmartins/ckxorrc2q6hzp15p9b9kojnvj',
  center: INITIAL_CENTER as LngLatLike,
  zoom: 10,
  container: 'map'
})

export default map

export function fitBounds(boundingBox: BoundingBox) {
  map.fitBounds(boundingBox, { padding: 20 })
}

export function circle(center: number[], size: number) {
  return turf.circle(center, size, { steps: 80, units: 'kilometers' })
}
