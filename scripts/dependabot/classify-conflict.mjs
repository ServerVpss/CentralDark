#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';


// Git conflict vocabulary is a diagnostic lexicon, not permission to merge.
// Recognize broad variants; only content with three index stages may reach the
// EXISTING source-backed path registry for an action.
const GIT_SIGNATURES = Object.freeze({
  'content':'CONTENT','add/add':'ADD_ADD','modify/delete':'MODIFY_DELETE',
  'delete/modify':'MODIFY_DELETE','rename/delete':'RENAME_DELETE',
  'rename/rename':'RENAME_RENAME','rename/rename(1to2)':'RENAME_RENAME',
  'rename/rename(2to1)':'RENAME_RENAME','rename involved in collision':'RENAME_COLLISION',
  'rename/add':'RENAME_COLLISION','rename/modify':'RENAME_MODIFY',
  'directory rename suggested':'DIRECTORY_RENAME',
  'directory rename collision':'DIRECTORY_RENAME',
  'directory rename unclear split':'DIRECTORY_RENAME',
  'file in way of directory rename':'DIRECTORY_RENAME',
  'directory rename file in way':'DIRECTORY_RENAME',
  'file/directory':'FILE_DIRECTORY','directory/file':'FILE_DIRECTORY',
  'file location':'FILE_DIRECTORY','distinct types':'TYPE_CHANGE',
  'typechange':'TYPE_CHANGE','type change':'TYPE_CHANGE',
  'mode':'MODE','binary':'BINARY','binary file':'BINARY',
  'submodule':'SUBMODULE','submodule lacks merge base':'SUBMODULE',
  'submodule history not available':'SUBMODULE',
  'submodule multiple merge bases':'SUBMODULE',
  'submodule not fast forward':'SUBMODULE',
  'submodule may have rewinds':'SUBMODULE',
  'submodule has conflict':'SUBMODULE',
  'submodule merge conflict':'SUBMODULE',
  'add/delete':'DELETE_ADD','delete/add':'DELETE_ADD',
  'rename/rename collision':'RENAME_RENAME',
  'rename/delete conflict':'RENAME_DELETE',
  'modify/modify':'CONTENT',
  'both modified':'CONTENT',
  'both added':'ADD_ADD',
  'both deleted':'DELETE_DELETE',
  'update/delete':'MODIFY_DELETE',
  'create/create':'ADD_ADD',
  'rename/rename(2to2)':'RENAME_RENAME'
});
const HIGH_RISK = new Set([
  'MODIFY_DELETE','RENAME_DELETE','RENAME_RENAME','RENAME_COLLISION',
  'RENAME_MODIFY','DIRECTORY_RENAME','FILE_DIRECTORY','TYPE_CHANGE',
  'MODE','BINARY','SUBMODULE','DELETE_ADD','DELETE_DELETE','UNKNOWN',
  'ADD_ADD'
]);
const FILE_FAMILIES = Object.freeze([
  ['DEPENDENCY_LOCK',/(^|\/)(?:package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|Cargo\.lock|poetry\.lock|Pipfile\.lock|composer\.lock|Gemfile\.lock|go\.sum|uv\.lock)$/i],
  ['DEPENDENCY_MANIFEST',/(^|\/)(?:package\.json|Cargo\.toml|pyproject\.toml|Pipfile|composer\.json|Gemfile|go\.mod|requirements(?:-[^/]+)?\.txt|gradle\.properties)$/i],
  ['CI_WORKFLOW',/(^|\/)(?:\.github\/workflows\/|\.gitlab-ci\.yml|Jenkinsfile|\.circleci\/|azure-pipelines)/i],
  ['SECRETS_ENV',/(^|\/)(?:\.env(?:\.[^/]*)?|secrets?(?:[._-][^/]*)?|\.(?:npmrc|netrc))$/i],
  ['SECURITY_POLICY',/(^|\/)(?:SECURITY\.md|CODEOWNERS|dependabot\.ya?ml|\.github\/codeql\/|policy(?:[._-][^/]*)?\.(?:json|ya?ml))$/i],
  ['DATABASE_MIGRATION',/(^|\/)(?:migrations?|prisma\/migrations|alembic\/versions)\/|\.sql$/i],
  ['INFRA_TERRAFORM',/\.(?:tf|tfvars|hcl)$|(^|\/)\.terraform\//i],
  ['INFRA_KUBERNETES',/(^|\/)(?:k8s|kubernetes|helm|charts)\/|(?:deployment|service|ingress|configmap)\.ya?ml$/i],
  ['CONTAINER',/(^|\/)(?:Dockerfile(?:\..+)?|docker-compose(?:\.[^/]+)?\.ya?ml|Containerfile)$/i],
  ['BINARY_ASSET',/\.(?:png|jpe?g|gif|webp|ico|pdf|zip|7z|gz|tar|mp4|mov|exe|dll|so|dylib|woff2?|ttf|bin|db)$/i],
  ['GIT_SUBMODULE',/(^|\/)\.gitmodules$|(^|\/)modules\//i],
  ['TEST_FIXTURE',/(^|\/)(?:test|tests|__tests__|fixtures|specs)\/|(?:\.test|\.spec)\.[^/]+$/i],
  ['SOURCE_TYPESCRIPT',/\.(?:ts|tsx|mts|cts)$/i],
  ['SOURCE_JAVASCRIPT',/\.(?:js|jsx|mjs|cjs)$/i],
  ['SOURCE_PYTHON',/\.py$/i],
  ['SOURCE_SHELL',/\.(?:sh|bash|zsh|ps1|cmd|bat)$/i],
  ['SOURCE_COMPILED',/\.(?:rs|go|java|kt|cs|cpp|c|h|hpp)$/i],
  ['CONFIG_JSON',/\.(?:json|jsonc|json5)$/i],
  ['CONFIG_YAML',/\.(?:yaml|yml)$/i],
  ['CONFIG_TOML',/\.toml$/i],
  ['CONFIG_XML',/\.(?:xml|svg|plist)$/i],
  ['DOCUMENTATION',/\.(?:md|mdx|rst|txt|adoc)$/i],
  ['GENERATED_OUTPUT',/(^|\/)(?:dist|build|coverage|generated|\.next|vendor)\/|(?:\.min\.js|\.map)$/i],
  ['NOTEBOOK',/\.ipynb$/i],
  ['GIT_METADATA',/(^|\/)(?:\.gitattributes|\.gitignore|\.editorconfig)$/i],
  ['ROOT_ENTRYPOINT',/(^|\/)(?:README|RULES|AGENTS|LEIA-ME-IA)\.md$/i]
]);
function familyForPath(value) {
  const p=String(value||'').replaceAll('\\','/');
  return FILE_FAMILIES.find(([,expr])=>expr.test(p))?.[0] || 'UNCLASSIFIED';
}
function classifyGitSignature(raw) {
  const label=String(raw||'').trim().toLowerCase().replace(/\s+/g,' ');
  return GIT_SIGNATURES[label] || 'UNKNOWN';
}
function parseUnmergedIndex(raw) {
  const byPath=new Map();
  for(const record of String(raw||'').split('\0')) {
    if(!record)continue;
    const match=/^\d{6} [0-9a-f]{40,64} ([123])\t(.+)$/s.exec(record);
    if(!match)throw new Error('UNMERGED_INDEX_INVALID');
    const value=byPath.get(match[2]) || {path:match[2],stages:new Set()};
    value.stages.add(Number(match[1]));
    byPath.set(match[2],value);
  }
  return [...byPath.values()].map(x=>{
    const stages=[...x.stages].sort(),key=stages.join(',');
    const shape=key==='1,2,3'?'THREE_WAY':key==='2,3'?'ADD_ADD':
      key==='1,2'||key==='1,3'?'MODIFY_DELETE':'UNEXPECTED';
    return {path:x.path,stages,index_shape:shape,path_family:familyForPath(x.path)};
  }).sort((a,b)=>a.path.localeCompare(b.path));
}
function diagnoseMerge(text,index) {
  if(Buffer.byteLength(text,'utf8')>1024*1024)throw new Error('MERGE_OUTPUT_TOO_LARGE');
  const signatures=[];
  for(const line of String(text).split(/\r?\n/)) {
    const m=/^\s*CONFLICT\s*\((.*)\)\s*:?\s*(.*)$/i.exec(line);
    if(!m)continue;
    const label=m[1].trim(),family=classifyGitSignature(label);
    signatures.push({label,family,high_risk:HIGH_RISK.has(family)});
    if(signatures.length>5000)throw new Error('TOO_MANY_CONFLICT_SIGNATURES');
  }
  const paths=parseUnmergedIndex(index);
  const elevated=signatures.some(x=>x.high_risk) ||
    paths.some(x=>x.index_shape!=='THREE_WAY');
  const unclassified=signatures.some(x=>x.family==='UNKNOWN');
  return {
    schema:'centraldark.conflict.diagnosis.v1',
    signature_count:signatures.length,unmerged_path_count:paths.length,
    recognized_signature_count:signatures.filter(x=>x.family!=='UNKNOWN').length,
    signatures,paths,
    risk_status:elevated||unclassified?'REQUIRES_REVIEW':
      paths.length && signatures.length?'CONTENT_ONLY_CANDIDATE':'INSUFFICIENT_EVIDENCE',
    auto_resolve_allowed:Boolean(paths.length && signatures.length && !elevated && !unclassified),
    classification_is_resolution:false
  };
}
if(process.argv[2]==='--diagnose') {
  try {
    const text=fs.readFileSync(0,'utf8');
    let index;
    try {
      index=execFileSync('git',['ls-files','-u','-z'],{
        encoding:'utf8',timeout:15000,maxBuffer:8*1024*1024
      });
    } catch {throw new Error('GIT_INDEX_UNAVAILABLE');}
    console.log(JSON.stringify(diagnoseMerge(text,index)));
  } catch(error) {
    console.log(JSON.stringify({schema:'centraldark.conflict.diagnosis.v1',
      risk_status:'REQUIRES_REVIEW',auto_resolve_allowed:false,
      classification_is_resolution:false,error:String(error.message)}));
    process.exitCode=3;
  }
  process.exit(process.exitCode||0);
}

const file = process.argv[2];
if (!file) {
  console.error('USAGE: classify-conflict.mjs <repo-relative-path>');
  process.exit(2);
}

const registryPath = process.env.CONFLICT_REGISTRY || 'scripts/dependabot/known-conflict-patterns.json';

function globToRegExp(glob) {
  let out = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i += 1;
        if (glob[i + 1] === '/') {
          i += 1;
          out += '(?:.*/)?';
        } else {
          out += '.*';
        }
      } else {
        out += '[^/]*';
      }
    } else if ('\\.^$+?()[]{}|'.includes(c)) {
      out += '\\' + c;
    } else {
      out += c;
    }
  }
  return new RegExp(out + '$');
}

function matchKnown(p) {
  if (!fs.existsSync(registryPath)) return null;
  let registry;
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  } catch {
    return null;
  }
  for (const item of registry.patterns || []) {
    const pattern = String(item.PATH_PATTERN || '');
    if (!pattern) continue;
    if (globToRegExp(pattern).test(p)) return item;
  }
  return null;
}

const normalized = file.replaceAll('\\', '/');
const base = path.posix.basename(normalized);
const ext = path.posix.extname(normalized).toLowerCase();

let action = 'YELLOW';
let reason = 'UNKNOWN_CODE_OR_CONFIG_REQUIRES_DISCRIMINANT';
let conflictId = 'UNREGISTERED';
let source = 'path-policy';
let structuredStrategy = '';
let semanticKey = '';
let sourceRef = '';
let preserveRule = '';

if (['package.json', 'package-lock.json', 'pnpm-lock.yaml', 'yarn.lock'].includes(base)) {
  action = 'CURRENT';
  reason = 'DEPENDENCY_MANIFEST_OR_LOCKFILE_PRESERVE_PR_DELTA';
  conflictId = 'DEPENDENCY_MANIFEST_OR_LOCKFILE';
} else {
  const known = matchKnown(normalized);
  if (known) {
    conflictId = String(known.CONFLICT_ID || 'KNOWN');
    source = 'known-conflict-patterns.json';
    sourceRef = String(known.SOURCE_REF || '');
    preserveRule = String(known.PRESERVE_RULE || '');
    const policy = String(known.SAFE_RESOLUTION || '').toUpperCase();
    if (policy === 'USE_PR_SIDE') {
      action = 'CURRENT';
      reason = 'KNOWN_POLICY_USE_PR_SIDE';
    } else if (policy === 'USE_MAIN_SIDE') {
      action = 'INCOMING';
      reason = 'KNOWN_POLICY_USE_MAIN_SIDE';
    } else if (policy === 'PRESERVE_BOTH' || policy === 'USE_BOTH') {
      action = 'BOTH';
      reason = 'KNOWN_POLICY_PRESERVE_BOTH';
    } else if (policy === 'STRUCTURED') {
      action = 'STRUCTURED';
      structuredStrategy = String(known.STRUCTURED_STRATEGY || '');
      semanticKey = String(known.SEMANTIC_KEY || '');
      reason = structuredStrategy ? 'KNOWN_POLICY_STRUCTURED' : 'KNOWN_POLICY_STRUCTURED_MISSING_STRATEGY';
      if (!structuredStrategy) action = 'YELLOW';
    }
    if (action !== 'YELLOW' && (!sourceRef || !preserveRule)) {
      action = 'YELLOW';
      reason = 'KNOWN_POLICY_MISSING_PRIMARY_SOURCE_OR_PRESERVE_RULE';
    }
  }
}

// UNKNOWN textual conflicts are not automatically semantically compatible.
// Preserve YELLOW until a proven pattern is added to the canonical registry.
if (action === 'YELLOW' && reason === 'UNKNOWN_CODE_OR_CONFIG_REQUIRES_DISCRIMINANT') {
  reason = 'UNREGISTERED_CONFLICT_REQUIRES_PROVEN_PATTERN';
}

console.log(JSON.stringify({
  path: normalized,
  action,
  reason,
  conflict_id: conflictId,
  source,
  structured_strategy: structuredStrategy,
  semantic_key: semanticKey,
  source_ref: sourceRef,
  preserve_rule: preserveRule,
  current_means: 'PR_HEAD',
  incoming_means: 'MAIN',
  path_family: familyForPath(normalized),
  lexicon_recognized_types: Object.keys(GIT_SIGNATURES).length,
  unknown_is_pass: false
}));
