import demo3JSON from '../setup/demo3.json'
import solarSystemJSON from '../setup/solar-system.json'
import App from './App'
import map from './map'
import { Config } from './types'
import { $configDropdown, $configFileSelector } from './ui'

const configs = {
  solarSystem: solarSystemJSON as Config,
  demo3: demo3JSON as Config
}

const app = new App()
let destroy: (() => void) | undefined

function initialize(config: Config) {
  if (destroy) destroy()
  destroy = app.initialize(config)
}

map.on('load', () => {
  initialize(configs.solarSystem)

  $configDropdown.addEventListener('change', function (this: HTMLSelectElement) {
    const config = configs[this.value as keyof typeof configs]
    if (config) {
      initialize(config)
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
    initialize(config)
  })
})
