import * as turf from '@turf/turf'

import { BaseModelData, RootData, RootStore } from '.'
import * as Setup from '../setups'
import { toLngLat } from '../utils'
import { AnyStoreEvent, Observable, Store, eventField, matchEvent } from './core'

export type GroupData = BaseModelData<'group'>

export class GroupStore extends Store<GroupData> {
  constructor(private definition: Setup.GroupModel, private rootStore: RootStore) {
    const data: GroupData = {
      type: 'group',
      visible: definition.visible ?? true,
      bearing: definition.bearing,
      center: rootStore.get('center')
    }
    const observables = [new Observable(rootStore, ['size', 'center'])]
    super(data, observables)
    this.data.center = this.offsetCenter()
  }

  onUpdate(event: AnyStoreEvent): void {
    if (matchEvent<GroupData>(this.id, 'group', event)) {
      if (eventField(event) === 'bearing') {
        this.set({ center: this.offsetCenter() })
      }
    }

    if (matchEvent<RootData>(this.rootStore.id, 'root', event)) {
      this.set({ center: this.offsetCenter() })
    }
  }

  private offsetCenter() {
    const center = this.rootStore.get('center')
    const { offset } = this.definition
    if (!offset) return center
    const offsetCenter = turf.rhumbDestination(
      center,
      offset * this.rootStore.sizeRatio(),
      this.data.bearing ?? 0
    )
    return toLngLat(offsetCenter.geometry.coordinates)
  }
}
