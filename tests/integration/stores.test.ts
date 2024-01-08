import * as turf from '@turf/turf'

import { initialCenter } from '../../src/initializers/center'
import * as Setup from '../../src/setups'
import { GroupStore, ModelStore, RootStore } from '../../src/store'
import * as setups from './setups'

interface Group {
  store: GroupStore
  models: ModelStore[]
}

let rootStore: RootStore
let groups: Group[] = []

jest.mock('../../src/initializers/map')

describe('stores', () => {
  beforeEach(() => {
    rootStore = new RootStore(setups.base.root)
    groups = (setups.base.models || []).filter(Setup.isGroup).map(group => {
      const store = new GroupStore(group, rootStore)
      const models = group.models.map(model => new ModelStore(model, rootStore, store))
      return { store, models }
    })
  })

  it('calculates the root size ratio', () => {
    expect(rootStore.sizeRatio()).toEqual(0.01)
  })

  it('propagates root size ratio change to all model stores', () => {
    const newSize = 10
    rootStore.set({ size: { ...rootStore.get('size'), rendered: newSize } })
    const modelRatios = groups[0].models.map(m => m.get('sizeRatio'))
    expect(modelRatios[0]).toEqual(newSize / 100)
    expect(modelRatios[1]).toEqual(newSize / 100)
  })

  it('propagates group store visibility change to all model stores in the group', () => {
    groups[0].store.set({ visible: false })
    expect(groups[0].models.every(model => model.get('visible') === false)).toEqual(true)
  })

  it('allows a single model to remain visible after group visibility change', () => {
    groups[0].store.set({ visible: false })
    groups[0].models[1].set({ visible: true })
    expect(groups.map(g => g.models.map(m => m.get('visible'))).flat(1)).toEqual([false, true])
  })

  it('propagates group center change to all model stores in the group', () => {
    groups[0].store.set({ center: [100, 100] })
    expect(groups[0].models.map(model => model.get('center'))).toEqual([
      [100, 100],
      [100, 100]
    ])
  })

  describe('when group has offset', () => {
    beforeEach(() => {
      rootStore = new RootStore(setups.groupWithOffset.root)
      groups = (setups.groupWithOffset.models || []).filter(Setup.isGroup).map(group => {
        const store = new GroupStore(group, rootStore)
        const models = group.models.map(model => new ModelStore(model, rootStore, store))
        return { store, models }
      })
    })

    it('initializes the center of the group and related models with offset', () => {
      const groupCenter = turf.rhumbDestination(initialCenter, 30 * 0.01, 270).geometry.coordinates
      expect(groups[0].store.get('center')).toEqual(groupCenter)
      expect(groups[0].models.map(model => model.get('center'))).toEqual([groupCenter, groupCenter])
    })

    it('propagates group center change with offset to the group store and all model stores in the group', () => {
      rootStore.set({ center: [100, 100] })
      const groupCenter = turf.rhumbDestination([100, 100], 30 * 0.01, 270).geometry.coordinates
      expect(groups[0].store.get('center')).toEqual(groupCenter)
      expect(groups[0].models.map(model => model.get('center'))).toEqual([groupCenter, groupCenter])
    })

    it('updates group center with offset when root size ratio changes', () => {
      const newSize = 10
      rootStore.set({ size: { ...rootStore.get('size'), rendered: newSize } })
      const groupCenterDest = turf.rhumbDestination(initialCenter, 30 * (newSize / 100), 270)
      const groupCenter = groupCenterDest.geometry.coordinates
      expect(groups[0].store.get('center')).toEqual(groupCenter)
    })
  })
})
