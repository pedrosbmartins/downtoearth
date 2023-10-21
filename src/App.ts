import { GroupFactory } from './app/GroupFactory'
import { RootFactory } from './app/RootFactory'
import { RootMapComponent } from './components/map'
import { RootStore } from './store'
import { Setup } from './types'
import { $sidebar } from './ui'

export default class App extends EventTarget {
  private _setup: Setup | undefined
  private rootStore: RootStore | undefined
  private rootMapComponent: RootMapComponent | undefined
  private groups: GroupFactory[] | undefined
  private _currentLngLat: number[] | undefined

  get setup() {
    return this._setup
  }

  get currentLngLat() {
    return this._currentLngLat
  }

  public initialize(setup: Setup, center?: number[]) {
    this._setup = setup
    this._currentLngLat = center
    this.destroy()
    this.buildRoot(setup)
    this.buildGroups(setup)
  }

  private buildRoot({ root }: Setup) {
    if (!root) return
    const factory = new RootFactory(root, this._currentLngLat)
    this.rootStore = factory.store
    this.rootMapComponent = factory.mapComponent
    this.rootStore.register(this, 'center', () => {
      this._currentLngLat = this.rootStore?.get('center')
    })
  }

  private buildGroups({ groups }: Setup) {
    this.groups = groups?.map(group => new GroupFactory(group, this.rootStore))
  }

  private destroy() {
    $sidebar.innerHTML = ''
    this.rootStore?.destroy()
    this.rootStore = undefined
    this.rootMapComponent?.destroy()
    this.groups?.forEach(group => {
      group.store.destroy()
      group.models.forEach(model => {
        model.store.destroy()
        model.mapComponent.destroy()
      })
    })
  }
}
