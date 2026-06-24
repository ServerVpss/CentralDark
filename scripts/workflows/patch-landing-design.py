#!/usr/bin/env python3
"""
Aplica melhoria visual no bloco de comando da landing page.
Chamado pelo workflow .github/workflows/patch-install-landing-design.yml
"""
from pathlib import Path

path = Path('CentralDark/apps/install-callback/server.js')
src = path.read_text(encoding='utf-8')

marker = 'centraldark-landing-command-v2'
if marker in src:
    print('Patch visual ja existe. Nada a fazer.')
    raise SystemExit(0)

style = '''<style id="centraldark-landing-command-v2">
.cd-command-v2{box-sizing:border-box!important;position:relative!important;width:min(100%,860px)!important;max-height:none!important;margin:26px auto 18px!important;padding:clamp(18px,3vw,30px) clamp(18px,4vw,38px)!important;overflow:visible!important;border-radius:24px!important;border:1px solid rgba(56,255,142,.72)!important;background:radial-gradient(circle at 18% 0%,rgba(58,255,152,.20),transparent 34%),linear-gradient(135deg,rgba(1,25,14,.96),rgba(3,58,33,.90))!important;box-shadow:0 0 0 1px rgba(58,255,152,.18) inset,0 22px 70px rgba(0,0,0,.42),0 0 34px rgba(58,255,152,.14)!important}
.cd-command-v2::before{content:'COMANDO PARA COLAR NO SSH';position:absolute;left:50%;top:-14px;transform:translateX(-50%);padding:6px 18px;border-radius:999px;border:1px solid rgba(56,255,142,.38);background:linear-gradient(135deg,#19e878,#44ff9b);color:#03150c;font:800 11px/1.1 ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.12em;white-space:nowrap;box-shadow:0 10px 26px rgba(25,232,120,.22)}
.cd-command-v2,.cd-command-v2 pre,.cd-command-v2 code,.cd-command-v2 kbd{scrollbar-width:none!important}.cd-command-v2::-webkit-scrollbar,.cd-command-v2 pre::-webkit-scrollbar,.cd-command-v2 code::-webkit-scrollbar{display:none!important}
.cd-command-v2 pre,.cd-command-v2 code,.cd-command-v2 kbd{display:block!important;max-width:100%!important;margin:0!important;padding:0!important;overflow:visible!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;word-break:break-word!important;text-align:center!important;color:#72ff9f!important;text-shadow:0 0 18px rgba(114,255,159,.26)!important;font:800 clamp(14px,2.1vw,20px)/1.65 ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono',monospace!important}
.cd-command-v2 button,.cd-command-v2 a[role='button'],.cd-command-v2 .copy,.cd-command-v2 .copy-btn,.cd-command-v2 .btn-copy{position:static!important;display:inline-flex!important;justify-content:center!important;align-items:center!important;width:auto!important;max-width:100%!important;margin:16px auto 0!important;transform:none!important}
@media(max-width:620px){.cd-command-v2{width:calc(100% - 20px)!important;margin-top:24px!important;border-radius:18px!important}.cd-command-v2::before{top:-12px;font-size:9px;padding:5px 12px;letter-spacing:.08em}.cd-command-v2 pre,.cd-command-v2 code,.cd-command-v2 kbd{text-align:left!important}}
</style>'''

script = '''<script id="centraldark-landing-command-v2-js">
(()=>{const needles=['bash <(curl','install.centralldark.com'];const candidates=[...document.querySelectorAll('pre,code,kbd,.command,.command-box,.copy-box,.terminal,.terminal-box,.cmd,.cmd-box,div')];const scored=candidates.map((el)=>({el,txt:(el.textContent||'').trim()})).filter(({txt})=>needles.every((n)=>txt.includes(n))&&txt.length<420).sort((a,b)=>a.txt.length-b.txt.length);const target=scored[0]?.el;if(!target)return;const box=target.closest('pre,.command,.command-box,.copy-box,.terminal,.terminal-box,.cmd,.cmd-box')||target;box.classList.add('cd-command-v2');})();
</script>'''

if '</head>' in src:
    src = src.replace('</head>', style + '\n</head>')
elif '</style>' in src:
    src = src.replace('</style>', style + '\n</style>')
else:
    raise SystemExit('Nao achei ponto de injecao CSS')

if '</body>' in src:
    src = src.replace('</body>', script + '\n</body>')
else:
    print('Aviso: nao achei </body>; sem JS')

path.write_text(src, encoding='utf-8')
print('Patch visual aplicado')
