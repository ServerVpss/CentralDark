ONBOARDING PYTHON - PACOTE LOCAL CORRIGIDO

O erro com XMLHttpRequest/localhost acontece quando o script é executado
em um console online/sandbox do navegador. Nesse ambiente, localhost não
é o seu PC e 127.0.0.1 pode ser bloqueado.

NO WINDOWS:
1. Extraia o ZIP.
2. Dê duplo clique em RUN_LOCAL.bat.

OU:
py -m pip install -r requirements.txt
py run_all.py

run_all.py sobe a API local, executa o teste e encerra o servidor.
Este pacote usa somente dados fictícios e endpoints locais.
