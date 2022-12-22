import { StoreListener, StoreListenerConfig } from './StoreListener'

export interface StoreEvent<T extends {}> extends Event {
  detail?: T & { name: keyof T }
}

interface ListenerConfig<D extends {}> {
  listener: EventTarget
  handler: (this: any, event: StoreEvent<D>) => void
}

export abstract class BaseStore<D extends {}> extends StoreListener<D> {
  protected listeners: { [field: string]: ListenerConfig<D>[] } = {}

  constructor(
    protected namespace: string,
    protected data: D,
    storeConfigs?: StoreListenerConfig<D>[]
  ) {
    super(storeConfigs ?? [])
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
    handler: (this: T, event: StoreEvent<D>) => void
  ) {
    if (!this.listeners[field]) this.listeners[field] = []
    this.listeners[field].push({ listener, handler })
    listener.addEventListener(this.eventName(field), handler)
  }

  public id() {
    return this.namespace
  }

  public destroy() {
    Object.entries(this.listeners).forEach(([field, listeners]) => {
      listeners.forEach(({ listener, handler }) => {
        listener.removeEventListener(this.eventName(field as keyof D), handler)
      })
    })
  }

  private broadcast(field: keyof D) {
    ;(this.listeners[field] ?? []).forEach(({ listener }) => {
      listener.dispatchEvent(
        new CustomEvent(this.eventName(field), { detail: { name: field, ...this.data } })
      )
    })
  }

  private eventName(field: keyof D) {
    return `${this.namespace}-${field}-changed`
  }
}
