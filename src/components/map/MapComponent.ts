import { CircleLayer, EllipseLayer, Layer as LayerDefinition } from '../../setups'
import { AnyStore, StoreListener } from '../../store/core'
import { LngLat } from '../../types'
import { Circle, Ellipse, Layer } from './primitives'

export interface Props {
  layerDefinitions: LayerDefinition[]
}

export interface MapLayer {
  rendered: Layer<LayerDefinition>
  definition: LayerDefinition
}

export abstract class MapComponent<S extends AnyStore> extends StoreListener {
  protected layers: MapLayer[] = []

  constructor(protected id: string, protected store: S, events: string[], protected props: Props) {
    super([{ store, events }])
  }

  public destroy() {
    this.layers.forEach(layer => layer.rendered.destroy())
  }

  protected show() {
    this.layers.forEach(({ rendered }) => rendered.show())
  }

  protected hide() {
    this.layers.forEach(({ rendered }) => rendered.hide())
  }

  protected resize(ratio: number) {
    this.layers.forEach(({ rendered }) => {
      rendered.resize(ratio)
    })
  }

  protected setCenter(value: LngLat) {
    this.layers.forEach(({ rendered }) => {
      rendered.setCenter(value)
    })
  }

  protected buildLayers() {
    return this.props.layerDefinitions.map(definition => {
      return { definition, rendered: this.buildLayer(definition) }
    })
  }

  private buildLayer(definition: LayerDefinition) {
    switch (definition.shape) {
      case 'circle':
        return this.buildCircle(definition)
      case 'ellipse':
        return this.buildEllipse(definition)
    }
  }

  private buildCircle(definition: CircleLayer) {
    return new Circle(`${this.id}-${definition.id}`, { definition, ...this.layerProps(definition) })
  }

  private buildEllipse(definition: EllipseLayer) {
    return new Ellipse(`${this.id}-${definition.id}`, {
      definition,
      ...this.layerProps(definition)
    })
  }

  private layerProps(definition: LayerDefinition) {
    return {
      sizeRatio: this.sizeRatio(),
      center: this.center(definition),
      rootCenter: this.rootCenter()
    }
  }

  protected abstract sizeRatio(): number
  protected abstract center(definition: LayerDefinition): LngLat
  protected abstract rootCenter(): () => LngLat | undefined
}
