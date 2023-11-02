import { BaseModelData } from '.'
import { INITIAL_CENTER } from '../constants'
import { isRelativeSize, Layer, Root } from '../setups'
import { LngLat } from '../types'
import { AnyStoreEvent, Store } from './core'

export interface RootData extends BaseModelData<'root'> {
  size: { real: number; rendered: number }
}

export class RootStore extends Store<RootData> {
  constructor(definition: Root, center?: LngLat) {
    const { visible, layers, sizePresets } = definition
    const mainLayer = layers[0]
    const realSize = RootStore.realSize(mainLayer)
    const renderedSize = (sizePresets.find(sp => sp.default) ?? sizePresets[0]).km / 2
    super('root', {
      type: 'root',
      visible: visible ?? true,
      center: center ?? INITIAL_CENTER,
      size: {
        real: realSize,
        rendered: renderedSize
      }
    })
  }

  public static realSize(layer: Layer) {
    const size = layer.shape === 'circle' ? layer.radius : layer.axes.semiMajor
    return isRelativeSize(size) ? size.real : size
  }

  public sizeRatio() {
    const { real: rootReal, rendered: rootRendered } = this.data.size
    return rootRendered / rootReal
  }

  onUpdate(_: AnyStoreEvent) {}
}
