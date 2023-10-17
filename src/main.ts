import alphaCentauri from '../setup/alphaCentauri.json'
import demo from '../setup/demo.json'
import earthSatellites from '../setup/earthSatellites.json'
import pluto from '../setup/pluto.json'
import solarSystem from '../setup/solarSystem.json'
import starSizes from '../setup/starSizes.json'
import starSizes_solarSystem from '../setup/starSizes_solarSystem.json'
import App from './App'
import map from './map'
import { Setup } from './types'
import {
  $setupDropdown,
  $setupFileSelector,
  $setupFromURLOption,
  SETUP_FROM_FILE_VALUE,
  SETUP_FROM_URL_VALUE
} from './ui'

const setups = {
  alphaCentauri: alphaCentauri as Setup,
  earthSatellites: earthSatellites as Setup,
  pluto: pluto as Setup,
  solarSystem: solarSystem as Setup,
  starSizes: starSizes as Setup,
  starSizes_solarSystem: starSizes_solarSystem as Setup,
  demo: demo as Setup
}

const app = new App()

const urlDataMatch = window.location.search.match(/data=(.+)/)
const urlData = urlDataMatch ? urlDataMatch[1] : undefined
const urlDataContent = urlData ? Buffer.from(urlData, 'base64').toString() : undefined
const setupFromURL = urlDataContent ? (JSON.parse(urlDataContent) as Setup) : undefined

map.on('load', () => {
  const initialSetup: keyof typeof setups = 'solarSystem'
  const $setupOptionElement = $setupDropdown.querySelector(`option[value=${initialSetup}]`)
  if ($setupOptionElement) {
    $setupOptionElement.setAttribute('selected', 'true')
  }

  let setup: Setup = setups[initialSetup]

  if (setupFromURL) {
    try {
      $setupFromURLOption.style.display = 'block'
      $setupFromURLOption.setAttribute('selected', 'true')
      $setupFromURLOption.innerText = setupFromURL.title
      setup = setupFromURL
    } catch (error) {
      console.error('error parsing setup from URL.', error)
    }
  }

  app.initialize(setup)

  $setupDropdown.addEventListener('change', function (this: HTMLSelectElement) {
    const { value } = this
    switch (value) {
      case SETUP_FROM_FILE_VALUE:
        $setupFileSelector.click()
        break
      case SETUP_FROM_URL_VALUE:
        if (setupFromURL) app.initialize(setupFromURL)
        break
      default:
        const setup = setups[value as keyof typeof setups]
        if (setup) app.initialize(setup)
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
})
