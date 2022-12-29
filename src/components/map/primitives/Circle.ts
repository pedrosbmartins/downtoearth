import * as turf from '@turf/turf'

import map, { circle } from '../../../map'
import { BoundingBox } from '../../../store'
import { CircleLayer } from '../../../types'
import { CircleLabelSource, CircleSource, Source } from './sources'

interface Props {
  size: number
  center: number[]
  definition: CircleLayer
}

export class Circle {
  private definition: CircleLayer
  private sources: Source[]
  private mainSource: Source | undefined

  constructor(private id: string, private props: Props) {
    this.definition = props.definition
    this.sources = this.getSources()
    this.addSources()
    this.renderLayers()
  }

  public show() {
    this.sources.forEach(source => {
      source.layers.forEach(layer => {
        map.setLayoutProperty(layer.id, 'visibility', 'visible')
      })
    })
  }

  public hide() {
    this.sources.forEach(source => {
      source.layers.forEach(layer => {
        map.setLayoutProperty(layer.id, 'visibility', 'none')
      })
    })
  }

  public resize(size: number) {
    this.updateSources({ size })
  }

  public setCenter(center: number[]) {
    this.updateSources({ center })
  }

  public boundingBox(): BoundingBox {
    if (!this.mainSource) throw new Error(`layer ${this.id} does not have main source`)
    return turf.bbox(this.mainSource.data()) as BoundingBox
  }

  public destroy() {
    this.sources.forEach(source => {
      source.layers.forEach(({ id }) => map.removeLayer(id))
      map.removeSource(source.id)
    })
  }

  private center() {
    if (this.definition.offset) {
      const { value, bearing } = this.definition.offset
      return turf.destination(this.props.center, value, bearing).geometry.coordinates
    }
    return this.props.center
  }

  private updateSources(props: Partial<Props>) {
    this.props = { ...this.props, ...props }
    this.sources.forEach(source => source.update())
  }

  private addSources() {
    this.sources.forEach(source => {
      map.addSource(source.id, source.content())
    })
  }

  private getSources() {
    const sources: Source[] = []
    this.mainSource = new CircleSource(
      this.namespace('main'),
      () => circle(this.center(), this.props.size),
      this.definition
    )
    sources.push(this.mainSource)
    if (this.definition.label?.position === 'outline') {
      sources.push(
        new CircleLabelSource(
          this.namespace('outline-label'),
          () => circle(this.center(), 1.05 * this.props.size),
          { label: this.definition.label! }
        )
      )
    }
    return sources
  }

  private renderLayers() {
    this.sources.forEach(({ layers }) => {
      layers.forEach(layer => {
        map.addLayer(layer)
      })
    })
  }

  private namespace(value: string) {
    return `${this.id}-${value}`
  }
}
