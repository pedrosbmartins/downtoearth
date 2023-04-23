import { AnyLayer, FillLayer, LineLayer, SymbolLayer } from 'mapbox-gl'
import { ellipse } from '../../../../map'

import { Fill, Label, Outline } from '../../../../types'
import { Source } from './Source'

interface Props {
  visible: boolean
  fill?: Fill
  outline?: Outline
  label?: Label
}

interface EllipseData {
  center: number[]
  axes: { semiMajor: number; semiMinor: number }
}

export class EllipseSource extends Source {
  constructor(id: string, dataGetter: () => EllipseData, props: Props) {
    super(id, 'geojson', () => EllipseSource.data(dataGetter()), EllipseSource.layers(id, props))
  }

  private static data({ center, axes }: EllipseData) {
    return ellipse(center, axes.semiMajor, axes.semiMinor)
  }

  private static layers(sourceId: string, props: Props): AnyLayer[] {
    return [
      ...EllipseSource.fillLayer(sourceId, props),
      ...EllipseSource.outlineLayer(sourceId, props),
      ...EllipseSource.labelLayer(sourceId, props)
    ]
  }

  private static fillLayer(sourceId: string, props: Props): FillLayer[] {
    if (!props.fill) return []
    return [
      {
        id: `${sourceId}-fill`,
        type: 'fill',
        source: sourceId,
        layout: { visibility: props.visible ? 'visible' : 'none' },
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
