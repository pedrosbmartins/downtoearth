import { AnyStoreEvent, Observable, StoreListener } from '..'
import { Store } from '../Store'

interface Data {
  type: 'test'
  value: number
}

class TestStore extends Store<Data> {
  onUpdate(event: AnyStoreEvent) {}
}

class TestStoreListener extends StoreListener {
  onUpdate(event: AnyStoreEvent) {}
}

describe('StoreListener', () => {
  const store = new TestStore('test', { type: 'test', value: 42 })
  const listener = new TestStoreListener([new Observable(store, ['value'])])
  describe('#onUpdate', () => {
    it('is called when a store broadcasts an event', () => {
      const spy = jest.spyOn(listener, 'onUpdate')
      store.set({ value: 0 })
      expect(spy).toHaveBeenCalledWith(expect.any(MessageEvent))
    })
  })
})
