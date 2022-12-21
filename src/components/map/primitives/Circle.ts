import * as turf from '@turf/turf'
import { GeoJSONSource } from 'mapbox-gl'

import map from '../../../map'
import { BoundingBox } from '../../../store'
import { CircleLayer } from '../../../types'

interface Props {
  size: number
  center: number[]
  definition: CircleLayer
}

export class Circle {
  private sourceID = this.id('circle')
  private layer: CircleLayer

  constructor(private namespace: string, private props: Props) {
    this.layer = props.definition
    this.addSource()
    this.renderLayers()
  }

  public show() {
    if (this.layer.fill) map.setLayoutProperty(this.id('fill'), 'visibility', 'visible')
    if (this.layer.outline) map.setLayoutProperty(this.id('outline'), 'visibility', 'visible')
  }

  public hide() {
    if (this.layer.fill) map.setLayoutProperty(this.id('fill'), 'visibility', 'none')
    if (this.layer.outline) map.setLayoutProperty(this.id('outline'), 'visibility', 'none')
  }

  public resize(size: number) {
    this.updateSource({ size })
  }

  public setCenter(center: number[]) {
    this.updateSource({ center })
  }

  public boundingBox(): BoundingBox {
    return turf.bbox(this.sourceData()) as BoundingBox
  }

  private sourceData() {
    return turf.circle(this.center(), this.props.size, { steps: 80, units: 'kilometers' })
  }

  private center() {
    if (this.layer.offset) {
      const { value, bearing } = this.layer.offset
      return turf.destination(this.props.center, value, bearing)
    }
    return this.props.center
  }

  private addSource() {
    map.addSource(this.sourceID, { type: 'geojson', data: this.sourceData() })
  }

  private updateSource(props: Partial<Props>) {
    this.props = { ...this.props, ...props }
    ;(map.getSource(this.sourceID) as GeoJSONSource).setData(this.sourceData())
  }

  private renderLayers() {
    this.renderFill()
    this.renderOutline()
  }

  private renderFill() {
    if (!this.layer.fill) return
    map.addLayer({
      id: this.id('fill'),
      type: 'fill',
      source: this.id('circle'),
      layout: {},
      paint: {
        'fill-color': this.layer.fill.color,
        'fill-opacity': this.layer.fill.opacity ?? 0.5
      }
    })
  }

  private renderOutline() {
    const { outline } = this.layer
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

  private id(value: string) {
    return `${this.namespace}-${value}`
  }
}
