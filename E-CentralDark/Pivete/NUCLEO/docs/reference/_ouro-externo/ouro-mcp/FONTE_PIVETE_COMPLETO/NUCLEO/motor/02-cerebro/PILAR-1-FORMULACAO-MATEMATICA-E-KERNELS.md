# PILAR 1: Paradigmas de Programação e Arquitetura Avançada (Fronteira)

> Fonte única. Substitui a versão anterior que vivia em
> `C:\Users\danda\OneDrive\Documentos\1\Segredinho\` (fora do padrão — movida
> pra cá em 19/07/2026). Incorpora formulação mais rigorosa (valor PRM
> token-level com decaimento, log-odds, agregação por passo, virtual loss no
> PUCT) que a versão anterior não sustentava, extraída de
> `E:\CentralDark\Pivete\NUCLEO\skills\lupa-react\Segredinho\Novo(a) Documento de Texto.txt`
> (arquivo de origem — mantido lá como rascunho bruto, não como fonte).

---

## 1. FlashAttention-3+: blocagem SRAM/HBM, FP8 e pipeline assíncrono

Para cada bloco `Q_i ∈ R^{B_r×d}`, percorrem-se blocos `K_j, V_j ∈ R^{B_c×d}`
sem materializar `S, P ∈ R^{N×N}` na HBM.

### 1.1 Restrição de SRAM e escolha de tile

```
M_SRAM ≥ B_r·d + 2·B_c·d + B_r·B_c + B_r·d + 2·B_r
          └─Q─┘   └──K,V──┘  └─S/P─┘  └O_acc┘ └m,l┘
```

Escolha operacional do tile — maximiza intensidade aritmética sujeito ao
limite de SRAM e de registradores por thread:

```
(B_r, B_c) = argmax_{b_r,b_c} AI(b_r,b_c)
             s.t.  M_tile ≤ M_SRAM,  R_thread ≤ R_max
```

Tráfego HBM da atenção densa (materializando S e P):

```
Q_HBM,naive = Θ(N² + Nd)
```

Tráfego HBM com blocagem IO-aware, para `d ≤ M ≤ Nd`:

```
Q_HBM,flash = Θ(N²d²/M + Nd)
```

### 1.2 Softmax online por bloco

Estado persistente por linha: `m_i^(0) = -∞`, `ℓ_i^(0) = 0`, `A_i^(0) = 0`.

Para o bloco `j`:

```
S_ij     = Q_i K_jᵀ / √d
m̃_i      = max(m_i, rowmax(S_ij))
α_i      = exp(m_i - m̃_i)
P̃_ij     = exp(S_ij - m̃_i)
ℓ̃_i      = α_i·ℓ_i + rowsum(P̃_ij)
Ã_i      = α_i·A_i + P̃_ij·V_j

m_i ← m̃_i,  ℓ_i ← ℓ̃_i,  A_i ← Ã_i
```

Resultado final: `O_i = A_i / ℓ_i`, `LSE_i = m_i + log(ℓ_i)` (salvo pro backward).

### 1.3 Quantização FP8 por bloco com rotação de Hadamard

Para `X ∈ {Q, K, V}`, escala por bloco:

```
s_X^(b) = max(|X_b|) / FP8_MAX
X̂_b     = quant_FP8(X_b / s_X^(b))
X_b     ≈ s_X^(b) · X̂_b
```

Produto `QKᵀ` com operandos FP8, escalas por bloco, acumulação FP32:

```
S_ij ≈ (s_Q^(i)·s_K^(j)) · MMA_FP8→FP32(Q̂_i, K̂_jᵀ) / √d
```

Rotação ortogonal `H` (Hadamard, `HHᵀ = I`) antes de quantizar — redistribui
a energia de outliers entre coordenadas sem alterar o produto interno:

```
Q' = Q·Hᵀ,  K' = K·Hᵀ
Q'K'ᵀ = Q·Hᵀ·H·Kᵀ = Q·Kᵀ         (pois HHᵀ = I)
```

### 1.4 Pipeline Hopper/Blackwell — 3 estágios

```
T_tile = max(T_TMA, T_WGMMA + T_softmax)
```

Transferência fica oculta atrás do compute quando:

```
T_TMA(K_{j+1}, V_{j+1}) ≤ T_WGMMA(Q_i, K_j) + T_softmax + T_PV
```

```text
warp-group producer:
    TMA_LOAD K[j+1], V[j+1] -> SRAM[next]
    MBARRIER_ARRIVE(next)

warp-group QK consumer:
    MBARRIER_WAIT(current)
    WGMMA_ASYNC Q, K[current] -> S
    WGMMA_COMMIT_GROUP

warp-group softmax/PV consumer:
    WGMMA_WAIT_GROUP
    ONLINE_SOFTMAX(S, m, l)
    WGMMA_ASYNC P, V[current] -> ACC
    rotate(current, next)
```

> Nota de fidelidade de abstração: o pipeline de 3 estágios acima com
> warp-groups produtor/consumidor explícitos é o nível CUTLASS/PTX cru.
> Triton historicamente compilava para um único warp-group lógico por bloco
> (pipelining produtor-consumidor aproximado via `num_stages` de software
> pipelining, sem controle explícito de warp-specialization). Versões mais
> recentes do Triton (3.2+) expõem `warp_specialize=True` em `tl.range`,
> usado no kernel abaixo — mas isso é um *hint* pro compilador tentar mapear
> pra warp-specialization real em Hopper/Blackwell, não uma garantia
> equivalente ao controle manual de CUTLASS. Em caso de dúvida sobre se o
> hint está de fato sendo honrado numa GPU/versão específica, inspecionar o
> PTX gerado (`triton.compiler.compile(...).asm["ptx"]`) em vez de assumir.

### 1.5 Kernel Triton — FP8, causal, warp-specialized

```python
import triton
import triton.language as tl


@triton.jit
def flash_attn3_fp8_fwd(
    Q, K, V, O, LSE,
    Q_SCALE, K_SCALE, V_SCALE,
    stride_qh, stride_qm, stride_qd,
    stride_kh, stride_kn, stride_kd,
    stride_vh, stride_vn, stride_vd,
    stride_oh, stride_om, stride_od,
    N_CTX: tl.constexpr,
    HEAD_DIM: tl.constexpr,
    SM_SCALE: tl.constexpr,
    CAUSAL: tl.constexpr,
    BLOCK_M: tl.constexpr,
    BLOCK_N: tl.constexpr,
):
    pid_m = tl.program_id(0)
    pid_h = tl.program_id(1)

    offs_m = pid_m * BLOCK_M + tl.arange(0, BLOCK_M)
    offs_n_base = tl.arange(0, BLOCK_N)
    offs_d = tl.arange(0, HEAD_DIM)

    q_ptrs = (
        Q
        + pid_h * stride_qh
        + offs_m[:, None] * stride_qm
        + offs_d[None, :] * stride_qd
    )

    q_mask = offs_m[:, None] < N_CTX
    q8 = tl.load(q_ptrs, mask=q_mask, other=0.0)

    # Escala FP8 do bloco Q atual.
    sq = tl.load(Q_SCALE + pid_h * tl.cdiv(N_CTX, BLOCK_M) + pid_m)

    m_i = tl.full((BLOCK_M,), -float("inf"), tl.float32)
    l_i = tl.zeros((BLOCK_M,), tl.float32)
    acc = tl.zeros((BLOCK_M, HEAD_DIM), tl.float32)

    # tl.range com múltiplos stages + warp_specialize permite ao compilador
    # sobrepor carregamentos de K/V (TMA) com MMA e softmax do bloco anterior.
    for start_n in tl.range(
        0,
        N_CTX,
        BLOCK_N,
        num_stages=4,
        warp_specialize=True,
    ):
        offs_n = start_n + offs_n_base

        k_ptrs = (
            K
            + pid_h * stride_kh
            + offs_n[:, None] * stride_kn
            + offs_d[None, :] * stride_kd
        )
        v_ptrs = (
            V
            + pid_h * stride_vh
            + offs_n[:, None] * stride_vn
            + offs_d[None, :] * stride_vd
        )

        kv_mask = offs_n[:, None] < N_CTX

        k8 = tl.load(k_ptrs, mask=kv_mask, other=0.0)
        v8 = tl.load(v_ptrs, mask=kv_mask, other=0.0)

        block_n = start_n // BLOCK_N
        sk = tl.load(K_SCALE + pid_h * tl.cdiv(N_CTX, BLOCK_N) + block_n)
        sv = tl.load(V_SCALE + pid_h * tl.cdiv(N_CTX, BLOCK_N) + block_n)

        # FP8 WGMMA -> acumulação FP32.
        qk = tl.dot(q8, tl.trans(k8), out_dtype=tl.float32)
        qk *= (sq * sk * SM_SCALE)

        valid = (offs_m[:, None] < N_CTX) & (offs_n[None, :] < N_CTX)
        if CAUSAL:
            valid &= offs_m[:, None] >= offs_n[None, :]
        qk = tl.where(valid, qk, -float("inf"))

        block_max = tl.max(qk, axis=1)
        m_new = tl.maximum(m_i, block_max)

        alpha = tl.exp2((m_i - m_new) * 1.4426950408889634)
        p = tl.exp2((qk - m_new[:, None]) * 1.4426950408889634)

        l_new = alpha * l_i + tl.sum(p, axis=1)
        acc *= alpha[:, None]  # reescala o acumulador quando o máximo online muda

        # P convertido pra FP16/BF16; V permanece FP8 e acumula em FP32.
        pv = tl.dot(p.to(tl.float16), v8.to(tl.float16), out_dtype=tl.float32)
        acc += pv * sv

        m_i = m_new
        l_i = l_new

    out = acc / l_i[:, None]
    lse = m_i + tl.log(l_i)

    o_ptrs = (
        O
        + pid_h * stride_oh
        + offs_m[:, None] * stride_om
        + offs_d[None, :] * stride_od
    )
    tl.store(o_ptrs, out, mask=q_mask)
    tl.store(LSE + pid_h * N_CTX + offs_m, lse, mask=offs_m < N_CTX)
```

---

## 2. Mixture of Experts dinâmico: Top-K, balanceamento dual e dispatch distribuído

Para o token `x_t`: `z_t = W_r·x_t + b_r ∈ R^E`.

### 2.1 Balanceamento por dual-ascent (generaliza o "loss-free bias")

Carga exponencial (EMA) do expert `e`:

```
f̂_e^(n) = ρ·f̂_e^(n-1) + (1-ρ)·(n_e / TK)
```

Logit de seleção corrigido (bias dual + penalização de overload):

```
z̃_{t,e} = z_{t,e} + b_e^dual - λ·(f̂_e - 1/E)
```

Seleção usa o logit corrigido; peso de combinação (gate) usa o logit
**original** (sem bias) — a correção de balanceamento não deve vazar pro
peso semântico da saída:

```
E_t   = TopK_e(z̃_{t,e})
g_{t,e} = softmax(z_{t,e}/τ)  para e ∈ E_t
y_t   = Σ_{e∈E_t} g_{t,e}·Expert_e(x_t)
```

Capacidade por expert: `C = ⌈c_cap · TK/E⌉`.

Atualização dual sem gradiente (clip pra estabilidade):

```
b_e^dual ← clip[ b_e^dual + η·(1/E - f̂_e), -b_max, b_max ]
```

> Variante mais simples e amplamente usada em produção (DeepSeek-V3 —
> "loss-free balancing"): em vez de dual-ascent com EMA contínua, atualiza
> só com o sinal do desbalanceamento medido no batch corrente —
> `b_e ← b_e + γ·sign(target_load - load_e)`, `γ` pequeno (~1e-3). Mais
> barato, menos suave que a versão EMA acima; escolher em função de
> estabilidade de treino observada, não por padrão.

Perdas auxiliares (mantidas mesmo com bias dual, como regularização leve):

```
L_balance = α·E·Σ_e f_e·p_e                    (f_e = fração roteada, p_e = softmax médio)
L_z       = β·(1/T)·Σ_t (logsumexp(z_t))²      (penaliza magnitude do roteador)
L         = L_LM + L_balance + L_z
```

### 2.2 Roteamento com capacidade (rank estável por expert)

```python
from dataclasses import dataclass

import torch
import torch.distributed as dist
import torch.nn.functional as F


@dataclass
class RouteState:
    load_ema: torch.Tensor
    dual_bias: torch.Tensor


def dynamic_topk_route(
    x: torch.Tensor,                  # [tokens, hidden]
    router_weight: torch.Tensor,      # [experts, hidden]
    state: RouteState,
    *,
    top_k: int,
    temperature: float = 1.0,
    load_decay: float = 0.99,
    load_penalty: float = 2.0,
    dual_lr: float = 1e-3,
    capacity_factor: float = 1.10,
):
    tokens = x.shape[0]
    experts = router_weight.shape[0]

    logits = F.linear(x.float(), router_weight.float())

    target = torch.full_like(state.load_ema, 1.0 / experts)
    overload = state.load_ema - target

    selection_logits = (
        logits
        + state.dual_bias[None, :]
        - load_penalty * overload[None, :]
    )

    _, expert_ids = torch.topk(selection_logits, k=top_k, dim=-1, sorted=False)

    # O balanceamento decide QUAIS experts entram; o peso da combinação
    # vem dos logits SEM penalização.
    selected_logits = logits.gather(1, expert_ids)
    gates = F.softmax(
        selected_logits / temperature, dim=-1, dtype=torch.float32
    ).to(x.dtype)

    capacity = int(
        torch.ceil(torch.tensor(capacity_factor * tokens * top_k / experts)).item()
    )

    flat_experts = expert_ids.reshape(-1)
    flat_tokens = torch.arange(tokens, device=x.device).repeat_interleave(top_k)
    flat_gates = gates.reshape(-1)

    raw_count = torch.bincount(flat_experts, minlength=experts)

    # Rank estável dentro de cada expert para impor capacidade.
    order = torch.argsort(flat_experts, stable=True)
    sorted_experts = flat_experts[order]

    starts = torch.zeros(experts + 1, device=x.device, dtype=torch.long)
    starts[1:] = torch.cumsum(raw_count, dim=0)

    position = torch.arange(
        flat_experts.numel(), device=x.device
    ) - torch.repeat_interleave(starts[:-1], raw_count)

    keep_sorted = position < capacity
    keep = torch.zeros_like(keep_sorted)
    keep[order] = keep_sorted

    flat_experts = flat_experts[keep]
    flat_tokens = flat_tokens[keep]
    flat_gates = flat_gates[keep]

    accepted_count = torch.bincount(flat_experts, minlength=experts).float()

    # Consenso global de carga entre nós do expert-parallel group.
    if dist.is_initialized():
        dist.all_reduce(accepted_count, op=dist.ReduceOp.SUM)

    normalized_load = accepted_count / accepted_count.sum().clamp_min(1)

    state.load_ema.mul_(load_decay).add_(normalized_load, alpha=1.0 - load_decay)
    state.dual_bias.add_(dual_lr * (target - state.load_ema)).clamp_(-2.0, 2.0)

    router_prob = logits.softmax(dim=-1).mean(dim=0)
    balance_loss = experts * torch.sum(router_prob * normalized_load.detach())
    z_loss = torch.mean(torch.logsumexp(logits, dim=-1).square())

    return {
        "token_ids": flat_tokens,
        "expert_ids": flat_experts,
        "gates": flat_gates,
        "capacity": capacity,
        "balance_loss": balance_loss,
        "z_loss": z_loss,
        "state": state,
    }
```

### 2.3 Dispatch/compute/combine com Expert Parallelism (all-to-all real)

```python
def expert_parallel_forward(x, route, local_experts, expert_owner, ep_group):
    token_ids = route["token_ids"]
    expert_ids = route["expert_ids"]
    gates = route["gates"]

    routed_x = x[token_ids]
    destination = expert_owner[expert_ids]

    permutation = torch.argsort(destination, stable=True)

    send_x = routed_x[permutation]
    send_expert = expert_ids[permutation]
    send_gate = gates[permutation]
    send_token = token_ids[permutation]

    world = dist.get_world_size(ep_group)
    send_splits = torch.bincount(destination, minlength=world).tolist()

    split_tensor = torch.tensor(send_splits, device=x.device, dtype=torch.int64)
    recv_split_tensor = torch.empty_like(split_tensor)
    dist.all_to_all_single(recv_split_tensor, split_tensor, group=ep_group)
    recv_splits = recv_split_tensor.tolist()
    recv_total = sum(recv_splits)

    recv_x = torch.empty(recv_total, x.shape[-1], device=x.device, dtype=x.dtype)
    recv_expert = torch.empty(recv_total, device=x.device, dtype=torch.long)

    # Dispatch: tokens -> nós que possuem os experts.
    dist.all_to_all_single(recv_x, send_x, recv_splits, send_splits, group=ep_group)
    dist.all_to_all_single(
        recv_expert, send_expert, recv_splits, send_splits, group=ep_group
    )

    recv_y = torch.empty_like(recv_x)
    for expert_id, expert in local_experts.items():
        mask = recv_expert == expert_id
        if mask.any():
            recv_y[mask] = expert(recv_x[mask])

    send_back = torch.empty_like(send_x)

    # Combine: resultados -> nós de origem.
    dist.all_to_all_single(send_back, recv_y, send_splits, recv_splits, group=ep_group)

    weighted = send_back * send_gate[:, None]

    y = torch.zeros_like(x)
    y.index_add_(0, send_token, weighted)

    gate_sum = torch.zeros(x.shape[0], device=x.device, dtype=x.dtype)
    gate_sum.index_add_(0, send_token, send_gate)

    return y / gate_sum.clamp_min(1e-6)[:, None]
```

### 2.4 Kernel do expert (SwiGLU fundido)

```python
@triton.jit
def expert_ffn_swiglu_kernel(
    x_ptr, w1_ptr, w3_ptr, w2_ptr, out_ptr,
    stride_xm, stride_xd, D, D_FF,
    BLOCK_M: tl.constexpr, BLOCK_D: tl.constexpr,
):
    # Roda sobre o shard de tokens já despachado a ESTE expert.
    pid = tl.program_id(0)
    offs_m = pid * BLOCK_M + tl.arange(0, BLOCK_M)
    x = tl.load(x_ptr + offs_m[:, None] * stride_xm + tl.arange(0, BLOCK_D)[None, :])

    h1 = tl.dot(x, tl.load(w1_ptr))            # gate proj
    h3 = tl.dot(x, tl.load(w3_ptr))             # up proj
    h = (h1 * tl.sigmoid(h1)) * h3              # SiLU(h1) * h3  (SwiGLU)
    out = tl.dot(h, tl.load(w2_ptr))            # down proj
    tl.store(out_ptr + offs_m[:, None] * stride_xm, out)
```

---

## 3. Test-Time Compute: PRM token-level acoplado a MCTS com virtual loss

Estado parcial: `s_t = (x, y_{1:t})`. Prior do gerador por token:

```
P_θ(a|s_t) = softmax(W_LM·h_t)_a
```

### 3.1 Cabeça PRM e valor por token (os 4 elementos antes ausentes)

Cabeça escalar sobre o hidden state:

```
u_t      = W_2 · SiLU(W_1 · LN(h_t))
p_t^PRM  = σ(u_t)
```

**(1) Valor token-level com decaimento** — recompensa instantânea em
log-probabilidade, acumulada com desconto `γ` e normalizada:

```
r_t       = log(p_t^PRM + ε)
V_PRM(s_t) = [ Σ_{j=1}^{t} γ^{t-j}·r_j ] / [ Σ_{j=1}^{t} γ^{t-j} ]
```

**(2) Parametrização em log-odds** — alternativa quando o PRM está bem
calibrado (mais sensível perto de `p≈0` e `p≈1` que o log simples):

```
r_t^odds = log[ (p_t^PRM + ε) / (1 - p_t^PRM + ε) ]
```

**(3) Agregação por fronteira de passo** — quando o raciocínio é segmentado
em passos discretos `step_k = {b_{k-1}+1, ..., b_k}`:

```
V_step(s_t) = Agg(r_{b_{k-1}+1}, ..., r_{b_k})

Agg_min = min_j p_j^PRM                                   (conservadora)
Agg_geo = exp[ (1/|step_k|) · Σ_j log(p_j^PRM + ε) ]       (geométrica)
```

### 3.2 Seleção PUCT com virtual loss (o 4º elemento)

**(4)** O termo de virtual loss impede que múltiplos workers concorrentes
explorem a mesma aresta simultaneamente durante busca paralela:

```
a* = argmax_a [ Q(s,a) + c_puct·P_θ(a|s)·√N(s)/(1+N(s,a)) - λ_v·L_virtual(s,a) ]
```

### 3.3 Expansão e valor combinado

```
A_B(s) = TopB(P_θ(·|s))                      # top-B candidatos do prior
s'     = s ⊕ a

V(s') = λ_p·V_PRM(s') + λ_o·V_ORM(s') + λ_e·V_exec(s') - λ_c·C(s')
        com  λ_p + λ_o + λ_e = 1
```

`V_exec` pode vir de compilador, testes, solver ou verificador formal —
sinal de correção executável, não apenas aprendido. `C(s')` é um custo
(tokens/latência) subtraído do valor pra penalizar buscas caras.

### 3.4 Backup

Para a trajetória `(s_0,a_0,...,s_L)`, `G_L = V(s_L)`, `G_t = r_t + γ·G_{t+1}`:

```
N(s_t,a_t) ← N(s_t,a_t) + 1
Q(s_t,a_t) ← Q(s_t,a_t) + [G_t - Q(s_t,a_t)] / N(s_t,a_t)
```

### 3.5 Implementação — cabeça PRM por token

```python
import torch
import torch.nn as nn
import torch.nn.functional as F


class TokenProcessRewardModel(nn.Module):
    def __init__(self, backbone, hidden_size, bottleneck=1024):
        super().__init__()
        self.backbone = backbone
        self.norm = nn.LayerNorm(hidden_size)
        self.reward_head = nn.Sequential(
            nn.Linear(hidden_size, bottleneck, bias=False),
            nn.SiLU(),
            nn.Linear(bottleneck, 1, bias=False),
        )

    def forward(self, input_ids, attention_mask, step_boundary_mask=None, labels=None):
        outputs = self.backbone(
            input_ids=input_ids,
            attention_mask=attention_mask,
            output_hidden_states=True,
            use_cache=False,
        )
        h = self.norm(outputs.hidden_states[-1])
        token_logits = self.reward_head(h).squeeze(-1)
        token_prob = torch.sigmoid(token_logits)

        result = {"token_logits": token_logits, "token_prob": token_prob}

        if step_boundary_mask is not None:
            result["step_logits"] = token_logits.masked_select(step_boundary_mask)
            result["step_prob"] = token_prob.masked_select(step_boundary_mask)

        if labels is not None:
            valid = labels != -100
            result["loss"] = F.binary_cross_entropy_with_logits(
                token_logits[valid], labels[valid].float()
            )
        return result
```

### 3.6 Nó MCTS com valor incremental por token + virtual loss

```python
from dataclasses import dataclass, field
import math
import threading


@dataclass
class Edge:
    prior: float
    visits: int = 0
    value_sum: float = 0.0
    virtual_loss: int = 0
    child: "Node | None" = None

    @property
    def q(self):
        if self.visits == 0:
            return 0.0
        return self.value_sum / self.visits


@dataclass
class Node:
    token_ids: tuple
    kv_cache_handle: object
    prm_log_sum: float
    prm_weight_sum: float
    depth: int
    terminal: bool = False
    edges: dict = field(default_factory=dict)
    lock: threading.Lock = field(default_factory=threading.Lock, repr=False)

    @property
    def visits(self):
        return sum(edge.visits for edge in self.edges.values())

    @property
    def prm_value(self):
        if self.prm_weight_sum == 0:
            return 0.0
        return self.prm_log_sum / self.prm_weight_sum


def extend_prm_value(parent: Node, token_probability: float, gamma: float):
    eps = 1e-8
    decayed_log_sum = gamma * parent.prm_log_sum
    decayed_weight_sum = gamma * parent.prm_weight_sum
    token_reward = math.log(max(token_probability, eps))
    return decayed_log_sum + token_reward, decayed_weight_sum + 1.0


def select_edge(node: Node, c_puct: float, virtual_loss_weight: float):
    with node.lock:
        parent_visits = max(1, node.visits)
        sqrt_parent = math.sqrt(parent_visits)

        best_token, best_score = None, -float("inf")
        for token, edge in node.edges.items():
            exploration = c_puct * edge.prior * sqrt_parent / (1 + edge.visits)
            score = edge.q + exploration - virtual_loss_weight * edge.virtual_loss
            if score > best_score:
                best_score, best_token = score, token

        edge = node.edges[best_token]
        edge.virtual_loss += 1
        return best_token, edge


@torch.no_grad()
def expand_node(node, policy_model, prm_model, tokenizer, *, branch_factor=16, gamma=0.995):
    last_token = torch.tensor([[node.token_ids[-1]]], device=policy_model.device)
    policy_out = policy_model(
        input_ids=last_token, past_key_values=node.kv_cache_handle, use_cache=True
    )
    logits = policy_out.logits[0, -1]
    probs = logits.softmax(dim=-1)
    priors, candidate_tokens = torch.topk(probs, k=branch_factor)

    batch_tokens = candidate_tokens[:, None]
    prm_out = prm_model(input_ids=batch_tokens, attention_mask=torch.ones_like(batch_tokens))
    token_values = prm_out["token_prob"][:, -1]

    children = []
    for token, prior, token_probability in zip(
        candidate_tokens.tolist(), priors.tolist(), token_values.tolist()
    ):
        log_sum, weight_sum = extend_prm_value(node, token_probability, gamma)
        child = Node(
            token_ids=node.token_ids + (token,),
            kv_cache_handle=policy_out.past_key_values,
            prm_log_sum=log_sum,
            prm_weight_sum=weight_sum,
            depth=node.depth + 1,
            terminal=token == tokenizer.eos_token_id,
        )
        node.edges[token] = Edge(prior=prior, child=child)
        children.append(child)
    return children


def backup(trajectory, leaf_value, gamma=0.995):
    value = leaf_value
    for node, token, token_reward in reversed(trajectory):
        value = token_reward + gamma * value
        with node.lock:
            edge = node.edges[token]
            edge.virtual_loss = max(0, edge.virtual_loss - 1)
            edge.visits += 1
            edge.value_sum += value


def mcts_runtime_inference(
    root, policy_model, prm_model, tokenizer, *,
    simulations=1024, branch_factor=16, max_depth=2048,
    c_puct=1.5, virtual_loss_weight=0.25, gamma=0.995,
):
    for _ in range(simulations):
        node = root
        trajectory = []

        while node.edges and not node.terminal:
            token, edge = select_edge(node, c_puct=c_puct, virtual_loss_weight=virtual_loss_weight)
            child = edge.child
            token_reward = child.prm_value - node.prm_value
            trajectory.append((node, token, token_reward))
            node = child
            if node.depth >= max_depth:
                break

        if not node.terminal and node.depth < max_depth:
            children = expand_node(
                node, policy_model, prm_model, tokenizer,
                branch_factor=branch_factor, gamma=gamma,
            )
            # Inicialização conservadora: melhor filho segundo o PRM, sem
            # transformar prior do gerador em recompensa.
            leaf = max(children, key=lambda c: c.prm_value)
            leaf_value = leaf.prm_value
        else:
            leaf_value = node.prm_value

        backup(trajectory, leaf_value, gamma=gamma)

    # Política final derivada das visitas, não do maior Q isolado.
    best_token, best_edge = max(root.edges.items(), key=lambda item: item[1].visits)
    return best_token, best_edge.child
```

### 3.7 Alocação adaptativa de orçamento de busca

Para dificuldade estimada `d_x` e orçamento máximo `B`:

```
max_{n_x,b_x,h_x} E[U_x(n_x,b_x,h_x)]   s.t.  Σ_x n_x·b_x·h_x ≤ B
```

Onde `n_x` = simulações MCTS, `b_x` = branching factor, `h_x` = profundidade,
`U_x` = utilidade estimada por PRM/ORM/verificador. Regra adaptativa —
concentra compute em problemas de dificuldade intermediária, onde a busca
adicional tem maior ganho marginal:

```
B_x = B_min + (B_max - B_min)·4·d_x·(1-d_x)
```

```python
def allocate_search_budget(
    predicted_success, *,
    min_simulations=64, max_simulations=4096,
    min_branch=4, max_branch=32,
):
    p = float(max(0.0, min(1.0, predicted_success)))
    uncertainty = 4.0 * p * (1.0 - p)          # pico em p=0.5, zero em p=0 ou 1

    simulations = round(min_simulations + uncertainty * (max_simulations - min_simulations))
    branch_factor = round(min_branch + uncertainty * (max_branch - min_branch))

    return {
        "simulations": simulations,
        "branch_factor": branch_factor,
        "uncertainty": uncertainty,
    }
```

### 3.8 Caminho alternativo — busca internalizada via RL

Fronteira de engenharia distinta da busca explícita acima (estilo
DeepSeek-R1): eliminar o MCTS explícito em inferência, treinando `π_θ` via
RL (GRPO ou equivalente) com recompensa de resultado verificável, até que
comportamentos de backtracking/auto-verificação emerjam **dentro** da
própria cadeia gerada autoregressivamente — trocando custo de inferência
(árvore explícita, `N_simulations × k_branch` chamadas de LM) por custo de
treino (RL longo sobre trajetórias longas). MCTS+PRM explícito continua
superior em controlabilidade e interpretabilidade do processo de busca;
busca internalizada via RL é superior em custo/latência de inferência por
resposta. Escolha é de trade-off de produto, não hierarquia técnica.

---

## Rollback documental

- Versão anterior (menos rigorosa, sem os 4 elementos da seção 3.1/3.2):
  vivia em `C:\Users\danda\OneDrive\Documentos\1\Segredinho\PILAR-1-FORMULACAO-MATEMATICA-E-KERNELS.md`
  — removida em 19/07/2026 pra não deixar duas fontes divergindo (mesma
  regra que já valeu pro REGISTRAR e pro sentinela-session-mesh nesta
  sessão). A fonte válida a partir de agora é este arquivo.
- Origem do conteúdo incorporado: `E:\CentralDark\Pivete\NUCLEO\skills\lupa-react\Segredinho\Novo(a) Documento de Texto.txt`
  (mantido como rascunho bruto de origem, não editado).
