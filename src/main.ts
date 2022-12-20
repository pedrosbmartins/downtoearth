import { Button } from './components/dom'
import * as mapComponents from './components/map'
import map, { INITIAL_CENTER } from './map'
import { ModelData, Store } from './store'
import { Config, DiameterPreset, Group, Model, Root } from './types'
import { $sidebar } from './ui'

const config: Config = {
  root: {
    id: 'root',
    label: 'Root',
    sizePresets: [
      { label: '1', value: 1 },
      { label: '5', value: 5, default: true },
      { label: '10', value: 10 }
    ],
    visible: true,
    layer: {
      id: 'root',
      shape: 'circle',
      visible: true,
      size: { unit: 'km', value: 5 },
      fill: { color: '#0080ff' }
    }
  },
  groups: [
    {
      id: 'group-1',
      label: 'Group',
      visible: true,
      models: [
        {
          id: 'object',
          label: 'Object',
          visible: true,
          layers: [
            {
              id: '1',
              shape: 'circle',
              visible: true,
              size: { unit: 'root', value: 3 },
              outline: { color: '#ff0033' }
            }
          ]
        }
      ]
    }
  ]
}

let rootStore: Store<ModelData> | undefined

function initialize() {
  const { root, groups } = config
  rootStore = root && buildRoot(root)
  groups?.forEach(group => {
    buildGroup(group)
  })
}

function buildRoot(root: Root) {
  const store = new Store<ModelData>('root', {
    center: INITIAL_CENTER,
    visible: root.visible,
    size: root.layer.size!.value
  })
  $sidebar.append(buildItem(root.label, store, root.sizePresets))
  new mapComponents.Root('root', store, { layerDefinitions: [root.layer] })
  return store
}

function buildGroup(group: Group) {
  const store = new Store<ModelData>(`group-${group.id}`, {
    visible: group.visible
  })
  $sidebar.append(buildItem(group.label, store))
  group.models.forEach(model => buildModel(model, store))
}

function buildModel(model: Model, groupStore?: Store<ModelData>) {
  const store =
    groupStore ??
    new Store<ModelData>(`model-${model.id}`, {
      visible: model.visible
    })
  new mapComponents.Regular(model.id, store, { layerDefinitions: model.layers }, rootStore)
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
  initialize()
})

map.on('click', event => {
  rootStore?.set({ center: event.lngLat.toArray() })
})
