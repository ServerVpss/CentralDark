# COMANDO - typescript.d.ts
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\Codex\2026-06-10\prior-conversation-with-codex-conversation-role\work\CentralDark-live\CentralDark\apps\mcp\node_modules\typescript\lib\typescript.d.ts
**SHA:** e134052a6b1ded61
**Timestamp:** 2026-08-26T19:32:32.503277
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start: number;
- start: number;
- start: Location;
- start: Location;
- start: Location;
- start: number;
- start: Location;
- editContent(start: number, end: number, newText: string): void;
- start: number | undefined;
- start: number;

### Padroes
- ObjectBindingPattern = 207,
- ArrayBindingPattern = 208,
- type BindingPattern = ObjectBindingPattern | ArrayBindingPattern;
- type ObjectBindingOrAssignmentPattern = ObjectBindingPattern | ObjectLiteralExpression;
- type ArrayBindingOrAssignmentPattern = ArrayBindingPattern | ArrayLiteralExpression;
- type AssignmentPattern = ObjectLiteralExpression | ArrayLiteralExpression;
- type BindingOrAssignmentPattern = ObjectBindingOrAssignmentPattern | ArrayBindingOrAssignmentPattern;
- getTypeOfAssignmentPattern(pattern: AssignmentPattern): Type;
- type DestructuringPattern = BindingPattern | ObjectLiteralExpression | ArrayLiteralExpression;

### Gaps
- Missing = "__missing",

### Ouro Bruto (primeiros 5000 chars)
```
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

declare namespace ts {
    namespace server {
        namespace protocol {
            export import ApplicableRefactorInfo = ts.ApplicableRefactorInfo;
            export import ClassificationType = ts.ClassificationType;
            export import CompletionsTriggerCharacter = ts.CompletionsTriggerCharacter;
            export import CompletionTriggerKind = ts.CompletionTriggerKind;
            export import InlayHintKind = ts.InlayHintKind;
            export import OrganizeImportsMode = ts.OrganizeImportsMode;
            export import RefactorActionInfo = ts.RefactorActionInfo;
            export import RefactorTriggerReason = ts.RefactorTriggerReason;
            export import RenameInfoFailure = ts.RenameInfoFailure;
            export import SemicolonPreference = ts.SemicolonPreference;
            export import SignatureHelpCharacterTypedReason = ts.SignatureHelpCharacterTypedReason;
            export import SignatureHelpInvokedReason = ts.SignatureHelpInvokedReason;
            export import SignatureHelpParameter = ts.SignatureHelpParameter;
            export import SignatureHelpRetriggerCharacter = ts.SignatureHelpRetriggerCharacter;
            export import SignatureHelpRetriggeredReason = ts.SignatureHelpRetriggeredReason;
            export import SignatureHelpTriggerCharacter = ts.SignatureHelpTriggerCharacter;
            export import SignatureHelpTriggerReason = ts.SignatureHelpTriggerReason;
            export import SymbolDisplayPart = ts.SymbolDisplayPart;
            export import UserPreferences = ts.UserPreferences;
            type ChangePropertyTypes<
                T,
                Substitutions extends {
                    [K in keyof T]?: any;
                },
            > = {
                [K in keyof T]: K extends keyof Substitutions ? Substitutions[K] : T[K];
            };
            type ChangeStringIndexSignature<T, NewStringIndexSignatureType> = {
                [K in keyof T]: string extends K ? NewStringIndexSignatureType : T[K];
            };
            export enum CommandTypes {
                JsxClosingTag = "jsxClosingTag",
                LinkedEditingRange = "linkedEditingRange",
                Brace = "brace",
                BraceCompletion = "braceCompletion",
                GetSpanOfEnclosingComment = "getSpanOfEnclosingComment",
                Change = "change",
                Close = "close",
                /** @deprecated Prefer CompletionInfo -- see comment on CompletionsResponse */
                Completions = "completions",
                CompletionInfo = "completionInfo",
                CompletionDetails = "completionEntryDetails",
                CompileOnSaveAffectedFileList = "compileOnSaveAffectedFileList",
                CompileOnSaveEmitFile = "compileOnSaveEmitFile",
                Configure = "configure",
                Definition = "definition",
                DefinitionAndBoundSpan = "definitionAndBoundSpan",
                Implementation = "implementation",
                Exit = "exit",
                FileReferences = "fileReferences",
                Format = "format",
                Formatonkey = "formatonkey",
                Geterr = "geterr",
                GeterrForProject = "geterrForProject",
                SemanticDiagnosticsSync = "semanticDiagnosticsSync",
                SyntacticDiagnosticsSync = "syntacticDiagnosticsSync",
                SuggestionDiagnosticsSync = "suggestionDiagnosticsSync",
                NavBar = "navbar",
                Navto = "navto",
                NavTree = "navtree",
                NavTreeFull = "navtree-full",
                DocumentHighlights = "documentHighlights",
                Open = "open",
                Quickinfo = "quickinfo",
                References = "references",
                Reload = "reload",
                Rename = "rename",
                Saveto = "saveto",
                SignatureHelp = "signatureHelp",
                FindSourceDefinition = "findSourceDefinition",
                Status = "status",
                TypeDefinition = "typeDefinition",
                ProjectInfo = "projectInfo",
                ReloadProjects = "reloadProj
```