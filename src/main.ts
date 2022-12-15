import * as turf from '@turf/turf'

import { INITIAL_CENTER, initializeMap } from './map'
import { $sidebar } from './ui'

const map = initializeMap()

interface Props {
  visible: boolean
}

interface TypedCustomEvent<T> extends Event {
  detail?: T
}

class Component {
  private props: Props = { visible: true }
  private listeners: EventTarget[] = []

  get<K extends keyof Props>(propName: K): Props[K] {
    return this.props[propName]
  }

  set(update: Props): void {
    Object.assign(this.props, update)
    this.broadcastEvent()
  }

  public addListener<T extends EventTarget>(
    listener: T,
    event: string,
    handler: (this: T, event: TypedCustomEvent<Props>) => void
  ) {
    this.listeners.push(listener)
    listener.addEventListener(event, handler)
  }

  private broadcastEvent() {
    for (const listener of this.listeners) {
      listener.dispatchEvent(new CustomEvent('button-clicked', { detail: this.props }))
    }
  }
}

class Target extends EventTarget {
  public onUpdate(event: TypedCustomEvent<Props>) {
    if (event.detail?.visible) {
      createLayers()
    } else {
      map.removeLayer('maine')
      map.removeLayer('outline')
    }
  }
}

const $button = document.createElement('button') as HTMLButtonElement
$button.innerText = 'Click me'

const $display = document.createElement('div')
$display.setAttribute('style', 'width:100px;height:100px;background:red')

$sidebar.append($button, $display)

const component = new Component()

component.addListener(
  $display,
  'button-clicked',
  function (this: HTMLElement, event: TypedCustomEvent<Props>) {
    this.style.display = event.detail?.visible ? 'block' : 'none'
  }
)

component.addListener(new Target(), 'button-clicked', function (this, event) {
  this.onUpdate(event)
})

$button.addEventListener('click', event => component.set({ visible: !component.get('visible') }))

function createLayers() {
  map.addLayer({
    id: 'maine',
    type: 'fill',
    source: 'maine',
    layout: {},
    paint: {
      'fill-color': '#0080ff',
      'fill-opacity': 0.5
    }
  })
  map.addLayer({
    id: 'outline',
    type: 'line',
    source: 'maine',
    layout: {},
    paint: {
      'line-color': '#000',
      'line-width': 3
    }
  })
}

map.on('load', () => {
  map.addSource('maine', {
    type: 'geojson',
    data: turf.circle(INITIAL_CENTER as number[], 5, { steps: 50, units: 'kilometers' })
  })
  createLayers()
})
