import * as turf from '@turf/turf'
import { BaseMap } from '../../../map'
import { CircleLayer, EllipseLayer, ShapeLayer, Size, isAbsluteSize } from '../../../setups'
import { toLngLat } from '../../../utils'
import { Feature, FeatureState } from './Feature'

export abstract class ShapeFeature<L extends ShapeLayer> extends Feature {
  constructor(public layerDefinition: L, state: FeatureState, mapInstance: BaseMap) {
    super(layerDefinition, state, mapInstance)
  }
}

export class CircleFeature extends ShapeFeature<CircleLayer> {
  private renderOptions = { steps: 80, units: 'kilometers' as const }

  public data() {
    return turf.circle(this.state.center, this.size(this.state.sizeRatio), this.renderOptions)
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

export class EllipseFeature extends ShapeFeature<EllipseLayer> {
  private renderOptions = { steps: 180, units: 'kilometers' as const }

  public data() {
    const { semiMajor, semiMinor } = this.axes()
    return turf.ellipse(this.center(), semiMajor, semiMinor, this.renderOptions)
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
