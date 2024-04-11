import * as turf from '@turf/turf'
import { BaseMap } from '../../../map'
import * as Setup from '../../../setups'
import { Feature, FeatureState } from './Feature'

export { Feature, FeatureState } from './Feature'
export { CircleFeature, EllipseFeature } from './shapes'

export class LineFeature extends Feature {
  public data(): GeoJSON.Feature {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [this.state.rootCenter, this.state.center]
      }
    }
  }
}

export class ImageFeature extends Feature {
  constructor(
    public definition: Setup.ImageFeature,
    public state: FeatureState & { opacity?: number },
    protected mapInstance: BaseMap
  ) {
    super(definition, state, mapInstance)
  }

  public data(): GeoJSON.Feature<GeoJSON.Polygon> {
    return {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [this.coordinates()]
      }
    }
  }

  private coordinates() {
    const { center, baseSize } = this.state
    let { width, height } = this.definition.realDimensions

    width *= baseSize
    height *= baseSize

    const topMid = this.destination(center, height / 2, 0)
    const topLeft = this.destination(topMid, width / 2, 270)
    const topRight = this.destination(topLeft, width, 90)
    const bottomLeft = this.destination(topLeft, height, 180)
    const bottomRight = this.destination(bottomLeft, width, 90)
    return [topLeft, topRight, bottomRight, bottomLeft]
  }

  private destination(origin: number[], distance: number, bearing: number) {
    return turf.rhumbDestination(origin, distance, bearing).geometry.coordinates
  }
}
