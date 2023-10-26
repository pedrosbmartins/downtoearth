import { SidebarItem } from '../components/dom'
import { ModelMapComponent } from '../components/map'
import { fitBounds } from '../map'
import { SingleModel } from '../setups'
import { GroupStore, ModelStore, RootStore } from '../store'

export class ModelFactory {
  public store: ModelStore
  public mapComponent: ModelMapComponent

  constructor(
    private definition: SingleModel,
    private $container: HTMLElement,
    private rootStore?: RootStore,
    private groupStore?: GroupStore
  ) {
    this.store = new ModelStore(this.definition, this.rootStore, this.groupStore)
    this.mapComponent = this.buildMapComponent()
    this.buildUI()
  }

  public destroy() {
    this.store.destroy()
    this.mapComponent.destroy()
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
    let $element = item.dom()
    if (this.groupStore === undefined) {
      $element = document.createElement('div')
      $element.className = 'single-model'
      $element.append(item.dom())
    }
    this.$container.append($element)
  }
}
