import { SidebarItemData } from '../components/dom/SidebarItem'
import { INITIAL_CENTER } from '../constants'
import { RelativeSize, Root } from '../types'
import { AnyStoreEvent, Store, StoreData } from './core'

export interface RootData extends StoreData<'root'>, SidebarItemData<'root'> {
  size: { real: number; rendered: number }
}

export class RootStore extends Store<RootData> {
  constructor(definition: Root) {
    const { visible, layer, sizePresets } = definition
    super('root', {
      type: 'root',
      visible,
      center: INITIAL_CENTER,
      size: {
        real: (layer?.size as RelativeSize)?.real.value,
        rendered: sizePresets.find(sp => sp.default)!.value
      }
    })
  }

  onUpdate(_: AnyStoreEvent) {}
}
