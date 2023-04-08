import { SidebarItem } from '../components/dom'
import { RegularMapComponent } from '../components/map'
import { fitBounds } from '../map'
import { GroupStore, ModelStore, RootStore } from '../store'
import { Model } from '../types'

export class ModelFactory {
  public store: ModelStore
  public mapComponent: RegularMapComponent

  constructor(
    private definition: Model,
    private $container: HTMLElement,
    private rootStore?: RootStore,
    private groupStore?: GroupStore
  ) {
    this.store = this.buildStore()
    this.mapComponent = this.buildMapComponent()
    this.buildUI()
  }

  private buildStore() {
    return new ModelStore(this.definition, this.rootStore, this.groupStore)
  }

  private buildMapComponent() {
    const { id, layers } = this.definition
    return new RegularMapComponent(id, this.store, {
      layerDefinitions: layers
    })
  }

  private buildUI() {
    const { label, icon } = this.definition
    const item = SidebarItem(
      {
        label,
        icon,
        onCenter: () => fitBounds(this.mapComponent.boundingBox())
      },
      this.store
    )
    this.$container.append(item.dom())
  }
}
