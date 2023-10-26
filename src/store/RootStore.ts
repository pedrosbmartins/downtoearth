import { SidebarItemData } from '../components/dom/SidebarItem'
import { INITIAL_CENTER } from '../constants'
import { isRelativeSize, Root } from '../setups'
import { LngLat } from '../types'
import { AnyStoreEvent, Store, StoreData } from './core'

export interface RootData extends StoreData<'root'>, SidebarItemData<'root'> {
  size: { real: number; rendered: number }
}

export class RootStore extends Store<RootData> {
  constructor(definition: Root, center?: LngLat) {
    const { visible, layers, sizePresets } = definition
    const layer = layers[0] // @todo: handle multiple layers
    const realSize = isRelativeSize(layer.radius) ? layer.radius.real : layer.radius
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

  public sizeRatio() {
    const { real: rootReal, rendered: rootRendered } = this.data.size
    return rootRendered / rootReal
  }

  onUpdate(_: AnyStoreEvent) {}
}
