import * as turf from '@turf/turf'
import { SidebarItem } from '../components/dom'
import { fitBounds } from '../map'
import { BoundingBox, GroupStore, RootStore } from '../store'
import { GroupModel } from '../types'
import { $sidebar } from '../ui'
import { ModelFactory } from './ModelFactory'

export class GroupFactory {
  public store: GroupStore
  public $ui: HTMLElement
  public models: ModelFactory[]

  constructor(private definition: GroupModel, private rootStore?: RootStore) {
    this.store = new GroupStore(this.definition, this.rootStore)
    this.$ui = this.buildUI()
    this.models = this.buildModels()
  }

  public destroy() {
    this.store.destroy()
    this.models.forEach(model => model.destroy())
  }

  private buildUI() {
    const $group = document.createElement('div')
    $group.className = 'group'
    $group.innerHTML = this.template()
    $sidebar.append($group)

    const $groupContainer = $group.querySelector('.items[data-role="group"]')
    const onCenter = () => {
      const componentsBbox = this.models.map(model => model.mapComponent.boundingBox())
      const boundingBox = turf.bbox(
        turf.featureCollection(componentsBbox.map(bbox => turf.bboxPolygon(bbox)))
      ) as BoundingBox
      fitBounds(boundingBox)
    }
    const { label, bearingControl, info } = this.definition
    const itemComponent = SidebarItem(
      { label, bearingControl, info, alternative: true, onCenter },
      this.store
    )
    $groupContainer!.append(itemComponent.dom())
    return $group
  }

  private buildModels() {
    const $modelsContainer = this.$ui.querySelector<HTMLElement>('.items[data-role="models"]')!
    return this.definition.models.map(
      model => new ModelFactory(model, $modelsContainer, this.rootStore, this.store)
    )
  }

  private template() {
    return `
      <div class="items" data-role="group"></div>
      <div class="items" data-role="models"></div>
    `
  }
}
