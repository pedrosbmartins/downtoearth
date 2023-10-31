import * as turf from '@turf/turf'
import map from '../../map'
import { CircleFeature, Feature } from '../../map/index'
import { CircleLayer, EllipseLayer, Layer as LayerDefinition } from '../../setups'
import { AnyStore, StoreListener } from '../../store/core'
import { BoundingBox, LngLat } from '../../types'
import { mergeBoundingBoxes } from '../../utils'

export interface Props {
  layerDefinitions: LayerDefinition[]
}

export abstract class MapComponent<S extends AnyStore> extends StoreListener {
  protected features: Feature[] = []

  constructor(protected id: string, protected store: S, events: string[], protected props: Props) {
    super([{ store, events }])
    this.features = this.props.layerDefinitions.map(definition => this.buildFeature(definition))
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
      feature.update({ center })
    })
  }

  private buildFeature(definition: LayerDefinition) {
    switch (definition.shape) {
      case 'circle':
        return this.buildCircle(definition)
      default:
        throw new Error('...')
      // case 'ellipse':
      //   return this.buildEllipse(definition)
    }
  }

  private buildCircle(definition: CircleLayer) {
    return new CircleFeature(
      definition,
      {
        center: this.center(definition),
        sizeRatio: this.sizeRatio()
      },
      map
    )
  }

  private buildEllipse(definition: EllipseLayer) {
    // return new Ellipse(`${this.id}-${definition.id}`, {
    //   definition,
    //   ...this.layerProps(definition)
    // })
  }

  // private layerProps(definition: LayerDefinition) {
  //   return {
  //     sizeRatio: this.sizeRatio(),
  //     center: this.center(definition),
  //     rootCenter: this.rootCenter()
  //   }
  // }

  public boundingBox(): BoundingBox {
    const featureBboxes = this.features.map(feature => turf.bbox(feature.data()) as BoundingBox)
    return mergeBoundingBoxes(featureBboxes)
  }

  protected abstract sizeRatio(): number
  protected abstract center(definition: LayerDefinition): LngLat
  protected abstract rootCenter(): () => LngLat | undefined
}
