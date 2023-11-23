import alphaCentauri from '../setup/alphaCentauri.json'
import demo from '../setup/demo.json'
import earthSatellites from '../setup/earthSatellites.json'
import pluto from '../setup/pluto.json'
import solarSystem from '../setup/solarSystem.json'
import starSizes from '../setup/starSizes.json'
import starSizes_solarSystem from '../setup/starSizes_solarSystem.json'
import { App } from './app'
import { initialCenter } from './initializers/center'
import map from './initializers/map'
import { setupFromURL } from './initializers/setupFromURL'
import { Setup, ShareableSetup } from './setups'
import { LngLat } from './types'
import {
  $setupDropdown,
  $setupFileSelector,
  $setupFromURLOption,
  $shareButton,
  SETUP_FROM_FILE_VALUE,
  SETUP_FROM_URL_VALUE,
  showDialog
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

map.onLoad(() => {
  const initialSetup: keyof typeof setups = 'solarSystem'
  const $setupOptionElement = $setupDropdown.querySelector(`option[value=${initialSetup}]`)
  if ($setupOptionElement) {
    $setupOptionElement.setAttribute('selected', 'true')
  }

  let setup: Setup = setups[initialSetup]
  let center: LngLat | undefined

  if (setupFromURL) {
    activateUIForSetupFromURL(setupFromURL.setup.title)
    map.setCenter(setupFromURL.center)
    setup = setupFromURL.setup
    center = setupFromURL.center
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
        if (setupFromURL) app.initialize(setupFromURL.setup, app.currentLngLat)
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
    const link = generateShareableLink()
    if (!link) {
      alert('Could not generate a shareable link: no visualization loaded.')
      return
    }
    await displaySharingDialog(link)
  })
})

function activateUIForSetupFromURL(title: string) {
  $setupFromURLOption.style.display = 'block'
  $setupFromURLOption.setAttribute('selected', 'true')
  $setupFromURLOption.innerText = title
}

function generateShareableLink() {
  const { setup, currentLngLat } = app
  if (!setup) return
  const shareableSetup: ShareableSetup = { setup, center: currentLngLat ?? initialCenter }
  const encodedValue = Buffer.from(JSON.stringify(shareableSetup)).toString('base64')
  const encodedValueURLSafe = encodedValue.replace('/', '_').replace('+', '-').replace('=', '')
  const { origin, pathname } = window.location
  return `${origin}${pathname}?data=${encodedValueURLSafe}`
}

async function displaySharingDialog(link: string) {
  let dialogContent = `This is a <a href="${link}">shareable link</a> to your current visualization.`
  try {
    await window.navigator.clipboard.writeText(link)
    dialogContent += '<br /><br />It has been automatically copied to your clipboard.'
  } catch (e) {
    console.error('Could not write shareable link to clipboard.', e)
  }
  showDialog('Sharing', { type: 'html', value: dialogContent })
}
