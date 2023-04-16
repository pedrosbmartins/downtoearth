import alphaCentauriJSON from '../setup/alpha-centauri.json'
import demoJSON from '../setup/demo.json'
import earthSatellitesJSON from '../setup/earth-satellites.json'
import solarSystemJSON from '../setup/solar-system.json'
import starSizesJSON from '../setup/star-sizes.json'
import App from './App'
import map from './map'
import { Config } from './types'
import { $configDropdown, $configFileSelector } from './ui'

const configs = {
  alphaCentauri: alphaCentauriJSON as Config,
  earthSatellites: earthSatellitesJSON as Config,
  solarSystem: solarSystemJSON as Config,
  starSizes: starSizesJSON as Config,
  demo: demoJSON as Config
}

const app = new App()

map.on('load', () => {
  app.initialize(configs.earthSatellites)

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
})
