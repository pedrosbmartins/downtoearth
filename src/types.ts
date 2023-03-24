export interface Config {
  unit?: Unit
  root?: Root
  groups?: Group[]
}

export interface Model {
  id: string
  label: string
  layers: Layer[]
  visible: boolean
  icon?: string
  bearingControl?: boolean
  bearing?: number
}

export interface Root extends Omit<Model, 'layers'> {
  id: 'root'
  sizePresets: SizePreset[]
  layer: Layer
}

export interface SizePreset {
  label: string
  value: number
  default?: boolean
}

export interface Group {
  id: string
  label: string
  models: Model[]
  visible: boolean
  layers?: Layer[]
  bearingControl?: boolean
  offset?: { size: RelativeSize; bearing: number }
}

export interface CircleLayer {
  id: string
  shape: 'circle'
  visible: boolean
  size: Size
  fill?: Fill
  outline?: Outline
  offset?: { size: RelativeSize; bearing?: number }
  label?: Label
  popup?: { content: string }
  actsAsInitialBounds?: boolean
  actAsGroupBounds?: boolean
  drawLineToRoot?: boolean
}

export type Layer = CircleLayer

export type Size = AbsoluteSize | RelativeSize

export type AbsoluteSize = number

export interface RelativeSize {
  type: 'relative'
  to?: 'root' | 'group'
  real: AbsoluteSize
}

export interface Fill {
  color: string
  opacity?: number
}
export interface Outline {
  color: string
  width?: number
}

export interface Label {
  value: string
  position: 'center' | 'outline'
}

export interface Unit {
  name: string
  km: number
}

export function isRelativeSize(object: any): object is RelativeSize {
  return object && object.type === 'relative' && object.real !== undefined
}

export function isAbsluteSize(object: any): object is AbsoluteSize {
  return object !== undefined && typeof object === 'number'
}
