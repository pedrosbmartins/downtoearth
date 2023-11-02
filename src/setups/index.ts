import { LngLat } from '../types'

export interface ShareableSetup {
  setup: Setup
  center: LngLat
}

export interface Setup {
  title: string
  unit?: Unit
  root: Root
  models?: Model[]
  $schema?: string
}

export interface BaseModel {
  id: string
  label: string
  visible?: boolean
  bearingControl?: boolean
  info?: string
}

export interface GroupModel extends BaseModel {
  models: SingleModel[]
  bearing?: number
  offset?: RelativeSize
}

export interface SingleModel extends BaseModel {
  layers: Layer[]
  icon?: string
}

export type Model = GroupModel | SingleModel

export interface Root extends SingleModel {
  id: 'root'
  sizePresets: SizePreset[]
  layers: Layer[]
}

export interface SizePreset {
  label: string
  km: number
  default?: boolean
}

export interface LayerBase {
  id: string
  fill?: Fill
  outline?: Outline
  offset?: RelativeSize
  bearing?: number
  label?: Label
  popup?: { content: string }
  drawLineToRoot?: boolean
}

export interface CircleLayer extends LayerBase {
  shape: 'circle'
  radius: Size
}

export interface EllipseLayer extends LayerBase {
  shape: 'ellipse'
  axes: { semiMajor: Size; semiMinor: Size }
}

export type Layer = CircleLayer | EllipseLayer

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

export function hasRelativeSize(layer: Layer) {
  return (
    (layer.shape === 'circle' && isRelativeSize(layer.radius)) ||
    (layer.shape === 'ellipse' && isRelativeSize(layer.axes.semiMajor))
  )
}

export function isRelativeSize(object: any): object is RelativeSize {
  return object && object.type === 'relative' && object.real !== undefined
}

export function isAbsluteSize(object: any): object is AbsoluteSize {
  return object !== undefined && typeof object === 'number'
}

export function isGroup(object: any): object is GroupModel {
  return object !== undefined && object.models !== undefined
}
