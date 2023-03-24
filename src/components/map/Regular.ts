import { INITIAL_CENTER } from '../../constants'
import { ModelData, ModelStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { ModelMapComponent, ModelProps } from './Model'

export class RegularMapComponent extends ModelMapComponent<ModelStore> {
  constructor(id: string, store: ModelStore, props: ModelProps) {
    super(id, store, ['visible', 'center', 'sizeRatio'], props)
    this.layers = this.buildLayers()
    this.setBoundingBox()
  }

  onUpdate(event: AnyStoreEvent) {
    if (matchEvent<ModelData>(this.store.id, 'model', event)) {
      switch (eventField(event)) {
        case 'visible':
          event.data.visible ? this.show() : this.hide()
          break
        case 'sizeRatio':
          this.onRootResize(event.data.sizeRatio)
          break
        case 'center':
          this.setCenter(event.data.center!)
          break
      }
    }
  }

  protected onRootResize(ratio: ModelData['sizeRatio']) {
    this.layers.forEach(({ definition: { size }, rendered }) => {
      if (size.type === 'relative') {
        rendered.resize(size.real.value * ratio)
      }
    })
    this.setBoundingBox()
  }

  protected buildLayer(layer: Layer) {
    return new Circle(`${this.id}-${layer.id}`, {
      size: this.layerSize(layer),
      definition: layer,
      center: INITIAL_CENTER
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
    const ratio = this.store.get('sizeRatio')
    if (!ratio) {
      throw new Error(`size ratio not set for relative sized model ${this.id}`)
    }
    return size.real.value * ratio
  }
}
