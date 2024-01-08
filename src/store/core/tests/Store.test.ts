import { AnyStoreEvent } from '..'
import { Store } from '../Store'

interface Data {
  type: 'test'
  value: number
}

class TestStore extends Store<Data> {
  onUpdate(event: AnyStoreEvent) {}
}

describe('Store', () => {
  const store = new TestStore({ type: 'test', value: 42 })
  describe('#get', () => {
    it('returns store data', () => {
      expect(store.get('value')).toBe(42)
    })
  })
  describe('#set', () => {
    it('modifies store data', () => {
      store.set({ value: 0 })
      expect(store.get('value')).toBe(0)
    })
    it('broadcasts the data to store listeners', () => {
      const listener = new EventTarget()
      const spy = jest.spyOn(listener, 'dispatchEvent')
      store.register(listener, 'value', event => {})
      store.set({ value: 0 })
      expect(spy).toHaveBeenCalledWith(expect.any(MessageEvent))
      // @todo: check if correct event was called? e.g. use spy.mock.calls[0][0]
      // const expectedEvent: StoreEvent<Data> = new MessageEvent('', {
      //   data: { type: 'test', value: 1 },
      //   origin: `${store.id}/value2`
      // })
    })
  })
  describe('#register', () => {
    it('creates an event listener in the given event target', () => {
      const listener = new EventTarget()
      const spy = jest.spyOn(listener, 'addEventListener')
      const handler = () => {}
      store.register(listener, 'value', handler)
      store.set({ value: 0 })
      expect(spy).toHaveBeenCalledWith(expect.any(String), handler)
    })
  })
  describe('#destroy', () => {
    it('removes all event listeners', () => {
      const listener1 = new EventTarget()
      const listener2 = new EventTarget()
      const [spy1, spy2] = [listener1, listener2].map(l => jest.spyOn(l, 'removeEventListener'))
      ;[listener1, listener2].forEach(listener => store.register(listener, 'value', () => {}))
      store.destroy()
      ;[spy1, spy2].forEach(spy => expect(spy).toHaveBeenCalledTimes(1))
    })
  })
})
