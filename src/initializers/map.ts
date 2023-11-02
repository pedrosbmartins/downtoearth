import { INITIAL_CENTER, MAPBOXGL_ACCESS_TOKEN } from '../constants'
import * as MapBoxGL from '../map/mapboxgl'
import { setupFromURL } from './setupFromURL'

const center = setupFromURL ? setupFromURL.center : INITIAL_CENTER

const map = new MapBoxGL.Map(center, { accessToken: MAPBOXGL_ACCESS_TOKEN })

export default map
