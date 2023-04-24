import { circle } from '../../../../map'

import { ShapeSource } from './ShapeSource'

interface CircleData {
  center: number[]
  radius: number
}

export class CircleSource extends ShapeSource<CircleData> {
  public data() {
    const { center, radius } = this.dataGetter()
    return circle(center, radius)
  }
}
