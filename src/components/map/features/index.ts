import { Feature } from './Feature'

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
