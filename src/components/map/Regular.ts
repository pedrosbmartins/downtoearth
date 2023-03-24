import * as turf from '@turf/turf'

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
          this.onRootResize()
          break
        case 'center':
          this.setCenter()
          break
      }
    }
  }

  protected onRootResize() {
    this.layers.forEach(({ definition, rendered }) => {
      if (isRelativeSize(definition.size)) {
        rendered.resize(this.layerSize(definition))
      }
      if (definition.offset) {
        rendered.setCenter(this.layerCenter(definition))
      }
    })
    this.setBoundingBox()
  }

  protected setCenter() {
    this.layers.forEach(({ definition, rendered }) => {
      rendered.setCenter(this.layerCenter(definition))
    })
    this.setBoundingBox()
  }

  protected buildLayer(layer: Layer) {
    return new Circle(`${this.id}-${layer.id}`, {
      definition: layer,
      size: this.layerSize(layer),
      center: this.layerCenter(layer)
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

  private layerCenter({ offset }: Layer): number[] {
    const center = this.store.get('center')

    if (!offset) {
      return this.store.get('center')
    }

    const ratio = this.store.get('sizeRatio')
    if (!ratio) {
      throw new Error(`size ratio not set for relative sized model ${this.id}`)
    }
    const destination = turf.destination(center, offset.size.real * ratio, offset.bearing || 0)
    return destination.geometry.coordinates
  }
}
