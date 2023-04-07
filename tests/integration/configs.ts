import { Config } from '../../src/types'

export const base: Config = {
  unit: { name: 'm', km: 1e-3 },
  root: {
    id: 'root',
    label: 'Root',
    visible: true,
    layer: {
      id: 'root',
      shape: 'circle',
      visible: true,
      size: { type: 'relative', real: 5 },
      fill: { color: '#fff2d1' }
    },
    sizePresets: [
      { label: '1', value: 1, default: true },
      { label: '5', value: 5 },
      { label: '10', value: 10 }
    ]
  },
  groups: [
    {
      id: 'group',
      label: 'Group',
      visible: true,
      models: [
        {
          id: '1',
          label: 'Object 1',
          visible: true,
          layers: [
            {
              id: '1',
              shape: 'circle',
              visible: true,
              size: { type: 'relative', real: 10 },
              fill: { color: '#fff0c0' }
            }
          ]
        },
        {
          id: '2',
          label: 'Object 2',
          visible: true,
          layers: [
            {
              id: '2',
              shape: 'circle',
              visible: true,
              size: { type: 'relative', real: 15 },
              fill: { color: '#ffeb93' }
            }
          ]
        }
      ]
    }
  ]
}

export const groupWithOffset: Config = {
  ...base,
  groups: base.groups!.map(group => {
    group.bearing = 270
    group.offset = { type: 'relative', real: 15 }
    return group
  })
}
