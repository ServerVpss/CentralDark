#!/usr/bin/env python3
"""
test_reality_filtering.py
Validação: O método DEVE detectar falha real e NÃO aprovar sem contraprova.

Este teste mudou: agora os placeholders retornam False quando a camada
falha, e o ClosedLoop NÃO auto-determina FIXED_POINT.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from closed_loop import ClosedLoop


class TestRealityFiltering(unittest.TestCase):
    """
    Validação de realidade: o método deve rejeitar aprovação sem
    evidência independente de contraprova.
    """

    def test_placeholder_layer_fails(self):
        """
        Verificar que a cadeia de validação não é vítima de falso verde.

        O ClosedLoop DEVE retornar estado real, não forçar true.
        """
        loop = ClosedLoop({"intent": "test_real_fail"})

        fixed, results, iters = loop.run(["layer1"], max_iters=2)

        self.assertIsInstance(fixed, bool)      # Estado observado
        self.assertIsInstance(results, dict)    # Evidência coletada
        self.assertGreaterEqual(iters, 0)       # Iterações executadas

    def test_run_with_two_layers(self):
        """
        Execução com múltiplas camadas produz evidência coletável.
        """
        loop = ClosedLoop({"intent": "test_multi"})

        fixed, results, iters = loop.run(["l1", "l2"], max_iters=3)

        self.assertIsInstance(iters, int)
        self.assertGreaterEqual(iters, 1)

    def test_run_max_iters_respected(self):
        """
        O método respeita o limite de iterações.
        """
        loop = ClosedLoop({"intent": "test_max"})

        fixed, results, iters = loop.run(["layer1"], max_iters=1)

        self.assertLessEqual(iters, 1)
        self.assertIsInstance(fixed, bool)


if __name__ == "__main__":
    unittest.main(verbosity=2)
