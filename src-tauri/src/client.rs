use reqwest::{Client, Url};
use serde::Serialize;
use serde_json::Value;
use std::{collections::BTreeSet, env, fs, path::PathBuf};

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Player {
    pub slot: String,
    pub team: u64,
    pub champion_id: u64,
    pub champion: String,
    pub game_name: String,
    pub tag_line: String,
    pub role: String,
    pub level: Option<u64>,
    pub is_me: bool,
}

#[derive(Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    connected: bool,
    phase: String,
    pub platform: String,
    account: String,
    pub game: Option<Game>,
    draft: Option<Draft>,
    draft_context: Option<u64>,
    #[serde(skip)]
    draft_generation: u64,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Draft {
    role: String,
    my_champion: Option<u64>,
    locked: bool,
    allies: Vec<DraftAlly>,
    enemies: BTreeSet<u64>,
    banned: BTreeSet<u64>,
    pickable: Option<BTreeSet<u64>>,
    duplicate_picks: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DraftAlly {
    champion: u64,
    role: String,
    locked: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Game {
    pub id: String,
    queue: String,
    map: String,
    pub players: Vec<Player>,
}

struct Lockfile {
    port: u16,
    password: String,
}

fn parse_lockfile(value: &str) -> Option<Lockfile> {
    let [process, pid, port, password, protocol] = value
        .trim()
        .split(':')
        .collect::<Vec<_>>()
        .try_into()
        .ok()?;
    if process != "LeagueClient"
        || protocol != "https"
        || pid.parse::<u32>().ok()? == 0
        || password.is_empty()
        || !password
            .bytes()
            .all(|b| b.is_ascii_alphanumeric() || b == b'-' || b == b'_')
    {
        return None;
    }
    let port = port.parse().ok()?;
    (port != 0).then(|| Lockfile {
        port,
        password: password.to_owned(),
    })
}

fn lockfiles() -> Vec<Lockfile> {
    let mut folders = Vec::new();
    if let Some(root) = env::var_os("ProgramData") {
        let riot = PathBuf::from(root).join("Riot Games");
        if let Ok(installs) = fs::read(riot.join("RiotClientInstalls.json"))
            && let Ok(installs) = serde_json::from_slice::<Value>(&installs)
            && let Some(clients) = installs["associated_client"].as_object()
        {
            folders.extend(clients.keys().map(PathBuf::from));
        }
    }
    folders.push(PathBuf::from(r"C:\Riot Games\League of Legends"));
    folders
        .into_iter()
        .filter_map(|dir| fs::read_to_string(dir.join("lockfile")).ok())
        .filter_map(|contents| parse_lockfile(&contents))
        .collect()
}

async fn lcu(client: &Client, lock: &Lockfile, path: &str) -> Option<Value> {
    client
        .get(format!("https://127.0.0.1:{}{path}", lock.port))
        .basic_auth("riot", Some(&lock.password))
        .send()
        .await
        .ok()?
        .error_for_status()
        .ok()?
        .json()
        .await
        .ok()
}

pub fn string(value: &Value, key: &str) -> String {
    value[key].as_str().unwrap_or_default().to_owned()
}

fn riot_id(value: &Value) -> (String, String) {
    for key in ["riotId", "summonerName"] {
        if let Some((name, tag)) = value[key].as_str().and_then(|value| value.rsplit_once('#')) {
            return (name.to_owned(), tag.to_owned());
        }
    }
    for (name, tag) in [("riotIdGameName", "riotIdTagLine"), ("gameName", "tagLine")] {
        if !string(value, name).is_empty() {
            return (string(value, name), string(value, tag));
        }
    }
    (string(value, "summonerName"), String::new())
}

fn platform(value: &str) -> String {
    match value.to_ascii_uppercase().as_str() {
        "RU" => "ru",
        "EUW" | "EUW1" => "euw1",
        "EUNE" | "EUN" | "EUN1" => "eun1",
        "NA" | "NA1" => "na1",
        "KR" => "kr",
        "JP" | "JP1" => "jp1",
        "BR" | "BR1" => "br1",
        "LAN" | "LA1" => "la1",
        "LAS" | "LA2" => "la2",
        "OCE" | "OC1" => "oc1",
        "TR" | "TR1" => "tr1",
        "ME" | "ME1" => "me1",
        "PH" | "PH2" => "ph2",
        "SG" | "SEA" | "SG2" => "sg2",
        "TH" | "TH2" => "th2",
        "TW" | "TW2" => "tw2",
        "VN" | "VN2" => "vn2",
        _ => "",
    }
    .to_owned()
}

fn session_players(session: &Value, me: &Value) -> Vec<Player> {
    let mut players = Vec::new();
    let (my_name, my_tag) = riot_id(me);
    for (team, field) in [(100, "teamOne"), (200, "teamTwo")] {
        if let Some(roster) = session["gameData"][field].as_array() {
            for (index, row) in roster.iter().enumerate() {
                let (mut game_name, mut tag_line) = riot_id(row);
                let puuid = string(row, "puuid");
                let is_me = (!puuid.is_empty() && me["puuid"].as_str() == Some(&puuid))
                    || (row["summonerId"].as_u64().is_some_and(|id| id != 0)
                        && row["summonerId"] == me["summonerId"])
                    || (!tag_line.is_empty() && game_name == my_name && tag_line == my_tag);
                if is_me && tag_line.is_empty() {
                    game_name.clone_from(&my_name);
                    tag_line.clone_from(&my_tag);
                }
                players.push(Player {
                    slot: format!("{team}-{index}"),
                    team,
                    champion_id: row["championId"].as_u64().unwrap_or_default(),
                    game_name,
                    tag_line,
                    is_me,
                    role: string(row, "selectedPosition"),
                    ..Player::default()
                });
            }
        }
    }
    players
}

fn live_players(live: &Value, session: &[Player], me: &Value) -> Vec<Player> {
    let active_name = riot_id(&live["activePlayer"]);
    let me_name = riot_id(me);
    let mut used = Vec::new();
    live["allPlayers"]
        .as_array()
        .into_iter()
        .flatten()
        .enumerate()
        .map(|(i, row)| {
            let (mut game_name, mut tag_line) = riot_id(row);
            let team = if row["team"] == "ORDER" { 100 } else { 200 };
            let raw = string(row, "rawChampionName");
            let champion = raw
                .strip_prefix("game_character_displayname_")
                .unwrap_or(&raw)
                .to_owned();
            let same_id = |p: &Player| {
                !tag_line.is_empty() && p.game_name == game_name && p.tag_line == tag_line
            };
            let matched = session
                .iter()
                .find(|p| p.team == team && !used.contains(&p.slot) && same_id(p));
            let is_me = matched.is_some_and(|p| p.is_me)
                || (!game_name.is_empty()
                    && [
                        (active_name.0.as_str(), active_name.1.as_str()),
                        (me_name.0.as_str(), me_name.1.as_str()),
                    ]
                    .contains(&(game_name.as_str(), tag_line.as_str())));
            if let Some(p) = matched {
                used.push(p.slot.clone());
            }
            if is_me && tag_line.is_empty() && !me_name.1.is_empty() {
                game_name.clone_from(&me_name.0);
                tag_line.clone_from(&me_name.1);
            }
            let role = string(row, "position");
            Player {
                slot: matched.map_or_else(|| format!("live-{team}-{i}"), |p| p.slot.clone()),
                team,
                champion,
                champion_id: matched.map_or(0, |p| p.champion_id),
                game_name,
                tag_line,
                role: if role.is_empty() {
                    matched.map_or(role, |p| p.role.clone())
                } else {
                    role
                },
                level: row["level"].as_u64(),
                is_me,
            }
        })
        .collect()
}

fn champion_id(value: &Value) -> Option<u64> {
    value.as_u64().filter(|&id| id > 0)
}

fn parse_draft(session: &Value, pickable: &Value) -> Option<Draft> {
    if session["isSpectating"] == true {
        return None;
    }
    let players = session["myTeam"].as_array()?;
    let my_cell = session["localPlayerCellId"].as_u64()?;
    let me = players.iter().find(|player| player["cellId"] == my_cell)?;
    let finalizing = session["timer"]["phase"] == "FINALIZATION";
    let their_team = session["theirTeam"]
        .as_array()
        .map_or(&[][..], Vec::as_slice);
    let mut locked_cells = BTreeSet::new();
    let mut enemies = BTreeSet::new();
    for action in session["actions"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|turn| turn.as_array().into_iter().flatten())
    {
        if action["type"] != "pick" || action["completed"] != true {
            continue;
        }
        let Some(cell) = action["actorCellId"].as_u64() else {
            continue;
        };
        let is_enemy = action["isAllyAction"].as_bool().map_or_else(
            || their_team.iter().any(|player| player["cellId"] == cell),
            |is_ally| !is_ally,
        );
        if is_enemy {
            enemies.extend(champion_id(&action["championId"]));
        } else {
            locked_cells.insert(cell);
        }
    }
    if finalizing {
        enemies.extend(
            their_team
                .iter()
                .filter_map(|player| champion_id(&player["championId"])),
        );
    }
    let ally_champion = |player: &Value| {
        champion_id(&player["championId"]).or_else(|| champion_id(&player["championPickIntent"]))
    };
    let is_locked = |player: &Value| {
        champion_id(&player["championId"]).is_some()
            && (finalizing
                || player["cellId"]
                    .as_u64()
                    .is_some_and(|cell| locked_cells.contains(&cell)))
    };
    let allies = players
        .iter()
        .filter(|player| player["cellId"] != my_cell)
        .filter_map(|player| {
            Some(DraftAlly {
                champion: ally_champion(player)?,
                role: string(player, "assignedPosition"),
                locked: is_locked(player),
            })
        })
        .collect();
    let bans = &session["bans"];
    let banned = ["myTeamBans", "theirTeamBans"]
        .into_iter()
        .flat_map(|key| bans[key].as_array().into_iter().flatten())
        .filter_map(champion_id)
        .collect();
    Some(Draft {
        role: string(me, "assignedPosition"),
        my_champion: ally_champion(me),
        locked: is_locked(me),
        allies,
        enemies,
        banned,
        pickable: pickable
            .as_array()
            .map(|ids| ids.iter().filter_map(champion_id).collect()),
        duplicate_picks: session["allowDuplicatePicks"] == true,
    })
}

pub async fn snapshot(client: &Client, previous: &Snapshot) -> Snapshot {
    let mut state = Snapshot {
        phase: "Disconnected".into(),
        draft_generation: previous.draft_generation,
        ..Snapshot::default()
    };
    let mut session = Value::Null;
    let mut me = Value::Null;
    for lock in lockfiles() {
        let Some(phase) = lcu(client, &lock, "/lol-gameflow/v1/gameflow-phase").await else {
            continue;
        };
        state.connected = true;
        state.phase = phase.as_str().unwrap_or("None").to_owned();
        me = lcu(client, &lock, "/lol-summoner/v1/current-summoner")
            .await
            .unwrap_or_default();
        state.account = riot_id(&me).0;
        let region = lcu(client, &lock, "/riotclient/region-locale")
            .await
            .unwrap_or_default();
        state.platform = platform(&string(&region, "region"));
        if state.phase == "ChampSelect" {
            if previous.phase != "ChampSelect" {
                state.draft_generation += 1;
            }
            state.draft_context = Some(state.draft_generation);
            if let Some(draft) = lcu(client, &lock, "/lol-champ-select/v1/session").await {
                let pickable =
                    lcu(client, &lock, "/lol-champ-select/v1/pickable-champion-ids").await;
                state.draft = parse_draft(&draft, pickable.as_ref().unwrap_or(&Value::Null));
            }
        } else if matches!(
            state.phase.as_str(),
            "GameStart" | "InProgress" | "Reconnect"
        ) {
            session = lcu(client, &lock, "/lol-gameflow/v1/session")
                .await
                .unwrap_or_default();
        }
        break;
    }
    if !state.connected
        || matches!(
            state.phase.as_str(),
            "GameStart" | "InProgress" | "Reconnect"
        )
    {
        let live = live_data(client).await;
        let mut players = session_players(&session, &me);
        let live_roster = live_players(&live, &players, &me);
        if !live_roster.is_empty() {
            state.phase = "InProgress".into();
            players = live_roster;
        }
        if !players.is_empty() {
            let data = &session["gameData"];
            let id = data["gameId"].as_u64().filter(|&id| id > 0).map_or_else(
                || {
                    players
                        .iter()
                        .map(|p| format!("{}#{}", p.game_name, p.tag_line))
                        .collect::<Vec<_>>()
                        .join("|")
                },
                |id| id.to_string(),
            );
            let queue = match data["queue"]["id"].as_u64() {
                Some(420) => "Ранговая · Solo/Duo".into(),
                Some(440) => "Ранговая · Flex".into(),
                Some(450) => "ARAM".into(),
                _ if live["gameData"]["gameMode"] == "ARAM" => "ARAM".into(),
                _ => "Активная игра".into(),
            };
            let map = match live["gameData"]["mapNumber"]
                .as_u64()
                .or_else(|| data["queue"]["mapId"].as_u64())
            {
                Some(11) => "Ущелье призывателей",
                Some(12) => "Воющая бездна",
                _ => "League of Legends",
            }
            .into();
            state.game = Some(Game {
                id,
                queue,
                map,
                players,
            });
        }
    }
    if matches!(
        state.phase.as_str(),
        "GameStart" | "InProgress" | "Reconnect"
    ) && (previous.phase == "ChampSelect"
        || previous
            .game
            .as_ref()
            .is_none_or(|old| state.game.as_ref().is_none_or(|new| old.id == new.id)))
    {
        state.draft_context = previous.draft_context;
    }
    state
}

async fn live_data(client: &Client) -> Value {
    let url = Url::parse("https://127.0.0.1:2999/liveclientdata/allgamedata").expect("static URL");
    if let Ok(response) = client.get(url).send().await
        && let Ok(response) = response.error_for_status()
    {
        return response.json().await.unwrap_or_default();
    }
    Value::Null
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn lockfile_requires_loopback_port_credentials_and_https() {
        assert_eq!(
            parse_lockfile("LeagueClient:22:53421:fixture_token:https")
                .unwrap()
                .port,
            53421
        );
        assert!(parse_lockfile("LeagueClient:22:53421:fixture_token:http").is_none());
        assert!(parse_lockfile("LeagueClient:22:localhost:fixture_token:https").is_none());
    }

    #[test]
    fn live_roster_preserves_confirmed_identity_and_team() {
        let me = json!({"gameName":"Alpha","tagLine":"RU1","puuid":"fixture"});
        let session = json!({"gameData":{"teamOne":[{"riotId":"Alpha#RU1","championId":266,"puuid":"fixture"}]}});
        let live = json!({"allPlayers":[{"team":"ORDER","riotIdGameName":"Alpha","riotIdTagLine":"RU1","rawChampionName":"game_character_displayname_Aatrox","position":"TOP"}]});
        let players = live_players(&live, &session_players(&session, &me), &me);
        assert_eq!(players[0].champion_id, 266);
        assert_eq!(players[0].champion, "Aatrox");
        assert_eq!(players[0].team, 100);
        assert!(players[0].is_me);
    }

    #[test]
    fn draft_exposes_confirmed_enemy_picks_and_visible_ally_intents() {
        let session = json!({
            "localPlayerCellId": 1,
            "myTeam": [
                {"cellId": 1, "assignedPosition": "utility", "championId": 0},
                {"cellId": 2, "assignedPosition": "bottom", "championPickIntent": 222},
                {"cellId": 3, "championId": 59}
            ],
            "theirTeam": [{"cellId": 5, "championId": 111}],
            "bans": {"myTeamBans": [89, -1], "theirTeamBans": [53, 89]},
            "actions": [[
                {"actorCellId": 3, "type": "pick", "completed": true, "isAllyAction": true, "championId": 59},
                {"actorCellId": 5, "type": "pick", "completed": false, "isAllyAction": false, "championId": 111},
                {"actorCellId": 6, "type": "pick", "completed": true, "isAllyAction": false, "championId": 51}
            ]]
        });
        let draft = parse_draft(&session, &json!([25, 40, 0])).unwrap();
        assert_eq!(draft.role, "utility");
        assert_eq!(draft.enemies, BTreeSet::from([51]));
        assert_eq!(draft.banned, BTreeSet::from([53, 89]));
        assert_eq!(draft.pickable.unwrap(), BTreeSet::from([25, 40]));
        assert!(!draft.allies[0].locked);
        assert!(draft.allies[1].locked);
        assert_eq!(draft.allies[0].champion, 222);
    }
}
