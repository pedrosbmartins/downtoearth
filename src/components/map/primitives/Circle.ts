import * as turf from '@turf/turf'
import { GeoJSONSource } from 'mapbox-gl'

import map from '../../../map'
import { BoundingBox } from '../../../store'
import { Fill, Outline } from '../../../types'

interface Props {
  size: number
  center: number[]
  fill?: Fill
  outline?: Outline
}

export class Circle {
  private sourceID = this.id('circle')

  constructor(private namespace: string, private props: Props) {
    this.addSource()
    this.renderLayers()
  }

  public show() {
    if (this.props.fill) map.setLayoutProperty(this.id('fill'), 'visibility', 'visible')
    if (this.props.outline) map.setLayoutProperty(this.id('outline'), 'visibility', 'visible')
  }

  public hide() {
    if (this.props.fill) map.setLayoutProperty(this.id('fill'), 'visibility', 'none')
    if (this.props.outline) map.setLayoutProperty(this.id('outline'), 'visibility', 'none')
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
    return turf.circle(this.props.center, this.props.size, { steps: 80, units: 'kilometers' })
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

  private id(value: string) {
    return `${this.namespace}-${value}`
  }
}
