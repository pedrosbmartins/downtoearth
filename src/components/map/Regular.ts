import { ModelData, ModelStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { isAbsluteSize, isRelativeSize, Layer } from '../../types'
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
      if (isRelativeSize(size)) {
        rendered.resize(size.real * ratio)
      }
    })
    this.setBoundingBox()
  }

  protected buildLayer(layer: Layer) {
    return new Circle(`${this.id}-${layer.id}`, {
      size: this.layerSize(layer),
      definition: layer,
      center: this.store.get('center')
    })
  }

  protected setBoundingBox() {
    this.store.set({ boundingBox: this.boundingBox() })
  }

  public boundingBox() {
    return this.layers[0].rendered.boundingBox() // @todo: handle bounding box config
  }

  private layerSize({ size }: Layer): number {
    if (isAbsluteSize(size)) {
      return size
    }
    const ratio = this.store.get('sizeRatio')
    if (!ratio) {
      throw new Error(`size ratio not set for relative sized model ${this.id}`)
    }
    return size.real * ratio
  }
}
