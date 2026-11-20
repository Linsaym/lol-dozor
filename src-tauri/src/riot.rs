use crate::client::string;
use reqwest::{Client, StatusCode, Url, header::HeaderValue};
use serde::Serialize;
use serde_json::Value;
use std::{
    collections::HashMap,
    fs,
    io::{self, Write},
    path::Path,
    time::{Duration, Instant},
};
use tokio::sync::Mutex;
use zeroize::Zeroizing;

#[derive(Clone, Copy, Debug, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub enum Issue {
    MissingKey,
    InvalidKey,
    RateLimited,
    Unavailable,
    NotFound,
    UnsupportedRegion,
    Storage,
    KeyChanged,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct KeyStatus {
    configured: bool,
    revision: u64,
    issue: Option<Issue>,
}

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Stats {
    pub rank: Option<Rank>,
    pub matches: Vec<Recent>,
    pub issue: Option<Issue>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Rank {
    tier: String,
    division: String,
    lp: u64,
    wins: u64,
    losses: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Recent {
    win: bool,
    kills: u64,
    deaths: u64,
    assists: u64,
    champion: String,
    role: String,
    lane_opponent: String,
    items: Vec<u64>,
    patch: String,
}

pub fn route(platform: &str) -> Option<&'static str> {
    match platform {
        "br1" | "la1" | "la2" | "na1" => Some("americas"),
        "euw1" | "eun1" | "ru" | "tr1" | "me1" => Some("europe"),
        "kr" | "jp1" => Some("asia"),
        "oc1" | "ph2" | "sg2" | "th2" | "tw2" | "vn2" => Some("sea"),
        _ => None,
    }
}

fn url(host: &str, path: &[&str]) -> Url {
    let mut url = Url::parse(&format!("https://{host}.api.riotgames.com")).expect("Riot host");
    url.path_segments_mut()
        .expect("URL path")
        .extend(path.iter().copied());
    url
}

#[derive(Default)]
struct State {
    key: Option<Zeroizing<String>>,
    revision: u64,
    issue: Option<Issue>,
    retry: Option<Instant>,
    last_request: Option<Instant>,
    cache: HashMap<Url, (Instant, Option<Value>)>,
}

impl State {
    fn status(&self) -> KeyStatus {
        KeyStatus {
            configured: self.key.is_some(),
            revision: self.revision,
            issue: self.issue.filter(|issue| {
                *issue != Issue::RateLimited
                    || self.retry.is_some_and(|until| until > Instant::now())
            }),
        }
    }
}

pub struct Riot {
    client: Client,
    state: Mutex<State>,
}

impl Riot {
    pub fn new(client: Client, path: &Path) -> Self {
        let mut state = State::default();
        match fs::read(path) {
            Ok(ciphertext) => match crypt(&ciphertext, false)
                .and_then(|bytes| String::from_utf8(bytes.to_vec()).map_err(io::Error::other))
            {
                Ok(key) => state.key = Some(Zeroizing::new(key)),
                Err(_) => state.issue = Some(Issue::Storage),
            },
            Err(error) if error.kind() == io::ErrorKind::NotFound => (),
            Err(_) => state.issue = Some(Issue::Storage),
        }
        Self {
            client,
            state: Mutex::new(state),
        }
    }

    pub async fn status(&self) -> KeyStatus {
        self.state.lock().await.status()
    }

    pub async fn save(&self, path: &Path, key: Zeroizing<String>) -> Result<KeyStatus, Issue> {
        let key = Zeroizing::new(key.trim().to_owned());
        if !key.starts_with("RGAPI-") || !valid_part(&key, 128) || !key.is_ascii() {
            return Err(Issue::InvalidKey);
        }
        let mut state = self.state.lock().await;
        let ciphertext = crypt(key.as_bytes(), true).map_err(|_| Issue::Storage)?;
        let dir = path.parent().ok_or(Issue::Storage)?;
        let write = || -> io::Result<()> {
            fs::create_dir_all(dir)?;
            let mut file = tempfile::NamedTempFile::new_in(dir)?;
            file.write_all(&ciphertext)?;
            file.as_file().sync_all()?;
            file.persist(path)?;
            Ok(())
        };
        write().map_err(|_| Issue::Storage)?;
        *state = State {
            key: Some(key),
            revision: state.revision + 1,
            ..State::default()
        };
        Ok(state.status())
    }

    pub async fn check(&self, platform: &str) -> Result<KeyStatus, Issue> {
        let platform = if route(platform).is_some() {
            platform
        } else {
            "euw1"
        };
        let revision = self.status().await.revision;
        self.get(
            url(platform, &["lol", "status", "v4", "platform-data"]),
            revision,
            Duration::ZERO,
            true,
        )
        .await?;
        Ok(self.status().await)
    }

    async fn get(
        &self,
        url: Url,
        revision: u64,
        ttl: Duration,
        recheck: bool,
    ) -> Result<Value, Issue> {
        let mut state = self.state.lock().await;
        if state.revision != revision {
            return Err(Issue::KeyChanged);
        }
        let key = state.key.as_ref().ok_or(Issue::MissingKey)?;
        let now = Instant::now();
        if let Some((at, data)) = state.cache.get(&url)
            && now.duration_since(*at) < ttl
        {
            return data.clone().ok_or(Issue::NotFound);
        }
        if state.issue == Some(Issue::InvalidKey) && !recheck {
            return Err(Issue::InvalidKey);
        }
        if state.retry.is_some_and(|until| now < until) {
            return Err(Issue::RateLimited);
        }
        let mut header = HeaderValue::from_str(key).map_err(|_| Issue::InvalidKey)?;
        header.set_sensitive(true);
        if let Some(last_request) = state.last_request {
            let wait = Duration::from_millis(65).saturating_sub(last_request.elapsed());
            tokio::time::sleep(wait).await;
        }
        state.last_request = Some(Instant::now());
        let response = self
            .client
            .get(url.clone())
            .header("X-Riot-Token", header)
            .send()
            .await
            .map_err(|_| Issue::Unavailable)?;
        let issue = match response.status() {
            StatusCode::UNAUTHORIZED | StatusCode::FORBIDDEN => Issue::InvalidKey,
            StatusCode::TOO_MANY_REQUESTS => {
                let seconds = response
                    .headers()
                    .get("Retry-After")
                    .and_then(|v| v.to_str().ok())
                    .and_then(|v| v.parse::<u64>().ok())
                    .unwrap_or(60);
                state.retry = Some(Instant::now() + Duration::from_secs(seconds.clamp(1, 3600)));
                Issue::RateLimited
            }
            StatusCode::NOT_FOUND => Issue::NotFound,
            status if status.is_success() => {
                let data: Value = response.json().await.map_err(|_| Issue::Unavailable)?;
                state.issue = None;
                if !ttl.is_zero() {
                    if state.cache.len() >= 512 {
                        state.cache.clear();
                    }
                    state
                        .cache
                        .insert(url, (Instant::now(), Some(data.clone())));
                }
                return Ok(data);
            }
            _ => Issue::Unavailable,
        };
        if matches!(issue, Issue::RateLimited | Issue::InvalidKey) {
            state.issue = Some(issue);
        }
        if issue == Issue::NotFound && !ttl.is_zero() {
            state.cache.insert(url, (Instant::now(), None));
        }
        Err(issue)
    }

    pub async fn stats(
        &self,
        platform: &str,
        game_name: &str,
        tag_line: &str,
        count: usize,
        revision: u64,
    ) -> Result<Stats, Issue> {
        let region = route(platform).ok_or(Issue::UnsupportedRegion)?;
        let ttl = Duration::from_secs(15 * 60);
        if !valid_part(game_name, 64) || !valid_part(tag_line, 32) {
            return Err(Issue::NotFound);
        }
        // The local client's PUUID is not accepted by the public API.
        let account = self
            .get(
                url(
                    region,
                    &[
                        "riot",
                        "account",
                        "v1",
                        "accounts",
                        "by-riot-id",
                        game_name,
                        tag_line,
                    ],
                ),
                revision,
                ttl,
                false,
            )
            .await?;
        let puuid = account["puuid"]
            .as_str()
            .filter(|value| valid_part(value, 128) && value.is_ascii())
            .ok_or(Issue::NotFound)?;
        let mut stats = Stats::default();
        match self
            .get(
                url(
                    platform,
                    &["lol", "league", "v4", "entries", "by-puuid", puuid],
                ),
                revision,
                ttl,
                false,
            )
            .await
        {
            Ok(data) => {
                stats.rank = data
                    .as_array()
                    .into_iter()
                    .flatten()
                    .find(|p| p["queueType"] == "RANKED_SOLO_5x5")
                    .map(|p| Rank {
                        tier: string(p, "tier"),
                        division: string(p, "rank"),
                        lp: number(p, "leaguePoints"),
                        wins: number(p, "wins"),
                        losses: number(p, "losses"),
                    })
            }
            Err(issue) if matches!(issue, Issue::NotFound | Issue::Unavailable) => {
                stats.issue = Some(issue)
            }
            Err(issue) => return Err(issue),
        }
        let mut ids = url(
            region,
            &["lol", "match", "v5", "matches", "by-puuid", puuid, "ids"],
        );
        ids.query_pairs_mut()
            .append_pair("count", &count.to_string());
        match self.get(ids, revision, ttl, false).await {
            Ok(ids) => {
                for id in ids
                    .as_array()
                    .into_iter()
                    .flatten()
                    .filter_map(Value::as_str)
                    .take(count)
                {
                    let result = self
                        .get(
                            url(region, &["lol", "match", "v5", "matches", id]),
                            revision,
                            Duration::from_secs(3600),
                            false,
                        )
                        .await;
                    match result {
                        Ok(data) => stats.matches.extend(recent(&data["info"], puuid)),
                        Err(issue) => {
                            stats.issue = Some(issue);
                            if !matches!(issue, Issue::NotFound | Issue::Unavailable) {
                                break;
                            }
                        }
                    }
                }
            }
            Err(issue) => stats.issue = Some(issue),
        }
        Ok(stats)
    }
}

fn number(value: &Value, field: &str) -> u64 {
    value[field].as_u64().unwrap_or_default()
}

fn recent(info: &Value, puuid: &str) -> Option<Recent> {
    let players = info["participants"].as_array()?;
    let me = players.iter().find(|p| p["puuid"] == puuid)?;
    let role = string(me, "teamPosition");
    let lane_opponent = if role.is_empty() || info["mapId"] != 11 {
        String::new()
    } else {
        players
            .iter()
            .find(|p| p["teamId"] != me["teamId"] && p["teamPosition"] == role)
            .map_or_else(String::new, |p| string(p, "championName"))
    };
    Some(Recent {
        win: me["win"].as_bool()?,
        kills: number(me, "kills"),
        deaths: number(me, "deaths"),
        assists: number(me, "assists"),
        champion: string(me, "championName"),
        role,
        lane_opponent,
        items: (0..6)
            .map(|i| number(me, &format!("item{i}")))
            .filter(|&id| id > 0)
            .collect(),
        patch: string(info, "gameVersion")
            .split('.')
            .take(2)
            .collect::<Vec<_>>()
            .join("."),
    })
}

pub fn valid_part(value: &str, max: usize) -> bool {
    !value.trim().is_empty()
        && value.chars().count() <= max
        && !value
            .chars()
            .any(|c| c.is_control() || matches!(c, '/' | '\\' | '#' | '?' | '%'))
        && !matches!(value.trim(), "." | "..")
}

#[cfg(windows)]
fn crypt(data: &[u8], encrypt: bool) -> io::Result<Zeroizing<Vec<u8>>> {
    use std::{ptr, slice};
    use windows_sys::Win32::{
        Foundation::LocalFree,
        Security::Cryptography::{
            CRYPT_INTEGER_BLOB, CRYPTPROTECT_UI_FORBIDDEN, CryptProtectData, CryptUnprotectData,
        },
    };
    let input = CRYPT_INTEGER_BLOB {
        cbData: u32::try_from(data.len()).map_err(io::Error::other)?,
        pbData: data.as_ptr().cast_mut(),
    };
    let mut output = CRYPT_INTEGER_BLOB {
        cbData: 0,
        pbData: ptr::null_mut(),
    };
    // DPAPI owns the returned buffer. Copy and clear it before releasing it with LocalFree.
    unsafe {
        let ok = if encrypt {
            CryptProtectData(
                &input,
                ptr::null(),
                ptr::null(),
                ptr::null(),
                ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        } else {
            CryptUnprotectData(
                &input,
                ptr::null_mut(),
                ptr::null(),
                ptr::null(),
                ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        };
        if ok == 0 {
            return Err(io::Error::last_os_error());
        }
        let result = if output.cbData == 0 {
            Zeroizing::new(Vec::new())
        } else {
            let bytes = slice::from_raw_parts_mut(output.pbData, output.cbData as usize);
            let copy = Zeroizing::new(bytes.to_vec());
            use zeroize::Zeroize;
            bytes.zeroize();
            copy
        };
        LocalFree(output.pbData.cast());
        Ok(result)
    }
}

#[cfg(not(windows))]
fn crypt(_: &[u8], _: bool) -> io::Result<Zeroizing<Vec<u8>>> {
    Err(io::Error::from(io::ErrorKind::Unsupported))
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn riot_platform_and_clusters_are_validated() {
        assert_eq!(route("ru"), Some("europe"));
        assert_eq!(route("oc1"), Some("sea"));
        assert_eq!(route("example.com"), None);
        assert!(!valid_part("../puuid", 128));
    }

    #[test]
    fn match_history_finds_only_the_opponent_in_the_same_role() {
        let info = json!({"mapId":11,"gameVersion":"16.23.400.01","participants":[
            {"puuid":"a","teamId":100,"teamPosition":"TOP","championName":"Aatrox","item0":6610,"win":true},
            {"puuid":"b","teamId":100,"teamPosition":"TOP","championName":"Garen"},
            {"puuid":"c","teamId":200,"teamPosition":"TOP","championName":"Renekton"}
        ]});
        let record = recent(&info, "a").unwrap();
        assert_eq!(record.lane_opponent, "Renekton");
        assert_eq!(record.patch, "16.23");
        assert_eq!(record.items, vec![6610]);
    }

    #[cfg(windows)]
    #[test]
    fn dpapi_protects_and_restores_fixture() {
        let plain = b"fixture only";
        let protected = crypt(plain, true).unwrap();
        assert!(!protected.windows(plain.len()).any(|part| part == plain));
        assert_eq!(&*crypt(&protected, false).unwrap(), plain);
    }
}
