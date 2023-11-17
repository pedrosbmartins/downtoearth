import * as turf from '@turf/turf'

import * as Setup from '../../setups'
import { ModelData, ModelStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { LngLat } from '../../types'
import { toLngLat } from '../../utils'
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

  protected center({ offset, bearing }: Setup.Feature): LngLat {
    const center = this.store.get('center')

    if (!offset) {
      return center
    }

    const ratio = this.sizeRatio()
    if (!ratio) {
      throw new Error(`size ratio not set for relative sized model ${this.definition.label}`)
    }
    const destination = turf.rhumbDestination(
      center,
      offset.value * ratio,
      bearing || this.store.get('bearing') || this.store.groupBearing() || 0
    )
    return toLngLat(destination.geometry.coordinates)
  }

  protected rootCenter() {
    return this.store.rootCenter()
  }
}
