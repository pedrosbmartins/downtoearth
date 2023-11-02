import { BaseMap } from '../../../map'
import { Layer } from '../../../setups'
import { LngLat } from '../../../types'

export interface FeatureState {
  sizeRatio: number
  center: LngLat
  rootCenter: LngLat
}

export abstract class Feature<S extends FeatureState = FeatureState, L extends Layer = Layer> {
  public id: string

  constructor(public layerDefinition: L, public state: S, protected mapInstance: BaseMap) {
    this.id = layerDefinition.id
    this.mapInstance.addFeature(this.id, this)
  }

  public update(input: Partial<S>) {
    this.state = { ...this.state, ...input }
    this.mapInstance.updateFeature(this.id, this.data())
  }

  public remove() {
    this.mapInstance.removeFeature(this.id)
  }

  public show() {
    this.mapInstance.showFeature(this.id)
  }

  public hide() {
    this.mapInstance.hideFeature(this.id)
  }

  public abstract data(): GeoJSON.Feature
}
