mod halo_focus;
mod logging;
mod platform;
mod session_vault;
mod settings;
mod state;
mod tray;
mod watcher;

use settings::AppSettings;
use state::{HaloEvent, HaloState, HaloTarget, unix_time_ms};
use std::collections::HashSet;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex, mpsc};
use std::time::{Duration, Instant};
use tauri::{
    AppHandle, Emitter, Manager, Monitor, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
};
use tauri_plugin_notification::NotificationExt;

const OVERLAY_PREFIX: &str = "overlay-";
const CONTROL_LABEL: &str = "agent-control";

/// !RASTRO: abre ou restaura a UNICA janela interativa agent-control.
/// POR_QUE: tela autenticada e controles de janela sem segundo WebView/renderer.
/// INVARIANTES: reutiliza a janela existente, mantem overlays sem foco e
/// acesso ao cofre somente pelo label agent-control.
/// EFEITO: mostra e foca a janela; nao inicia acesso remoto.
/// PROVA: tray -> abrir -> minimizar/ocultar -> abrir a mesma janela.
pub(crate) fn show_agent_control(app: &AppHandle) -> Result<(), String> {
    let window = match app.get_webview_window(CONTROL_LABEL) {
        Some(existing) => existing,
        None => WebviewWindowBuilder::new(app, CONTROL_LABEL, WebviewUrl::App("index.html".into()))
            .title("Segredo Agente Remoto")
            // Barra nativa substituida pela UI React; overlays preservados.
            .decorations(false)
            .resizable(true)
            .inner_size(1020.0, 760.0)
            .min_inner_size(540.0, 620.0)
            .visible(false)
            .build()
            .map_err(|_| "AGENT_WINDOW_CREATE_FAILED")?,
    };
    // O mesmo olho dourado da bandeja tambem identifica a janela na barra de tarefas.
    // Reaproveita o rasterizador existente, sem segundo asset nem outro processo.
    if let Err(error) = window.set_icon(tray::halo_tray_icon(0.0)) {
        log::warn!("Nao foi possivel atualizar o icone da janela: {error}");
    }
    if window.is_minimized().unwrap_or(false) {
        window
            .unminimize()
            .map_err(|_| "AGENT_WINDOW_RESTORE_FAILED")?;
    }
    window.show().map_err(|_| "AGENT_WINDOW_SHOW_FAILED")?;
    window
        .set_focus()
        .map_err(|_| "AGENT_WINDOW_FOCUS_FAILED")?;
    Ok(())
}

#[derive(Debug)]
pub struct RuntimeState {
    pub state: HaloState,
    pub target: HaloTarget,
    pub revision: u64,
}

#[derive(Debug, Clone, Copy)]
struct TimeoutSchedule {
    revision: u64,
    delay: Option<Duration>,
}

pub struct AppState {
    pub current: Arc<Mutex<RuntimeState>>,
    pub settings: Arc<Mutex<AppSettings>>,
    pub demo_mode: Arc<AtomicBool>,
    pub cursor_active: Arc<AtomicBool>,
    timeout_tx: mpsc::Sender<TimeoutSchedule>,
}

/// !RASTRO: cria apenas a superficie Halo visual no monitor solicitado.
/// POR_QUE: o efeito nao pode capturar cursor, foco nem eventos do cliente.
/// INVARIANTES: click-through, transparent, sem capabilities de agent-control.
fn create_overlay(
    app: &AppHandle,
    label: String,
    monitor: &Monitor,
) -> Result<WebviewWindow, String> {
    let scale = monitor.scale_factor();
    let logical_size = monitor.size().to_logical::<f64>(scale);
    let logical_position = monitor.position().to_logical::<f64>(scale);

    let window =
        WebviewWindowBuilder::new(app, label, WebviewUrl::App("index.html#overlay".into()))
            .title("Segredo Agente Remoto")
            .decorations(false)
            .transparent(true)
            .always_on_top(true)
            .visible_on_all_workspaces(true)
            .skip_taskbar(true)
            .visible(false)
            .resizable(false)
            .maximizable(false)
            .minimizable(false)
            .closable(false)
            .focused(false)
            .focusable(false)
            .shadow(false)
            .inner_size(logical_size.width, logical_size.height)
            .position(logical_position.x, logical_position.y)
            .build()
            .map_err(|error| error.to_string())?;
    window
        .set_ignore_cursor_events(true)
        .map_err(|error| error.to_string())?;
    Ok(window)
}

/// !RASTRO: reconcilia overlays pela lista atual de monitores.
/// POR_QUE: hotplug e reorganizacao nao devem multiplicar superficies antigas.
/// PROVA: conferir um overlay por monitor e ausencia de janelas fantasmas.
fn sync_overlays(app: &AppHandle) -> Result<Vec<WebviewWindow>, String> {
    let mut monitors = app
        .available_monitors()
        .map_err(|error| error.to_string())?;
    monitors.sort_by_key(|monitor| {
        (
            monitor.position().x,
            monitor.position().y,
            monitor.size().width,
            monitor.size().height,
        )
    });
    if monitors.is_empty() {
        return Err("No display is available".to_owned());
    }

    let mut expected = HashSet::with_capacity(monitors.len());
    let mut windows = Vec::with_capacity(monitors.len());
    for (index, monitor) in monitors.iter().enumerate() {
        let label = format!("{OVERLAY_PREFIX}{index}");
        expected.insert(label.clone());
        let window = match app.get_webview_window(&label) {
            Some(window) => window,
            None => {
                let window = create_overlay(app, label.clone(), monitor)?;
                log::info!(
                    "Sobreposição {label} criada para o monitor {}x{} na posição {},{}",
                    monitor.size().width,
                    monitor.size().height,
                    monitor.position().x,
                    monitor.position().y
                );
                window
            }
        };
        // !RASTRO: restaura a cobertura integral apos um alvo de janela.
        let scale = monitor.scale_factor();
        let logical_size = monitor.size().to_logical::<f64>(scale);
        let logical_pos = monitor.position().to_logical::<f64>(scale);
        let _ = window.set_size(tauri::LogicalSize::new(
            logical_size.width,
            logical_size.height,
        ));
        let _ = window.set_position(tauri::LogicalPosition::new(logical_pos.x, logical_pos.y));
        windows.push(window);
    }

    for (label, window) in app.webview_windows() {
        if label.starts_with(OVERLAY_PREFIX) && !expected.contains(&label) {
            if let Err(error) = window.destroy() {
                log::warn!("Não foi possível remover a sobreposição antiga {label}: {error}");
            } else {
                log::info!("Sobreposição antiga {label} removida");
            }
        }
    }
    Ok(windows)
}

/// !RASTRO: estado legado ilumina todos; alvo explicito limita a unica janela/superficie.
/// @owner centraldark-halo-main @doc_ref docs/RELEASE.md
/// @last_updated 2026-11-19T08:55:00Z
fn render_state(app: &AppHandle, state: HaloState, target: &HaloTarget) {
    let windows = match sync_overlays(app) {
        Ok(windows) => windows,
        Err(error) => {
            log::error!("Não foi possível sincronizar as janelas de sobreposição: {error}");
            return;
        }
    };

    if state == HaloState::Idle {
        let payload = serde_json::json!({ "state": state.to_string() });
        for window in windows {
            let _ = window.emit("halo-state", payload.clone());
            if let Err(error) = window.hide() {
                log::warn!("Não foi possível ocultar {}: {error}", window.label());
            }
        }
        let _ = app.emit("halo-state", payload);
        return;
    }

    let payload = serde_json::json!({ "state": state.to_string() });
    let selected = if matches!(target, HaloTarget::All) {
        None
    } else {
        let mut monitors = match app.available_monitors() {
            Ok(monitors) => monitors,
            Err(_) => Vec::new(),
        };
        monitors.sort_by_key(|m| {
            (
                m.position().x,
                m.position().y,
                m.size().width,
                m.size().height,
            )
        });
        halo_focus::selection(&monitors, target)
    };
    for (i, window) in windows.into_iter().enumerate() {
        let allowed = matches!(target, HaloTarget::All)
            || selected.as_ref().is_some_and(|(wanted, _)| *wanted == i);
        if !allowed {
            let _ = window.hide();
            continue;
        }
        if let Some((_, Some(rect))) = selected {
            let _ = window.set_position(tauri::PhysicalPosition::new(rect.x, rect.y));
            let _ = window.set_size(tauri::PhysicalSize::new(rect.width, rect.height));
        }
        let _ = window.set_always_on_top(true);
        let _ = window.set_ignore_cursor_events(true);
        let _ = window.emit("halo-state", payload.clone());
        if let Err(error) = window.show() {
            log::warn!("Não foi possível exibir {}: {error}", window.label());
        }
    }
    let _ = app.emit("halo-state", payload);
}

fn notify(app: &AppHandle, body: &str) {
    if let Err(error) = app
        .notification()
        .builder()
        .title("Segredo Agente Remoto")
        .body(body)
        .show()
    {
        log::warn!("Não foi possível enviar a notificação do sistema: {error}");
    }
}

fn apply_state(
    app: &AppHandle,
    current: &Arc<Mutex<RuntimeState>>,
    timeout_tx: &mpsc::Sender<TimeoutSchedule>,
    state: HaloState,
    target: HaloTarget,
    remaining: Option<Duration>,
) {
    let (previous, revision) = {
        let mut runtime = current
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        let previous = runtime.state;
        runtime.state = state;
        runtime.target = target.clone();
        runtime.revision = runtime.revision.wrapping_add(1);
        (previous, runtime.revision)
    };

    let delay = remaining.or_else(|| state.timeout_ms().map(Duration::from_millis));
    let _ = timeout_tx.send(TimeoutSchedule { revision, delay });
    render_state(app, state, &target);

    if state != previous {
        log::info!("Estado: {previous} -> {state}");
        match state {
            HaloState::Attention => notify(app, "O Segredo Agente precisa da sua atenção"),
            HaloState::Completed => notify(app, "O Segredo Agente concluiu a etapa"),
            HaloState::Idle | HaloState::Working => {}
        }
    }
}

fn apply_real_event(app: &AppHandle, app_state: &AppState, event: HaloEvent) {
    if app_state.demo_mode.load(Ordering::Acquire) {
        return;
    }
    let enabled = app_state
        .settings
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .enabled;
    if !enabled {
        return;
    }

    let age = unix_time_ms().saturating_sub(event.updated_at);
    let remaining = event
        .state
        .timeout_ms()
        .map(|timeout| Duration::from_millis(timeout.saturating_sub(age)));
    apply_state(
        app,
        &app_state.current,
        &app_state.timeout_tx,
        event.state,
        event.target.clone(),
        remaining,
    );
    if event.state == HaloState::Working && event.blink_cursor {
        match halo_focus::cursor_point(app, &event.target) {
            Some(point) => halo_focus::start_cua_blink(point, app_state.cursor_active.clone()),
            None => log::warn!("Segredo Agente: alvo não disponível; cursor não acionado"),
        }
    }
}

/// !RASTRO: restaura o ultimo estado Halo validado sem inventar evento ativo.
/// POR_QUE: reinicio nao deve mostrar atividade ficticia.
/// EFEITO: atualiza o estado compartilhado dos overlays existentes.
pub fn restore_latest_state(app: &AppHandle) {
    let state = app.state::<AppState>();
    let Some(path) = platform::state_file_path() else {
        apply_state(
            app,
            &state.current,
            &state.timeout_tx,
            HaloState::Idle,
            HaloTarget::All,
            None,
        );
        return;
    };
    match watcher::read_current_state(&path) {
        Ok(event) => apply_real_event(app, &state, event),
        Err(_) => apply_state(
            app,
            &state.current,
            &state.timeout_tx,
            HaloState::Idle,
            HaloTarget::All,
            None,
        ),
    }
}

fn start_timeout_worker(
    app: AppHandle,
    current: Arc<Mutex<RuntimeState>>,
    receiver: mpsc::Receiver<TimeoutSchedule>,
) {
    std::thread::spawn(move || {
        let mut pending: Option<(u64, Instant)> = None;
        loop {
            let message = match pending {
                Some((_, deadline)) => {
                    let delay = deadline.saturating_duration_since(Instant::now());
                    receiver.recv_timeout(delay)
                }
                None => receiver
                    .recv()
                    .map_err(|_| mpsc::RecvTimeoutError::Disconnected),
            };

            match message {
                Ok(schedule) => {
                    pending = schedule
                        .delay
                        .map(|delay| (schedule.revision, Instant::now() + delay));
                }
                Err(mpsc::RecvTimeoutError::Timeout) => {
                    let Some((expected_revision, _)) = pending.take() else {
                        continue;
                    };
                    let should_hide = {
                        let mut runtime = current
                            .lock()
                            .unwrap_or_else(|poisoned| poisoned.into_inner());
                        if runtime.revision == expected_revision && runtime.state != HaloState::Idle
                        {
                            log::info!("Tempo limite do estado: {} -> idle", runtime.state);
                            runtime.state = HaloState::Idle;
                            runtime.revision = runtime.revision.wrapping_add(1);
                            true
                        } else {
                            false
                        }
                    };
                    if should_hide {
                        render_state(&app, HaloState::Idle, &HaloTarget::All);
                    }
                }
                Err(mpsc::RecvTimeoutError::Disconnected) => break,
            }
        }
    });
}

pub fn run_demo(app: AppHandle) -> Result<(), String> {
    let state = app.state::<AppState>();
    let enabled = state
        .settings
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .enabled;
    if !enabled {
        return Err("Ative o Segredo Agente antes de iniciar a demonstração".to_owned());
    }
    state
        .demo_mode
        .compare_exchange(false, true, Ordering::AcqRel, Ordering::Acquire)
        .map_err(|_| "A demonstração já está em execução".to_owned())?;

    let current = state.current.clone();
    let demo_mode = state.demo_mode.clone();
    let timeout_tx = state.timeout_tx.clone();
    std::thread::spawn(move || {
        log::info!("Demonstração iniciada");
        for (halo_state, duration_ms) in [
            (HaloState::Working, 3_000),
            (HaloState::Attention, 3_000),
            (HaloState::Completed, 2_000),
        ] {
            apply_state(
                &app,
                &current,
                &timeout_tx,
                halo_state,
                HaloTarget::All,
                None,
            );
            std::thread::sleep(Duration::from_millis(duration_ms));
        }
        apply_state(
            &app,
            &current,
            &timeout_tx,
            HaloState::Idle,
            HaloTarget::All,
            None,
        );
        demo_mode.store(false, Ordering::Release);
        log::info!("Demonstração concluída");
        restore_latest_state(&app);
    });
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// !RASTRO: bootstrap unico do aplicativo Tauri, bandeja e watchers.
/// POR_QUE: evitar segundo executor e manter lifecycle das janelas no Rust.
/// PROVA: inicio nativo, um tray, overlays e comandos do agent-control.
pub fn run() {
    if let Err(error) = logging::init() {
        eprintln!("Não foi possível iniciar os registros do Segredo Agente Remoto: {error}");
    }
    std::panic::set_hook(Box::new(|info| {
        // Source line only, never the panic payload or local filesystem paths.
        if let Some(location) = info.location() {
            log::error!("AGENT_DIAG stage=native_runtime state=error code=RUST_PANIC line={}", location.line());
        } else {
            logging::diag("native_runtime", "error", "RUST_PANIC");
        }
    }));
    log::info!(
        "Segredo Agente Remoto versão {} iniciando no sistema {} ({})",
        env!("CARGO_PKG_VERSION"),
        std::env::consts::OS,
        std::env::consts::ARCH
    );
    // !RASTRO: inicializacao do mesmo processo nativo, sem gerar log paralelo.
    logging::diag("startup", "ok", "NATIVE_BOOT");
    logging::diag("remote_executor", "pending", "MOTOR_NOT_LINKED");

    let settings = Arc::new(Mutex::new(AppSettings::load()));
    let current = Arc::new(Mutex::new(RuntimeState {
        state: HaloState::Idle,
        target: HaloTarget::All,
        revision: 0,
    }));
    let demo_mode = Arc::new(AtomicBool::new(false));
    let (timeout_tx, timeout_rx) = mpsc::channel();
    let app_state = AppState {
        current: current.clone(),
        settings: settings.clone(),
        demo_mode: demo_mode.clone(),
        cursor_active: Arc::new(AtomicBool::new(false)),
        timeout_tx: timeout_tx.clone(),
    };

    let app = tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|_, _, _| {
            log::info!("Uma segunda inicialização do Segredo Agente Remoto foi ignorada");
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .app_name("Segredo Agente Remoto")
                .build(),
        )
        .on_window_event(|window, event| {
            if window.label() != CONTROL_LABEL { return; }
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                let _ = window.hide();
            }
        })        .manage(app_state)
        .setup(move |app| {
            #[cfg(target_os = "macos")]
            app.handle()
                .set_activation_policy(tauri::ActivationPolicy::Accessory)?;

            let overlays = sync_overlays(app.handle()).map_err(std::io::Error::other)?;
            log::info!("Sobreposições prontas para {} monitor(es)", overlays.len());
            tray::create_tray(app.handle())?;
            // O DEV abre a MESMA janela React automaticamente para personalização;
            // o release mantém o fluxo original de bandeja, sem segunda interface.
            #[cfg(debug_assertions)]
            if let Err(error) = show_agent_control(app.handle()) {
                log::warn!("Agente Remoto DEV: janela indisponível: {error}");
            }
            start_timeout_worker(app.handle().clone(), current.clone(), timeout_rx);
            // !RASTRO: mesma janela Halo acompanha a aplicacao (sem novo processo).
            let focus_app = app.handle().clone();
            let focus_state = current.clone();
            std::thread::spawn(move || loop {
                std::thread::sleep(Duration::from_millis(350));
                let (active, target) = {
                    let guard = focus_state.lock().unwrap_or_else(|e| e.into_inner());
                    (guard.state != HaloState::Idle, guard.target.clone())
                };
                if active { halo_focus::refresh_window(&focus_app, &target); }
            });

            if let Some(state_file) = platform::state_file_path() {
                let handle = app.handle().clone();
                watcher::spawn(state_file, move |event| {
                    let state = handle.state::<AppState>();
                    apply_real_event(&handle, &state, event);
                });
            } else {
                log::error!("Diretório de estado indisponível; integração por arquivos desativada");
            }
            if let Some(sessions_dir) = platform::codex_sessions_dir() {
                let handle = app.handle().clone();
                watcher::spawn_codex_activity(sessions_dir, move |activity| {
                    let app_state = handle.state::<AppState>();
                    if app_state.demo_mode.load(Ordering::Acquire)
                        || !app_state
                            .settings
                            .lock()
                            .unwrap_or_else(|poisoned| poisoned.into_inner())
                            .enabled
                    {
                        return;
                    }
                    apply_state(
                        &handle,
                        &app_state.current,
                        &app_state.timeout_tx,
                        activity.halo_state(),
                        HaloTarget::All,
                        None,
                    );
                });
            } else {
                log::debug!(
                    "Diretório de sessões do Codex indisponível; a integração por eventos continua ativa"
                );
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            session_vault::agent_supabase_auth_request,
            session_vault::save_agent_session,
            session_vault::load_agent_session,
            session_vault::clear_agent_session,
            session_vault::remote_pairing_status,
            session_vault::start_remote_pairing,
            session_vault::approve_remote_pairing,
            session_vault::record_remote_diagnostic,
            session_vault::local_bridge_health,
            session_vault::remote_network_status,
            session_vault::open_cockpit_in_browser,
            get_state,
            get_settings,
            run_demo_command,
            open_logs,
            quit_app
        ])
        .build(tauri::generate_context!())
        .expect("Erro ao iniciar o Segredo Agente Remoto");

    app.run(|app_handle, event| {
        if let tauri::RunEvent::ExitRequested { .. } = event {
            render_state(app_handle, HaloState::Idle, &HaloTarget::All);
            log::info!("Segredo Agente Remoto encerrado");
        }
    });
}

#[tauri::command]
fn get_state(state: tauri::State<'_, AppState>) -> String {
    state
        .current
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .state
        .to_string()
}

#[tauri::command]
fn get_settings(state: tauri::State<'_, AppState>) -> Result<serde_json::Value, String> {
    let settings = state
        .settings
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner());
    serde_json::to_value(&*settings).map_err(|error| error.to_string())
}

#[tauri::command]
fn run_demo_command(app: AppHandle) -> Result<(), String> {
    run_demo(app)
}

#[tauri::command]
fn open_logs() -> Result<(), String> {
    platform::open_log_dir()
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    render_state(&app, HaloState::Idle, &HaloTarget::All);
    app.exit(0);
}
