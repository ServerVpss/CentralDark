from pathlib import Path
repo=Path(r'E:\CentralDark\worktrees\tlc23-master-fixed-point-20260915')
engine=repo/'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml'
master=repo/'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml'
triggers=repo/'docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/TRIGGERS.yml'
expanded='[TLC23_OPEN, DESTINATION_LOCK, ACORDAR, CALIBRAR, MULTIBUSSOLA, AUREOLA_BAHIA_BIBLICA, PEGATUDO, PEGATUDO_HISTORY, DEBITO_COGNITIVO, READERS_MEASURE, META_LUPA, SCOPE_TEMPERATURE, DELTA_MINIMUM, DELTA_UTIL, RENDEZVOUS, RECONCILE, STITCH, OWNER, ONE_WRITER, PATCH, TESTE, CONTRAPROVA, REMEDICAO, SEMANTIC_GREEN, REALITY_JUDGE, FIXED_POINT, TLC23_CLOSE, POST_GREEN_LOCK, REGISTRA, HANDOFF, BOOT]'
s=engine.read_text(encoding='utf-8',errors='replace')
old=s[s.index('<<<<<<< HEAD', s.index('master_cycle_binding:')):s.index('>>>>>>> 58f60069c', s.index('master_cycle_binding:'))+len('>>>>>>> 58f60069c (cristal-tlc23-master-heartbeat)')]
new='  core_chain_source: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml#expands_to\n  mandatory_execution_extensions: [AUREOLA_BAHIA_BIBLICA, SEMANTIC_GREEN, POST_GREEN_LOCK]\n  extensions_role: BINDING_EXECUTION_EXTENSIONS_NOT_CORE_AUTHORITY\n  expands_to_role: EFFECTIVE_EXECUTION_CHAIN_DERIVED_FROM_CORE_PLUS_BINDING_EXTENSIONS\n  expands_to: '+expanded
engine.write_text(s.replace(old,new),encoding='utf-8')
print('RESOLVED ENGINE_BINDING')
s=master.read_text(encoding='utf-8',errors='replace')
start=s.index('<<<<<<< HEAD')
end=s.index('>>>>>>> 58f60069c', start)+len('>>>>>>> 58f60069c (cristal-tlc23-master-heartbeat)')
canon='chain_semantics:\n  expands_to_role: CORE_CONTRACT_CHAIN\n  core_chain_owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml\n  mandatory_binding_extensions_owner: docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/ENGINE_BINDING.yml\n  binding_extensions_are_second_core_authority: false\n  effective_chain_is_derived_by_binding: true\n\ncanonical_human_chain: "#CENTRALDARK -> !tlc23 -> DESTINATION_LOCK -> #ACORDAR -> !CALIBRAR -> !MULTIBUSSOLA -> PEGATUDO -> DEBITO_COGNITIVO -> READERS_MEASURE -> !META_LUPA -> RENDEZVOUS -> RECONCILE -> OWNER -> ONE_WRITER -> PATCH -> TESTE -> !CONTRAPROVA -> !REMEDICAO -> REALITY_JUDGE -> !FIXED_POINT -> !tlc23 -> !REGISTRA -> HANDOFF -> !BOOT"\ncanonical_machine_chain: "!CENTRALDARK -> TLC23_OPEN -> DESTINATION_LOCK -> ACORDAR -> CALIBRAR -> MULTIBUSSOLA -> PEGATUDO -> PEGATUDO_HISTORY -> DEBITO_COGNITIVO -> READERS_MEASURE -> META_LUPA -> SCOPE_TEMPERATURE -> DELTA_MINIMUM -> DELTA_UTIL -> RENDEZVOUS -> RECONCILE -> STITCH -> OWNER -> ONE_WRITER -> PATCH -> TESTE -> CONTRAPROVA -> REMEDICAO -> SEMANTIC_GREEN_GATE -> REALITY_JUDGE -> FIXED_POINT -> TLC23_CLOSE -> REGISTRA -> HANDOFF -> BOOT"\ncanonical_chain: "!CENTRALDARK -> TLC23_OPEN -> DESTINATION_LOCK -> ACORDAR -> CALIBRAR -> MULTIBUSSOLA -> PEGATUDO -> PEGATUDO_HISTORY -> DEBITO_COGNITIVO -> READERS_MEASURE -> META_LUPA -> SCOPE_TEMPERATURE -> DELTA_MINIMUM -> DELTA_UTIL -> RENDEZVOUS -> RECONCILE -> STITCH -> OWNER -> ONE_WRITER -> PATCH -> TESTE -> CONTRAPROVA -> REMEDICAO -> SEMANTIC_GREEN_GATE -> REALITY_JUDGE -> FIXED_POINT -> TLC23_CLOSE -> REGISTRA -> HANDOFF -> BOOT"'
master.write_text(s[:start]+canon+s[end:],encoding='utf-8')
print('RESOLVED MASTER-CYCLE')
s=triggers.read_text(encoding='utf-8',errors='replace')
start=s.index('<<<<<<< HEAD')
end=s.index('>>>>>>> 58f60069c', start)+len('>>>>>>> 58f60069c (cristal-tlc23-master-heartbeat)')
new='    expands_to: [TLC23_OPEN, DESTINATION_LOCK, ACORDAR, CALIBRAR, MULTIBUSSOLA, PEGATUDO, PEGATUDO_HISTORY, DEBITO_COGNITIVO, READERS_MEASURE, META_LUPA, SCOPE_TEMPERATURE, DELTA_MINIMUM, DELTA_UTIL, RENDEZVOUS, RECONCILE, STITCH, OWNER, ONE_WRITER, PATCH, TESTE, CONTRAPROVA, REMEDICAO, SEMANTIC_GREEN_GATE, REALITY_JUDGE, FIXED_POINT, TLC23_CLOSE, REGISTRA, HANDOFF, BOOT]\n    expands_to_source: "docs/ARQUITETURA/CENTRALDARK-TRIGGER-FABRIC/MASTER-CYCLE.yml#expands_to"'
triggers.write_text(s[:start]+new+s[end:],encoding='utf-8')
print('RESOLVED TRIGGERS')
