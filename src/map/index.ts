import { circle } from '../map'
import { CircleLayer, Layer, isAbsluteSize } from '../setups'
import { BoundingBox, LngLat } from '../types'

export type EventHandler<T = void> = (a: T) => void
export type ClickEventHandler = EventHandler<{ lngLat: LngLat }>

export abstract class BaseMap {
  constructor(protected center: LngLat) {}

  public abstract addFeature(feature: Feature, options?: { visible?: boolean }): void
  public abstract updateFeature(id: string, data: GeoJSON.Feature): void
  public abstract removeFeature(id: string): void
  public abstract showFeature(id: string): void
  public abstract hideFeature(id: string): void
  public abstract setCenter(center: LngLat): void
  public abstract flyTo(bbox: BoundingBox): void
  public abstract onLoad(handler: EventHandler): void
  public abstract onClick(handler: ClickEventHandler): void
}

export abstract class Feature<S extends FeatureState = FeatureState, L extends Layer = Layer> {
  protected id: string

  constructor(public layerDefinition: L, protected state: S, protected mapInstance: BaseMap) {
    this.id = layerDefinition.id
    this.mapInstance.addFeature(this)
  }

  public update(input: Partial<S>) {
    this.state = { ...this.state, ...input }
    this.mapInstance.updateFeature(this.id, this.data())
  }

  public remove() {
    this.mapInstance.removeFeature(this.id)
  }

  public show() {
    this.mapInstance.showFeature(this.id)
  }

  public hide() {
    this.mapInstance.hideFeature(this.id)
  }

  public abstract size(ratio: number): number
  public abstract data(): GeoJSON.Feature
}

export interface FeatureState {
  sizeRatio: number
  center: LngLat
}

export class CircleFeature extends Feature<FeatureState, CircleLayer> {
  constructor(layerDefinition: CircleLayer, state: FeatureState, mapInstance: BaseMap) {
    super(layerDefinition, state, mapInstance)
  }
  public size(ratio: number) {
    const { radius } = this.layerDefinition
    if (isAbsluteSize(radius)) {
      return radius
    } else {
      return ratio * radius.real
    }
  }
  public data() {
    return circle(this.state.center, this.size(this.state.sizeRatio))
  }
}
