const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Chats.tsx');
let content = fs.readFileSync(file, 'utf-8');

// 1. Adicionar o import do Hook
if (!content.includes('useRealtimeMessages')) {
    content = content.replace(
        'import { messageService, Message } from "@/services/messageService";',
        'import { messageService, Message } from "@/services/messageService";\nimport { useRealtimeMessages } from "@/hooks/useRealtimeMessages";'
    );
}

// 2. Extrair o useEffect "Realtime: mensagens do contato selecionado"
// A Regex vai procurar o bloco useEffect e removê-lo. Usaremos indexOf para precisão cirúrgica
const startComment = '// Realtime: mensagens do contato selecionado';
const startIdx = content.indexOf(startComment);

if (startIdx !== -1) {
    // Find the next two }]), to clear the whole effect block
    let tail = content.substring(startIdx);
    const endEffect = tail.indexOf('}, [selectedContact?.id]);');
    if (endEffect !== -1) {
       const blockToRemove = tail.substring(0, endEffect + '}, [selectedContact?.id]);'.length);
       content = content.replace(blockToRemove, '');
    }
}

// 3. Inject our Realtime Hook right before the return statement
if (!content.includes('useRealtimeMessages(')) {
    const hookInject = `
  // Injeta subscription com filtro client-side UX (Backlog de RLS pendente!)
  useRealtimeMessages({
    workspaceId: workspace?.id,
    contactId: selectedContact?.id,
    enabled: !!workspace?.id && !!selectedContact?.id,
    onMessageReceived: (newMsg) => {
      setMessages(prev => {
        // Evita duplicata se o load inicial já trouxe a mensagem
        if (prev.some(m => (m.id === newMsg.id) || (m as any).external_message_id && (m as any).external_message_id === (newMsg as any).external_message_id)) {
           return prev;
        }
        
        const updated = [...prev, newMsg];
        // Ordena garantindo cronologia
        return updated.sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      });
    },
    onMessageUpdated: (updatedMsg) => {
      setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    }
  });
  
  // Recarrega mensagens sempre que o contato troca
  useEffect(() => {
    if (!selectedContact?.id) return;
    loadMessages(selectedContact.id);
  }, [selectedContact?.id]);
  `;
    
  // Find the exact place before return (
  content = content.replace('return (', hookInject + '\n  return (');
}

fs.writeFileSync(file, content, 'utf-8');
