#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
let ts;
try { ts = await import('typescript'); }
catch { process.stderr.write('TYPESCRIPT_PARSER_UNAVAILABLE'); process.exit(3); }
const file=process.argv[2];
if(!file){process.stderr.write('FILE_REQUIRED');process.exit(2)}
const text=fs.readFileSync(file,'utf8');
const kind=file.endsWith('.tsx')?ts.ScriptKind.TSX:file.endsWith('.jsx')?ts.ScriptKind.JSX:ts.ScriptKind.TS;
const sf=ts.createSourceFile(file,text,ts.ScriptTarget.Latest,true,kind);
const rows=[];
function add(node,name,k){
  if(!name || name.startsWith('_')) return;
  const a=sf.getLineAndCharacterOfPosition(node.getStart(sf)).line+1;
  const b=sf.getLineAndCharacterOfPosition(node.getEnd()).line+1;
  rows.push({name,kind:k,line_start:a,line_end:b});
}
for(const n of sf.statements){
  if(ts.isFunctionDeclaration(n)) add(n,n.name?.text,'function');
  else if(ts.isClassDeclaration(n)) add(n,n.name?.text,'class');
  else if(ts.isInterfaceDeclaration(n)) add(n,n.name.text,'interface');
  else if(ts.isTypeAliasDeclaration(n)) add(n,n.name.text,'type');
  else if(ts.isEnumDeclaration(n)) add(n,n.name.text,'enum');
  else if(ts.isVariableStatement(n)) for(const d of n.declarationList.declarations){
    if(ts.isIdentifier(d.name) && d.initializer && (ts.isArrowFunction(d.initializer)||ts.isFunctionExpression(d.initializer))) add(n,d.name.text,'function');
  }
}
process.stdout.write(JSON.stringify(rows));
