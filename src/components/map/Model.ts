import { AnyStore, StoreListener } from '../../store/core'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'

export interface ModelProps {
  layerDefinitions: Layer[]
}

export interface ModelLayer {
  rendered: Circle
  definition: Layer
}

export abstract class ModelMapComponent<S extends AnyStore> extends StoreListener {
  protected layers: ModelLayer[] = []

  constructor(
    protected id: string,
    protected store: S,
    events: string[],
    protected props: ModelProps
  ) {
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

  protected resize(value: number) {
    this.layers.forEach(({ rendered }) => {
      rendered.resize(value)
    })
  }

  protected setCenter(value: number[]) {
    this.layers.forEach(({ rendered }) => {
      rendered.setCenter(value)
    })
  }

  protected buildLayers() {
    return this.props.layerDefinitions.map(layer => {
      const circle = this.buildLayer(layer)
      return { definition: layer, rendered: circle }
    })
  }

  protected abstract buildLayer(layer: Layer): Circle
}
