import { ellipse } from '../../../../map'
import { LngLat } from '../../../../types'

import { ShapeSource } from './ShapeSource'

interface EllipseData {
  center: LngLat
  axes: { semiMajor: number; semiMinor: number }
}

export class EllipseSource extends ShapeSource<EllipseData> {
  public data() {
    const { center, axes } = this.dataGetter()
    return ellipse(center, axes.semiMajor, axes.semiMinor)
  }
}
