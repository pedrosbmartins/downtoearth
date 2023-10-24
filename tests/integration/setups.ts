import { Setup, isGroup } from '../../src/types'

export const base: Setup = {
  title: 'Test',
  unit: { name: 'm', km: 1e-3 },
  root: {
    id: 'root',
    label: 'Root',
    visible: true,
    layers: [
      {
        id: 'root',
        shape: 'circle',
        visible: true,
        radius: { type: 'relative', real: 2.5 },
        fill: { color: '#fff2d1' }
      }
    ],
    sizePresets: [
      { label: '1', km: 1, default: true },
      { label: '5', km: 5 },
      { label: '10', km: 10 }
    ]
  },
  models: [
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
              radius: { type: 'relative', real: 5 },
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
              radius: { type: 'relative', real: 7.5 },
              fill: { color: '#ffeb93' }
            }
          ]
        }
      ]
    }
  ]
}

export const groupWithOffset: Setup = {
  ...base,
  models: base.models!.map(model => {
    if (isGroup(model)) {
      model.bearing = 270
      model.offset = { type: 'relative', real: 15 }
    }
    return model
  })
}
