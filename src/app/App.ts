import { Setup, isGroup } from '../setups'
import { LngLat } from '../types'
import { $sidebar } from '../ui'
import { GroupFactory } from './GroupFactory'
import { ModelFactory } from './ModelFactory'
import { RootFactory } from './RootFactory'

export class App extends EventTarget {
  private _setup: Setup | undefined
  private _currentLngLat: LngLat | undefined

  private root: RootFactory | undefined
  private models: Array<GroupFactory | ModelFactory> | undefined

  get setup() {
    return this._setup
  }

  get currentLngLat() {
    return this._currentLngLat
  }

  public initialize(setup: Setup, center?: LngLat) {
    this.destroy()
    this._currentLngLat = center
    this._setup = setup
    this.buildRoot(setup)
    this.buildModels(setup)
  }

  private buildRoot({ root }: Setup) {
    this.root = new RootFactory(root, this._currentLngLat)
    this.root.store.register(this, 'center', () => {
      this._currentLngLat = this.root!.store.get('center')
    })
  }

  private buildModels({ models }: Setup) {
    this.models = models?.map(model => {
      if (isGroup(model)) {
        return new GroupFactory(model, this.root!.store)
      } else {
        return new ModelFactory(model, $sidebar, this.root!.store)
      }
    })
  }

  private destroy() {
    $sidebar.innerHTML = ''
    this.root?.destroy()
    this.root = undefined
    this.models?.forEach(model => model.destroy())
    this.models = undefined
  }
}
