import { INITIAL_CENTER } from '../../map'
import { ModelData, ModelStore, StoreEvent } from '../../store'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { Model, ModelProps } from './Model'

export class Regular extends Model {
  constructor(id: string, store: ModelStore, props: ModelProps) {
    super(id, store, props)
    this.layers = this.buildLayers()
    this.setBoundingBox()
  }

  onUpdate(_: string, event: StoreEvent<ModelData>) {
    const { origin, data } = event
    switch (origin) {
      case 'visible':
        data.visible ? this.show() : this.hide()
        break
      case 'size':
        this.onRootResize(data.size!)
        break
      case 'center':
        this.setCenter(data.center!)
        break
    }
  }

  protected onRootResize(rootSize: ModelData['size']) {
    this.layers.forEach(({ definition: { size }, rendered }) => {
      if (size.type === 'relative') {
        rendered.resize(rootSize!.rendered * (size.real.value / rootSize!.real))
      }
    })
    this.setBoundingBox()
  }

  protected buildLayer(layer: Layer) {
    return new Circle(`${this.id}-${layer.id}`, {
      size: this.layerSize(layer),
      definition: layer,
      center: INITIAL_CENTER as number[]
    })
  }

  protected setBoundingBox() {
    this.store.set({ boundingBox: this.boundingBox() })
  }

  public boundingBox() {
    return this.layers[0].rendered.boundingBox() // @todo: handle bounding box config
  }

  private layerSize({ size }: Layer): number {
    if (size.type === 'absolute') {
      return size.value
    }
    const rootSize = this.store.get('size')
    if (!rootSize) {
      throw new Error(`no root size set for model ${this.id} store`)
    }
    return rootSize.rendered * (size.real.value / rootSize.real)
  }
}
