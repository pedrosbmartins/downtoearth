import { INITIAL_CENTER, MAPBOXGL_ACCESS_TOKEN } from '../constants'
import * as MapBoxGL from '../map/mapboxgl'

const map = new MapBoxGL.Map(INITIAL_CENTER, { accessToken: MAPBOXGL_ACCESS_TOKEN })

export default map
