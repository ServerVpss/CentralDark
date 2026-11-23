import { useStore } from '@nanostores/react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Copy, Minus, Square, X } from 'lucide-react'
import { useEffect, useState } from 'react'

import { BrandMark } from './components/brand-mark'
import Failure from './routes/failure'
import Progress from './routes/progress'
import Success from './routes/success'
import Welcome from './routes/welcome'
import { $bootstrap, $route, initialize } from './store'

const native = '__TAURI_INTERNALS__' in window
type ResizeDirection = 'East' | 'North' | 'NorthEast' | 'NorthWest' | 'South' | 'SouthEast' | 'SouthWest' | 'West'
const resizeEdges: { direction: ResizeDirection; className: string }[] = [
  { direction: 'North', className: 'north' },
  { direction: 'South', className: 'south' },
  { direction: 'East', className: 'east' },
  { direction: 'West', className: 'west' },
  { direction: 'NorthEast', className: 'north-east' },
  { direction: 'NorthWest', className: 'north-west' },
  { direction: 'SouthEast', className: 'south-east' },
  { direction: 'SouthWest', className: 'south-west' },
]

/*
 * A mesma arquitetura de moldura do Segredo Agente Remoto: uma janela Tauri,
 * barra própria, ícone do olho e controles Windows. A instalação não muda.
 */
export default function App() {
  const route = useStore($route)
  const bootstrap = useStore($bootstrap)
  const [maximized, setMaximized] = useState(false)
  const [windowError, setWindowError] = useState('')

  useEffect(() => {
    void initialize()
  }, [])

  useEffect(() => {
    if (!native) return
    const current = getCurrentWindow()
    let active = true
    let unlisten: (() => void) | undefined
    const sync = () => {
      void current.isMaximized().then(value => {
        if (active) setMaximized(value)
      }).catch(() => {})
    }
    sync()
    void current.onResized(sync).then(dispose => {
      if (active) unlisten = dispose
      else dispose()
    }).catch(() => {})
    return () => {
      active = false
      unlisten?.()
    }
  }, [])

  const control = (action: () => Promise<void>) => {
    if (!native) return
    setWindowError('')
    void action().catch(() => setWindowError('Não foi possível controlar a janela.'))
  }

  return (
    <div className="centraldark-native-shell">
      <header className="centraldark-native-titlebar">
        <div className="centraldark-titlebar-drag" data-tauri-drag-region
          title="Arraste para mover; dois cliques para maximizar"
          onDoubleClick={() => control(() => getCurrentWindow().toggleMaximize())}>
          <BrandMark className="centraldark-titlebar-icon" data-tauri-drag-region />
          <span className="centraldark-titlebar-wordmark" data-tauri-drag-region>
            <span className="centraldark-titlebar-eyebrow" data-tauri-drag-region>CENTRALDARK</span>
            <strong data-tauri-drag-region>CentralDark-OS</strong>
          </span>
        </div>
        {windowError && <span className="centraldark-titlebar-error" role="alert">{windowError}</span>}
        <div className="centraldark-titlebar-controls" aria-label="Controles da janela">
          <button type="button" className="centraldark-chrome-button" title="Minimizar"
            aria-label="Minimizar janela" disabled={!native}
            onClick={() => control(() => getCurrentWindow().minimize())}><Minus size={17} /></button>
          <button type="button" className="centraldark-chrome-button"
            title={maximized ? 'Restaurar' : 'Maximizar'} aria-label={maximized ? 'Restaurar janela' : 'Maximizar janela'}
            disabled={!native} onClick={() => control(() => getCurrentWindow().toggleMaximize())}>
            {maximized ? <Copy size={15} /> : <Square size={14} />}
          </button>
          <button type="button" className="centraldark-chrome-button centraldark-chrome-close"
            title="Fechar instalador" aria-label="Fechar instalador" disabled={!native}
            onClick={() => control(() => getCurrentWindow().close())}><X size={18} /></button>
        </div>
      </header>
      <main className="centraldark-native-body">
        {route === 'welcome' && <Welcome />}
        {route === 'progress' && <Progress bootstrap={bootstrap} />}
        {route === 'success' && <Success />}
        {route === 'failure' && <Failure bootstrap={bootstrap} />}
      </main>
      {native && !maximized && resizeEdges.map(edge => (
        <div key={edge.direction} className={`centraldark-resize-handle ${edge.className}`}
          role="presentation" onMouseDown={event => {
            if (event.button !== 0) return
            event.preventDefault()
            control(() => getCurrentWindow().startResizeDragging(edge.direction))
          }} />
      ))}
    </div>
  )
}
