import { MAPBOXGL_ACCESS_TOKEN } from '../constants'
import * as MapBoxGL from '../map/mapboxgl'
import { initialCenter } from './center'

const map = new MapBoxGL.Map(initialCenter, { accessToken: MAPBOXGL_ACCESS_TOKEN })

export default map
