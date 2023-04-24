import { SidebarItemData } from '../components/dom/SidebarItem'
import { INITIAL_CENTER } from '../constants'
import { isRelativeSize, Root } from '../types'
import { AnyStoreEvent, Store, StoreData } from './core'

export interface RootData extends StoreData<'root'>, SidebarItemData<'root'> {
  size: { real: number; rendered: number }
}

export class RootStore extends Store<RootData> {
  constructor(definition: Root, center?: number[]) {
    const { visible, layer, sizePresets } = definition
    const realSize = isRelativeSize(layer.radius) ? layer.radius.real : layer.radius
    const renderedSize = sizePresets.find(sp => sp.default)!.km / 2
    super('root', {
      type: 'root',
      visible,
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
