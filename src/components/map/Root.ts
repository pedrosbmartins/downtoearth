import { INITIAL_CENTER } from '../../constants'
import { RootData, RootStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { Layer } from '../../types'
import { Circle } from '../map/primitives'
import { ModelLayer, ModelMapComponent, ModelProps } from './Model'

export class RootMapComponent extends ModelMapComponent<RootStore> {
  private layer: ModelLayer
  private size: number

  constructor(id: string, store: RootStore, props: ModelProps & { size: number }) {
    super(id, store, ['visible', 'size', 'center'], props)
    this.size = props.size
    this.layers = this.buildLayers()
    this.layer = this.layers[0]
  }

  onUpdate(event: AnyStoreEvent) {
    if (matchEvent<RootData>(this.store.id, 'root', event)) {
      switch (eventField(event)) {
        case 'visible':
          event.data.visible ? this.show() : this.hide()
          break
        case 'size':
          this.resize(event.data.size!.rendered)
          break
        case 'center':
          this.setCenter(event.data.center!)
          break
      }
    }
  }

  protected buildLayer(layer: Layer) {
    const circle = new Circle(`${this.id}-${layer.id}`, {
      size: this.size,
      definition: layer,
      center: this.store.get('center') ?? INITIAL_CENTER
    })
    this.store.set({ boundingBox: circle.boundingBox() })
    return circle
  }

  protected setBoundingBox() {
    this.store.set({ boundingBox: this.layer.rendered.boundingBox() })
  }
}
