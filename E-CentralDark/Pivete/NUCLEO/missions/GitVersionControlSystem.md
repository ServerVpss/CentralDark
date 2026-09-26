# MISSAO - GitVersionControlSystem.java
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.gradle\wrapper\dists\gradle-8.14.3-all\10utluxaxniiv4wxiphsi49nj\gradle-8.14.3\src\version-control\org\gradle\vcs\git\internal\GitVersionControlSystem.java
**SHA:** 1c4e02b96896d133
**Timestamp:** 2026-08-28T02:52:12.715989
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Gaps
- // TODO: Default branch can be different from just master

### Ouro Bruto (primeiros 5000 chars)
```
/*
 * Copyright 2017 the original author or authors.
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

package org.gradle.vcs.git.internal;

import org.eclipse.jgit.api.CloneCommand;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.ResetCommand;
import org.eclipse.jgit.api.TransportCommand;
import org.eclipse.jgit.api.TransportConfigCallback;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.api.errors.JGitInternalException;
import org.eclipse.jgit.lib.Ref;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.submodule.SubmoduleWalk;
import org.eclipse.jgit.transport.SshTransport;
import org.eclipse.jgit.transport.Transport;
import org.eclipse.jgit.transport.URIish;
import org.eclipse.jgit.transport.sshd.SshdSessionFactory;
import org.gradle.api.GradleException;
import org.gradle.api.logging.Logger;
import org.gradle.api.logging.Logging;
import org.gradle.vcs.VersionControlSpec;
import org.gradle.vcs.git.GitVersionControlSpec;
import org.gradle.vcs.internal.VersionControlSystem;
import org.gradle.vcs.internal.VersionRef;

import javax.annotation.Nullable;
import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

/**
 * A Git {@link VersionControlSystem} implementation.
 */
public class GitVersionControlSystem implements VersionControlSystem {

    private static final Logger LOGGER = Logging.getLogger(GitVersionControlSystem.class);

    @Override
    public void populate(File workingDir, VersionRef ref, VersionControlSpec spec) {
        GitVersionControlSpec gitSpec = cast(spec);
        LOGGER.info("Populating VCS workingDir {}/{} with ref {}", workingDir.getParentFile().getName(), workingDir.getName(), ref);
        if (workingDir.isDirectory()) {
            // Directory has something in it already
            String[] contents = workingDir.list();
            if (contents!=null && contents.length > 0) {
                resetRepo(workingDir, gitSpec, ref);
                return;
            }
        }

        cloneRepo(workingDir, gitSpec, ref);
    }

    @Override
    public Set<VersionRef> getAvailableVersions(VersionControlSpec spec) {
        GitVersionControlSpec gitSpec = cast(spec);
        Collection<Ref> refs = getRemoteRefs(gitSpec, true, false);
        Set<VersionRef> versions = new HashSet<>();
        for (Ref ref : refs) {
            GitVersionRef gitRef = GitVersionRef.from(ref);
            versions.add(gitRef);
        }
        return versions;
    }

    @Override
    public VersionRef getDefaultBranch(VersionControlSpec spec) {
        GitVersionControlSpec gitSpec = cast(spec);
        Collection<Ref> refs = getRemoteRefs(gitSpec, false, true);
        for (Ref ref : refs) {
            // TODO: Default branch can be different from just master
            if (ref.getName().equals("refs/heads/master")) {
                return GitVersionRef.from(ref);
            }
        }
        throw new UnsupportedOperationException("Git repository has no master branch");
    }

    @Nullable
    @Override
    public VersionRef getBranch(VersionControlSpec spec, String branch) {
        GitVersionControlSpec gitSpec = cast(spec);
        Collection<Ref> refs = getRemoteRefs(gitSpec, false, true);
        String refName = "refs/heads/" + branch;
        for (Ref ref : refs) {
            if (ref.getName().equals(refName)) {
                return GitVersionRef.from(ref);
            }
        }
        return null;
    }

    private Collection<Ref> getRemoteRefs(GitVersionControlSpec gitSpec, boolean tags, boolean heads) {
        try {
            return configureTransport(Git.lsRemoteRepository()).setRemote(normalizeUri(gitSpec.getUrl())).setTags(tags).setHeads(heads).call();
        } catch (URISyntaxException | GitAPIException e) {
            throw wrapGitCommandException("ls-remote", gitSpec.getUrl(), null, e);
        }
    }

    private static void cloneRepo(File workingDir, GitVersionControlSpec gitSpec, VersionRef ref) {
        Git git = null;
        try {
            CloneCommand clone = configureTransport(Git.cloneRepository()).
                    setURI(normalizeUri(gitSpec.getUrl())).
                    setDirectory(workingDir).
                    setCloneSubmodules(true);
            git = clone.call();
            git.reset().setMode(ResetCommand.ResetType.HARD).setRef(ref.getCanonicalId())
```