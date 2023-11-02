import * as turf from '@turf/turf'
import map from '../../mapConfig'
import { CircleLayer, EllipseLayer, Layer, Layer as LayerDefinition } from '../../setups'
import { AnyStore, StoreListener } from '../../store/core'
import { BoundingBox, LngLat } from '../../types'
import { mergeBoundingBoxes } from '../../utils'
import { CircleFeature, EllipseFeature, Feature, LineFeature } from './features'

export interface Props {
  layerDefinitions: LayerDefinition[]
}

export abstract class MapComponent<S extends AnyStore> extends StoreListener {
  protected features: Feature[] = []

  constructor(protected id: string, protected store: S, events: string[], protected props: Props) {
    super([{ store, events }])
    this.features = this.props.layerDefinitions
      .map(definition => this.buildFeatures(definition))
      .flat()
  }

  public destroy() {
    this.features.forEach(feature => feature.remove())
  }

  protected show() {
    this.features.forEach(features => features.show())
  }

  protected hide() {
    this.features.forEach(feature => feature.hide())
  }

  protected resize(sizeRatio: number) {
    this.features.forEach(feature => {
      feature.update({ sizeRatio })
    })
  }

  protected setCenter(center: LngLat) {
    this.features.forEach(feature => {
      feature.update({ center, rootCenter: this.rootCenter() })
    })
  }

  private buildFeatures(definition: LayerDefinition) {
    const isCircle = definition.shape === 'circle'
    const shape = isCircle ? this.buildCircle(definition) : this.buildEllipse(definition)
    const features: Feature[] = [shape]
    if (definition.drawLineToRoot) {
      features.push(new LineFeature(definition, this.featureState(definition), map))
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
    const featureBboxes = this.features.map(feature => turf.bbox(feature.data()) as BoundingBox)
    return mergeBoundingBoxes(featureBboxes)
  }

  protected abstract sizeRatio(): number
  protected abstract center(definition: LayerDefinition): LngLat
  protected abstract rootCenter(): LngLat
}
