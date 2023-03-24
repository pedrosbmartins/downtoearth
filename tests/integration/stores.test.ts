import { GroupStore, ModelStore, RootStore } from '../../src/store'
import { config } from './config'

interface Group {
  store: GroupStore
  models: ModelStore[]
}

let rootStore: RootStore | undefined
let groups: Group[] = []

describe('stores', () => {
  beforeEach(() => {
    rootStore = new RootStore(config.root!)
    groups = (config.groups || []).map(group => {
      const store = new GroupStore(group, rootStore)
      const models = group.models.map(model => new ModelStore(model, rootStore!, store))
      return { store, models }
    })
  })

  it('calculates the root rendered size and the unit ratio', () => {
    expect(rootStore!.get('size').rendered).toEqual(1)
  })

  it('propagates root size ratio change to all model stores', () => {
    rootStore!.set({ size: { rendered: 10, real: rootStore!.get('size').real } })
    const ratios = groups[0].models.map(m => m.get('sizeRatio'))
    expect(ratios[0]).toEqual(10 / 5)
    expect(ratios[1]).toEqual(10 / 5)
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
})
