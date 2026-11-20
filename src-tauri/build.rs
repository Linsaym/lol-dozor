fn main() {
    tauri_build::try_build(tauri_build::Attributes::new().app_manifest(
        tauri_build::AppManifest::new().commands(&[
            "client_snapshot",
            "key_status",
            "save_key",
            "check_key",
            "player_stats",
            "open_reference",
        ]),
    ))
    .expect("failed to build Tauri resources");
}
