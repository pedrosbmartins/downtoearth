import * as turf from '@turf/turf'
import { ellipse } from '../../../map'
import { EllipseLayer, Size, isAbsluteSize } from '../../../types'
import { Layer } from './Layer'
import { OutlineLabelSource, Source } from './sources'
import { EllipseSource } from './sources/EllipseSource'

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
    const { semiMajor, semiMinor } = this.axes()
    return new OutlineLabelSource(
      this.namespace('outline-label'),
      () => ellipse(this.center(), 1.05 * semiMajor, 1.05 * semiMinor),
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
    return destination.geometry.coordinates
  }

  static eccentricity({ semiMajor, semiMinor }: EllipseAxes) {
    return Math.sqrt(1 - Math.pow(semiMinor, 2) / Math.pow(semiMajor, 2))
  }

  static focus(axes: EllipseAxes) {
    return axes.semiMajor * this.eccentricity(axes)
  }
}
