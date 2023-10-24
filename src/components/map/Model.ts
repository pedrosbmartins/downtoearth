import * as turf from '@turf/turf'

import { ModelData, ModelStore } from '../../store'
import { AnyStoreEvent, eventField, matchEvent } from '../../store/core'
import { Layer, hasRelativeSize } from '../../types'
import { MapComponent, Props } from './MapComponent'

export class ModelMapComponent extends MapComponent<ModelStore> {
  constructor(id: string, store: ModelStore, props: Props) {
    super(id, store, ['visible', 'center', 'sizeRatio', 'bearing'], props)
    this.layers = this.buildLayers()
  }

  onUpdate(event: AnyStoreEvent) {
    if (matchEvent<ModelData>(this.store.id, 'model', event)) {
      switch (eventField(event)) {
        case 'visible':
          event.data.visible ? this.show() : this.hide()
          break
        case 'sizeRatio':
          this.onRootResize()
          break
        case 'center':
          this.setCenter()
          break
        case 'bearing':
          this.setCenter()
          break
      }
    }
  }

  protected onRootResize() {
    this.layers.forEach(({ definition, rendered }) => {
      if (hasRelativeSize(definition)) {
        rendered.resize(this.sizeRatio())
      }
      if (definition.offset) {
        rendered.setCenter(this.center(definition))
      }
    })
  }

  protected setCenter() {
    this.layers.forEach(({ definition, rendered }) => {
      rendered.setCenter(this.center(definition))
    })
  }

  public boundingBox() {
    return this.layers[0].rendered.boundingBox()
  }

  protected sizeRatio(): number {
    return this.store.get('sizeRatio')
  }

  protected center({ offset, bearing }: Layer): number[] {
    const center = this.store.get('center')

    if (!offset) {
      return center
    }

    const ratio = this.sizeRatio()
    if (!ratio) {
      throw new Error(`size ratio not set for relative sized model ${this.id}`)
    }
    const destination = turf.rhumbDestination(
      center,
      offset.real * ratio,
      bearing || this.store.get('bearing') || this.store.groupBearing() || 0
    )
    return destination.geometry.coordinates
  }

  protected rootCenter() {
    return () => this.store.rootCenter()
  }
}
