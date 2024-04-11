import * as turf from '@turf/turf'
import { ImageSourceSpecification, RasterLayerSpecification } from 'maplibre-gl'
import alphaCentauri from '../setup/alphaCentauri.json'
import demo from '../setup/demo.json'
import earthMoon from '../setup/earthMoon.json'
import earthSatellites from '../setup/earthSatellites.json'
import pluto from '../setup/pluto.json'
import solarSystem from '../setup/solarSystem.json'
import starSizes from '../setup/starSizes.json'
import starSizes_solarSystem from '../setup/starSizes_solarSystem.json'
import { App } from './app'
import map from './initializers/map'
import { URLData } from './initializers/urldata'
import { Setup } from './setups'
import { activateUIForSetupFromURL, displaySharingDialog, generateShareableLink } from './sharing'
import { LngLat } from './types'
import {
  $setupDropdown,
  $setupFileSelector,
  $shareButton,
  SETUP_FROM_FILE_VALUE,
  SETUP_FROM_URL_VALUE
} from './ui'

const setups = {
  alphaCentauri: alphaCentauri as Setup,
  earthMoon: earthMoon as Setup,
  earthSatellites: earthSatellites as Setup,
  pluto: pluto as Setup,
  solarSystem: solarSystem as Setup,
  starSizes: starSizes as Setup,
  starSizes_solarSystem: starSizes_solarSystem as Setup,
  demo: demo as Setup
}

const app = new App()

map.onLoad(() => {
  const initialSetup: keyof typeof setups = 'demo'
  const $setupOptionElement = $setupDropdown.querySelector(`option[value=${initialSetup}]`)
  if ($setupOptionElement) {
    $setupOptionElement.setAttribute('selected', 'true')
  }

  let setup: Setup = setups[initialSetup]
  let center: LngLat | undefined

  if (URLData?.setup) {
    setup = URLData.setup
    activateUIForSetupFromURL(setup.title)
  }
  if (URLData?.location) {
    center = URLData.location
    map.setCenter(center)
  }

  app.initialize(setup, center)

  $setupDropdown.addEventListener('change', function (this: HTMLSelectElement) {
    const { value } = this
    switch (value) {
      case SETUP_FROM_FILE_VALUE:
        $setupDropdown.value = ''
        $setupFileSelector.click()
        break
      case SETUP_FROM_URL_VALUE:
        if (URLData?.setup) app.initialize(URLData.setup, app.currentLngLat)
        break
      default:
        const setup = setups[value as keyof typeof setups]
        if (setup) app.initialize(setup, app.currentLngLat)
    }
  })

  $setupFileSelector.addEventListener('change', async function (event) {
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
    const setupText = await file.text()
    const setup = JSON.parse(setupText) as Setup
    app.initialize(setup)
  })

  $shareButton.addEventListener('click', async () => {
    const link = generateShareableLink(app)
    if (!link) {
      alert('Could not generate a shareable link.')
      return
    }
    await displaySharingDialog(link)
  })

  // map.instance.addSource(MiddleEarth.sourceId, MiddleEarth.source(initialCenter))
  // map.instance.addLayer(MiddleEarth.layer())

  // map.instance.on('click', e => {
  //   const center = e.lngLat.toArray()
  //   const source = map.instance.getSource(MiddleEarth.sourceId) as ImageSource
  //   source.setCoordinates(MiddleEarth.coordinates(center) as any)
  // })
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

  static source(center: number[]): ImageSourceSpecification {
    return {
      type: 'image',
      url: 'http://127.0.0.1:8080/assets/middle-earth-bw.jpg',
      coordinates: this.coordinates(center) as any
    }
  }

  static layer(): RasterLayerSpecification {
    return {
      id: 'middle-earth-layer',
      type: 'raster',
      source: MiddleEarth.sourceId,
      paint: {
        'raster-fade-duration': 0,
        'raster-opacity': 0.75
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
