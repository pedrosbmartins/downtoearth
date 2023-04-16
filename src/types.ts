export interface Setup {
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
  visible?: boolean
  bearingControl?: boolean
  bearing?: number
  offset?: RelativeSize
}

export interface CircleLayer {
  id: string
  shape: 'circle'
  visible: boolean
  size: Size
  fill?: Fill
  outline?: Outline
  offset?: RelativeSize
  bearing?: number
  label?: Label
  popup?: { content: string }
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
