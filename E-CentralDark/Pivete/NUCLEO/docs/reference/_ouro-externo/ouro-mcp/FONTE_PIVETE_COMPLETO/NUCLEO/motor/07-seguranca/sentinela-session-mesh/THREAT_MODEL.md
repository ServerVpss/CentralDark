# Modelo de ameaça

## Coberto

- observação, modificação, injeção e reordenação de tráfego;
- repetição de envelopes válidos;
- confusão entre sessões, épocas e requests;
- cliente sem certificado aceito pela PKI mTLS;
- token incorreto, sessão revogada ou expirada;
- payload adulterado e cabeçalho adulterado;
- frame declarando tamanho excessivo;
- avalanche de falhas, dependência indisponível e saturação concorrente;
- exposição acidental via `Debug` de estruturas secretas;
- retenção residual best-effort de chaves e tokens em memória.

## Não coberto

- processo, kernel, hipervisor ou firmware comprometido;
- leitura física de memória e side channels microarquiteturais completos;
- rollback do armazenamento de sessão sem ledger/âncora externa;
- comprometimento de KMS/HSM ou PKI;
- negação volumétrica anterior ao balanceador/firewall;
- análise de tráfego baseada em tamanho e frequência;
- disponibilidade bizantina de múltiplos nós sem consenso externo.

## Assunções operacionais

- chave-mestre por época é gerada e protegida por KMS/HSM;
- `token_pepper` é independente das chaves AEAD;
- relógios possuem desvio controlado;
- revogação de certificados é propagada fora do processo;
- o mapa de sessões é substituído por armazenamento com CAS e TTL em cluster;
- métricas contêm apenas IDs correlacionáveis não secretos e códigos de erro.

