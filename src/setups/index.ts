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
  label: string
  visible?: boolean
  bearingControl?: boolean
  info?: string
  popup?: Popup
}

export interface GroupModel extends BaseModel {
  models: SingleModel[]
  bearing?: number
  offset?: RelativeSize
}

export interface SingleModel extends BaseModel {
  features: Feature[]
  icon?: string
}

export type Model = GroupModel | SingleModel

export interface Root extends SingleModel {
  sizePresets: SizePreset[]
}

export interface SizePreset {
  label: string
  km: number
  default?: boolean
}

export interface FeatureBase {
  fill?: Fill
  outline?: Outline
  offset?: RelativeSize
  bearing?: number
  label?: Label
  drawLineToRoot?: boolean
}

export interface ShapeFeature extends FeatureBase {
  shape: 'circle' | 'ellipse'
}

export interface CircleFeature extends ShapeFeature {
  shape: 'circle'
  radius: Size
}

export interface EllipseFeature extends ShapeFeature {
  shape: 'ellipse'
  axes: { semiMajor: Size; semiMinor: Size }
}

export type Feature = CircleFeature | EllipseFeature

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

export interface Popup {
  content: string
}

export interface Unit {
  name: string
  km: number
}

export function hasRelativeSize(feature: Feature) {
  return (
    (feature.shape === 'circle' && isRelativeSize(feature.radius)) ||
    (feature.shape === 'ellipse' && isRelativeSize(feature.axes.semiMajor))
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
