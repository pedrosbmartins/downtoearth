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
  const initialSetup: keyof typeof setups = 'solarSystem'
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
})
