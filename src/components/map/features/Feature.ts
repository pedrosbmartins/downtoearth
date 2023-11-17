import { nanoid } from 'nanoid'
import { BaseMap } from '../../../map'
import * as Setup from '../../../setups'
import { LngLat } from '../../../types'

export interface FeatureState {
  baseSize: number
  center: LngLat
  rootCenter: LngLat
}

export abstract class Feature {
  public id: string

  constructor(
    public definition: Setup.FeatureBase,
    public state: FeatureState,
    protected mapInstance: BaseMap
  ) {
    this.id = nanoid()
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
