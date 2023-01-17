import { RootData, RootStore } from '.'
import { SidebarItemData } from '../components/dom/SidebarItem'
import { Group } from '../types'
import { AnyStoreEvent, matchEvent, Observable, Store, StoreData } from './core'

export interface GroupData extends StoreData<'group'>, SidebarItemData<'group'> {}

export class GroupStore extends Store<GroupData> {
  private rootStoreId: string

  constructor(id: string, group: Group, rootStore: RootStore | undefined) {
    const data: GroupData = {
      type: 'group',
      visible: group.visible,
      center: [],
      size: { real: 0, rendered: 0 }
    }
    super(id, data, rootStore ? [new Observable(rootStore, ['center'])] : [])
    this.rootStoreId = rootStore?.id || ''
  }

  onUpdate(event: AnyStoreEvent): void {
    if (matchEvent<RootData>(this.rootStoreId, 'root', event)) {
      this.set({ center: event.data.center })
    }
  }
}
