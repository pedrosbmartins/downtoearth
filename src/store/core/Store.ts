import { nanoid } from 'nanoid'
import { AnyStoreData } from './StoreData'
import { AnyStoreEvent } from './StoreEvent'
import { AnyObservable, StoreListener } from './StoreListener'

interface ListenerConfig {
  listener: EventTarget
  handler: (this: any, event: AnyStoreEvent) => void
}

export type AnyStore = Store

export abstract class Store<D extends AnyStoreData = { type: any }> extends StoreListener {
  public readonly id: string
  protected listeners: { [field: string]: ListenerConfig[] } = {}

  constructor(protected data: D, observables?: AnyObservable[]) {
    super(observables ?? [])
    this.id = nanoid()
    Object.keys(data).forEach(field =>
      this.register(this, field as keyof D, (e: AnyStoreEvent) => this.onUpdate(e))
    )
  }

  public get<K extends keyof D>(field: K): D[K] {
    return this.data[field]
  }

  public set(data: Partial<D>): void {
    Object.assign(this.data, data)
    Object.keys(data).forEach(field => {
      this.broadcast(field as keyof D)
    })
  }

  public register<T extends EventTarget>(
    listener: T,
    field: keyof D,
    handler: (this: T, event: AnyStoreEvent) => void
  ) {
    if (!this.listeners[field]) this.listeners[field] = []
    this.listeners[field].push({ listener, handler })
    listener.addEventListener(this.eventName(field), handler as EventListener)
  }

  public destroy() {
    Object.entries(this.listeners).forEach(([field, listeners]) => {
      listeners.forEach(({ listener, handler }) => {
        listener.removeEventListener(this.eventName(field as keyof D), handler as EventListener)
      })
    })
  }

  private broadcast(field: keyof D) {
    if (!this.listeners[field]) return
    this.listeners[field].forEach(({ listener }) => {
      listener.dispatchEvent(
        new MessageEvent<D>(this.eventName(field), {
          origin: `${this.id}/${field}`,
          data: this.data
        })
      )
    })
  }

  private eventName(field: keyof D) {
    return `${this.id}-${field}-changed`
  }
}
