import mapboxgl, { LngLatLike } from 'mapbox-gl'

export const INITIAL_CENTER: LngLatLike = [-43.210855877349104, -22.951904902574256]

export function initializeMap() {
  return new mapboxgl.Map({
    accessToken:
      'pk.eyJ1IjoicGVkcm9zYm1hcnRpbnMiLCJhIjoiY2tiazY3bDM3MDQ2MzJwbWUzdmFqZXp0dSJ9.wyh0b-cWtDFg7MhOuHJwhg',
    style: 'mapbox://styles/pedrosbmartins/ckxorrc2q6hzp15p9b9kojnvj',
    center: INITIAL_CENTER,
    zoom: 10,
    container: 'map'
  })
}
