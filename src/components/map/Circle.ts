import * as turf from '@turf/turf'

import map from '../../map'
import { Store, StoreEvent } from '../../store'
import { StoreListener } from '../../store/listener'
import { Data } from '../../store/poc'
import { Fill, Outline } from '../../types'

interface Options {
  diameter: number
  center: number[]
  fill?: Fill
  outline?: Outline
}

export class Circle<D extends { visible: boolean }> extends StoreListener<D> {
  constructor(private namespace: string, store: Store<D>, private props: Options) {
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

  public source(): { type: 'geojson'; data: turf.Feature<turf.Polygon> } {
    return {
      type: 'geojson',
      data: turf.circle(this.props.center, this.props.diameter, { steps: 80, units: 'kilometers' })
    }
  }

  private addSource() {
    map.addSource(this.id('circle'), this.source())
  }

  private renderLayers() {
    this.renderFill()
    this.renderOutline()
  }

  private renderFill() {
    if (!this.props.fill) return
    map.addLayer({
      id: this.id('fill'),
      type: 'fill',
      source: this.id('circle'),
      layout: {},
      paint: {
        'fill-color': this.props.fill.color,
        'fill-opacity': this.props.fill.opacity ?? 0.5
      }
    })
  }

  private renderOutline() {
    const { outline } = this.props
    if (!outline) return
    map.addLayer({
      id: this.id('outline'),
      type: 'line',
      source: this.id('circle'),
      layout: {},
      paint: {
        'line-color': outline.color,
        'line-width': outline.width ?? 3
      }
    })
  }

  private showLayers() {
    if (this.props.fill) map.setLayoutProperty(this.id('fill'), 'visibility', 'visible')
    if (this.props.outline) map.setLayoutProperty(this.id('outline'), 'visibility', 'visible')
  }

  private hideLayers() {
    if (this.props.fill) map.setLayoutProperty(this.id('fill'), 'visibility', 'none')
    if (this.props.outline) map.setLayoutProperty(this.id('outline'), 'visibility', 'none')
  }

  private id(value: string) {
    return `${this.namespace}-${value}`
  }
}
