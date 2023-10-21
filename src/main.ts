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

const setupFromURL = tryParseSetupFromURL()

map.on('load', () => {
  const initialSetup: keyof typeof setups = 'solarSystem'
  const $setupOptionElement = $setupDropdown.querySelector(`option[value=${initialSetup}]`)
  if ($setupOptionElement) {
    $setupOptionElement.setAttribute('selected', 'true')
  }

  let setup: Setup = setups[initialSetup]

  if (setupFromURL) {
    try {
      initializeSetupFromURL(setupFromURL)
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

  $shareButton.addEventListener('click', async () => {
    const { setup } = app
    if (!setup) {
      alert('Could not generate a shareable link: no visualization loaded.')
      return
    }
    const setupJSON = JSON.stringify(app.setup)
    const setupEncoded = Buffer.from(setupJSON).toString('base64')
    const setupEncodedURLSafe = setupEncoded.replace('/', '_').replace('+', '-').replace('=', '')
    const { origin, pathname } = window.location
    const link = `${origin}${pathname}?data=${setupEncodedURLSafe}`
    let dialogContent = `This is a <a href="${link}">shareable link</a> to your current visualization.`
    try {
      await window.navigator.clipboard.writeText(link)
      dialogContent += '<br /><br />It has been automatically copied to your clipboard.'
    } catch (e) {
      console.error('Could not write shareable link to clipboard.', e)
    }
    showDialog('Sharing', { type: 'html', value: dialogContent })
  })
})

function tryParseSetupFromURL() {
  const urlDataMatch = window.location.search.match(/data=(.+)/)
  const urlData = urlDataMatch && urlDataMatch[1]
  const urlDataContent = urlData && Buffer.from(urlData, 'base64').toString()
  if (!urlDataContent) return
  return JSON.parse(urlDataContent) as Setup
}

function initializeSetupFromURL(setup: Setup) {
  $setupFromURLOption.style.display = 'block'
  $setupFromURLOption.setAttribute('selected', 'true')
  $setupFromURLOption.innerText = setup.title
}
