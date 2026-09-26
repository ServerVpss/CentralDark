---
name: home-network-camera-diagnostics
description: "Diagnosticar dispositivos, repetidores e câmeras IP na rede doméstica autorizada; descobrir rotas RTSP/ONVIF, capturar evidências e validar acesso sem adivinhar credenciais ou explorar terceiros."
version: 1.0.0
platforms: [windows, linux, macos]
metadata:
  hermes:
    tags: [home-network, cameras, yoosee, rtsp, onvif, wifi, repeaters, diagnostics]
    related_skills: [hermes-casa-pivete, systematic-debugging]
---

# Diagnóstico de rede doméstica e câmeras IP

## Quando usar

Use quando Pivete pedir para:

- mapear dispositivos da rede da casa;
- verificar se câmeras, repetidores ou roteadores estão alcançáveis;
- descobrir IP, portas, RTSP, ONVIF ou snapshot;
- capturar uma imagem das câmeras autorizadas;
- comparar a rede local com informações fornecidas por um app móvel.

Não tratar o nome do Wi-Fi como prova de que existe um roteador: um SSID pode ser AP, repetidor, rede dedicada ou rádio do mesmo equipamento.

## Regra de autorização e escopo

- Trabalhar apenas na rede doméstica explicitamente autorizada por Pivete.
- Descoberta de IP/MAC/portas é diferente de entrar no conteúdo de notebook ou telefone.
- Não tentar quebrar senha, explorar firmware, extrair cookies ou usar credenciais de outro dispositivo.
- Não armazenar usuário, senha, token ou URL RTSP com credenciais em memória/skill.
- Se o acesso depender de uma sessão autenticada em outro notebook/celular, pedir um método legítimo: credencial RTSP fornecida fora do chat, compartilhamento autorizado ou configuração no próprio equipamento.

## Método operacional

### 1. Identificar a topologia atual

1. Obter interface, IPv4, máscara e gateway.
2. Ler ARP para listar dispositivos realmente vistos pela máquina.
3. Separar gateway, câmeras, repetidores e dispositivos desconhecidos.
4. Fazer ping apenas nos IPs relevantes.
5. Não concluir que todo SSID visível é uma sub-rede acessível.

No Windows, use `ipconfig`, `arp -a` e `ping`. A tabela ARP é evidência de presença local; ausência nela não prova que o equipamento está desligado.

### 2. Verificar portas de câmera

Testar com timeout curto e em paralelo apenas portas relevantes, como:

- `80`, `443`: HTTP/HTTPS;
- `554`, `8554`: RTSP;
- `8000`, `8080`, `8899`: interfaces/protocolos comuns;
- portas específicas documentadas pelo fabricante.

Sempre fechar sockets e definir timeout. Um scanner sem timeout pode travar o diagnóstico.

### 3. Identificar a família do protocolo

- RTSP aberto em `554` confirma um serviço, não confirma que o stream é anônimo.
- Para câmeras Yoosee/Jortan, testar os caminhos documentados pelo ecossistema:
  - `/onvif1`
  - `/onvif2`
- Usar formato com autenticação somente quando o usuário RTSP e a senha forem legitimamente conhecidos:
  `rtsp://USUARIO:SENHA@IP:554/onvif1`
- `405 Method Not Allowed` em uma tentativa FFmpeg/RTSP não é prova de que o caminho está errado; pode indicar método/protocolo esperado diferente, autenticação ou implementação RTSP não padrão. TCP/554 aberto + `405` demonstra apenas um serviço responsivo, não autenticação nem stream.
- Revalide IP, ARP e estado em cada sessão. Um registro antigo de app pode divergir do ARP atual por bridge, MAC randomizado ou mudança de DHCP; não trate MAC/IP antigo como identidade física confirmada.
- Tentar rotas de Intelbras/Dahua/Hikvision em uma Yoosee sem evidência é chute. Use referências do fabricante/modelo.

### 4. Capturar evidência

Depois que uma URL autenticada funcionar:

1. usar `ffprobe` para confirmar codec, resolução e stream;
2. usar `ffmpeg` para capturar um frame único por câmera;
3. validar que o arquivo existe e abre;
4. enviar a imagem ao usuário com caminho absoluto/media válido;
5. relatar câmera, IP, rota, resolução e horário da captura.

Não afirmar que uma câmera foi vista apenas porque ping/porta responderam.

### 5. Apuração paralela obrigatória

Para qualquer teste novo:

- um agente/processo executa a ação;
- um agente/processo independente acompanha logs, portas, estado e resultado;
- comparar o resultado externo com o log interno;
- só declarar sucesso quando os dois lados baterem.

Isso vale para câmera, Telegram, TTS/STT, reinício de gateway e qualquer fluxo com mais de um componente.

## Assimilação de referências e controle de alucinação

Ao receber issue, artigo, repositório, gist ou discussão:

1. identificar a direção do fluxo e o componente afetado;
2. separar o que a fonte realmente demonstra do que é apenas hipótese;
3. verificar se a referência explica o sintoma atual antes de reutilizar a solução;
4. não transformar exemplos genéricos de URL, credencial ou comando em configuração real;
5. se a fonte estiver bloqueada ou incompleta, declarar a lacuna e pedir texto/captura;
6. só afirmar “funcionou” após evidência do serviço e confirmação observável no destino.

Links de brute force, bypass ou firmware devem ser tratados como material de risco e mitigação. Para a rede autorizada, preferir recuperação de credencial, reset documentado, usuário RTSP dedicado e testes limitados com credenciais conhecidas — nunca adivinhação de senha como primeiro caminho.

## Repetidores e roteadores

Se câmeras e computador estão na mesma faixa, por exemplo `192.168.100.0/24`, e usam o mesmo gateway, os repetidores provavelmente estão em bridge/AP e não em NAT separado. Isso facilita RTSP local.

Para confirmar repetidor:

- comparar BSSID/MAC do AP com o painel do roteador;
- verificar se o cliente mantém o mesmo gateway e sub-rede;
- consultar a lista de mesh/repetidores no roteador;
- não inferir topologia apenas de nomes como `CAMERAS` ou `SEGURANÇA`.

## Diagnóstico de notebook na mesma rede

A autorização de Pivete permite descobrir o notebook, mas não implica acesso mágico ao conteúdo:

- permitido: IP, MAC, presença, portas e serviços anunciados;
- requer configuração legítima: SMB, RDP, SSH, compartilhamento, agente remoto ou credencial;
- não fazer exploração de falhas para obter a sessão do Yoosee.

## Referência desta sessão

Os detalhes de IPs, portas, rotas Yoosee, erros observados e fontes externas estão em `references/yoosee-session-notes.md`.

## Checklist de conclusão

- [ ] Escopo confirmado como rede doméstica autorizada
- [ ] IP/gateway/sub-rede registrados
- [ ] ARP e ping separados de acesso ao conteúdo
- [ ] IP/MAC atual comparados com registros históricos; divergências classificadas, não apagadas
- [ ] Portas testadas com timeout
- [ ] Rota RTSP baseada em fabricante, não em chute
- [ ] `DETECTADA`, `AUTENTICADA`, `STREAM VALIDADO` e `OPERACIONAL` classificados separadamente
- [ ] Credenciais não expostas nem salvas
- [ ] Agente executor e observador usados em teste novo
- [ ] Captura validada com `ffprobe`/`ffmpeg`
- [ ] Resultado externo confirmado antes de declarar sucesso
