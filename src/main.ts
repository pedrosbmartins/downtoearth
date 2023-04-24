import alphaCentauri from '../setup/alphaCentauri.json'
import demo from '../setup/demo.json'
import earthSatellites from '../setup/earthSatellites.json'
import pluto from '../setup/pluto.json'
import solarSystem from '../setup/solarSystem.json'
import starSizes from '../setup/starSizes.json'
import App from './App'
import map from './map'
import { Setup } from './types'
import { $setupDropdown, $setupFileSelector } from './ui'

const setups = {
  alphaCentauri: alphaCentauri as Setup,
  earthSatellites: earthSatellites as Setup,
  pluto: pluto as Setup,
  solarSystem: solarSystem as Setup,
  starSizes: starSizes as Setup,
  demo: demo as Setup
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
