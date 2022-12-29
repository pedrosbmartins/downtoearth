import { AnyLayer, FillLayer, LineLayer } from 'mapbox-gl'

import { Fill, Outline } from '../../../../types'
import { Source } from './Source'

interface Props {
  fill?: Fill
  outline?: Outline
}

export class CircleSource extends Source {
  constructor(id: string, data: () => any, props: Props) {
    super(id, 'geojson', data, CircleSource.layers(id, props))
  }

  private static layers(sourceId: string, props: Props): AnyLayer[] {
    return [
      ...CircleSource.fillLayer(sourceId, props),
      ...CircleSource.outlineLayer(sourceId, props)
    ]
  }

  private static fillLayer(sourceId: string, props: Props): FillLayer[] {
    if (!props.fill) return []
    return [
      {
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        layout: {},
        paint: {
          'fill-color': props.fill.color,
          'fill-opacity': props.fill.opacity ?? 0.5
        }
      }
    ]
  }

  private static outlineLayer(sourceId: string, props: Props): LineLayer[] {
    if (!props.outline) return []
    return [
      {
        id: `${sourceId}-outline`,
        type: 'line',
        source: sourceId,
        layout: {},
        paint: {
          'line-color': props.outline.color,
          'line-width': props.outline.width ?? 1
        }
      }
    ]
  }
}
