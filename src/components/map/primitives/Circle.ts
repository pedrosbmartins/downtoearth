import { circle } from '../../../map'
import { CircleLayer, isAbsluteSize } from '../../../types'
import { Layer } from './Layer'
import { CircleSource, OutlineLabelSource, Source } from './sources'

export class Circle extends Layer<CircleLayer> {
  protected buildMainSource() {
    return new CircleSource(
      this.namespace('main'),
      () => ({ center: this.props.center, radius: this.radius() }),
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
    return new OutlineLabelSource(
      this.namespace('outline-label'),
      () => circle(this.props.center, 1.05 * this.radius()),
      { label: this.definition.label! }
    )
  }

  private radius() {
    if (isAbsluteSize(this.definition.size)) {
      return this.definition.size
    } else {
      return (this.props.sizeRatio * this.definition.size.real) / 2
    }
  }
}
