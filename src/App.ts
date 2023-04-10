import { GroupFactory } from './app/GroupFactory'
import { RootFactory } from './app/RootFactory'
import { RootMapComponent } from './components/map'
import { RootStore } from './store'
import { Config } from './types'
import { $sidebar } from './ui'

export default class App extends EventTarget {
  private rootStore: RootStore | undefined
  private rootMapComponent: RootMapComponent | undefined
  private groups: GroupFactory[] | undefined
  private currentLngLat: number[] | undefined

  public initialize(config: Config) {
    this.destroy()
    this.buildRoot(config)
    this.buildGroups(config)
  }

  private buildRoot({ root }: Config) {
    if (!root) return
    const factory = new RootFactory(root, this.currentLngLat)
    this.rootStore = factory.store
    this.rootMapComponent = factory.mapComponent
    this.rootStore.register(this, 'center', () => {
      this.currentLngLat = this.rootStore?.get('center')
    })
  }

  private buildGroups({ groups }: Config) {
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
