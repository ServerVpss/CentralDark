#!/bin/bash
# Gera um token aleatório para uso na Contingência
TOKEN=$(openssl rand -base64 32)
echo "--------------------------------------------------"
echo "TOKEN DE CONTINGÊNCIA GERADO:"
echo "$TOKEN"
echo "--------------------------------------------------"
echo "INSTRUÇÕES:"
echo "1. Adicione este token no Supabase: CONTINGENCY_INTERNAL_TOKEN=$TOKEN"
echo "2. Adicione a chave real que você quer proteger: CONTINGENCY_TARGET_SECRET=<SUA_CHAVE_AQUI>"
echo "3. Use a Edge Function 'contingency-proxy' passando o header 'x-contingency-token'"
echo "--------------------------------------------------"
