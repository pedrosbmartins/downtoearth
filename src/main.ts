import demo3JSON from '../setup/demo3.json'
import solarSystemJSON from '../setup/solar-system.json'
import { SizePresets } from './components/dom'
import { SidebarItem } from './components/dom/SidebarItem'
import * as mapComponents from './components/map'
import map from './map'
import { GroupStore, ModelData, ModelStore, RootStore, UnitStore } from './store'
import { matchEvent } from './store/core'
import { Config, Group, Model, Root } from './types'
import { $configDropdown, $configFileSelector, $sidebar } from './ui'

const configs = {
  solarSystem: solarSystemJSON as Config,
  demo3: demo3JSON as Config
}

let destroy: (() => void) | undefined
let rootStore: RootStore | undefined
let unitStore: UnitStore

function initialize(config: Config) {
  if (destroy) destroy()
  const { root, groups } = config
  let rootMapComponent: mapComponents.Root | undefined
  if (root) {
    const { store, mapComponent } = buildRoot(root)
    rootStore = store
    rootMapComponent = mapComponent
  }
  unitStore = new UnitStore(rootStore)
  const builtGroups = groups?.map(group => buildGroup(group))
  return () => {
    $sidebar.innerHTML = ''
    rootStore?.destroy()
    rootStore = undefined
    rootMapComponent?.destroy()
    builtGroups?.forEach(group => {
      group.store.destroy()
      group.builtModels.forEach(model => {
        model.store.destroy()
        model.mapComponent.destroy()
      })
    })
  }
}

function buildRoot(root: Root) {
  const { label, sizePresets, layer } = root
  const store = new RootStore(root)
  const sizePresetsComponent = SizePresets({ presets: sizePresets }, store)
  const itemComponent = SidebarItem({ label, children: [sizePresetsComponent] }, store)
  $sidebar.append(itemComponent.dom())
  let mapComponent: mapComponents.Root | undefined
  if (layer) {
    mapComponent = new mapComponents.Root('root', store, {
      size: sizePresets.find(sp => sp.default)!.value,
      layerDefinitions: [layer]
    })
  }
  return { store, mapComponent }
}

function buildGroup(group: Group) {
  const store = new GroupStore(`group-${group.id}`, group, rootStore)
  const item = SidebarItem({ label: group.label }, store)
  $sidebar.append(item.dom())
  const builtModels = group.models.map(model => buildModel(model, store))
  const boundingBoxModel = builtModels.find(m => m.layers.some(l => l.actAsGroupBounds))
  if (boundingBoxModel) {
    store.set({ boundingBox: boundingBoxModel.mapComponent.boundingBox() })
    boundingBoxModel.store.register(store, 'boundingBox', event => {
      if (matchEvent<ModelData>(boundingBoxModel.store.id, 'model', event)) {
        store.set({ boundingBox: event.data.boundingBox })
      }
    })
  }
  return { store, builtModels }
}

function buildModel(model: Model, groupStore?: GroupStore) {
  const store = new ModelStore(model, unitStore, groupStore)
  const item = SidebarItem({ label: model.label }, store)
  $sidebar.append(item.dom())
  const mapComponent = new mapComponents.Regular(model.id, store, {
    layerDefinitions: model.layers
  })
  return { store, mapComponent, layers: model.layers }
}

map.on('load', () => {
  destroy = initialize(configs.solarSystem)

  $configDropdown.addEventListener('change', function (this: HTMLSelectElement) {
    const config = configs[this.value as keyof typeof configs]
    if (config) {
      destroy = initialize(config)
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
    destroy = initialize(config)
  })
})

map.on('click', event => {
  rootStore?.set({ center: event.lngLat.toArray() })
})
