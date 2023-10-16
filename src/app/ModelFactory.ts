import { SidebarItem } from '../components/dom'
import { ModelMapComponent } from '../components/map'
import { fitBounds } from '../map'
import { GroupStore, ModelStore, RootStore } from '../store'
import { Model } from '../types'

export class ModelFactory {
  public store: ModelStore
  public mapComponent: ModelMapComponent

  constructor(
    private definition: Model,
    private $container: HTMLElement,
    private rootStore?: RootStore,
    private groupStore?: GroupStore
  ) {
    this.store = new ModelStore(this.definition, this.rootStore, this.groupStore)
    this.mapComponent = this.buildMapComponent()
    this.buildUI()
  }

  private buildMapComponent() {
    const { id, layers, visible } = this.definition
    return new ModelMapComponent(id, this.store, {
      layerDefinitions: layers.map(layer => ({ ...layer, visible }))
    })
  }

  private buildUI() {
    const { label, icon, bearingControl, info } = this.definition
    const item = SidebarItem(
      {
        label,
        icon,
        bearingControl,
        info,
        onCenter: () => fitBounds(this.mapComponent.boundingBox())
      },
      this.store
    )
    this.$container.append(item.dom())
  }
}
