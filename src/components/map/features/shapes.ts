import * as turf from '@turf/turf'
import { BaseMap } from '../../../map'
import * as Setup from '../../../setups'
import { toLngLat } from '../../../utils'
import { Feature, FeatureState } from './Feature'

export abstract class ShapeFeature<L extends Setup.ShapeFeature> extends Feature {
  constructor(public definition: L, state: FeatureState, mapInstance: BaseMap) {
    super(definition, state, mapInstance)
  }
}

export class CircleFeature extends ShapeFeature<Setup.CircleFeature> {
  private readonly DEFAULT_RADIUS_RATIO = 0.5
  private renderOptions = { steps: 80, units: 'kilometers' as const }

  public data() {
    return turf.circle(this.state.center, this.size(), this.renderOptions)
  }

  private size() {
    const { radiusRatio } = this.definition
    console.log(this.id, this.state.baseSize)
    return this.state.baseSize * (radiusRatio ?? this.DEFAULT_RADIUS_RATIO)
  }
}

interface EllipseAxes {
  semiMajor: number
  semiMinor: number
}

export class EllipseFeature extends ShapeFeature<Setup.EllipseFeature> {
  private readonly DEFAULT_AXIS_RATIO = { semiMajor: 0.5, semiMinor: 0.25 }

  private renderOptions = { steps: 180, units: 'kilometers' as const }

  public data() {
    const { semiMajor, semiMinor } = this.axes()
    return turf.ellipse(this.center(), semiMajor, semiMinor, this.renderOptions)
  }

  private axes(): EllipseAxes {
    const { axesRatios } = this.definition
    const { semiMajor, semiMinor } = axesRatios ?? this.DEFAULT_AXIS_RATIO
    return { semiMajor: this.size(semiMajor), semiMinor: this.size(semiMinor) }
  }

  private size(ratio: number) {
    return this.state.baseSize * ratio
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
