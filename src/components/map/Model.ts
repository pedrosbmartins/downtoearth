import * as Setup from '../../setups'
import { ModelData, ModelStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { MapComponent } from './MapComponent'

export class ModelMapComponent extends MapComponent<ModelStore> {
  constructor(store: ModelStore, definition: Setup.SingleModel) {
    super(store, ['visible', 'center', 'sizeRatio', 'bearing'], definition)
  }

  onUpdate(event: AnyStoreEvent) {
    if (matchEvent<ModelData>(this.store.id, 'model', event)) {
      switch (eventField(event)) {
        case 'visible':
          event.data.visible ? this.show() : this.hide()
          break
        case 'sizeRatio':
        case 'center':
        case 'bearing':
          this.update()
          break
      }
    }
  }

  protected sizeRatio(): number {
    return this.store.get('sizeRatio')
  }

  protected defaultBearing(): number {
    return this.store.get('bearing') ?? this.store.groupBearing() ?? 0
  }

  protected rootCenter() {
    return this.store.rootCenter()
  }
}
