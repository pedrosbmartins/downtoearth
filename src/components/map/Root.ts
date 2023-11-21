import * as Setup from '../../setups'
import { RootData, RootStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { MapComponent } from './MapComponent'

export class RootMapComponent extends MapComponent<RootStore> {
  constructor(store: RootStore, definition: Setup.Root) {
    super(store, ['visible', 'size', 'center'], definition)
  }

  onUpdate(event: AnyStoreEvent) {
    if (matchEvent<RootData>(this.store.id, 'root', event)) {
      switch (eventField(event)) {
        case 'visible':
          event.data.visible ? this.show() : this.hide()
          break
        case 'size':
        case 'center':
          this.update()
          break
      }
    }
  }

  protected sizeRatio(): number {
    return this.store.sizeRatio()
  }

  protected defaultBearing(): number {
    return this.store.get('bearing') ?? 0
  }

  protected rootCenter() {
    return this.store.get('center')
  }
}
