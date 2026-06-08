## Entendi

Só **um** gateway ativo por vez. Quando você liga a MisticPay, a EFI desliga sozinha (e vice-versa). O outro só entra em ação se o ativo falhar/estiver fora do ar.

Hoje os dois estão `is_active = true` no banco — por isso a confusão.

## O que vou fazer

### 1. Exclusividade no painel (frontend)
- No `usePayments.ts` (hooks `useEfiGateway` e `useMisticPayGateway`): quando salvar `is_active = true` em um, **desativar automaticamente todos os outros** gateways de PIX.
- No `PaymentGatewaysGrid.tsx`: o toggle de ativação de cada card também aplica a mesma regra (liga um, desliga os outros).
- Visual: o card ativo ganha destaque ("Ativo") e os demais aparecem como "Standby (fallback)".

### 2. Roteamento do bot
- Em `telegram-webhook/index.ts` (linha ~7370) e `telegram-payment-handler/index.ts` (linha ~49):
  - Buscar **o gateway ativo** (`is_active = true`) → chama o endpoint dele (`misticpay-generate-pix` ou `efi-generate-pix`).
  - Se a chamada falhar (erro de credenciais, timeout, etc.) → **fallback automático** para qualquer outro gateway configurado (mesmo inativo), só pra não deixar o cliente na mão.
  - Log claro de qual gateway foi usado.

### 3. Limpeza imediata do estado atual
- Como você já escolheu a MisticPay, desativar a EFI agora no banco pra parar o erro `invalid_client` na hora.

## Não muda
- Dialogs de configuração da EFI e MisticPay continuam iguais.
- Edge functions `misticpay-*` e `efi-*` continuam iguais.
- Mínimos por gateway (MisticPay R$5, EFI R$2) continuam respeitados.

## Como vai ficar pra você
- Liga MisticPay → EFI desativa sozinha. Bot manda PIX pela MisticPay.
- Se a MisticPay cair → bot tenta EFI sozinho como salva-vidas (você nem precisa mexer).
- Quer voltar pra EFI? Liga ela no painel, a MisticPay desativa sozinha.

Depois de aplicar, faço o teste real clicando no plano "diária privado" e te mostro nos logs que saiu pela MisticPay.
