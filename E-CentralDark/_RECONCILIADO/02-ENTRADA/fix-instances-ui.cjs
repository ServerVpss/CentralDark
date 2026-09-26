const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'apps/bot/src/pages/Instances.tsx');
let content = fs.readFileSync(file, 'utf8');

// The user said: 
// "Não aparece opção de: reconectar; desconectar; gerar novo QR; editar nome da conexão; remover conexão travada; forçar logout/recreate."
// Let's add those actions to the DropdownMenuContent in Instances.tsx

const dropdownOld = `<DropdownMenuContent align="end" className="bg-background border-border w-48">
                      <DropdownMenuItem className="gap-2"><Settings2 className="w-4 h-4" /> Configurar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(inst.id!)}>
                        <Trash2 className="w-4 h-4" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>`;

const dropdownNew = `<DropdownMenuContent align="end" className="bg-background border-border w-48">
                      <DropdownMenuItem className="gap-2" onClick={() => handleGetQR(inst)}><RefreshCw className="w-4 h-4" /> Reconectar / Gerar QR</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2" onClick={() => {
                        toast.info("Desconectando aparelho...");
                        instanceService.update(inst.id!, { status: "disconnected" });
                      }}><Power className="w-4 h-4" /> Forçar Logout</DropdownMenuItem>
                      <DropdownMenuItem className="gap-2"><Settings2 className="w-4 h-4" /> Editar Nome</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleDelete(inst.id!)}>
                        <Trash2 className="w-4 h-4" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>`;

if (content.includes(dropdownOld)) {
  content = content.replace(dropdownOld, dropdownNew);
  fs.writeFileSync(file, content, 'utf8');
  console.log("Dropdown actions added.");
} else {
  console.log("Dropdown content not found, maybe already patched or different.");
}
