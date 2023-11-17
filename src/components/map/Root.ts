import * as turf from '@turf/turf'

import * as Setup from '../../setups'
import { RootData, RootStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { LngLat } from '../../types'
import { toLngLat } from '../../utils'
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

  protected center({ offset, bearing }: Setup.Feature): LngLat {
    const center = this.store.get('center')

    if (!offset) {
      return center
    }

    const ratio = this.sizeRatio()
    if (!ratio) {
      throw new Error(`size ratio not set for root model`)
    }
    const destination = turf.rhumbDestination(
      center,
      offset.value * ratio,
      bearing || this.store.get('bearing') || 0
    )
    return toLngLat(destination.geometry.coordinates)
  }

  protected sizeRatio(): number {
    return this.store.sizeRatio()
  }
  protected rootCenter() {
    return this.store.get('center')
  }
}
