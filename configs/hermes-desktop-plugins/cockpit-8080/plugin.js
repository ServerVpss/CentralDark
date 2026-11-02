import { jsx } from 'react/jsx-runtime'

const ID = 'cockpit-8080'
const URL = 'http://127.0.0.1:8080/'

function CockpitPane() {
  return jsx('iframe', {
    src: URL,
    title: 'Cockpit 8080',
    style: { width: '100%', height: '100%', border: '0' }
  })
}

export default {
  id: ID,
  name: 'Cockpit 8080',
  register(ctx) {
    ctx.register({
      id: 'cockpit-8080-pane',
      area: 'panes',
      title: 'Cockpit 8080',
      order: 10,
      render: () => jsx(CockpitPane, {}),
      data: { placement: 'right', width: '55%' }
    })
  }
}
