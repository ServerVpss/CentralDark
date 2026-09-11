# 🔌 API Tool Resource Bridge · Onde ainda dói

**OWNER:** `.agents/skills/meta-lupa/SKILL.md`  
**KIT:** `.agents/skills/meta-lupa/KITS/METAGRILL-METALUPA/`  
**TRILHO:** `🔗 !># INTERLIGADOS` + `🔗 META-START-LINK` + metacognição operacional  
**STATUS:** cristalizado como fronteira de integração. Não prova runtime.

## 💡 Ideia simples

O `api_tool` é uma ponte de consulta do ChatGPT. Ele ajuda a ler respostas de ferramenta, GitHub, arquivos e conectores quando estão disponíveis. Mas ele não é, sozinho, o motor da Casa.

A dor real é esta:

```text
um endereço tipo /response/turn430
parece arquivo da Casa
mas é só rastro de uma resposta/ferramenta daquela janela
```

Então a Casa precisa separar:

```text
/response/turnX     = rastro temporário da janela
repo path           = endereço estável dentro do GitHub
blob sha            = foto exata de um arquivo naquele momento
main                = estado vivo que manda agora
runtime             = máquina rodando, só passa se medir
```

## 🩹 Onde dói

```text
DOR_1=/response/turn430 não é caminho canônico da Casa
DOR_2=find_in_resource só procura dentro de resposta de ferramenta já existente
DOR_3=INTERLIGADOS.md existe em várias skills, então busca solta pode achar muita coisa
DOR_4=META-START-LINK precisa guardar direção/cursor estável, não ID temporário de janela
DOR_5=api_tool consultar não significa que runtime executou
DOR_6=arquivo encontrado não significa peça carregada por agente
```

Em palavras simples:

```text
achar não é usar
ler não é agir
consultar não é mexer
arquivo não é máquina rodando
```

## 🔗 Rota certa

Quando o CHEFE pedir algo como:

```text
find_in_resource { uri: "/response/turn430", query: "INTERLIGADOS.md" }
```

A Casa deve responder assim:

```text
1. Se /response/turn430 existir nesta janela, usar find_in_resource só para procurar naquele rastro.
2. Se não existir, marcar UNKNOWN e não inventar.
3. Para achar arquivo real, usar GitHub search/fetch_file no repo ServerVpss/CentralDark.
4. Para guardar no fio da Casa, salvar repo path + ref + sha, não /response/turnX.
5. Ligar o achado ao META-START-LINK: posição, direção, proveniência, delta, confiança e próximo cursor.
```

## 🧭 Ligação com META-START-LINK

```text
POSIÇÃO      = onde o pedido está agora: chat, api_tool, GitHub, VPS ou runtime
DIREÇÃO      = o que o CHEFE quer ligar
PROVENIÊNCIA = de onde veio a prova: repo path, sha, tool response, print, log
DELTA        = o que mudou ou foi descoberto
CONFIANÇA    = provado, dúvida ou não sei ainda
CURSOR       = próxima ação segura
```

## 🔗 Ligação com !># INTERLIGADOS

`🔗 !># INTERLIGADOS` não deve virar outro motor. Ele apenas costura o pedido ao dono certo.

```text
CHEFE pede INTERLIGADOS.md
→ procurar todos os INTERLIGADOS.md
→ escolher o dono certo pelo assunto
→ se for costura geral, usar este kit INTERLIGADOS
→ se for skill específica, usar o INTERLIGADOS.md daquela skill
→ registrar caminho estável
→ não promover /response/turnX como owner
```

## 🧠 Ligação com metacognição

Essa peça corrige o erro do próprio método: confundir rastro temporário de ferramenta com peça oficial da Casa.

```text
ERRO_DE_METODO=confundir /response/turnX com arquivo canônico
CORREÇÃO=usar /response/turnX só como rastro local e repo path como endereço estável
APRENDIZADO=api_tool é ponte, não juiz final
```

## 🔌 Formato de visibilidade quando api_tool aparecer

```text
🔌 API_TOOL_VISIBILIDADE
PEDIDO_DO_CHEFE=
URI_TEMPORARIA=
QUERY=
RECURSO_EXISTE_NESTA_JANELA=
ARQUIVO_REAL_NO_GITHUB=
CAMINHO_ESTAVEL=
SHA_OU_REF=
O_QUE_FOI_SO_CONSULTA=
O_QUE_FOI_MEXIDA_REAL=
UNKNOWN=
PROXIMO_CURSOR=
```

## 🔒 Leis

```text
RESPONSE_RESOURCE_IS_TEMPORARY=true
REPO_PATH_IS_STABLE_ADDRESS=true
API_TOOL_IS_BRIDGE_NOT_RUNTIME=true
FIND_IN_RESOURCE_IS_LOCAL_TO_TOOL_RESPONSE=true
SEARCH_RESULT_IS_NOT_RUNTIME_PROOF=true
FOUND_FILE_IS_NOT_LOADED_SKILL=true
DOCUMENTED != EXECUTED
ACTION != PROOF
UNKNOWN != PASS
REALITY_IS_JUDGE=true
```

## 🧭 Próximo cursor

```text
NEXT_CURSOR=ligar este bridge ao parser/runtime de gatilhos apenas depois de medir owner executável. Testar !centraldark, !>#, find_in_resource, GitHub search/fetch_file e registro no META-START-LINK sem usar /response/turnX como fonte durável.
```
