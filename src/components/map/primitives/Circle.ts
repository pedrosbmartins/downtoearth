import * as turf from '@turf/turf'
import mapboxgl, { LngLatLike } from 'mapbox-gl'

import { INITIAL_CENTER } from '../../../constants'
import map, { circle } from '../../../map'
import { BoundingBox } from '../../../store'
import { CircleLayer } from '../../../types'
import { CircleLabelSource, CircleSource, Source } from './sources'
import { LineSource } from './sources/LineSource'

interface Props {
  size: number
  center: number[]
  definition: CircleLayer
  rootCenter?: () => number[] | undefined
}

export class Circle {
  private definition: CircleLayer
  private sources: Source[]
  private mainSource: Source | undefined
  private popup: mapboxgl.Popup | undefined
  private visible: boolean

  constructor(private id: string, private props: Props) {
    this.definition = props.definition
    this.visible = this.definition.visible
    this.sources = this.buildSources()
    this.renderPopup()
  }

  public show() {
    this.visible = true
    this.renderPopup()
    this.sources.forEach(source => {
      source.layers.forEach(layer => {
        map.setLayoutProperty(layer.id, 'visibility', 'visible')
      })
    })
  }

  public hide() {
    this.visible = false
    this.popup?.remove()
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
    this.renderPopup()
  }

  public boundingBox(): BoundingBox {
    if (!this.mainSource) throw new Error(`layer ${this.id} does not have main source`)
    return turf.bbox(this.mainSource.data()) as BoundingBox
  }

  public destroy() {
    this.popup?.remove()
    this.sources.forEach(source => {
      source.layers.forEach(({ id }) => map.removeLayer(id))
      map.removeSource(source.id)
    })
  }

  private renderPopup() {
    if (!this.definition.popup || !this.visible) return
    this.popup?.remove()
    this.popup = new mapboxgl.Popup({ closeButton: false })
      .setLngLat(this.props.center as LngLatLike)
      .setHTML(this.definition.popup!.content)
      .addTo(map)
  }

  private updateSources(props: Partial<Props>) {
    this.props = { ...this.props, ...props }
    this.sources.forEach(source => source.update())
  }

  private buildSources() {
    const sources: Source[] = []
    this.mainSource = this.buildMainSource()
    sources.push(this.mainSource)
    if (this.definition.label?.position === 'outline') {
      sources.push(this.buildOutlineLabelSource())
    }
    if (this.definition.drawLineToRoot) {
      sources.push(this.buildLineToRootSource())
    }
    return sources
  }

  private buildMainSource() {
    return new CircleSource(
      this.namespace('main'),
      () => ({ center: this.props.center, radius: this.radius() }),
      this.definition
    )
  }

  private buildOutlineLabelSource() {
    return new CircleLabelSource(
      this.namespace('outline-label'),
      () => circle(this.props.center, 1.05 * this.radius()),
      { label: this.definition.label! }
    )
  }

  private buildLineToRootSource() {
    return new LineSource(
      this.namespace('rootline'),
      () => ({
        from: (this.props.rootCenter && this.props.rootCenter()) || INITIAL_CENTER,
        to: this.props.center
      }),
      { visible: this.definition.visible }
    )
  }

  private radius() {
    return this.props.size / 2
  }

  private namespace(value: string) {
    return `${this.id}-${value}`
  }
}
