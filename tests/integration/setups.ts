import { Setup, isGroup } from '../../src/setups'

export const base: Setup = {
  title: 'Test',
  unit: { name: 'm', km: 1e-3 },
  root: {
    label: 'Root',
    size: 100,
    features: [
      {
        shape: 'circle',
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
      models: [
        {
          label: 'Object 1',
          size: 20,
          features: [
            {
              shape: 'circle',
              fill: { color: '#fff0c0' }
            }
          ]
        },
        {
          label: 'Object 2',
          size: 15,
          features: [
            {
              shape: 'circle',
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
      model.offset = 30
    }
    return model
  })
}
