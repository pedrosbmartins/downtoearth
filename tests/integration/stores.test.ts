import { GroupStore, ModelStore, RootStore, UnitStore } from '../../src/store'
import { RelativeSize } from '../../src/types'
import { config } from './config'

const INITIAL_CENTER = [0, 0]

interface Group {
  store: GroupStore
  models: ModelStore[]
}

let rootStore: RootStore | undefined
let unitStore: UnitStore | undefined
let groups: Group[] = []

describe('stores', () => {
  beforeEach(() => {
    const { visible, layer, sizePresets } = config.root!
    rootStore = new RootStore({
      visible,
      center: INITIAL_CENTER,
      size: {
        real: (layer?.size as RelativeSize)?.real.value,
        rendered: sizePresets.find(sp => sp.default)!.value
      }
    })
    unitStore = new UnitStore(rootStore)
    groups = (config.groups || []).map(group => {
      const store = new GroupStore(`group-${group.id}`, group, rootStore)
      const models = group.models.map(model => {
        const modelStore = new ModelStore(model, unitStore!, store)
        return modelStore
      })
      return { store, models }
    })
  })

  it('calculates the root rendered size and the unit ratio', () => {
    expect(rootStore!.get('size').rendered).toEqual(1)
    expect(unitStore!.get('ratio')).toEqual(1 / 5)
  })

  it('propagates root size change to unit store', () => {
    rootStore!.set({ size: { rendered: 10, real: rootStore!.get('size').real } })
    expect(unitStore!.get('ratio')).toEqual(10 / 5)
  })

  it('propagates unit ratio change to all model stores', () => {
    unitStore!.set({ ratio: 2 })
    const ratios = groups[0].models.map(m => m.get('sizeRatio'))
    expect(ratios[0]).toEqual(2)
    expect(ratios[1]).toEqual(2)
  })

  it('propagates group store visibility change to all model stores in the group', () => {
    groups[0].store.set({ visible: false })
    expect(groups[0].models.every(model => model.get('visible') === false)).toEqual(true)
  })

  it('allows a single model to remain visible after group visibility change', () => {
    groups[0].store.set({ visible: false })
    groups[0].models.find(m => m.id === `model-2`)!.set({ visible: true })
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
