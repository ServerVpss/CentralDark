import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { decidePendingMemoryWrite, editPendingMemoryWrite, getPendingMemoryWrites, rejectAllPendingMemoryWrites } from '@/hermes'
import type { PendingMemoryWrite } from '@/types/hermes'

/** Janela nativa, sem aprovação automática e sem cronômetro de ferramentas. */
export function MemoryWriteReviewDialog({ profile }: { profile?: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PendingMemoryWrite[]>([])
  const [enabled, setEnabled] = useState(false)
  const [id, setId] = useState('')
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const refresh = useCallback(async () => {
    const data = await getPendingMemoryWrites(profile)
    setEnabled(data.enabled)
    setItems(data.pending)
    setId(old => data.pending.some(item => item.id === old) ? old : data.pending[0]?.id ?? '')
  }, [profile])
  useEffect(() => {
    if (!open) return
    void refresh().catch(e => setError(String(e)))
  }, [open, refresh])
  const current = items.find(item => item.id === id)
  const payload = current?.payload
  const operations = payload?.action === 'batch' ? payload.operations ?? [] : payload ? [payload] : []
  const canEdit = operations.length === 1 && ['add', 'patch', 'replace'].includes(operations[0]?.action ?? '')
  const proposed = operations.length === 1 ? operations[0]?.content ?? '' : ''
  const act = async (action: () => Promise<unknown>) => {
    setBusy(true)
    setError('')
    try { await action(); setEditing(false); await refresh() }
    catch (e) { setError(String(e)) }
    finally { setBusy(false) }
  }
  return (
    <div className="mt-3" data-testid="memory-write-review">
      <Button onClick={() => setOpen(true)} size="sm" type="button" variant="outline">Revisar gravações de memória</Button>
      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aprovação de gravação de memória</DialogTitle>
            <DialogDescription>
              Esta alteração poderá afetar conversas futuras. Leia o texto exato; nenhuma memória pendente será salva sem aprovação específica.
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[60vh] gap-3 overflow-auto">
            <p className="text-sm">{enabled ? 'Proteção ativa' : 'Proteção desativada'} · {items.length} gravações pendentes</p>
            <div className="flex flex-wrap gap-1">
              {items.map(item => <Button aria-pressed={item.id === id} key={item.id}
                onClick={() => { setId(item.id); setEditing(false); setError('') }}
                size="xs" type="button" variant={item.id === id ? 'default' : 'outline'}>
                {item.id}{item.origin === 'background_review' ? ' · automática' : ''}
              </Button>)}
            </div>
            {current ? (
              <div className="grid gap-2">
                <p className="text-sm"><strong>ID:</strong> {id} · <strong>Destino:</strong> {payload?.target === 'user' ? 'USER.md' : 'MEMORY.md'}</p>
                <pre data-testid="memory-write-exact-content" className="max-h-56 overflow-auto whitespace-pre-wrap rounded border p-2 text-xs">{JSON.stringify(payload, null, 2)}</pre>
                {editing && <label className="grid gap-1 text-sm">Novo texto proposto (ainda não salvo)
                  <Textarea value={text} rows={4} onChange={e => setText(e.target.value)} />
                </label>}
                <div className="flex flex-wrap gap-2">
                  <Button disabled={busy} onClick={() => void act(() => decidePendingMemoryWrite(id, 'approve', profile))}>A) Aprovar esta memória</Button>
                  <Button disabled={busy} onClick={() => void act(() => decidePendingMemoryWrite(id, 'reject', profile))} variant="outline">B) Rejeitar</Button>
                  <Button disabled={busy || !canEdit} onClick={() => { setEditing(!editing); setText(proposed) }} variant="outline">E) Editar</Button>
                  {editing && <Button disabled={busy || !text.trim()} onClick={() => void act(() => editPendingMemoryWrite(id, text, profile))}>Salvar edição pendente</Button>}
                </div>
              </div>
            ) : <p className="text-sm">Nenhuma gravação pendente.</p>}
            {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          </div>
          <DialogFooter>
            <Button disabled={busy} onClick={() => void act(refresh)} variant="outline">C) Ver todas / atualizar</Button>
            <Button disabled={busy || items.length === 0} onClick={() => void act(() => rejectAllPendingMemoryWrites(profile))} variant="destructive">D) Rejeitar todas</Button>
            <Button onClick={() => setOpen(false)} variant="outline">Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
