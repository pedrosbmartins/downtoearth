import * as turf from '@turf/turf'
import map from '../../initializers/map'
import * as Setup from '../../setups'
import { BaseModelData } from '../../store'
import { Store, StoreListener } from '../../store/core'
import { BoundingBox, LngLat } from '../../types'
import { mergeBoundingBoxes, toLngLat } from '../../utils'
import { CircleFeature, EllipseFeature, Feature, FeatureState, LineFeature } from './features'

export abstract class MapComponent<S extends Store<BaseModelData<any>>> extends StoreListener {
  protected features: Feature[] = []

  constructor(protected store: S, events: string[], protected definition: Setup.SingleModel) {
    super([{ store, events }])
    this.features = this.definition.features.map(feature => this.buildFeatures(feature)).flat()
    this.features.forEach(feature => feature.render())
    this.renderPopup()
  }

  public destroy() {
    this.features.forEach(feature => feature.remove())
    map.removePopup(this.store.id)
  }

  protected show() {
    this.features.forEach(features => features.show())
    this.renderPopup()
  }

  protected hide() {
    this.features.forEach(feature => feature.hide())
    map.removePopup(this.store.id)
  }

  protected update() {
    this.features.forEach(feature => {
      feature.update(this.featureState(feature.definition))
    })
    this.renderPopup()
  }

  protected renderPopup() {
    if (this.definition.popup && this.store.get('visible')) {
      const { content } = this.definition.popup
      map.removePopup(this.store.id)
      map.addPopup(this.store.id, content, this.centerOfMass())
    }
  }

  private buildFeatures(definition: Setup.Feature) {
    const isCircle = definition.shape === 'circle'
    const shape = isCircle ? this.buildCircle(definition) : this.buildEllipse(definition)
    const features: Feature[] = [shape]
    if (definition.drawLineToRoot) {
      features.push(new LineFeature(definition, this.featureState(definition), map))
    }
    return features
  }

  private buildCircle(definition: Setup.CircleFeature) {
    return new CircleFeature(definition, this.featureState(definition), map)
  }

  private buildEllipse(definition: Setup.EllipseFeature) {
    return new EllipseFeature(definition, this.featureState(definition), map)
  }

  private featureState(definition: Setup.FeatureBase): FeatureState {
    return {
      center: this.center(definition),
      rootCenter: this.rootCenter(),
      baseSize: this.definition.size * this.sizeRatio()
    }
  }

  public boundingBox(): BoundingBox {
    const featureBboxes = this.features
      .filter(feature => !(feature instanceof LineFeature))
      .map(feature => turf.bbox(feature.data()) as BoundingBox)
    return mergeBoundingBoxes(featureBboxes)
  }

  public centerOfMass(): LngLat {
    const allCenters = turf.points(this.definition.features.map(feature => this.center(feature)))
    return toLngLat(turf.center(allCenters).geometry.coordinates)
  }

  protected abstract sizeRatio(): number
  protected abstract center(definition: Setup.FeatureBase): LngLat
  protected abstract rootCenter(): LngLat
}
