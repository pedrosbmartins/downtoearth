import * as turf from '@turf/turf'
import { EllipseLayer, Size, isAbsluteSize } from '../../../setups'
import { toLngLat } from '../../../utils'
import { Layer } from './Layer'
import { EllipseOutlineLabelSource, EllipseSource, Source } from './sources'

interface EllipseAxes {
  semiMajor: number
  semiMinor: number
}

export class Ellipse extends Layer<EllipseLayer> {
  protected buildMainSource() {
    return new EllipseSource(
      this.namespace('main'),
      () => ({ center: this.center(), axes: this.axes() }),
      this.definition
    )
  }

  protected buildAdditionalSources(): Source[] {
    if (this.definition.label?.position === 'outline') {
      return [this.buildOutlineLabelSource()]
    }
    return []
  }

  private buildOutlineLabelSource() {
    return new EllipseOutlineLabelSource(
      this.namespace('outline-label'),
      () => ({ center: this.center(), axes: this.axes() }),
      { label: this.definition.label! }
    )
  }

  private axes(): EllipseAxes {
    const { semiMajor, semiMinor } = this.definition.axes
    return { semiMajor: this.size(semiMajor), semiMinor: this.size(semiMinor) }
  }

  private size(axis: Size) {
    if (isAbsluteSize(axis)) {
      return axis
    } else {
      return this.props.sizeRatio * axis.real
    }
  }

  private center() {
    const { center } = this.props
    const focusDistance = Ellipse.focus(this.axes())
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
