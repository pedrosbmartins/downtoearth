export type AnyStoreData = StoreData<any>

export interface StoreData<T extends string> {
  type: T
}
