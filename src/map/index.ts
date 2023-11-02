import * as turf from '@turf/turf'
import { circle, ellipse } from '../map'
import { CircleLayer, EllipseLayer, Layer, Size, isAbsluteSize } from '../setups'
import { BoundingBox, LngLat } from '../types'
import { toLngLat } from '../utils'

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

  public data() {
    return circle(this.state.center, this.size(this.state.sizeRatio))
  }

  private size(ratio: number) {
    const { radius } = this.layerDefinition
    if (isAbsluteSize(radius)) {
      return radius
    } else {
      return ratio * radius.real
    }
  }
}

interface EllipseAxes {
  semiMajor: number
  semiMinor: number
}

export class EllipseFeature extends Feature<FeatureState, EllipseLayer> {
  constructor(layerDefinition: EllipseLayer, state: FeatureState, mapInstance: BaseMap) {
    super(layerDefinition, state, mapInstance)
  }

  public data() {
    const { semiMajor, semiMinor } = this.axes()
    return ellipse(this.center(), semiMajor, semiMinor)
  }

  private axes(): EllipseAxes {
    const { semiMajor, semiMinor } = this.layerDefinition.axes
    return { semiMajor: this.size(semiMajor), semiMinor: this.size(semiMinor) }
  }

  private size(axis: Size) {
    if (isAbsluteSize(axis)) {
      return axis
    } else {
      return this.state.sizeRatio * axis.real
    }
  }

  private center() {
    const { center } = this.state
    const focusDistance = EllipseFeature.focus(this.axes())
    const destination = turf.rhumbDestination(center, focusDistance, 270)
    return toLngLat(destination.geometry.coordinates)
  }

  static eccentricity({ semiMajor, semiMinor }: EllipseAxes) {
    return Math.sqrt(1 - Math.pow(semiMinor, 2) / Math.pow(semiMajor, 2))
  }

  static focus(axes: EllipseAxes) {
    return axes.semiMajor * this.eccentricity(axes)
  }
}
