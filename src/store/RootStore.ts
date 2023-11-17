import { BaseModelData } from '.'
import { initialCenter } from '../initializers/center'
import * as Setup from '../setups'
import { LngLat } from '../types'
import { AnyStoreEvent, Store } from './core'

export interface RootData extends BaseModelData<'root'> {
  size: { real: number; rendered: number }
}

export class RootStore extends Store<RootData> {
  constructor(definition: Setup.Root, center?: LngLat) {
    const { visible, sizePresets } = definition
    const renderedSize = (sizePresets.find(sp => sp.default) ?? sizePresets[0]).km
    super({
      type: 'root',
      visible: visible ?? true,
      center: center ?? initialCenter,
      size: {
        real: definition.size,
        rendered: renderedSize
      }
    })
  }

  public sizeRatio() {
    const { real: rootReal, rendered: rootRendered } = this.data.size
    return rootRendered / rootReal
  }

  onUpdate(_: AnyStoreEvent) {}
}
