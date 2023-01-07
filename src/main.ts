import demo3JSON from '../setup/demo3.json'
import solarSystemJSON from '../setup/solar-system.json'
import { SidebarItem } from './components/dom/SidebarItem'
import * as mapComponents from './components/map'
import map, { INITIAL_CENTER } from './map'
import { BaseStore, ModelData, ModelStore, Store, StoreListenerConfig } from './store'
import { Config, Group, Model, RelativeSize, Root } from './types'
import { $configDropdown, $configFileSelector, $sidebar } from './ui'

const configs = {
  solarSystem: solarSystemJSON as Config,
  demo3: demo3JSON as Config
}

let destroy: (() => void) | undefined
let rootStore: Store | undefined
let unitStore: Store | undefined

function initialize(config: Config) {
  if (destroy) destroy()
  const { unit, root, groups } = config
  let rootMapComponent: mapComponents.Root | undefined
  if (root) {
    const { store, mapComponent } = buildRoot(root)
    rootStore = store
    rootMapComponent = mapComponent
  }
  if (unit) {
    let baseSize = 1
    const config: StoreListenerConfig<ModelData>[] = []
    if (rootStore) {
      baseSize = rootStore.get('size')!.rendered
      config.push({ store: rootStore, events: ['size'] })
    }
    unitStore = new ModelStore(
      'unit',
      { size: { real: unit.km, rendered: baseSize / unit.km } },
      config
    )
  }
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
  const { label, sizePresets, layer, visible } = root
  const store = new Store('root', {
    center: INITIAL_CENTER,
    visible: visible,
    size: {
      real: (layer?.size as RelativeSize)?.real.value,
      rendered: sizePresets.find(sp => sp.default)!.value
    }
  })
  const item = SidebarItem({ label, sizePresets }, store)
  $sidebar.append(item.dom())
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
  const store = new Store(`group-${group.id}`, {
    visible: group.visible
  })
  const item = SidebarItem({ label: group.label }, store)
  $sidebar.append(item.dom())
  const builtModels = group.models.map(model => buildModel(model, store))
  const boundingBoxModel = builtModels.find(m => m.layers.some(l => l.actAsGroupBounds))
  if (boundingBoxModel) {
    store.set({ boundingBox: boundingBoxModel.mapComponent.boundingBox() })
    boundingBoxModel.store.register(store, 'boundingBox', event =>
      store.set({ boundingBox: event.detail!.boundingBox })
    )
  }
  return { store, builtModels }
}

function buildModel(model: Model, groupStore?: BaseStore<ModelData>) {
  const storeConfigs: StoreListenerConfig<ModelData>[] = []
  if (unitStore) {
    storeConfigs.push({ store: unitStore!, events: ['size'] })
  }
  if (rootStore) {
    const events: Array<keyof ModelData> = ['center']
    if (!unitStore) {
      events.push('size')
    }
    storeConfigs.push({ store: rootStore!, events })
  }
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
