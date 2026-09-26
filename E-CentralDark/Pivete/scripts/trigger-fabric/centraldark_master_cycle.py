import numpy as np
import json
import os
import hashlib
from pathlib import Path

class CentralDarkCompressor:
    def __init__(self, threshold=0.65):
        self.threshold = threshold
        # Vetor base canônico calibrado para "Informação de Fato"
        self.v_target = np.array([0.95, 0.90, 0.05])
        # Normaliza o vetor alvo para garantir que seja unitário
        self.v_target = self.v_target / np.linalg.norm(self.v_target)
    
    def calculate_similarity(self, v_x):
        # Garantir que v_x seja um array numpy e normalizado
        v_x = np.array(v_x, dtype=float)
        norm_x = np.linalg.norm(v_x)
        if norm_x == 0:
            return 0.0
        v_x_normalized = v_x / norm_x
        # Produto escalar entre vetores normalizados = cosseno do ângulo
        dot_product = np.dot(v_x_normalized, self.v_target)
        # Garantir que esteja no intervalo [-1, 1] devido a possíveis erros de ponto flutuante
        return max(-1.0, min(1.0, dot_product))
    
    def compress(self, v_x):
        """
        Aplica a compressão semântica: se a similaridade com o vetor alvo for >= limiar,
        retorna o vetor alvo (mesmo valor essencial). Senão, retorna o vetor original.
        """
        similarity = self.calculate_similarity(v_x)
        if similarity >= self.threshold:
            return self.v_target.copy()
        else:
            return np.array(v_x, dtype=float)

def test_compressor():
    """Teste automático do compressor"""
    compressor = CentralDarkCompressor(threshold=0.65)
    
    # Vetores de teste que devem ser comprimidos (similaridade alta)
    # These are close to v_target
    test_vectors_should_compress = [
        [0.94, 0.89, 0.06],  # Muito próximo do alvo
        [0.96, 0.91, 0.04],  # Também próximo
        [0.95, 0.90, 0.05],  # Idêntico ao alvo (antes de normalização)
    ]
    
    # Vetores de teste que NÃO devem ser comprimidos (similaridade baixa)
    # These are orthogonal or sufficiently distant
    test_vectors_should_not_compress = [
        [0.5, 0.0, 0.5],     # Similaridade esperada < 0.65
        [0.0, 0.0, 1.0],     # Apenas na terceira dimensão
        [0.1, 0.1, 0.8],     # Pontos baixos nas primeiras duas dim
    ]
    
    print("Testando compressão semântica...")
    print(f"Limiar: {compressor.threshold}")
    print(f"Vetor alvo (normalizado): {compressor.v_target}")
    print()
    
    all_passed = True
    
    for i, vec in enumerate(test_vectors_should_compress):
        result = compressor.compress(vec)
        similarity = compressor.calculate_similarity(vec)
        is_compressed = np.allclose(result, compressor.v_target)
        print(f"Teste de compressão {i+1}:")
        print(f"  Entrada: {vec}")
        print(f"  Similaridade: {similarity:.4f}")
        print(f"  Resultado: {result}")
        print(f"  Foi comprimido? {is_compressed} (esperado: True)")
        if not is_compressed:
            all_passed = False
        print()
    
    for i, vec in enumerate(test_vectors_should_not_compress):
        result = compressor.compress(vec)
        similarity = compressor.calculate_similarity(vec)
        is_compressed = np.allclose(result, compressor.v_target)
        print(f"Teste de não-compressão {i+1}:")
        print(f"  Entrada: {vec}")
        print(f"  Similaridade: {similarity:.4f}")
        print(f"  Resultado: {result}")
        print(f"  Foi comprimido? {is_compressed} (esperado: False)")
        if is_compressed:
            all_passed = False
        print()
    
    if all_passed:
        print("✅ TODOS OS TESTES PASSARAM")
        return True
    else:
        print("❌ ALGUNS TESTES FALHARAM")
        return False

def main():
    """Função principal para execução via linha de comando"""
    import argparse
    parser = argparse.ArgumentParser(description='CentralDark Semantic Compressor')
    parser.add_argument('--self-test', action='store_true', help='Executa teste automático')
    parser.add_argument('--text', type=str, help='Texto para processar (não implementado neste simulador)')
    parser.add_argument('--chefe-source', action='store_true', help='Indica fonte do Chefe (não implementado neste simulador)')
    parser.add_argument('--telemetry', action='store_true', help='Ativa telemetria (não implementado neste simulador)')
    
    args = parser.parse_args()
    
    if args.self_test:
        success = test_compressor()
        return 0 if success else 1
    else:
        print("Modo interativo não implementado neste simulador. Use --self-test para testar.")
        return 0

if __name__ == "__main__":
    exit(main())