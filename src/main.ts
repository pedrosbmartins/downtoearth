import solarSystemJSON from '../setup/solar-system.json'
import { Button } from './components/dom'
import * as mapComponents from './components/map'
import map, { INITIAL_CENTER } from './map'
import { ModelData, Store } from './store'
import { Config, DiameterPreset, Group, Model, Root } from './types'
import { $configDropdown, $configFileSelector, $sidebar } from './ui'

const configs = {
  solarSystem: solarSystemJSON as Config
}

let destroy: (() => void) | undefined
let rootStore: Store<ModelData> | undefined

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
  const store = new Store<ModelData>('root', {
    center: INITIAL_CENTER,
    visible: root.visible,
    size: root.layer?.size!.value
  })
  $sidebar.append(buildItem(root.label, store, root.sizePresets))
  let mapComponent: mapComponents.Root | undefined
  if (root.layer) {
    mapComponent = new mapComponents.Root('root', store, { layerDefinitions: [root.layer] })
  }
  return { store, mapComponent }
}

function buildGroup(group: Group) {
  const store = new Store<ModelData>(`group-${group.id}`, {
    visible: group.visible
  })
  $sidebar.append(buildItem(group.label, store))
  const builtModels = group.models.map(model => buildModel(model, store))
  return { store, builtModels }
}

function buildModel(model: Model, groupStore?: Store<ModelData>) {
  const store = new Store<ModelData>(`model-${model.id}`, {
    visible: model.visible
  })
  $sidebar.append(buildItem(model.label, store))
  const mapComponent = new mapComponents.Regular(
    model.id,
    store,
    { layerDefinitions: model.layers },
    rootStore,
    groupStore
  )
  return { store, mapComponent }
}

function buildDiameterPresets(sizePresets: DiameterPreset[] | undefined, store: Store<ModelData>) {
  const $wrapper = document.createElement('div')
  if (!sizePresets) return $wrapper
  sizePresets.forEach(preset => {
    const PresetButton = Button(store, {
      title: `${preset.default ? '*' : ''}${preset.label}`,
      onClick: () => store.set({ size: preset.value }),
      events: ['size'],
      onUpdate: ($, event) => {
        const isCurrent = event.detail?.size === preset.value
        $.innerHTML = `${isCurrent ? '*' : ''}${preset.label}`
      }
    })
    $wrapper.append(PresetButton.dom())
  })
  return $wrapper
}

function buildItem(label: string, store: Store<ModelData>, sizePresets?: DiameterPreset[]) {
  const $label = document.createElement('h3')
  $label.innerText = label

  const $sizePresets = buildDiameterPresets(sizePresets, store)

  const VisibilityButton = Button(store, {
    title: 'Hide',
    onClick: () => {
      store.set({ visible: !store.get('visible') } as any) // @todo: fix typing
    },
    events: ['visible'],
    onUpdate: ($, event) => {
      $.innerText = event.detail?.visible ? 'Hide' : 'Show'
    }
  })

  const CenterButton = Button(store, {
    title: 'Center',
    onClick: () => {
      const boundingBox = store.get('boundingBox')
      if (!boundingBox) {
        console.warn(`store ${store.id()} has no bounding box defined`)
        return
      }
      map.fitBounds(boundingBox, { padding: 20 })
    }
  })

  const $wrapper = document.createElement('div')
  $wrapper.append($label, $sizePresets, VisibilityButton.dom(), CenterButton.dom())

  return $wrapper
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
