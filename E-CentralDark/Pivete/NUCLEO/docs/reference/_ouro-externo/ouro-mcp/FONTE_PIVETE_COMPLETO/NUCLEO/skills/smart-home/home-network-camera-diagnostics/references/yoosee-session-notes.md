# Sessão de referência — Yoosee e rede da casa

## Evidências observadas

- Máquina: `192.168.100.3/24`
- Gateway: `192.168.100.1`
- Câmera “FRENTE DA CASA”: `192.168.100.6`, ID `7223531488`, firmware `38.2.107`, MAC exibido pelo app `a8:b5:8e:9f:0a:f1`.
- Câmera “garagem”: `192.168.100.9`, ID `6924109898`, firmware `37.0.14`, MAC exibido pelo app `cc:64:1a:a1:63:ca`.
- Ambas responderam a ping e aceitaram conexão TCP em `554`.
- Tentativas sem credenciais em `/onvif1` e `/onvif2` retornaram `405 Method Not Allowed` pelo FFmpeg; isso demonstra serviço RTSP compatível/particular, mas não stream anônimo funcional.

## Revalidação obrigatória

Estas notas são evidência histórica, não um mapa permanente dos dispositivos. Refaça ARP, TCP/554, ICMP e inventário do app/roteador em cada sessão. Na rechecagem de 2026-07-18, os dois hosts lógicos das câmeras continuaram aceitando TCP/554 e retornaram `405` em `/onvif1`/`/onvif2` sem autenticação, mas um host não respondeu a ICMP e os MACs do ARP divergiram dos MACs exibidos pelo app. Classifique isso como **serviço detectado, não autenticado, stream não validado** até credenciais RTSP legítimas produzirem resultado real no `ffprobe` e captura de frame.



- Discussão Frigate sobre câmera Yoosee: usa formato `rtsp://admin:SENHA@IP:554/onvif1`; o relato também menciona `/onvif2`.
- Repositório `wredan/yoosee_camera_control_api`: referência para controle REST de câmeras Yoosee com RTSP.
- Gist `alexishida/rtsp-intelbras-outros.txt`: banco genérico de URLs RTSP; usar apenas para comparar padrões por fabricante. Não aplicar automaticamente uma URL Intelbras/Dahua/Hikvision a uma câmera Yoosee.
- Repositório `gabrielmaialva33/camera-hack`: pesquisa de firmware/UART/Anyka para Yoosee/Jortan; não é necessário para captura normal e não deve ser tratado como primeiro caminho.

## Próximo teste legítimo

Obter no app Yoosee as credenciais específicas de RTSP/ONVIF ou configurar um usuário RTSP. Não usar o ID da câmera como senha. Com credencial legítima, testar `/onvif1` e `/onvif2` com `ffprobe -rtsp_transport tcp`; depois capturar um frame via `ffmpeg`.

## Auditoria defensiva de autenticação

A sequência reutilizável é: identificar serviço/porta; confirmar o protocolo; usar somente credenciais conhecidas e autorizadas; observar código/resposta e logs; validar o acesso; corrigir a configuração. Não fazer brute force, wordlists ou exploração de firmware como primeiro caminho: isso pode bloquear a câmera e não é necessário para recuperação legítima. Para proteger a instalação, preferir senha forte, UPnP desativado, isolamento IoT/VLAN quando disponível e acesso RTSP restrito à LAN.

## Fontes externas e apuração

Quando GitHub/Gist/Reddit/Google bloquear a leitura, registrar apenas o que foi realmente observado e pedir ao usuário o texto ou captura; não preencher lacunas por inferência. Links sobre força bruta servem para entender o risco e a mitigação, não para executar tentativas contra o dispositivo.

## Nota de rede

SSIDs `CAMERAS` e `SEGURANÇA` aparecem no celular e foram descritos como repetidores. Isso é compatível com bridge/AP, mas a confirmação deve vir do painel do roteador/BSSID; SSID por si só não prova topologia. Câmeras na mesma faixa do PC indicam que o acesso local pode atravessar os repetidores sem NAT duplo.
