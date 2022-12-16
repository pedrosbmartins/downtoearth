import * as turf from '@turf/turf'

import map from '../../map'
import { Store, StoreEvent } from '../../store'
import { StoreListener } from '../../store/listener'
import { Data } from '../../store/poc'

interface Options {
  color: string
  center: number[]
}

export class Circle extends StoreListener<Data> {
  constructor(private namespace: string, store: Store<Data>, private options: Options) {
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
