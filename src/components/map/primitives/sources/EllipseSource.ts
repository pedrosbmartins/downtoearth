import { ellipse } from '../../../../map'

import { ShapeSource } from './ShapeSource'

interface EllipseData {
  center: number[]
  axes: { semiMajor: number; semiMinor: number }
}

export class EllipseSource extends ShapeSource<EllipseData> {
  public data() {
    const { center, axes } = this.dataGetter()
    return ellipse(center, axes.semiMajor, axes.semiMinor)
  }
}
