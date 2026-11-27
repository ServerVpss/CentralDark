# ChatGPT Classic: interface nativa via Windows UI Automation

Owner: .agents/skills/centraldark-operational-method/SKILL.md.
Status: receita de operacao sob demanda, nao e servico de observacao continua.
Origem: Casa SEGREDO, 2026-10-30. ChatGPT Classic foi aberto e manipulado; Plugins > Pessoal > CentralDark Unified Surface foi visitado, menu de acoes revelou Editar plugin, Baixar ZIP do plugin e Excluir plugin. Download foi solicitado, mas salvamento de ZIP e atualizacao de plugin nao foram comprovados.

## Gatilho automatico pela intencao
Quando CHEFE pedir para entrar, abrir, clicar, navegar, preencher, exportar, baixar ou verificar algo no ChatGPT Classic/Desktop, usar esta receita no aplicativo que ja existe. Nao confundir com OpenAI.Codex (binario ChatGPT.exe), Edge em chatgpt.com, nem com Chromium. Nao criar segundo executor, instancia, plugin ou tarefa agendada.

## Identidade da instalacao observada
- Casa SEGREDO, Windows; AppID: OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0!ChatGPT; janela ChatGPT Classic; binario ChatGPT Classic.exe.
- O atalho ChatGPT.lnk da Casa apontava para Codex antigo. Nao confiar no nome do atalho.
- Detectar: Get-StartApps | Where-Object Name -match 'ChatGPT|Codex'; Get-AppxPackage OpenAI.ChatGPT-Desktop
- Abrir aplicativo existente: Start-Process explorer.exe -ArgumentList 'shell:AppsFolder\OpenAI.ChatGPT-Desktop_2p2nqsd0c76g0!ChatGPT'
- Comprovar janela: AutomationElement.RootElement.FindAll(TreeScope.Children, Condition.TrueCondition); filtrar Current.Name = ChatGPT Classic, verificar ProcessId, IsOffscreen e BoundingRectangle. Sem correspondencia, UNKNOWN.

## Formula de manipulacao exercitada
1. No PowerShell autorizado da Casa: Add-Type -AssemblyName UIAutomationClient; Add-Type -AssemblyName UIAutomationTypes
2. Descobrir janela por RootElement.FindAll(TreeScope.Children, Condition.TrueCondition). Filtrar Current.Name igual a ChatGPT Classic. Renovar AutomationElement apos navegacao/re-render.
3. Inspecionar FindAll(TreeScope.Descendants, Condition.TrueCondition), Current.ControlType.ProgrammaticName, Current.Name, Current.IsEnabled, Current.IsOffscreen e BoundingRectangle. Identificar controles REAIS, jamais inventar IDs/labels.
4. Hyperlink Plugins: InvokePattern.Invoke(); aguardar render e validar nova pagina. TabItem Pessoal: SelectionItemPattern.Select(); conferir Criados por mim.
5. Hyperlink Abrir CentralDark Unified Surface: InvokePattern.Invoke(); conferir pagina. Button Acoes do plugin: ExpandCollapsePattern.Expand() (InvokePattern nao foi suportado na observacao).
6. MenuItem Editar plugin ou Baixar ZIP do plugin: validar intencao e InvokePattern.Invoke() uma vez. Excluir plugin e destrutivo, nao disparar sem ordem explicita e contextual.
7. Downloads podem abrir janela Save As; nome sugerido no episodio: centraldark-unified-surface-parity. Solicitar download NAO prova ZIP salvo. Conferir dialogo, caminho de destino, integridade ZIP, conteudo e checksum, preservar nome e dados preexistentes.
8. Edit: ValuePattern.SetValue e readback de ValuePattern.Current.Value. Button: InvokePattern se suportado. ComboBox: ExpandCollapsePattern e SelectionItemPattern. CheckBox: TogglePattern apenas se Current.ToggleState difere do desejado.
9. Se InvokePattern nao suportado: usar ExpandCollapsePattern ou SelectionItemPattern conforme tipo. Apenas se necessario, foco/teclas ou clique fisico por BoundingRectangle previamente confirmado; nunca codificar coordenadas fixas. Renomear ou alterar foco so quando preciso.
10. Ler UI novamente e comprovar efeito externo (arquivo, estado plugin, processo, rede). CLICKED != SUBMITTED != ACK != EFFECT_PROVED. Em erro ou timeout, nao repetir clique, upload ou envio cegamente.

## Plugin e continuidade
- CentralDark v1.0.0 na nuvem: pagina exibia 1 aplicativo, sem descricao tecnica de ferramentas.
- CentralDark Unified Surface v0.1.4: 1 MCP, 1 habilidade, Read/Write; preferir evoluir esta identidade quando pedido, sem criar plugin paralelo.
- No Classic, menu do Unified Surface ofereceu Editar plugin, Baixar ZIP do plugin, Excluir plugin. Edge pode expor outro conjunto de controles: selecionar superficie pedida e observar em tempo real.
- Para atualizar: baixar pacote verificavel, ler manifest e skill originais, mudar menor delta e atualizar o mesmo plugin; nunca sobrescrever arquivo local nem substituir identidade existente sem prova.

## Segurança, contrato de prova
- Operar somente na sessao Windows autorizada, respeitar permissoes dos conectores. Nao ler/expor tokens, segredos, cookies ou credenciais.
- Preservar drafts, dialogos ativos, arquivos originais, conversas, processos e mudancas locais.
- Leitura e navegacao observacional conforme pedido; envio, instalacao, exclusao, publicacao e alteracao de conta requerem autorizacao contextual especifica.
- Formato de retorno: APP | WINDOW | INTENT | CONTROL | ACTION | READBACK | EFFECT | RECEIPT | NEXT_CURSOR.
- Sem readback independente: UNKNOWN, nao PASS. Registro Git nao concede acesso continuo ou inicia daemon.
