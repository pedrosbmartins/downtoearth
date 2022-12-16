export interface StoreEvent<T extends {}> extends Event {
  detail?: T & { name: string }
}

export abstract class Store<D extends {}> {
  protected data: D
  protected listeners: EventTarget[] = []

  constructor(protected namespace: string, initialData: D) {
    this.namespace = namespace
    this.data = initialData
  }

  get<K extends keyof D>(field: K): D[K] {
    return this.data[field]
  }

  set(data: D): void {
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
    this.listeners.push(listener)
    listener.addEventListener(this.eventName(field), handler)
  }

  private broadcast(field: keyof D) {
    for (const listener of this.listeners) {
      listener.dispatchEvent(
        new CustomEvent(this.eventName(field), { detail: { name: field, ...this.data } })
      )
    }
  }

  private eventName(field: keyof D) {
    return `${this.namespace}-${field}-changed`
  }
}
