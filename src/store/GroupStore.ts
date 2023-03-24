import * as turf from '@turf/turf'

import { RootData, RootStore } from '.'
import { SidebarItemData } from '../components/dom/SidebarItem'
import { Group } from '../types'
import { AnyStoreEvent, eventField, matchEvent, Observable, Store, StoreData } from './core'

export interface GroupData extends StoreData<'group'>, SidebarItemData<'group'> {
  sizeRatio: number
  offset?: { size: { real: number; rendered: number }; bearing: number }
}

export class GroupStore extends Store<GroupData> {
  private rootStore: RootStore | undefined

  constructor(group: Group, rootStore: RootStore | undefined) {
    const data: GroupData = {
      type: 'group',
      visible: group.visible,
      center: GroupStore.center(group, rootStore),
      offset: GroupStore.offset(group, rootStore),
      sizeRatio: GroupStore.sizeRatio(rootStore)
    }
    const observables = rootStore ? [new Observable(rootStore, ['size', 'center'])] : []
    super(`group-${group.id}`, data, observables)
    this.rootStore = rootStore
  }

  onUpdate(event: AnyStoreEvent): void {
    if (this.rootStore && matchEvent<RootData>(this.rootStore.id, 'root', event)) {
      switch (eventField(event)) {
        case 'center': {
          this.set({ center: GroupStore.calculateCenter(event.data.center, this.data.offset) })
          break
        }
        case 'size': {
          const sizeRatio = this.rootStore.sizeRatio()
          this.set({ sizeRatio })

          if (this.data.offset) {
            this.set({ offset: GroupStore.offset(this.data, this.rootStore) })
            this.set({ center: GroupStore.calculateCenter(event.data.center, this.data.offset) })
          }

          break
        }
      }
    }
  }

  private static offset(
    group: { offset?: { bearing: number; size: { real: number } } },
    rootStore: RootStore | undefined
  ) {
    if (!group.offset) return undefined
    return {
      ...group.offset,
      size: {
        real: group.offset.size.real,
        rendered: group.offset.size.real * GroupStore.sizeRatio(rootStore)
      }
    }
  }

  private static sizeRatio(rootStore: RootStore | undefined) {
    return rootStore?.sizeRatio() ?? 1.0
  }

  private static center(group: Group, rootStore: RootStore | undefined): number[] {
    if (!rootStore) return []
    const offset = GroupStore.offset(group, rootStore)
    return GroupStore.calculateCenter(rootStore.get('center'), offset)
  }

  private static calculateCenter(center: number[], offset?: GroupData['offset']) {
    if (!offset) return center
    return turf.destination(center, offset.size.rendered, offset.bearing || 270).geometry
      .coordinates
  }
}
