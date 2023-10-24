import { AnyLayer, FillLayer, LineLayer, SymbolLayer } from 'mapbox-gl'

import { Fill, Label, Outline } from '../../../../types'
import { Source } from './Source'

interface ShapeProps {
  visible?: boolean
  fill?: Fill
  outline?: Outline
  label?: Label
}

export abstract class ShapeSource<D extends {}> extends Source<D> {
  constructor(id: string, protected dataGetter: () => D, props: ShapeProps) {
    super(id, 'geojson', dataGetter, ShapeSource.layers(id, props))
  }

  private static layers(sourceId: string, props: ShapeProps): AnyLayer[] {
    return [
      ...this.fillLayer(sourceId, props),
      ...this.outlineLayer(sourceId, props),
      ...this.labelLayer(sourceId, props)
    ]
  }

  private static fillLayer(sourceId: string, props: ShapeProps): FillLayer[] {
    if (!props.fill) return []
    return [
      {
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        layout: {
          visibility: props.visible ?? true ? 'visible' : 'none'
        },
        paint: {
          'fill-color': props.fill.color,
          'fill-opacity': props.fill.opacity ?? 0.5
        }
      }
    ]
  }

  private static outlineLayer(sourceId: string, props: ShapeProps): LineLayer[] {
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

  private static labelLayer(sourceId: string, props: ShapeProps): SymbolLayer[] {
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
