import { ModelData, Store } from '../../store'
import { StoreListener, StoreListenerConfig } from '../../store/listener'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'

export interface ModelProps {
  layerDefinitions: Layer[]
}

export interface ModelLayer {
  rendered: Circle
  definition: Layer
}

export abstract class Model extends StoreListener<ModelData> {
  protected layers: ModelLayer[] = []

  constructor(
    protected namespace: string,
    protected stores: Store<ModelData>[],
    protected props: ModelProps
  ) {
    const events: Array<keyof ModelData> = ['size', 'center', 'visible']
    super(stores.map<StoreListenerConfig<ModelData>>(store => ({ store, events })))
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
    this.setBoundingBox()
  }

  protected setCenter(value: number[]) {
    this.layers.forEach(({ rendered }) => {
      rendered.setCenter(value)
    })
    this.setBoundingBox()
  }

  protected buildLayers() {
    return this.props.layerDefinitions.map(layer => {
      const circle = this.buildLayer(layer)
      return { definition: layer, rendered: circle }
    })
  }

  protected abstract buildLayer(layer: Layer): Circle
  protected abstract setBoundingBox(): void
}
