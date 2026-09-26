# SECURITY-BOUNDARIES

Sob zero-trust/ existente:

- LEAST_PRIVILEGE  
- READ_ONLY_DEFAULT para infra  
- IDENTITY_PER_AGENT  
- NO_SECRET_IN_MESSAGES  
- NO_SECRET_IN_EVENTS  
- NO_IMPLICIT_AUTHORITY  
- NO_CHAT_EQUALS_AUTHORIZATION  
- NO_EVENT_EQUALS_COMMAND  
- FAIL_CLOSED  

Buzz auth (NIP-42 / membership) autentica **no plano de comunicação**, não autoriza mutação no plano canônico CentralDark.
