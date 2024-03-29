import { AnyStoreData } from './StoreData'

export interface AnyStoreEvent extends StoreEvent {}

export interface StoreEvent<D extends AnyStoreData = { type: any }> extends MessageEvent<D> {
  data: D
}

export function matchEvent<T extends { type: any }>(
  storeId: string,
  type: T['type'],
  event: StoreEvent
): event is StoreEvent<T> {
  return event.origin.split('/')[0] === storeId && (event.data as any).type === type
}

export function eventField<D extends AnyStoreData>(event: StoreEvent<D>): keyof D {
  return event.origin.split('/')[1] as keyof D
}
