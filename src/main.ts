import * as turf from '@turf/turf'

import { Button } from './components/dom'
import { Circle } from './components/map'
import map, { INITIAL_CENTER } from './map'
import { Store } from './store'
import { Config, Group, Layer, Root } from './types'
import { $sidebar } from './ui'

const config: Config = {
  root: {
    id: 'root',
    label: 'Root',
    realDiameter: 1,
    visible: true,
    diameterPresets: [],
    layers: [
      {
        id: 'root',
        shape: 'circle',
        visible: true,
        diameter: 5,
        fill: { color: '#0080ff' }
      }
    ]
  },
  groups: [
    {
      id: 'group-1',
      label: 'Group',
      visible: true,
      objects: [
        {
          id: 'object',
          label: 'Object',
          visible: true,
          layers: [
            {
              id: '1',
              shape: 'circle',
              visible: true,
              diameter: 15,
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
}

function initialize() {
  const { root, groups } = config
  buildRoot(root)
  groups?.forEach(group => {
    buildGroup(group)
  })
}

function buildRoot(root: Root) {
  const store = new Store<Data>('root', {
    visible: true,
    layers: []
  })
  $sidebar.append(buildItems(root.label, store))
  root.layers.forEach(layer => buildLayer(`root-${layer.id}`, store, layer))
}

function buildGroup(group: Group) {
  const store = new Store<Data>(`group-${group.id}`, {
    visible: true,
    layers: []
  })
  $sidebar.append(buildItems(group.label, store))
  group.objects.forEach(object => {
    object.layers.forEach(layer => buildLayer(`${group.id}-${layer.id}`, store, layer))
  })
}

function buildItems<D extends { visible: boolean; layers: Circle<D>[] }>(
  label: string,
  store: Store<D>
) {
  const $label = document.createElement('h3')
  $label.innerText = label

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
  $wrapper.append($label, VisibilityButton.dom(), CenterButton.dom())

  return $wrapper
}

function buildLayer<D extends { visible: boolean; layers: Circle<D>[] }>(
  id: string,
  store: Store<D>,
  layer: Layer
) {
  const circleLayer = new Circle(id, store, {
    diameter: layer.diameter!,
    fill: layer.fill,
    outline: layer.outline,
    center: INITIAL_CENTER as number[]
  })
  store.set({ layers: [...store.get('layers'), circleLayer] } as any) // @todo: fix typing
}

map.on('load', () => {
  initialize()
})
