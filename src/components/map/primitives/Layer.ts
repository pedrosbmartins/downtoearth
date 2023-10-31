import * as turf from '@turf/turf'
import mapboxgl, { LngLatLike } from 'mapbox-gl'

import { INITIAL_CENTER } from '../../../constants'
import map from '../../../map'
import { Layer as LayerDefinition } from '../../../setups'
import { BoundingBox, LngLat } from '../../../types'
import { Source } from './sources'
import { LineSource } from './sources/LineSource'

interface Props<D extends LayerDefinition> {
  sizeRatio: number
  center: LngLat
  definition: D
  rootCenter?: () => LngLat | undefined
}

export abstract class Layer<D extends LayerDefinition> {
  protected definition: D
  protected sources: Source[]
  protected mainSource: Source | undefined
  protected popup: mapboxgl.Popup | undefined
  protected visible: boolean

  constructor(protected id: string, protected props: Props<D>) {
    this.definition = props.definition
    this.visible = true // this.definition.visible ?? true
    this.sources = [] //this.buildSources()
    this.renderPopup()
  }

  public show() {
    this.visible = true
    this.renderPopup()
    this.sources.forEach(source => {
      source.layers.forEach(layer => {
        map.instance.setLayoutProperty(layer.id, 'visibility', 'visible')
      })
    })
  }

  public hide() {
    this.visible = false
    this.popup?.remove()
    this.sources.forEach(source => {
      source.layers.forEach(layer => {
        map.instance.setLayoutProperty(layer.id, 'visibility', 'none')
      })
    })
  }

  public resize(sizeRatio: number) {
    this.updateSources({ sizeRatio })
  }

  public setCenter(center: LngLat) {
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
      source.layers.forEach(({ id }) => map.instance.removeLayer(id))
      map.instance.removeSource(source.id)
    })
  }

  private renderPopup() {
    if (!this.definition.popup || !this.visible) return
    this.popup?.remove()
    this.popup = new mapboxgl.Popup({ closeButton: false })
      .setLngLat(this.props.center as LngLatLike)
      .setText(this.definition.popup.content)
      .addTo(map.instance)
  }

  private updateSources(props: Partial<Props<D>>) {
    this.props = { ...this.props, ...props }
    this.sources.forEach(source => source.update())
  }

  private buildSources() {
    const sources: Source[] = []
    this.mainSource = this.buildMainSource()
    sources.push(this.mainSource)
    if (this.definition.drawLineToRoot) {
      sources.push(this.buildLineToRootSource())
    }
    sources.push(...this.buildAdditionalSources())
    return sources
  }

  protected abstract buildMainSource(): Source

  protected buildAdditionalSources(): Source[] {
    return []
  }

  private buildLineToRootSource() {
    return new LineSource(
      this.namespace('rootline'),
      () => ({
        from: (this.props.rootCenter && this.props.rootCenter()) || INITIAL_CENTER,
        to: this.props.center
      }),
      { visible: true } // this.definition.visible ?? true }
    )
  }

  protected namespace(value: string) {
    return `${this.id}-${value}`
  }
}
