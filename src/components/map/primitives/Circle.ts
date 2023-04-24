import { CircleLayer, isAbsluteSize } from '../../../types'
import { Layer } from './Layer'
import { CircleOutlineLabelSource, CircleSource, Source } from './sources'

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
    return new CircleOutlineLabelSource(
      this.namespace('outline-label'),
      () => ({ center: this.props.center, radius: 1.05 * this.radius() }),
      { label: this.definition.label! }
    )
  }

  private radius() {
    if (isAbsluteSize(this.definition.radius)) {
      return this.definition.radius
    } else {
      return this.props.sizeRatio * this.definition.radius.real
    }
  }
}
