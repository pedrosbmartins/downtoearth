import { AnyStore, StoreListener } from '../../store/core'
import { Layer } from '../../types'
import { Circle } from './primitives'

export interface Props {
  layerDefinitions: Layer[]
}

export interface MapLayer {
  rendered: Circle
  definition: Layer
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
