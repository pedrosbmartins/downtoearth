import * as turf from '@turf/turf'

import { INITIAL_CENTER } from '../../constants'
import { RootData, RootStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { Layer } from '../../types'
import { mergeBoundingBoxes } from '../../utils'
import { MapComponent, Props } from './MapComponent'

export class RootMapComponent extends MapComponent<RootStore> {
  constructor(id: string, store: RootStore, props: Props) {
    super(id, store, ['visible', 'size', 'center'], props)
    this.layers = this.buildLayers()
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
    return mergeBoundingBoxes(this.layers.map(layer => layer.rendered.boundingBox()))
  }

  protected center({ offset, bearing }: Layer): number[] {
    const center = this.store.get('center') ?? INITIAL_CENTER

    if (!offset) {
      return center
    }

    const ratio = this.sizeRatio()
    if (!ratio) {
      throw new Error(`size ratio not set for root model`)
    }
    const destination = turf.rhumbDestination(
      center,
      offset.real * ratio,
      bearing || this.store.get('bearing') || 0
    )
    return destination.geometry.coordinates
  }

  protected sizeRatio(): number {
    return this.store.sizeRatio()
  }
  protected rootCenter() {
    return () => this.store.get('center')
  }
}
