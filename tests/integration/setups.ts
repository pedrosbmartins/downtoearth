import { Setup, isGroup } from '../../src/setups'

export const base: Setup = {
  title: 'Test',
  unit: { name: 'm', km: 1e-3 },
  root: {
    label: 'Root',
    visible: true,
    features: [
      {
        shape: 'circle',
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
      label: 'Group',
      visible: true,
      models: [
        {
          label: 'Object 1',
          visible: true,
          features: [
            {
              shape: 'circle',
              radius: { type: 'relative', real: 5 },
              fill: { color: '#fff0c0' }
            }
          ]
        },
        {
          label: 'Object 2',
          visible: true,
          features: [
            {
              shape: 'circle',
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
