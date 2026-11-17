use crate::settings::ThemeId;
use crate::{AppState, HaloState};
use std::time::{Duration, Instant};
#[cfg(target_os = "windows")]
use std::sync::atomic::{AtomicBool, Ordering};
#[cfg(target_os = "windows")]
static CUA_RECOGNITION_ACTIVE: AtomicBool = AtomicBool::new(false);
use tauri::{
    image::Image,
    menu::{CheckMenuItem, CheckMenuItemBuilder, MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    tray::TrayIconBuilder,
    AppHandle, Emitter, Manager,
};
use tauri_plugin_autostart::ManagerExt;

fn distance_to_segment(px: f32, py: f32, ax: f32, ay: f32, bx: f32, by: f32) -> f32 {
    let ab_x = bx - ax;
    let ab_y = by - ay;
    let length_squared = ab_x * ab_x + ab_y * ab_y;
    let projection = if length_squared == 0.0 {
        0.0
    } else {
        (((px - ax) * ab_x + (py - ay) * ab_y) / length_squared).clamp(0.0, 1.0)
    };
    (px - (ax + projection * ab_x)).hypot(py - (ay + projection * ab_y))
}

fn halo_tray_icon(phase: f32) -> Image<'static> {
    const SIZE: u32 = 32;
    const SAMPLES: u32 = 4;
    const RING_RADIUS: f32 = 10.8;
    const RING_WIDTH: f32 = 2.4;

    #[cfg(target_os = "macos")]
    // Menu bars in the supported dark appearance need an explicit high-contrast
    // mark. Do not rely on template recolouring for frames refreshed at runtime.
    let color = [255_u8, 255_u8, 255_u8];
    #[cfg(not(target_os = "macos"))]
    let color = [0_u8, 212_u8, 255_u8];

    let mut rgba = Vec::with_capacity((SIZE * SIZE * 4) as usize);
    let center = SIZE as f32 / 2.0;
    let breath = 0.7 + 0.3 * ((phase * std::f32::consts::TAU).sin() * 0.5 + 0.5);
    let ring_radius = RING_RADIUS + (breath - 0.85) * 1.6;
    for y in 0..SIZE {
        for x in 0..SIZE {
            let mut covered = 0_u32;
            for sample_y in 0..SAMPLES {
                for sample_x in 0..SAMPLES {
                    let px = x as f32 + (sample_x as f32 + 0.5) / SAMPLES as f32 - center;
                    let py = y as f32 + (sample_y as f32 + 0.5) / SAMPLES as f32 - center;
                    let radius = px.hypot(py);
                    let ring = (radius - ring_radius).abs() <= RING_WIDTH / 2.0
                        && !(px > 5.0 && py < -5.0);
                    let chevron = distance_to_segment(px, py, -6.5, -4.5, -1.6, 0.0) <= 1.45
                        || distance_to_segment(px, py, -1.6, 0.0, -6.5, 4.5) <= 1.45;
                    let prompt = distance_to_segment(px, py, 1.8, 4.7, 7.8, 4.7) <= 1.35;
                    let spark = (px - 7.4).hypot(py + 7.4) <= 1.7;
                    if ring || chevron || prompt || spark {
                        covered += 1;
                    }
                }
            }
            rgba.extend_from_slice(&color);
            let coverage = (covered * 255) / (SAMPLES * SAMPLES);
            rgba.push((coverage as f32 * breath) as u8);
        }
    }
    Image::new_owned(rgba, SIZE, SIZE)
}

fn start_tray_breath(app: AppHandle) {
    std::thread::spawn(move || {
        let started = Instant::now();
        loop {
            std::thread::sleep(Duration::from_millis(650));
            let phase = (started.elapsed().as_millis() % 2_600) as f32 / 2_600.0;
            let Some(tray) = app.tray_by_id("main") else {
                break;
            };
            if let Err(error) = tray.set_icon(Some(halo_tray_icon(phase))) {
                log::debug!("Could not refresh tray breathing frame: {error}");
            }
        }
    });
}

#[derive(Clone)]
struct ThemeItems {
    cyber: CheckMenuItem<tauri::Wry>,
    sakura: CheckMenuItem<tauri::Wry>,
    minimal: CheckMenuItem<tauri::Wry>,
}

impl ThemeItems {
    fn set_selected(&self, theme: ThemeId) {
        let _ = self.cyber.set_checked(theme == ThemeId::CyberBlue);
        let _ = self.sakura.set_checked(theme == ThemeId::Sakura);
        let _ = self.minimal.set_checked(theme == ThemeId::Minimal);
    }
}

pub fn create_tray(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let initial = app
        .state::<AppState>()
        .settings
        .lock()
        .unwrap_or_else(|poisoned| poisoned.into_inner())
        .clone();
    let actual_autostart = app
        .autolaunch()
        .is_enabled()
        .unwrap_or(initial.start_at_login);
    if actual_autostart != initial.start_at_login {
        let state = app.state::<AppState>();
        let mut settings = state
            .settings
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        settings.start_at_login = actual_autostart;
        let _ = settings.save();
    }

    let open_control = MenuItemBuilder::with_id("open_agent_control", "Abrir Agente Remoto").build(app)?;
    let title = MenuItemBuilder::with_id("title", "CentralDark Halo")
        .enabled(false)
        .build(app)?;
    let enable = CheckMenuItemBuilder::new("Ativar Halo")
        .id("enable")
        .checked(initial.enabled)
        .build(app)?;
    let cyber = CheckMenuItemBuilder::new("Azul Cibernético")
        .id("theme_cyber_blue")
        .checked(initial.theme == ThemeId::CyberBlue)
        .build(app)?;
    let sakura = CheckMenuItemBuilder::new("Sakura")
        .id("theme_sakura")
        .checked(initial.theme == ThemeId::Sakura)
        .build(app)?;
    let minimal = CheckMenuItemBuilder::new("Minimalista")
        .id("theme_minimal")
        .checked(initial.theme == ThemeId::Minimal)
        .build(app)?;
    let theme_items = ThemeItems {
        cyber: cyber.clone(),
        sakura: sakura.clone(),
        minimal: minimal.clone(),
    };
    let themes = SubmenuBuilder::new(app, "Tema")
        .item(&cyber)
        .item(&sakura)
        .item(&minimal)
        .build()?;
    let demo = MenuItemBuilder::with_id("demo", "Modo de demonstração").build(app)?;
    let autostart = CheckMenuItemBuilder::new("Iniciar com o sistema")
        .id("autostart")
        .checked(actual_autostart)
        .build(app)?;
    let recognize_three = MenuItemBuilder::with_id(
        "cua_recognize_three", "Reconhecer tela 3 (mouse virtual)"
    ).enabled(cfg!(target_os = "windows")).build(app)?;
    let recognize_all = MenuItemBuilder::with_id(
        "cua_recognize_all", "Reconhecer todas as telas (mouse virtual)"
    ).enabled(cfg!(target_os = "windows")).build(app)?;
    let cua_menu = SubmenuBuilder::new(app, "Mouse virtual (Cua)")
        .item(&recognize_three)
        .item(&recognize_all)
        .build()?;
    let logs = MenuItemBuilder::with_id("logs", "Abrir registros").build(app)?;
    let quit = MenuItemBuilder::with_id("quit", "Sair").build(app)?;

    let menu = MenuBuilder::new(app)
        .item(&title)
        .item(&open_control)
        .separator()
        .item(&enable)
        .item(&themes)
        .item(&demo)
        .item(&cua_menu)
        .item(&autostart)
        .separator()
        .item(&logs)
        .item(&quit)
        .build()?;

    let enable_for_handler = enable.clone();
    let autostart_for_handler = autostart.clone();
    let themes_for_handler = theme_items.clone();
    TrayIconBuilder::with_id("main")
        .icon(halo_tray_icon(0.0))
        .icon_as_template(false)
        .tooltip("CentralDark Halo")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(move |app, event| match event.id().as_ref() {            "enable" => toggle_enabled(app, &enable_for_handler),
            "open_agent_control" => {
                if let Err(error) = crate::show_agent_control(app) {
                    log::warn!("Agente Remoto: {error}");
                }
            },
            "theme_cyber_blue" => {
                set_theme(app, ThemeId::CyberBlue, &themes_for_handler);
            }
            "theme_sakura" => set_theme(app, ThemeId::Sakura, &themes_for_handler),
            "theme_minimal" => set_theme(app, ThemeId::Minimal, &themes_for_handler),
            "demo" => {
                if let Err(error) = crate::run_demo(app.clone()) {
                    log::info!("Demonstração não iniciada: {error}");
                }
            }
            "cua_recognize_three" => {
                if let Err(error) = start_cua_visual_recognition(app, Some(3)) {
                    log::warn!("Reconhecimento visual indispon?vel: {error}");
                }
            },
            "cua_recognize_all" => {
                if let Err(error) = start_cua_visual_recognition(app, None) {
                    log::warn!("Reconhecimento visual indispon?vel: {error}");
                }
            },
            "autostart" => toggle_autostart(app, &autostart_for_handler),
            "logs" => {
                if let Err(error) = crate::platform::open_log_dir() {
                    log::warn!("Não foi possível abrir os registros: {error}");
                }
            }
            "quit" => {
                crate::render_state(app, HaloState::Idle);
                app.exit(0);
            }
            other => log::warn!("Unknown tray menu event: {other}"),
        })
        .build(app)?;

    start_tray_breath(app.clone());
    log::info!("Bandeja do sistema pronta");
    Ok(())
}

// CENTRALDARK_HALO_CUA_REUSE_20261114
// O Halo somente DELEGA ao helper ja existente: o cua-driver continua sendo o
// unico atuador. O overlay da Skill e usado somente durante o reconhecimento.
// Nunca inicie outro daemon, copie o driver, nem mova o mouse fisico.
#[cfg(target_os = "windows")]
fn start_cua_visual_recognition(app: &AppHandle, monitor: Option<u8>) -> Result<(), String> {
    use std::path::PathBuf;
    use std::process::Command;
    use std::os::windows::process::CommandExt;

    let state = app.state::<AppState>();
    let current = state.current.lock().unwrap_or_else(|e| e.into_inner()).state;
    if current != HaloState::Idle {
        return Err("O Halo está ocupado; preserve o overlay atual".into());
    }
    if CUA_RECOGNITION_ACTIVE.compare_exchange(
        false, true, Ordering::AcqRel, Ordering::Acquire,
    ).is_err() {
        return Err("Já existe um reconhecimento visual em execução".into());
    }

    let result = (|| {
        let relative = PathBuf::from(
            ".agents/skills/centraldark-operational-method/Skills/centraldark-hermes-visual-computer-use/scripts/blink_cursor.py"
        );
        let mut roots = Vec::<PathBuf>::new();
        if let Some(root) = std::env::var_os("CENTRALDARK_ROOT") {
            roots.push(root.into());
        }
        if let Ok(exe) = std::env::current_exe() {
            let mut cursor = exe.parent();
            while let Some(path) = cursor {
                roots.push(path.to_path_buf());
                cursor = path.parent();
            }
        }
        // Compatibilidade Casa/SEGREDO: fonte principal preexistente.
        roots.push(PathBuf::from(r"F:\CentralDark"));
        let script = roots.into_iter().map(|r| r.join(&relative))
            .find(|p| p.is_file())
            .ok_or("Helper Cua canônico não encontrado; configure CENTRALDARK_ROOT")?;
        let python = std::env::var_os("CENTRALDARK_PYTHON_EXE")
            .unwrap_or_else(|| "python".into());
        std::thread::spawn(move || {
            let mut command = Command::new(python);
            command.arg(script);
            match monitor {
                Some(n) => { command.arg("--monitor").arg(n.to_string()); }
                None => { command.arg("--all"); }
            }
            command.args(["--mode", "blink", "--blink-speed", "fast"]);
            // GUI: sem console extra e sem alterar o cursor fisico.
            command.creation_flags(0x0800_0000);
            match command.output() {
                Ok(out) if out.status.success() => {
                    log::info!("Reconhecimento Cua concluído, monitor={monitor:?}");
                }
                Ok(out) => {
                    log::warn!("Reconhecimento Cua falhou, exit={:?}", out.status.code());
                }
                Err(error) => {
                    log::warn!("Não foi possível acionar o helper Cua: {error}");
                }
            }
            CUA_RECOGNITION_ACTIVE.store(false, Ordering::Release);
        });
        Ok(())
    })();

    if result.is_err() {
        CUA_RECOGNITION_ACTIVE.store(false, Ordering::Release);
    }
    result
}

#[cfg(not(target_os = "windows"))]
fn start_cua_visual_recognition(_app: &AppHandle, _monitor: Option<u8>) -> Result<(), String> {
    Err("O cursor virtual Cua exige Windows nesta versão".into())
}
// /CENTRALDARK_HALO_CUA_REUSE_20261114

fn toggle_enabled(app: &AppHandle, item: &CheckMenuItem<tauri::Wry>) {
    let state = app.state::<AppState>();
    let enabled = {
        let mut settings = state
            .settings
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        settings.enabled = !settings.enabled;
        if let Err(error) = settings.save() {
            log::warn!("Não foi possível salvar a opção Ativar Halo: {error}");
        }
        settings.enabled
    };
    let _ = item.set_checked(enabled);
    if enabled {
        crate::restore_latest_state(app);
    } else {
        crate::apply_state(
            app,
            &state.current,
            &state.timeout_tx,
            HaloState::Idle,
            None,
        );
    }
    log::info!("Ativar Halo: {enabled}");
}

fn set_theme(app: &AppHandle, theme: ThemeId, items: &ThemeItems) {
    let state = app.state::<AppState>();
    {
        let mut settings = state
            .settings
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());
        settings.theme = theme;
        if let Err(error) = settings.save() {
            log::warn!("Não foi possível salvar o tema: {error}");
        }
    }
    items.set_selected(theme);
    let _ = app.emit(
        "halo-theme",
        serde_json::json!({ "theme": theme.to_string() }),
    );
    log::info!("Tema: {theme}");
}

fn toggle_autostart(app: &AppHandle, item: &CheckMenuItem<tauri::Wry>) {
    let current = app.autolaunch().is_enabled().unwrap_or(false);
    let desired = !current;
    let result = if desired {
        app.autolaunch().enable()
    } else {
        app.autolaunch().disable()
    };
    match result {
        Ok(()) => {
            let state = app.state::<AppState>();
            let mut settings = state
                .settings
                .lock()
                .unwrap_or_else(|poisoned| poisoned.into_inner());
            settings.start_at_login = desired;
            if let Err(error) = settings.save() {
                log::warn!("Não foi possível salvar a inicialização automática: {error}");
            }
            let _ = item.set_checked(desired);
            log::info!("Iniciar com o sistema: {desired}");
        }
        Err(error) => {
            let _ = item.set_checked(current);
            log::warn!("Não foi possível alterar a inicialização automática: {error}");
        }
    }
}
