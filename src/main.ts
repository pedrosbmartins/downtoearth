import * as turf from '@turf/turf'

import { Button } from './components/dom'
import { Circle } from './components/map'
import map, { INITIAL_CENTER } from './map'
import { Store } from './store'
import { Config, DiameterPreset, Group, Layer, Model, Root } from './types'
import { $sidebar } from './ui'

const config: Config = {
  root: {
    id: 'root',
    label: 'Root',
    diameterPresets: [
      { label: '1', value: 1 },
      { label: '5', value: 5, default: true },
      { label: '10', value: 10 }
    ],
    visible: true,
    layer: {
      id: 'root',
      shape: 'circle',
      visible: true,
      diameter: { unit: 'km', value: 5 },
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
              diameter: { unit: 'root', value: 3 },
              outline: { color: '#ff0033' }
            }
          ]
        }
      ]
    }
  ]
}

interface Data {
  visible: boolean
  layers: Circle<Data>[]
  diameter?: number
}

let rootStore: Store<Data> | undefined

function initialize() {
  const { root, groups } = config
  rootStore = root && buildRoot(root)
  groups?.forEach(group => {
    buildGroup(group)
  })
}

function buildRoot(root: Root) {
  const store = new Store<Data>('root', {
    visible: root.visible,
    diameter: root.layer.diameter!.value,
    layers: []
  })
  $sidebar.append(buildItem(root.label, store, root.diameterPresets))
  buildLayer(`root-${root.layer.id}`, root.layer, store)
  return store
}

function buildGroup(group: Group) {
  const store = new Store<Data>(`group-${group.id}`, {
    visible: true,
    layers: []
  })
  $sidebar.append(buildItem(group.label, store))
  group.models.forEach(model => buildModel(model, store))
}

function buildModel(model: Model, groupStore?: Store<Data>) {
  const store =
    groupStore ??
    new Store<Data>(`model-${model.id}`, {
      visible: model.visible,
      layers: []
    })
  model.layers.forEach(layer => {
    buildLayer(`${model.id}-${layer.id}`, layer, store)
  })
}

function buildDiameterPresets(diameterPresets: DiameterPreset[] | undefined, store: Store<Data>) {
  const $wrapper = document.createElement('div')
  if (!diameterPresets) return $wrapper
  diameterPresets.forEach(preset => {
    const PresetButton = Button(store, {
      title: `${preset.default ? '*' : ''}${preset.label}`,
      onClick: () => store.set({ diameter: preset.value }),
      events: ['diameter'],
      onUpdate: ($, event) => {
        const isCurrent = event.detail?.diameter === preset.value
        $.innerHTML = `${isCurrent ? '*' : ''}${preset.label}`
      }
    })
    $wrapper.append(PresetButton.dom())
  })
  return $wrapper
}

function buildItem(label: string, store: Store<Data>, diameterPresets?: DiameterPreset[]) {
  const $label = document.createElement('h3')
  $label.innerText = label

  const $diameterPresets = buildDiameterPresets(diameterPresets, store)

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
      const layers = store.get('layers')
      map.fitBounds(
        turf.bbox(layers[layers.length - 1].source().data) as [number, number, number, number],
        { padding: 20 }
      )
    }
  })

  const $wrapper = document.createElement('div')
  $wrapper.append($label, $diameterPresets, VisibilityButton.dom(), CenterButton.dom())

  return $wrapper
}

function buildLayer(id: string, layer: Layer, store: Store<Data>) {
  const circleLayer = new Circle(
    id,
    store,
    {
      diameter:
        layer.diameter!.unit === 'km'
          ? layer.diameter!.value
          : (rootStore!.get('diameter') ?? 1) * layer.diameter!.value,
      fill: layer.fill,
      outline: layer.outline,
      center: INITIAL_CENTER as number[],
      ratio: layer.diameter!.unit === 'root' ? layer.diameter?.value : undefined
    },
    layer.diameter!.unit === 'root' && store.id() !== 'root' ? rootStore : undefined
  )
  store.set({ layers: [...store.get('layers'), circleLayer] } as any) // @todo: fix typing
}

map.on('load', () => {
  initialize()
})
