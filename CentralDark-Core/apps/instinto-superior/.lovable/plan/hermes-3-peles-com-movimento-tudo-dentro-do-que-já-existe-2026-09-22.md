# Hermes — 3 peles com movimento, tudo dentro do que já existe

## O que já está pronto (medido agora)
- A seção "Hermes — três peles, um instinto" já existe no site e troca a pele em tempo real, sem ZIP.
- O Hermes já anima no site e no cantinho flutuante, usando a sua folha de poses original.
- As 3 folhas (Forja, Celestial, Ascensão) já estão publicadas no site.

Então nada novo é criado por fora: o plano só amplia o que existe.

## O que eu vou fazer

### 1. Mostrar a folha completa no site
Dentro da mesma seção do Hermes, um bloco "Folha de poses" que mostra, pela pele escolhida:
- cada pose com nome (parado, correndo direita, correndo esquerda, acenando, saltando, falhando, esperando, sentado, revisando);
- quantos quadros ela tem, contados de verdade da imagem — não número escrito na mão;
- cada pose rodando na tela, lado a lado, pra você ver na hora o que está bom e o que falta;
- um aviso claro nas poses com menos quadros (as de 4 e 5), que são as que "pulam" mais.

### 2. Garantir movimento nas 3 peles
Uma prova visível: cada pose de cada pele roda seus quadros na tela. Se alguma pele tiver quadro faltando, aparece marcado em dourado (não verificado) em vez de fingir que está certo.

### 3. Fechar o pacotão
Um único ZIP com as 3 peles já animadas, manifesto atualizado (poses, quadros, tamanho da célula, assinatura de cada folha) e o instalador de dois cliques com backup da versão antiga.

### 4. Instalar no seu PC
Isso eu não consigo fazer daqui — não tenho acesso à sua máquina. O que eu entrego é o pacotão de dois cliques; a instalação é você rodando ele. Depois, se quiser, te guio na conferência.

## Regra que eu vou respeitar
Sem criar segunda estrutura: mesmo componente do Hermes, mesmos textos nos três idiomas, mesmo contrato de folha (célula 192x208, grade 8x9), mesmo comportamento de animação reduzida. Nada de V2 do site.

## Detalhes técnicos
- `src/components/central/HermesPet.tsx` ganha `HermesFolha` reutilizando o `SpriteHermes` e a lista `POSES` existentes; nenhum componente paralelo.
- As contagens de quadros vêm de um JSON gerado por medição real dos atlas (alpha por célula), publicado como asset, em vez de constante escrita à mão.
- Novas chaves `pet.folha*` em pt/en/es em `src/lib/i18n.tsx`.
- Pacote montado em `/tmp` e entregue em `/mnt/documents` como um ZIP único.
- Validação: typecheck, build e Playwright nos três idiomas com captura de quadros diferentes por pose.
