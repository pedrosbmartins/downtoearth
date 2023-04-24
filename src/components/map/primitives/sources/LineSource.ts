import { LineLayer } from 'mapbox-gl'

import { Source } from './Source'

interface Props {
  visible: boolean
}

interface LineData {
  from: number[]
  to: number[]
}

export class LineSource extends Source<LineData> {
  public layer: LineLayer

  constructor(id: string, dataGetter: () => LineData, props: Props) {
    super(id, 'geojson', dataGetter, [LineSource.layer(id, props)])
    this.layer = this.layers[0] as LineLayer
  }

  public data(): GeoJSON.Feature {
    const { from, to } = this.dataGetter()
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [from, to]
      }
    }
  }

  private static layer(sourceId: string, props: Props): LineLayer {
    return {
      id: sourceId,
      type: 'line',
      source: sourceId,
      paint: {
        'line-color': '#555',
        'line-width': 2
      }
    }
  }
}
