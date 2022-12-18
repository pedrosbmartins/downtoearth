import * as turf from '@turf/turf'

import map from '../../map'
import { Store, StoreEvent } from '../../store'
import { StoreListener } from '../../store/listener'
import { Fill, Outline } from '../../types'

interface Options {
  diameter: number
  ratio?: number
  center: number[]
  fill?: Fill
  outline?: Outline
}

export class Circle<D extends { visible: boolean; diameter?: number }> extends StoreListener<D> {
  constructor(
    private namespace: string,
    store: Store<D>,
    private props: Options,
    private rootStore?: Store<D>
  ) {
    const stores = [{ store, events: ['visible', 'diameter'] as Array<keyof D> }]
    if (rootStore) stores.push({ store: rootStore, events: ['diameter' as keyof D] })
    super(stores)
    this.render()
  }

  render() {
    this.addSource()
    this.renderLayers()
  }

  onUpdate(storeId: string, event: StoreEvent<D>) {
    if (storeId === 'root' && this.rootStore) {
      this.onRootUpdate(event)
    } else {
      switch (event.detail!.name) {
        case 'visible':
          if (event.detail?.visible) {
            this.showLayers()
          } else {
            this.hideLayers()
          }
          break
        case 'diameter':
          this.resize(event.detail!.diameter!)
          break
        default:
          console.error(`no handler for event ${name}`)
          break
      }
    }
  }

  onRootUpdate(event: StoreEvent<D>) {
    if (event.detail?.name === 'diameter') {
      this.resize(event.detail!.diameter! * this.props.ratio!)
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

  private resize(diameter: number) {
    this.props.diameter = diameter
    if (this.props.fill) map.removeLayer(this.id('fill'))
    if (this.props.outline) map.removeLayer(this.id('outline'))
    map.removeSource(this.id('circle'))
    this.render()
  }

  private id(value: string) {
    return `${this.namespace}-${value}`
  }
}
