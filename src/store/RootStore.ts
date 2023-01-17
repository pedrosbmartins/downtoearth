import { SidebarItemData } from '../components/dom/SidebarItem'
import { AnyStoreEvent, Store, StoreData } from './core'

export interface RootData extends StoreData<'root'>, SidebarItemData<'root'> {
  size: { real: number; rendered: number }
}

export class RootStore extends Store<RootData> {
  constructor(data: Omit<RootData, 'type'>) {
    super('root', { type: 'root', ...data })
  }

  onUpdate(_: AnyStoreEvent) {}
}
