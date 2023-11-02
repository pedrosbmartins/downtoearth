import * as turf from '@turf/turf'
import { BaseMap } from '.'
import { circle, ellipse } from '../map'
import { CircleLayer, EllipseLayer, Layer, Size, isAbsluteSize } from '../setups'
import { LngLat } from '../types'
import { toLngLat } from '../utils'

export interface FeatureState {
  sizeRatio: number
  center: LngLat
}

export abstract class Feature<S extends FeatureState = FeatureState, L extends Layer = Layer> {
  public id: string

  constructor(public layerDefinition: L, protected state: S, protected mapInstance: BaseMap) {
    this.id = layerDefinition.id
    this.mapInstance.addFeature(this.id, this)
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
