# MISSAO - DefaultSourceIncludesResolver.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\language-native\org\gradle\language\nativeplatform\internal\incremental\DefaultSourceIncludesResolver.java
**SHA:** 2ade886479595a35
**Timestamp:** 2026-08-28T02:50:38.907739
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- missing = true;

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2013 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.gradle.language.nativeplatform.internal.incremental;

import com.google.common.base.Objects;
import org.gradle.internal.FileUtils;
import org.gradle.internal.file.FileType;
import org.gradle.internal.hash.HashCode;
import org.gradle.internal.vfs.FileSystemAccess;
import org.gradle.language.nativeplatform.internal.Expression;
import org.gradle.language.nativeplatform.internal.Include;
import org.gradle.language.nativeplatform.internal.IncludeDirectives;
import org.gradle.language.nativeplatform.internal.IncludeType;
import org.gradle.language.nativeplatform.internal.Macro;
import org.gradle.language.nativeplatform.internal.MacroFunction;
import org.gradle.language.nativeplatform.internal.incremental.sourceparser.ComplexExpression;
import org.gradle.language.nativeplatform.internal.incremental.sourceparser.SimpleExpression;

import javax.annotation.Nullable;
import java.io.File;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class DefaultSourceIncludesResolver implements SourceIncludesResolver {
    private static final MissingIncludeFile MISSING_INCLUDE_FILE = new MissingIncludeFile();
    private final FileSystemAccess fileSystemAccess;
    private final Map<File, DirectoryContents> includeRoots = new HashMap<File, DirectoryContents>();
    private final FixedIncludePath includePath;

    public DefaultSourceIncludesResolver(List<File> includePaths, FileSystemAccess fileSystemAccess) {
        this.fileSystemAccess = fileSystemAccess;
        List<DirectoryContents> includeDirs = new ArrayList<DirectoryContents>(includePaths.size());
        for (File includeDir : includePaths) {
            includeDirs.add(toDir(includeDir));
        }
        this.includePath = new FixedIncludePath(includeDirs);
    }

    @Override
    public IncludeResolutionResult resolveInclude(File sourceFile, Include include, MacroLookup visibleMacros) {
        BuildableResult results = new BuildableResult();
        resolveExpression(visibleMacros, include, new PathResolvingVisitor(sourceFile, results), new TokenLookup());
        return results;
    }

    private void resolveExpression(MacroLookup visibleMacros, Expression expression, ExpressionVisitor visitor, TokenLookup tokenLookup) {
        if (expression.getType() == IncludeType.SYSTEM) {
            visitor.visitSystem(expression);
        } else if (expression.getType() == IncludeType.QUOTED) {
            visitor.visitQuoted(expression);
        } else if (expression.getType() == IncludeType.IDENTIFIER) {
            visitor.visitIdentifier(expression);
        } else if (expression.getType() == IncludeType.ARGS_LIST) {
            visitor.visitTokens(expression);
        } else {
            if (!visitor.startVisit(expression)) {
                // Skip, visitor is not interested
                return;
            }
            if (expression.getType() == IncludeType.MACRO) {
                resolveMacro(visibleMacros, expression, visitor, tokenLookup);
            } else if (expression.getType() == IncludeType.MACRO_FUNCTION) {
                resolveMacroFunction(visibleMacros, expression, visitor, tokenLookup);
            } else if (expression.getType() == IncludeType.TOKEN_CONCATENATION) {
                resolveTokenConcatenation(visibleMacros, expression, visitor, tokenLookup);
            } else if (expression.getType() == IncludeType.EXPAND_TOKEN_CONCATENATION) {
                resolveAndExpandTokenConcatenation(visibleMacros, expression, visitor, tokenLookup);
            } else if (expression.getType() == IncludeType.EXPRESSIONS) {
                resolveExpressionSequence(visibleMacros, expression, visitor, tokenLookup);
            } else {
                visitor.visitUnresolved();
            }
        }
    }

    private void resolveExpressionSequence(MacroLookup visibleMacros, Expression expression, ExpressionVisitor visitor, TokenLookup tokenLookup) {
        List<Expression> expressions = expression.getArguments();
        // Only <function-call>+ <args-list> supported
        if (expressions.size() < 2) {
            visitor.visitUnresolved();
            return;
        }
        Expression argListExpression = expressions.get(expressi
```