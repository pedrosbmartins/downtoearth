import * as turf from '@turf/turf'
import { SidebarItem } from '../components/dom'
import { fitBounds } from '../map'
import { BoundingBox, GroupStore, RootStore } from '../store'
import { Group } from '../types'
import { $sidebar } from '../ui'
import { ModelFactory } from './ModelFactory'

export class GroupFactory {
  public store: GroupStore
  public $ui: HTMLElement
  public models: ModelFactory[]

  constructor(private definition: Group, private rootStore?: RootStore) {
    this.store = this.buildStore()
    this.$ui = this.buildUI()
    this.models = this.buildModels()
  }

  private buildStore() {
    return new GroupStore(this.definition, this.rootStore)
  }

  private buildUI() {
    const $container = document.createElement('div')
    $container.innerHTML = this.template()
    $sidebar.append($container)

    const $groupContainer = $container.querySelector('.items[data-role="group"]')
    const onCenter = () => {
      const componentsBbox = this.models.map(model => model.mapComponent.boundingBox())
      const boundingBox = turf.bbox(
        turf.featureCollection(componentsBbox.map(bbox => turf.bboxPolygon(bbox)))
      ) as BoundingBox
      fitBounds(boundingBox)
    }
    const { label, bearingControl } = this.definition
    const itemComponent = SidebarItem(
      { label, bearingControl, alternative: true, onCenter },
      this.store
    )
    $groupContainer!.append(itemComponent.dom())
    return $container
  }

  private buildModels() {
    const $modelsContainer = this.$ui.querySelector<HTMLElement>('.items[data-role="models"]')!
    return this.definition.models.map(
      model => new ModelFactory(model, $modelsContainer, this.rootStore, this.store)
    )
  }

  private template() {
    return `
      <div class="group">
        <div class="items" data-role="group"></div>
        <div class="items" data-role="models"></div>
      </div>
    `
  }
}
