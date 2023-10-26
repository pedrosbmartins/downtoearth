import * as turf from '@turf/turf'

import { RootData, RootStore } from '.'
import { SidebarItemData } from '../components/dom/SidebarItem'
import { INITIAL_CENTER } from '../constants'
import { GroupModel } from '../setups'
import { LngLat } from '../types'
import { toLngLat } from '../utils'
import { AnyStoreEvent, Observable, Store, StoreData, eventField, matchEvent } from './core'

export interface GroupData extends StoreData<'group'>, SidebarItemData<'group'> {
  sizeRatio: number
  offset?: { real: number; rendered: number }
  bearing?: number
}

export class GroupStore extends Store<GroupData> {
  private rootStore: RootStore | undefined

  constructor(group: GroupModel, rootStore: RootStore | undefined) {
    const data: GroupData = {
      type: 'group',
      visible: group.visible || true,
      bearing: group.bearing,
      offset: GroupStore.offset(group, rootStore),
      center: GroupStore.center(group, rootStore),
      sizeRatio: GroupStore.sizeRatio(rootStore)
    }
    const observables = rootStore ? [new Observable(rootStore, ['size', 'center'])] : []
    super(`group-${group.id}`, data, observables)
    this.rootStore = rootStore
  }

  onUpdate(event: AnyStoreEvent): void {
    if (this.rootStore && matchEvent<GroupData>(this.id, 'group', event)) {
      if (eventField(event) === 'bearing') {
        this.set({
          center: GroupStore.calculateCenter(
            this.rootStore.get('center'),
            event.data.bearing,
            this.data.offset
          )
        })
      }
    }

    if (this.rootStore && matchEvent<RootData>(this.rootStore.id, 'root', event)) {
      switch (eventField(event)) {
        case 'center': {
          this.set({
            center: GroupStore.calculateCenter(
              event.data.center,
              this.data.bearing,
              this.data.offset
            )
          })
          break
        }
        case 'size': {
          const sizeRatio = this.rootStore.sizeRatio()
          this.set({ sizeRatio })

          if (this.data.offset) {
            this.set({ offset: GroupStore.offset(this.data, this.rootStore) })
            this.set({
              center: GroupStore.calculateCenter(
                event.data.center,
                this.data.bearing,
                this.data.offset
              )
            })
          }

          break
        }
      }
    }
  }

  private static offset(group: { offset?: { real: number } }, rootStore: RootStore | undefined) {
    if (!group.offset) return undefined
    return {
      real: group.offset.real,
      rendered: group.offset.real * GroupStore.sizeRatio(rootStore)
    }
  }

  private static sizeRatio(rootStore: RootStore | undefined) {
    return rootStore?.sizeRatio() ?? 1.0
  }

  private static center(group: GroupModel, rootStore: RootStore | undefined): LngLat {
    if (!rootStore) return INITIAL_CENTER
    const offset = GroupStore.offset(group, rootStore)
    return GroupStore.calculateCenter(rootStore.get('center'), group.bearing, offset)
  }

  private static calculateCenter(center: LngLat, bearing?: number, offset?: GroupData['offset']) {
    if (!offset) return center
    const destination = turf.rhumbDestination(center, offset.rendered, bearing || 0)
    return toLngLat(destination.geometry.coordinates)
  }
}
