import alphaCentauriJSON from '../setup/alpha-centauri.json'
import demoJSON from '../setup/demo.json'
import earthSatellitesJSON from '../setup/earth-satellites.json'
import solarSystemJSON from '../setup/solar-system.json'
import starSizesJSON from '../setup/star-sizes.json'
import App from './App'
import map from './map'
import { Setup } from './types'
import { $setupDropdown, $setupFileSelector } from './ui'

const setups = {
  alphaCentauri: alphaCentauriJSON as Setup,
  earthSatellites: earthSatellitesJSON as Setup,
  solarSystem: solarSystemJSON as Setup,
  starSizes: starSizesJSON as Setup,
  demo: demoJSON as Setup
}

const app = new App()

map.on('load', () => {
  const initialSetup: keyof typeof setups = 'solarSystem'
  const $setupOptionElement = $setupDropdown.querySelector(`option[value=${initialSetup}]`)
  if ($setupOptionElement) {
    $setupOptionElement.setAttribute('selected', 'true')
  }
  app.initialize(setups[initialSetup])

  $setupDropdown.addEventListener('change', function (this: HTMLSelectElement) {
    const { value } = this
    if (value === 'from::file') {
      $setupFileSelector.click()
    }
    const setup = setups[value as keyof typeof setups]
    if (setup) {
      app.initialize(setup)
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
