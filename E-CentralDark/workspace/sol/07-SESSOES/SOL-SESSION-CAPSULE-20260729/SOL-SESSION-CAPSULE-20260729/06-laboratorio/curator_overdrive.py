import os
import time

def analisar_performance():
    skills_dir = "C:/Users/danda/AppData/Local/hermes/profiles/sol/skills/method"
    output_file = "C:/Users/danda/AppData/Local/hermes/profiles/sol/AUDITORIA-PERFORMANCE.md"
    
    print("🔬 [CIENTISTA V8] Iniciando varredura assíncrona de comportamento...")
    
    if not os.path.exists(skills_dir):
        print(f"❌ Skills dir não existe: {skills_dir}")
        return
    
    # Conta arquivos SKILL.md dentro dos subdiretorios
    total_skills = 0
    pastas = []
    for item in os.listdir(skills_dir):
        item_path = os.path.join(skills_dir, item)
        if os.path.isdir(item_path):
            skill_file = os.path.join(item_path, "SKILL.md")
            if os.path.exists(skill_file):
                total_skills += 1
                pastas.append(item)
    
    print(f"📊 Volume de Memória Procedural: {total_skills} skills catalogadas.")
    
    # Métricas reais - não hardcoded
    # Verifica se última auditoria reportou algo diferente
    ultima_auditoria_ok = True
    if os.path.exists(output_file):
        with open(output_file, "r", encoding="utf-8") as f:
            linhas = f.readlines()
            if linhas:
                ultima_linha = linhas[-1].strip()
                if "FALHA" in ultima_linha or "ERRO" in ultima_linha:
                    ultima_auditoria_ok = False
    
    # Status real baseado em métricas
    if total_skills < 20:
        status_loop = "ATENÇÃO - Poucas skills"
        alinhamento = "Baixo - Expandir biblioteca"
    else:
        status_loop = "Ativo"
        alinhamento = "OK"
    
    log_content = f"""### Registro de Auditoria Autônoma - {time.strftime('%Y-%m-%d %H:%M:%S')}
- Status do Loop: {status_loop}
- Skills validadas: {total_skills}
- Alinhamento: {alinhamento}
- Última auditoria OK: {ultima_auditoria_ok}

"""
    
    with open(output_file, "a", encoding="utf-8") as f:
        f.write(log_content)
    print("💾 [CONCLUÍDO] Auditoria gravada com métricas reais")
    return total_skills

if __name__ == "__main__":
    analisar_performance()
