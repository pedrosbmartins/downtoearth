import { AnyLayer, FillLayer, LineLayer, SymbolLayer } from 'mapbox-gl'

import { Fill, Label, Outline } from '../../../../types'
import { Source } from './Source'

interface Props {
  fill?: Fill
  outline?: Outline
  label?: Label
}

export class CircleSource extends Source {
  constructor(id: string, data: () => any, props: Props) {
    super(id, 'geojson', data, CircleSource.layers(id, props))
  }

  private static layers(sourceId: string, props: Props): AnyLayer[] {
    return [
      ...CircleSource.fillLayer(sourceId, props),
      ...CircleSource.outlineLayer(sourceId, props),
      ...CircleSource.labelLayer(sourceId, props)
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

  private static labelLayer(sourceId: string, props: Props): SymbolLayer[] {
    if (!props.label || props.label.position !== 'center') return []
    return [
      {
        id: `${sourceId}-label`,
        type: 'symbol',
        source: sourceId,
        layout: {
          'symbol-placement': 'point',
          'text-font': ['Open Sans Regular'],
          'text-field': props.label.value,
          'text-size': 14
        }
      }
    ]
  }
}
