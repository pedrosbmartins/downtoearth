import { circle } from '../../../../mapConfig'
import { LngLat } from '../../../../types'

import { ShapeSource } from './ShapeSource'

interface CircleData {
  center: LngLat
  radius: number
}

export class CircleSource extends ShapeSource<CircleData> {
  public data() {
    const { center, radius } = this.dataGetter()
    return circle(center, radius)
  }
}
