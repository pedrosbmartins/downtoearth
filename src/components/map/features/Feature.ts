import { BaseMap } from '../../../map'
import { LngLat } from '../../../types'

export interface FeatureState {
  sizeRatio: number
  center: LngLat
  rootCenter: LngLat
}

export abstract class Feature {
  public id: string

  constructor(public state: FeatureState, protected mapInstance: BaseMap) {
    this.id = Math.random().toString().split('.')[1] // @todo: random UUID?
  }

  public render() {
    this.mapInstance.addFeature(this.id, this)
  }

  public update(input: Partial<FeatureState>) {
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
