import { invoke, isTauri } from "@tauri-apps/api/core";

export type Issue =
  | "missingKey"
  | "invalidKey"
  | "rateLimited"
  | "unavailable"
  | "notFound"
  | "unsupportedRegion"
  | "storage"
  | "keyChanged";

export interface Player {
  slot: string;
  team: number;
  championId: number;
  champion: string;
  gameName: string;
  tagLine: string;
  role: string;
  level?: number;
  isMe: boolean;
}

export interface Match {
  id: string;
  queue: string;
  map: string;
  players: Player[];
}

export interface Snapshot {
  phase: string;
  connected: boolean;
  platform: string;
  account: string;
  game: Match | null;
  draft?: DraftState | null;
  draftContext?: number | null;
}

export interface DraftState {
  role: string;
  myChampion: number | null;
  locked: boolean;
  allies: { champion: number; role: string; locked: boolean }[];
  enemies: number[];
  banned: number[];
  pickable: number[] | null;
  duplicatePicks: boolean;
}

export interface Rank {
  tier: string;
  division: string;
  lp: number;
  wins: number;
  losses: number;
}

export interface Recent {
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  champion: string;
  role: string;
  laneOpponent: string;
  items: number[];
  patch: string;
}

export interface Stats {
  rank: Rank | null;
  matches: Recent[];
  issue?: Issue | null;
}

export interface KeyStatus {
  configured: boolean;
  revision: number;
  issue?: Issue | null;
}

export const issueText: Record<Issue, string> = {
  missingKey: "Добавьте ключ Riot API в настройках.",
  invalidKey:
    "Ключ Riot API недействителен или истёк. Замените его в настройках.",
  rateLimited: "Riot API ограничил запросы. Повторите попытку позже.",
  unavailable:
    "Не удалось получить ответ. Проверьте подключение и попробуйте снова.",
  notFound: "В Riot API нет доступных данных об игроке или игре.",
  unsupportedRegion: "Не удалось определить регион Riot для статистики.",
  storage: "Windows не смогла прочитать или сохранить защищённый ключ.",
  keyChanged: "Ключ изменился. Обновите статистику.",
};

export function errorText(error: unknown) {
  return typeof error === "string" &&
    Object.prototype.hasOwnProperty.call(issueText, error)
    ? issueText[error as Issue]
    : issueText.unavailable;
}

export const desktop = isTauri();
export const getSnapshot = () => invoke<Snapshot>("client_snapshot");
export const getKeyStatus = () => invoke<KeyStatus>("key_status");
export const saveKey = (key: string) => invoke<KeyStatus>("save_key", { key });
export const checkKey = () => invoke<KeyStatus>("check_key");
export const getStats = (gameId: string, slot: string, revision: number) =>
  invoke<Stats>("player_stats", { gameId, slot, revision });

const graphRegions: Record<string, string> = {
  ru: "ru",
  euw1: "euw",
  eun1: "eune",
  na1: "na",
  kr: "kr",
  jp1: "jp",
  br1: "br",
  la1: "lan",
  la2: "las",
  oc1: "oce",
  tr1: "tr",
  me1: "me",
  ph2: "sg",
  sg2: "sg",
  th2: "sg",
  tw2: "tw",
  vn2: "vn",
};

export function profileUrl(
  platform: string,
  gameName: string,
  tagLine: string,
) {
  const region = graphRegions[platform];
  if (!region || !gameName.trim() || !tagLine.trim()) return null;
  const segment = (value: string) =>
    encodeURIComponent(value.trim()).replace(/%20/g, "+").replace(/-/g, "%2D");
  return `https://www.leagueofgraphs.com/ru/summoner/${region}/${segment(gameName)}-${segment(tagLine)}/last-30-days`;
}

export function youtubeUrl(ours: string, opponent: string) {
  return `https://www.youtube.com/results?${new URLSearchParams({
    search_query: `${ours} vs ${opponent}`,
  })}`;
}

export function openReference(url: string) {
  return invoke<void>("open_reference", { url });
}

export const roles = {
  TOP: "Топ",
  JUNGLE: "Лес",
  MIDDLE: "Мид",
  BOTTOM: "Бот",
  UTILITY: "Поддержка",
};

export type Position = keyof typeof roles;

export function normalizeRole(role: string): Position | "" {
  const upper = role.toUpperCase();
  if (upper === "MID") return "MIDDLE";
  if (upper === "BOT" || upper === "ADC") return "BOTTOM";
  if (upper === "SUPPORT" || upper === "SUP") return "UTILITY";
  return Object.prototype.hasOwnProperty.call(roles, upper)
    ? (upper as Position)
    : "";
}

export const tiers: Record<string, string> = {
  IRON: "Железо",
  BRONZE: "Бронза",
  SILVER: "Серебро",
  GOLD: "Золото",
  PLATINUM: "Платина",
  EMERALD: "Изумруд",
  DIAMOND: "Алмаз",
  MASTER: "Мастер",
  GRANDMASTER: "Грандмастер",
  CHALLENGER: "Претендент",
};

export function percentage(wins: number, total: number) {
  return total ? `${Math.round((wins / total) * 100)}%` : "—";
}
