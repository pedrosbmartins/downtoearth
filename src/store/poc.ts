import { Store } from '.'

export interface Data {
  visible: boolean
}

export class ProofOfConceptStore extends Store<Data> {
  constructor(namespace: string) {
    super(namespace, { visible: true })
  }
}
