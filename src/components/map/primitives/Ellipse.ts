import { ellipse } from '../../../map'
import { EllipseLayer, Size, isAbsluteSize } from '../../../types'
import { Layer } from './Layer'
import { OutlineLabelSource, Source } from './sources'
import { EllipseSource } from './sources/EllipseSource'

export class Ellipse extends Layer<EllipseLayer> {
  protected buildMainSource() {
    return new EllipseSource(
      this.namespace('main'),
      () => ({ center: this.props.center, axes: this.axes() }),
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
      () => ellipse(this.props.center, 1.05 * semiMajor, 1.05 * semiMinor),
      { label: this.definition.label! }
    )
  }

  private axes() {
    const { semiMajor, semiMinor } = this.definition.axes
    return { semiMajor: this.size(semiMajor), semiMinor: this.size(semiMinor) }
  }

  private size(axis: Size) {
    if (isAbsluteSize(axis)) {
      return axis
    } else {
      return (this.props.sizeRatio * axis.real) / 2
    }
  }
}
