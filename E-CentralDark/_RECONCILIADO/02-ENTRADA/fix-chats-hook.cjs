const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Chats.tsx');
let content = fs.readFileSync(file, 'utf-8');

// The previous script accidentally injected useRealtimeMessages *inside* the useEffect for contacts-realtime
// because it replaced `return () => { supabase.removeChannel(contactsChannel); };` wrongly or matched the wrong return (.replace('return (')).
// In fact, the React Error #321 happens because `useRealtimeMessages` is currently inside `useEffect` or inside a weird block because of the previous regex replacing the first `return (` which was probably inside a block.

// 1. We'll reconstruct the component cleanly. We find where `useRealtimeMessages` starts and ends, remove it, and place it at the TOP.

const hookBlockStart = '  // Injeta subscription com filtro client-side UX (Backlog de RLS pendente!)';
const hookBlockEnd = '}, [selectedContact?.id]);\n  '; // Previous script injected a useEffect below it

let hookIndex = content.indexOf(hookBlockStart);
if(hookIndex !== -1) {
    let beforeHook = content.substring(0, hookIndex);
    let afterHook = content.substring(hookIndex);
    
    let effectEndIndex = afterHook.indexOf('}, [selectedContact?.id]);');
    if (effectEndIndex !== -1) {
        let blockToRemove = afterHook.substring(0, effectEndIndex + '}, [selectedContact?.id]);'.length + 1);
        content = beforeHook + afterHook.substring(effectEndIndex + '}, [selectedContact?.id]);'.length + 1);
    }
}

// 2. Now let's inject it at the top of the component (right after useState declarations)
const topLevelInjection = `
  useRealtimeMessages({
    workspaceId: workspace?.id,
    contactId: selectedContact?.id,
    enabled: !!workspace?.id && !!selectedContact?.id,
    onMessageReceived: (newMsg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id || ((m as any).external_message_id && (m as any).external_message_id === (newMsg as any).external_message_id))) {
           return prev;
        }
        return [...prev, newMsg].sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
      });
    },
    onMessageUpdated: (updatedMsg) => {
      setMessages(prev => prev.map(m => m.id === updatedMsg.id ? updatedMsg : m));
    }
  });

  useEffect(() => {
    if (!selectedContact?.id) return;
    loadMessages(selectedContact.id);
  }, [selectedContact?.id]);
`;

// Find a safe place to inject at the top level. The last useState is usually `showContactInfo`
const injectionPoint = 'const [showContactInfo, setShowContactInfo] = useState(false);';
if (content.includes(injectionPoint)) {
    content = content.replace(injectionPoint, injectionPoint + '\n\n' + topLevelInjection);
}

// Ensure the contacts-realtime useEffect has its proper cleanup restored if it was mangled
const contactsSubEnd = '.subscribe();';
if (content.includes(contactsSubEnd) && !content.includes('return () => { supabase.removeChannel(contactsChannel); };')) {
    content = content.replace('.subscribe();\n\n    ', '.subscribe();\n\n    return () => { supabase.removeChannel(contactsChannel); };\n  }, [workspace?.id]);\n\n');
}

fs.writeFileSync(file, content, 'utf-8');
