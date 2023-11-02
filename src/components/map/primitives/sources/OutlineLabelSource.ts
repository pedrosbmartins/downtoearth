import { SymbolLayer } from 'mapbox-gl'

import { circle, ellipse } from '../../../../mapConfig'
import { Label } from '../../../../setups'
import { LngLat } from '../../../../types'
import { Source } from './Source'

interface Props {
  label: Label
}

abstract class OutlineLabelSource<D extends {}> extends Source<D> {
  constructor(id: string, dataGetter: () => D, props: Props) {
    super(id, 'geojson', dataGetter, [OutlineLabelSource.layer(id, props)])
  }

  private static layer(sourceId: string, props: Props): SymbolLayer {
    return {
      id: `${sourceId}-label`,
      type: 'symbol',
      source: sourceId,
      layout: {
        'symbol-placement': 'line',
        'symbol-spacing': 500,
        'text-font': ['Open Sans Regular'],
        'text-field': props.label.value,
        'text-size': 14,
        'text-pitch-alignment': 'viewport'
      }
    }
  }
}

interface CircleData {
  center: LngLat
  radius: number
}

export class CircleOutlineLabelSource extends OutlineLabelSource<CircleData> {
  public data() {
    const { center, radius } = this.dataGetter()
    return circle(center, 1.05 * radius)
  }
}

interface EllipseData {
  center: LngLat
  axes: { semiMajor: number; semiMinor: number }
}

export class EllipseOutlineLabelSource extends OutlineLabelSource<EllipseData> {
  public data() {
    const { center, axes } = this.dataGetter()
    return ellipse(center, 1.05 * axes.semiMajor, 1.05 * axes.semiMinor)
  }
}
