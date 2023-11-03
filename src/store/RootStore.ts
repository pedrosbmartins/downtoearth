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
    const { visible, features, sizePresets } = definition
    const mainFeature = features[0]
    const realSize = RootStore.realSize(mainFeature)
    const renderedSize = (sizePresets.find(sp => sp.default) ?? sizePresets[0]).km / 2
    super('root', {
      type: 'root',
      visible: visible ?? true,
      center: center ?? initialCenter,
      size: {
        real: realSize,
        rendered: renderedSize
      }
    })
  }

  public static realSize(feature: Setup.Feature) {
    const size = feature.shape === 'circle' ? feature.radius : feature.axes.semiMajor
    return Setup.isRelativeSize(size) ? size.real : size
  }

  public sizeRatio() {
    const { real: rootReal, rendered: rootRendered } = this.data.size
    return rootRendered / rootReal
  }

  onUpdate(_: AnyStoreEvent) {}
}
