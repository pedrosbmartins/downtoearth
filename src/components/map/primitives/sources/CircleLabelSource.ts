import { SymbolLayer } from 'mapbox-gl'

import { Label } from '../../../../types'
import { Source } from './Source'

interface Props {
  label: Label
}

export class CircleLabelSource extends Source {
  constructor(id: string, data: () => any, props: Props) {
    super(id, 'geojson', data, [CircleLabelSource.layer(id, props)])
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
