import solarSystemJSON from '../setup/solar-system.json'
import { SidebarItem } from './components/dom/SidebarItem'
import * as mapComponents from './components/map'
import map, { INITIAL_CENTER } from './map'
import { BaseStore, ModelData, ModelStore, Store, StoreListenerConfig } from './store'
import { Config, Group, Model, Root } from './types'
import { $configDropdown, $configFileSelector, $sidebar } from './ui'

const configs = {
  solarSystem: solarSystemJSON as Config
}

let destroy: (() => void) | undefined
let rootStore: Store | undefined

function initialize(config: Config) {
  if (destroy) destroy()
  const { root, groups } = config
  let rootMapComponent: mapComponents.Root | undefined
  if (root) {
    const { store, mapComponent } = buildRoot(root)
    rootStore = store
    rootMapComponent = mapComponent
  }
  const builtGroups = groups?.map(group => {
    return buildGroup(group)
  })
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
  const { label, sizePresets, layer, visible } = root
  const store = new Store('root', {
    center: INITIAL_CENTER,
    visible: visible,
    size: layer?.size.value
  })
  const item = SidebarItem({ label, sizePresets }, store)
  $sidebar.append(item.dom())
  let mapComponent: mapComponents.Root | undefined
  if (layer) {
    mapComponent = new mapComponents.Root('root', store, { layerDefinitions: [layer] })
  }
  return { store, mapComponent }
}

function buildGroup(group: Group) {
  const store = new Store(`group-${group.id}`, {
    visible: group.visible
  })
  const item = SidebarItem({ label: group.label }, store)
  $sidebar.append(item.dom())
  const builtModels = group.models.map(model => buildModel(model, store))
  return { store, builtModels }
}

function buildModel(model: Model, groupStore?: BaseStore<ModelData>) {
  const storeConfigs: StoreListenerConfig<ModelData>[] = []
  if (rootStore) storeConfigs.push({ store: rootStore!, events: ['size', 'center'] })
  if (groupStore) storeConfigs.push({ store: groupStore, events: ['visible'] })
  const store = new ModelStore(
    `model-${model.id}`,
    {
      visible: model.visible,
      size: rootStore?.get('size')
    },
    storeConfigs
  )
  const item = SidebarItem({ label: model.label }, store)
  $sidebar.append(item.dom())
  const mapComponent = new mapComponents.Regular(model.id, store, {
    layerDefinitions: model.layers
  })
  return { store, mapComponent }
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
