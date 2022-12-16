import * as turf from '@turf/turf'

import { initializeMap } from './map'
import { $sidebar } from './ui'

interface StoreEvent<T extends {}> extends Event {
  detail?: T & { name: string }
}

abstract class Store<D extends {}> {
  protected data: D
  protected listeners: EventTarget[] = []

  constructor(protected namespace: string, initialData: D) {
    this.namespace = namespace
    this.data = initialData
  }

  get<K extends keyof D>(field: K): D[K] {
    return this.data[field]
  }

  set(data: D): void {
    Object.assign(this.data, data)
    Object.keys(data).forEach(field => {
      this.broadcast(field as keyof D)
    })
  }

  public register<T extends EventTarget>(
    listener: T,
    field: keyof D,
    handler: (this: T, event: StoreEvent<D>) => void
  ) {
    this.listeners.push(listener)
    listener.addEventListener(this.eventName(field), handler)
  }

  private broadcast(field: keyof D) {
    for (const listener of this.listeners) {
      listener.dispatchEvent(
        new CustomEvent(this.eventName(field), { detail: { name: field, ...this.data } })
      )
    }
  }

  private eventName(field: keyof D) {
    return `${this.namespace}-${field}-changed`
  }
}

interface Data {
  visible: boolean
}

class TestStore extends Store<Data> {
  constructor(namespace: string) {
    super(namespace, { visible: true })
  }
}

function Button({ title, onClick }: { title: string; onClick: () => void }) {
  const $button = document.createElement('button') as HTMLButtonElement
  $button.innerText = title
  $button.addEventListener('click', onClick)
  return $button
}

function Square({ color }: { color: string }) {
  const $square = document.createElement('div')
  $square.setAttribute('style', `width:100px;height:100px;background:${color}`)
  return $square
}

abstract class StoreListener<D extends {}> extends EventTarget {
  constructor(store: Store<D>, events: Array<keyof D>) {
    super()
    events.forEach(event => {
      store.register(this, event as any, this.onUpdate)
    })
  }

  abstract onUpdate(event: StoreEvent<D>): void
}

interface MarkerOptions {
  color: string
  center: number[]
}

class CircleMapMarker extends StoreListener<Data> {
  constructor(private namespace: string, store: Store<Data>, private options: MarkerOptions) {
    super(store, ['visible'])
    this.onLoad()
  }

  onLoad() {
    this.addSource()
    this.renderLayers()
  }

  onUpdate(event: StoreEvent<Data>) {
    if (event.detail?.visible) {
      this.showLayers()
    } else {
      this.hideLayers()
    }
  }

  private addSource() {
    map.addSource(this.id('circle'), {
      type: 'geojson',
      data: turf.circle(this.options.center, 5, { steps: 50, units: 'kilometers' })
    })
  }

  private renderLayers() {
    map.addLayer({
      id: this.id('circle'),
      type: 'fill',
      source: this.id('circle'),
      layout: {},
      paint: {
        'fill-color': this.options.color,
        'fill-opacity': 0.5
      }
    })
    map.addLayer({
      id: this.id('outline'),
      type: 'line',
      source: this.id('circle'),
      layout: {},
      paint: {
        'line-color': '#000',
        'line-width': 3
      }
    })
  }

  private showLayers() {
    map.setLayoutProperty(this.id('circle'), 'visibility', 'visible')
    map.setLayoutProperty(this.id('outline'), 'visibility', 'visible')
  }

  private hideLayers() {
    map.setLayoutProperty(this.id('circle'), 'visibility', 'none')
    map.setLayoutProperty(this.id('outline'), 'visibility', 'none')
  }

  private id(value: string) {
    return `${this.namespace}-${value}`
  }
}

function createComponent(namespace: string, color: string, center: number[]) {
  const store = new TestStore(namespace)

  const $button = Button({
    title: 'Hide',
    onClick: () => {
      store.set({ visible: !store.get('visible') })
    }
  })
  store.register($button, 'visible', function (this, event) {
    this.innerText = event.detail?.visible ? 'Hide' : 'Show'
  })

  const $square = Square({ color })
  store.register($square, 'visible', function (this, event) {
    this.style.display = event.detail?.visible ? 'block' : 'none'
  })

  const $wrapper = document.createElement('div')
  $wrapper.append($button, $square)

  $sidebar.append($wrapper)

  new CircleMapMarker(namespace, store, { color, center })
}

const map = initializeMap()

map.on('load', () => {
  createComponent('test1', '#0080ff', [-43.2209, -22.9619])
  createComponent('test2', '#ff0033', [-43.2009, -22.9419])
})
