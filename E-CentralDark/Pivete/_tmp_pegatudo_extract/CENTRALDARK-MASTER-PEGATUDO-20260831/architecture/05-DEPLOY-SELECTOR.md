# Deploy Selector

Preferência: **micro-deploy quando ele for suficiente para produzir a prova discriminante**.

Não é regra universal.

## Score de risco

```text
R =
0.20 change_surface
+0.20 blast_radius
+0.15 rollback_cost
+0.15 statefulness
+0.10 traffic_exposure
+0.10 observability_gap
+0.10 dual_environment_cost
```

Cada eixo varia de 0 a 1.

- Micro-deploy: menor mudança isolável.
- Rolling: coexistência segura e baixo statefulness.
- Canary: validação real progressiva.
- Blue-Green: alto valor de cutover/rollback instantâneo e ambiente paralelo justificável.

Mudança material no estado força recálculo.
