const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let content = fs.readFileSync(file, 'utf8');

// The original UI used to have a choice panel in the modal. Let's inspect the `showAddModal` part in the current file.
// In the current Instances.tsx, we have a simple modal. I will update the modal to restore the selection UI.

// Instead of rewriting the entire file with complex logic blindly, let's just make the modal a ProviderSelector-style
// We will replace the content of DialogContent for the add modal.
const modalRegex = /<Dialog open=\{showAddModal\} onOpenChange=\{setShowAddModal\}>([\s\S]*?)<\/Dialog>/;

const newModal = `<Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[600px] border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="font-display">Nova Conexão WhatsApp</DialogTitle>
            <DialogDescription>
              Escolha o provedor de conexão para o seu número.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* WuzAPI / QR Code Provider */}
            <div className="border border-primary/20 bg-primary/5 rounded-xl p-4 flex flex-col items-start hover:border-primary/50 transition-colors cursor-pointer" onClick={() => {
               // Keeps original logic for creating a WuzAPI connection
               document.getElementById("input-nome-conexao")?.focus();
            }}>
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <QrCode className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-sm mb-1">QR Code Próprio</h3>
              <p className="text-xs text-muted-foreground mb-4">Conecte escaneando um QR Code via nosso servidor seguro WuzAPI.</p>
              
              <div className="w-full mt-auto space-y-3" onClick={(e) => e.stopPropagation()}>
                <Input 
                  id="input-nome-conexao"
                  placeholder="Ex: Suporte Principal" 
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="bg-background/50 h-9"
                />
                <Button onClick={handleAdd} className="w-full h-9 text-xs" disabled={!newName.trim()}>
                  Criar Conexão WuzAPI
                </Button>
              </div>
            </div>

            {/* Meta Cloud API Provider (Disabled/Coming Soon or Redirect) */}
            <div className="border border-border/50 bg-background/50 rounded-xl p-4 flex flex-col items-start opacity-70 hover:opacity-100 transition-opacity">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <Cloud className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="font-bold text-sm mb-1">WhatsApp Cloud API</h3>
              <p className="text-xs text-muted-foreground mb-4">Integração oficial via Meta para empresas verificadas.</p>
              
              <div className="w-full mt-auto">
                <Button variant="outline" className="w-full h-9 text-xs border-blue-500/30 text-blue-400" onClick={(e) => {
                   e.stopPropagation();
                   toast.info("A configuração manual da Cloud API Meta deve ser feita via Painel CRM.");
                }}>
                  Configurar no CRM
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>`;

content = content.replace(modalRegex, newModal);
fs.writeFileSync(file, content, 'utf8');
console.log("Instances modal updated");
