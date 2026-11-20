mod client;
mod riot;

use reqwest::{Client, Url, redirect::Policy};
use std::{path::PathBuf, time::Duration};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_opener::OpenerExt;
use tokio::sync::Mutex;
use zeroize::Zeroizing;

struct Dozor {
    local: Client,
    riot: riot::Riot,
    key_path: PathBuf,
    current: Mutex<client::Snapshot>,
}

#[tauri::command]
async fn client_snapshot(state: State<'_, Dozor>) -> Result<serde_json::Value, riot::Issue> {
    let mut current = state.current.lock().await;
    *current = client::snapshot(&state.local, &current).await;
    serde_json::to_value(&*current).map_err(|_| riot::Issue::Unavailable)
}

#[tauri::command]
async fn key_status(state: State<'_, Dozor>) -> Result<riot::KeyStatus, riot::Issue> {
    Ok(state.riot.status().await)
}

#[tauri::command]
async fn save_key(state: State<'_, Dozor>, key: String) -> Result<riot::KeyStatus, riot::Issue> {
    state.riot.save(&state.key_path, Zeroizing::new(key)).await
}

#[tauri::command]
async fn check_key(state: State<'_, Dozor>) -> Result<riot::KeyStatus, riot::Issue> {
    let platform = state.current.lock().await.platform.clone();
    state.riot.check(&platform).await
}

#[tauri::command]
async fn player_stats(
    state: State<'_, Dozor>,
    game_id: String,
    slot: String,
    revision: u64,
) -> Result<riot::Stats, riot::Issue> {
    let (platform, player) = {
        let current = state.current.lock().await;
        let player = current
            .game
            .as_ref()
            .filter(|game| game.id == game_id)
            .and_then(|game| game.players.iter().find(|p| p.slot == slot))
            .ok_or(riot::Issue::NotFound)?;
        (current.platform.clone(), player.clone())
    };
    state
        .riot
        .stats(
            &platform,
            &player.game_name,
            &player.tag_line,
            if player.is_me { 12 } else { 5 },
            revision,
        )
        .await
}

fn valid_external(url: &Url) -> bool {
    if url.scheme() != "https"
        || !url.username().is_empty()
        || url.password().is_some()
        || url.port().is_some()
        || url.fragment().is_some()
    {
        return false;
    }
    match url.host_str() {
        Some("www.leagueofgraphs.com") => {
            let segments = url.path_segments().map(Iterator::collect::<Vec<_>>);
            matches!(segments.as_deref(), Some(["ru", "summoner", region, id, "last-30-days"])
                if matches!(*region, "ru" | "euw" | "eune" | "na" | "kr" | "jp" | "br" | "lan" | "las" | "oce" | "tr" | "me" | "sg" | "tw" | "vn")
                && !id.is_empty() && url.query().is_none())
        }
        Some("www.youtube.com") => {
            url.path() == "/results"
                && matches!(url.query_pairs().collect::<Vec<_>>().as_slice(),
                [(key, value)] if key == "search_query" && riot::valid_part(value, 150))
        }
        Some("developer.riotgames.com") => url.path() == "/" && url.query().is_none(),
        _ => false,
    }
}

#[tauri::command]
async fn open_reference(app: AppHandle, url: String) -> Result<(), riot::Issue> {
    let url = Url::parse(&url)
        .ok()
        .filter(valid_external)
        .ok_or(riot::Issue::Unavailable)?;
    app.opener()
        .open_url(url.as_str(), None::<&str>)
        .map_err(|_| riot::Issue::Unavailable)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_window_state::Builder::default()
                .with_state_flags(
                    tauri_plugin_window_state::StateFlags::POSITION
                        | tauri_plugin_window_state::StateFlags::SIZE
                        | tauri_plugin_window_state::StateFlags::MAXIMIZED,
                )
                .build(),
        )
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let key_path = app.path().app_local_data_dir()?.join("riot-key.dpapi");
            let local = Client::builder()
                .no_proxy()
                .redirect(Policy::none())
                .danger_accept_invalid_certs(true)
                .timeout(Duration::from_millis(800))
                .build()?;
            let remote = Client::builder()
                .redirect(Policy::none())
                .timeout(Duration::from_secs(5))
                .build()?;
            app.manage(Dozor {
                local,
                riot: riot::Riot::new(remote, &key_path),
                key_path,
                current: Mutex::default(),
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            client_snapshot,
            key_status,
            save_key,
            check_key,
            player_stats,
            open_reference
        ])
        .run(tauri::generate_context!())
        .expect("failed to run LoL Dozor");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn opener_allows_only_expected_https_destinations() {
        for (value, allowed) in [
            (
                "https://www.leagueofgraphs.com/ru/summoner/ru/Добрая+Лулу-meow/last-30-days",
                true,
            ),
            (
                "https://www.youtube.com/results?search_query=Aatrox+vs+Renekton",
                true,
            ),
            (
                "https://www.youtube.com/redirect?q=https%3A%2F%2Fexample.com",
                false,
            ),
            ("https://developer.riotgames.com@host.example/", false),
            ("file:///C:/Windows/System32/cmd.exe", false),
        ] {
            assert_eq!(
                valid_external(&Url::parse(value).unwrap()),
                allowed,
                "{value}"
            );
        }
    }
}
