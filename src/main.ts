import * as turf from '@turf/turf'

import { ImageSource, ImageSourceRaw, RasterLayer } from 'mapbox-gl'
import alphaCentauriJSON from '../setup/alpha-centauri.json'
import demoJSON from '../setup/demo.json'
import solarSystemJSON from '../setup/solar-system.json'
import App from './App'
import { INITIAL_CENTER } from './constants'
import map from './map'
import { Config } from './types'
import { $configDropdown, $configFileSelector } from './ui'

const configs = {
  alphaCentauri: alphaCentauriJSON as Config,
  solarSystem: solarSystemJSON as Config,
  demo: demoJSON as Config
}

const app = new App()

map.on('load', () => {
  app.initialize({})

  $configDropdown.addEventListener('change', function (this: HTMLSelectElement) {
    const { value } = this
    if (value === 'from::file') {
      $configFileSelector.click()
    }
    const config = configs[value as keyof typeof configs]
    if (config) {
      app.initialize(config)
    }
  })

  $configFileSelector.addEventListener('change', async function (event) {
    const fileList = (<HTMLInputElement>event.target).files
    const file = fileList && fileList[0]
    if (!file) {
      console.error('could not load file')
      return
    }
    if (file.type !== 'application/json') {
      console.error(`file type ${file.type} not supported`)
      return
    }
    const configText = await file.text()
    const config = JSON.parse(configText) as Config
    app.initialize(config)
  })

  map.addSource(MiddleEarth.sourceId, MiddleEarth.source(INITIAL_CENTER))
  map.addLayer(MiddleEarth.layer())

  map.on('click', e => {
    const center = e.lngLat.toArray()
    const source = map.getSource(MiddleEarth.sourceId) as ImageSource
    source.setCoordinates(MiddleEarth.coordinates(center))
  })
})

class MiddleEarth {
  // 171 px = 100 mi
  // 1 px = 0.58479532163 mi

  // 3200 px = 1871.34502922 mi = 3011.637894705032 km
  // 2400 px = 1403.50877191 mi = 2258.728421020727 km

  // 3011.64 km x 2258.73 km

  static readonly WIDTH_KM = 3011.64
  static readonly HEIGHT_KM = 2258.73

  static readonly sourceId = 'middle-earth'

  static source(center: number[]): ImageSourceRaw {
    return {
      type: 'image',
      url: 'http://127.0.0.1:8080/assets/middle-earth.jpg',
      coordinates: this.coordinates(center)
    }
  }

  static layer(): RasterLayer {
    return {
      id: 'middle-earth-layer',
      type: 'raster',
      source: MiddleEarth.sourceId,
      paint: {
        'raster-fade-duration': 0,
        'raster-opacity': 0.4
      }
    }
  }

  static coordinates(center: number[]) {
    const width = MiddleEarth.WIDTH_KM
    const height = MiddleEarth.HEIGHT_KM
    const topMid = this.destination(center, height / 2, 0)
    const topLeft = this.destination(topMid, width / 2, 270)
    const topRight = this.destination(topLeft, width, 90)
    const bottomLeft = this.destination(topLeft, height, 180)
    const bottomRight = this.destination(bottomLeft, width, 90)
    return [topLeft, topRight, bottomRight, bottomLeft]
  }

  static destination(origin: number[], distance: number, bearing: number) {
    return turf.rhumbDestination(origin, distance, bearing).geometry.coordinates
  }
}
