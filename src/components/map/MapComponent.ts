import * as turf from '@turf/turf'
import map from '../../mapConfig'
import { CircleLayer, EllipseLayer, Layer, SingleModel } from '../../setups'
import { BaseModelData } from '../../store'
import { Store, StoreListener } from '../../store/core'
import { BoundingBox, LngLat } from '../../types'
import { mergeBoundingBoxes, toLngLat } from '../../utils'
import { CircleFeature, EllipseFeature, Feature, LineFeature } from './features'

export abstract class MapComponent<S extends Store<BaseModelData<any>>> extends StoreListener {
  protected features: Feature[] = []

  constructor(
    protected id: string,
    protected store: S,
    events: string[],
    protected definition: SingleModel
  ) {
    super([{ store, events }])
    this.features = this.definition.layers.map(layer => this.buildFeatures(layer)).flat()
    this.features.forEach(feature => feature.render())
    this.renderPopup()
  }

  public destroy() {
    this.features.forEach(feature => feature.remove())
    map.removePopup(this.id)
  }

  protected show() {
    this.features.forEach(features => features.show())
    this.renderPopup()
  }

  protected hide() {
    this.features.forEach(feature => feature.hide())
    map.removePopup(this.id)
  }

  protected resize(sizeRatio: number) {
    this.features.forEach(feature => {
      feature.update({ sizeRatio })
    })
    this.renderPopup()
  }

  protected setCenter(center: LngLat) {
    this.features.forEach(feature => {
      feature.update({ center, rootCenter: this.rootCenter() })
    })
    this.renderPopup()
  }

  protected renderPopup() {
    if (this.definition.popup && this.store.get('visible')) {
      const { content } = this.definition.popup
      map.removePopup(this.id)
      map.addPopup(this.id, content, this.centerOfMass())
    }
  }

  private buildFeatures(definition: Layer) {
    const isCircle = definition.shape === 'circle'
    const shape = isCircle ? this.buildCircle(definition) : this.buildEllipse(definition)
    const features: Feature[] = [shape]
    if (definition.drawLineToRoot) {
      features.push(new LineFeature(this.featureState(definition), map))
    }
    return features
  }

  private buildCircle(definition: CircleLayer) {
    return new CircleFeature(definition, this.featureState(definition), map)
  }

  private buildEllipse(definition: EllipseLayer) {
    return new EllipseFeature(definition, this.featureState(definition), map)
  }

  private featureState(layer: Layer) {
    return {
      center: this.center(layer),
      rootCenter: this.rootCenter(),
      sizeRatio: this.sizeRatio()
    }
  }

  public boundingBox(): BoundingBox {
    const featureBboxes = this.features
      .filter(feature => !(feature instanceof LineFeature))
      .map(feature => turf.bbox(feature.data()) as BoundingBox)
    return mergeBoundingBoxes(featureBboxes)
  }

  public centerOfMass(): LngLat {
    const allCenters = turf.points(this.definition.layers.map(layer => this.center(layer)))
    return toLngLat(turf.center(allCenters).geometry.coordinates)
  }

  protected abstract sizeRatio(): number
  protected abstract center(definition: Layer): LngLat
  protected abstract rootCenter(): LngLat
}
