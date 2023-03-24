import * as turf from '@turf/turf'

import { GroupStore, ModelStore, RootStore } from '../../src/store'
import * as configs from './configs'

const INITIAL_CENTER = [-43.210855877349104, -22.951904902574256]

interface Group {
  store: GroupStore
  models: ModelStore[]
}

let rootStore: RootStore | undefined
let groups: Group[] = []

describe('stores', () => {
  beforeEach(() => {
    rootStore = new RootStore(configs.base.root!)
    groups = (configs.base.groups || []).map(group => {
      const store = new GroupStore(group, rootStore)
      const models = group.models.map(model => new ModelStore(model, rootStore!, store))
      return { store, models }
    })
  })

  it('calculates the root size ratio', () => {
    expect(rootStore!.sizeRatio()).toEqual(0.2)
  })

  it('propagates root size ratio change to all group and model stores', () => {
    rootStore!.set({ size: { rendered: 10, real: rootStore!.get('size').real } })
    const groupRatio = groups[0].store.get('sizeRatio')
    const modelRatios = groups[0].models.map(m => m.get('sizeRatio'))
    expect(groupRatio).toEqual(10 / 5)
    expect(modelRatios[0]).toEqual(10 / 5)
    expect(modelRatios[1]).toEqual(10 / 5)
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
      rootStore = new RootStore(configs.groupWithOffset.root!)
      groups = (configs.groupWithOffset.groups || []).map(group => {
        const store = new GroupStore(group, rootStore)
        const models = group.models.map(model => new ModelStore(model, rootStore!, store))
        return { store, models }
      })
    })

    it('initializes the center of the group and related models with offset', () => {
      const groupCenter = turf.destination(INITIAL_CENTER, 5 * 0.2, 270).geometry.coordinates
      expect(groups[0].store.get('center')).toEqual(groupCenter)
      expect(groups[0].models.map(model => model.get('center'))).toEqual([groupCenter, groupCenter])
    })

    it('propagates group center change with offset to the group store and all model stores in the group', () => {
      rootStore!.set({ center: [100, 100] })
      const groupCenter = turf.destination([100, 100], 5 * 0.2, 270).geometry.coordinates
      expect(groups[0].store.get('center')).toEqual(groupCenter)
      expect(groups[0].models.map(model => model.get('center'))).toEqual([groupCenter, groupCenter])
    })

    it('updates group center with offset when root size ratio changes', () => {
      rootStore!.set({ size: { rendered: 10, real: rootStore!.get('size').real } })
      const groupCenter = turf.destination(INITIAL_CENTER, 5 * (10 / 5), 270).geometry.coordinates
      expect(groups[0].store.get('center')).toEqual(groupCenter)
    })
  })
})
