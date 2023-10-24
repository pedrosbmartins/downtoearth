import { GroupFactory } from './app/GroupFactory'
import { ModelFactory } from './app/ModelFactory'
import { RootFactory } from './app/RootFactory'
import { Setup, isGroup } from './types'
import { $sidebar } from './ui'

export default class App extends EventTarget {
  private _setup: Setup | undefined
  private _currentLngLat: number[] | undefined

  private root: RootFactory | undefined
  private models: Array<GroupFactory | ModelFactory> | undefined

  get setup() {
    return this._setup
  }

  get currentLngLat() {
    return this._currentLngLat
  }

  public initialize(setup: Setup, center?: number[]) {
    this.destroy()
    this.buildRoot(setup)
    this.buildModels(setup)
    this._setup = setup
    this._currentLngLat = center
  }

  private buildRoot({ root }: Setup) {
    if (!root) return
    this.root = new RootFactory(root, this._currentLngLat)
    this.root.store.register(this, 'center', () => {
      this._currentLngLat = this.root?.store.get('center')
    })
  }

  private buildModels({ models }: Setup) {
    this.models = models?.map(model => {
      if (isGroup(model)) {
        return new GroupFactory(model, this.root?.store)
      } else {
        return new ModelFactory(model, $sidebar, this.root?.store)
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
