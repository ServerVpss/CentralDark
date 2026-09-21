import { useEffect, useMemo, useState } from 'react';
import {
  CENTRALDARK_CAPABILITY_COUNT,
  CENTRALDARK_FIXED_ROLES,
  CENTRALDARK_PROFILE_STORAGE_KEY,
  CENTRALDARK_SOUL,
  defaultCentralDarkProfile,
  type CentralDarkLocalProfile,
  type CentralDarkRoleId,
} from '~/lib/centraldark/organism';

function loadProfile(): CentralDarkLocalProfile {
  const fallback = defaultCentralDarkProfile();
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(CENTRALDARK_PROFILE_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<CentralDarkLocalProfile>;
    return {
      managerName: typeof parsed.managerName === 'string' && parsed.managerName.trim() ? parsed.managerName.trim() : fallback.managerName,
      roleNames: { ...fallback.roleNames, ...(parsed.roleNames ?? {}) },
    };
  } catch {
    return fallback;
  }
}

export function OrganismPanel() {
  const [profile, setProfile] = useState<CentralDarkLocalProfile>(() => loadProfile());
  const [selected, setSelected] = useState<CentralDarkRoleId>('auditor');

  useEffect(() => {
    window.localStorage.setItem(CENTRALDARK_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, [profile]);

  const selectedRole = useMemo(
    () => CENTRALDARK_FIXED_ROLES.find((role) => role.id === selected) ?? CENTRALDARK_FIXED_ROLES[0],
    [selected],
  );

  function renameRole(id: CentralDarkRoleId, name: string) {
    setProfile((current) => ({ ...current, roleNames: { ...current.roleNames, [id]: name } }));
  }

  function reset() {
    const fallback = defaultCentralDarkProfile();
    setProfile(fallback);
    window.localStorage.removeItem(CENTRALDARK_PROFILE_STORAGE_KEY);
  }

  return (
    <section className="cd-organism" aria-label="One SOUL, muitas capacidades">
      <header className="cd-organism__hero">
        <div className="cd-organism__sol-pet" aria-hidden>☀️</div>
        <div>
          <span className="cd-kicker">ONE SOUL · MANY CAPABILITIES</span>
          <input
            className="cd-organism__manager-name"
            value={profile.managerName}
            onChange={(event) => setProfile((current) => ({ ...current, managerName: event.target.value }))}
            aria-label="Nome visual da gerente"
          />
          <p>
            Nome visual editável. A alma continua em <code>{CENTRALDARK_SOUL.owner}</code>. Modelo, provider, app e superfície podem mudar sem criar outra identidade.
          </p>
        </div>
        <div className="cd-organism__numbers">
          <strong>1</strong><span>SOUL</span>
          <strong>6</strong><span>papéis fixos</span>
          <strong>{CENTRALDARK_CAPABILITY_COUNT}</strong><span>capacidades-base</span>
        </div>
      </header>

      <div className="cd-organism__flow">
        <span>SEGREDO/CHEFE</span><b>→</b><span>{profile.managerName || 'SOL'}</span><b>→</b>
        <span>gabinete + Hermes + ferramentas</span><b>→</b><span>REALIDADE</span>
      </div>

      <div className="cd-organism__grid">
        {CENTRALDARK_FIXED_ROLES.map((role) => (
          <button
            type="button"
            key={role.id}
            className={`cd-role-card ${selected === role.id ? 'is-selected' : ''}`}
            onClick={() => setSelected(role.id)}
          >
            <span className="cd-role-pet" aria-hidden>{role.pet}</span>
            <span className="cd-role-card__copy">
              <strong>{profile.roleNames[role.id] || role.role}</strong>
              <small>{role.role}</small>
            </span>
            <span className="cd-role-card__state">PAPEL FIXO</span>
          </button>
        ))}
      </div>

      <div className="cd-role-desk">
        <div className="cd-role-desk__pet" aria-hidden>{selectedRole.pet}</div>
        <div className="cd-role-desk__body">
          <span className="cd-kicker">MESA DO FUNCIONÁRIO</span>
          <input
            value={profile.roleNames[selectedRole.id]}
            onChange={(event) => renameRole(selectedRole.id, event.target.value)}
            aria-label={`Nome visual de ${selectedRole.role}`}
          />
          <div className="cd-role-desk__meta">
            <span><b>Papel:</b> {selectedRole.role}</span>
            <span><b>Reporta:</b> {profile.managerName || 'SOL'}</span>
            <span><b>Runtime:</b> UNKNOWN até telemetria/receipt</span>
          </div>
          <div className="cd-chip-row cd-chip-row--left">
            {selectedRole.capabilities.map((capability) => <span key={capability} className="cd-chip">{capability}</span>)}
          </div>
          <div className="cd-role-desk__columns">
            <div><strong>O que está fazendo</strong><span>vem da missão/telemetria viva</span></div>
            <div><strong>Prova</strong><span>receipt/log/diff aplicável</span></div>
            <div><strong>Resultado</strong><span>estado medido, não animação</span></div>
            <div><strong>Próximo trabalho</strong><span>cursor da SOL</span></div>
          </div>
        </div>
      </div>

      <footer className="cd-organism__footer">
        <span>Forja = cria bot temporário quando faltar capacidade; valor repetido + prova pode promover a permanente.</span>
        <button type="button" className="cd-button" onClick={reset}>Restaurar nomes</button>
      </footer>
    </section>
  );
}