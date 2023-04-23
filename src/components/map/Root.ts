import { INITIAL_CENTER } from '../../constants'
import { RootData, RootStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { MapComponent, MapLayer, Props } from './MapComponent'

export class RootMapComponent extends MapComponent<RootStore> {
  private layer: MapLayer

  constructor(id: string, store: RootStore, props: Props) {
    super(id, store, ['visible', 'size', 'center'], props)
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
          this.resize(this.store.sizeRatio())
          break
        case 'center':
          this.setCenter(event.data.center!)
          break
      }
    }
  }

  public boundingBox() {
    return this.layer.rendered.boundingBox()
  }

  protected sizeRatio(): number {
    return this.store.sizeRatio()
  }
  protected center(): number[] {
    return this.store.get('center') ?? INITIAL_CENTER
  }
  protected rootCenter() {
    return () => this.store.get('center')
  }
}
