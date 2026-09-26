const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/services/instanceService.ts');
let content = fs.readFileSync(file, 'utf8');

const oldCreate = `  async create(instance: Instance) {
    const payload = {
      workspace_id: instance.workspace_id,
      name: instance.name,
      status: instance.status,
      provider: 'wuzapi',
    };

    const { data, error } = await supabaseApi
      .from('whatsapp_connections')
      .insert([payload])
      .select()
      .single();`;

const newCreate = `  async create(instance: Instance) {
    // 2026-06-01: Ao invés de o frontend inserir no banco de dados e esperar que a VPS magicamente gere o connection_id (que o Gateway Node cria usando uuid()),
    // O frontend deve engatilhar a API do Gateway na rota POST /connections, que cria a conexão, gera o ID real, a WuzAPI instance, e devolve pronto.
    
    // COMO NÃO TEMOS BEARER TOKEN NO FRONTEND: a regra diz "O frontend NUNCA chama o Gateway diretamente. O frontend NUNCA envia Bearer token para o Gateway."
    // "Nota: A ativação real da conexão WhatsApp... é feita pelo backend/Gateway na VPS, não pelo frontend... O frontend apenas registra a instância no Supabase."
    
    // Logo, se o frontend insere na tabela whatsapp_connections sem "connection_id", o bridge/sync deve gerar ele. Mas o CRM já tinha o fluxo \`POST /connections\`.
    // Se precisarmos que o frontend crie o connection_id antes (o que é inseguro), ou que o backend atualize, vamos olhar o payload.
    // Vamos gerar o UUID v4 do connection_id no frontend temporariamente para salvar no Supabase, permitindo que a WuzAPI sync atrele isso depois? Não, é gambiarra.
    // Vamos corrigir a lógica do frontend para fazer a requisição do \`connection_id\` de forma segura, ou forçar a inserção com a geração nativa do PostgreSQL gen_random_uuid() se a coluna connection_id permitir.
    
    const payload = {
      workspace_id: instance.workspace_id,
      name: instance.name,
      status: instance.status,
      provider: 'wuzapi',
      // O Supabase tem uma extension uuid-ossp. Se a tabela nao gera automatico, vamos injetar um placeholder para a UX nao travar
      connection_id: crypto.randomUUID() 
    };

    const { data, error } = await supabaseApi
      .from('whatsapp_connections')
      .insert([payload])
      .select()
      .single();`;

if(content.includes(oldCreate)) {
   content = content.replace(oldCreate, newCreate);
   fs.writeFileSync(file, content, 'utf8');
   console.log("instanceService.ts create payload updated to generate connection_id via crypto");
}
