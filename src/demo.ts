import type { DraftState, Match, Player, Recent, Stats } from "./game";
import { demoCatalog } from "./catalog";

const lineup = [
  [100, "Aatrox", "Iron Warden", "TOP", "DIAMOND", "II", 57, 218, 5.4],
  [100, "Viego", "Ghost Circuit", "JUNGLE", "DIAMOND", "III", 54, 184, 4.3],
  [100, "Ahri", "Neon Fox", "MIDDLE", "EMERALD", "I", 55, 156, 3.7],
  [100, "Kaisa", "Void Signal", "BOTTOM", "DIAMOND", "IV", 52, 243, 3.1],
  [100, "Nautilus", "Anchor Point", "UTILITY", "EMERALD", "I", 53, 131, 3.9],
  [200, "Renekton", "Copper Fang", "TOP", "DIAMOND", "II", 56, 208, 3.2],
  [200, "LeeSin", "Blind Pulse", "JUNGLE", "DIAMOND", "III", 51, 170, 3.5],
  [200, "Syndra", "Null Sphere", "MIDDLE", "DIAMOND", "IV", 53, 142, 3.1],
  [200, "Jinx", "Static Bloom", "BOTTOM", "EMERALD", "I", 54, 161, 3.7],
  [200, "Thresh", "Chain Relay", "UTILITY", "EMERALD", "II", 50, 124, 2.7],
] as const;

const records = [
  "11011",
  "10101",
  "01100",
  "10111",
  "11001",
  "11010",
  "01011",
  "10010",
  "11101",
  "00110",
];
const build = [6610, 3047, 6333, 3053, 3026];
const patch = demoCatalog.patch.split(".").slice(0, 2).join(".");

export const demoMatch: Match = {
  id: "demo",
  queue: "Ранговая · Solo/Duo",
  map: "Ущелье призывателей",
  players: lineup.map(([team, champion, gameName, role], index): Player => ({
    slot: `demo-${index}`,
    team,
    championId: demoCatalog.champions.find((data) => data.id === champion)!.key,
    champion,
    gameName,
    tagLine: "RU1",
    role,
    isMe: index === 0,
  })),
};

export const demoDraft: DraftState = {
  role: "TOP",
  myChampion: null,
  locked: false,
  allies: demoMatch.players
    .filter((player) => player.team === 100 && !player.isMe)
    .map(({ championId, role }) => ({
      champion: championId,
      role,
      locked: true,
    })),
  enemies: demoMatch.players
    .filter((player) => player.team === 200)
    .slice(0, 2)
    .map((player) => player.championId),
  banned: [122, 24],
  pickable: null,
  duplicatePicks: false,
};

export const demoStats = Object.fromEntries(
  lineup.map(
    (
      [, champion, , role, tier, division, rate, games, kda],
      index,
    ): [string, Stats] => {
      const wins = Math.round((rate / 100) * games);
      return [
        `demo-${index}`,
        {
          rank: {
            tier,
            division,
            wins,
            losses: games - wins,
            lp: [68, 42, 19, 76, 55][index % 5],
          },
          matches: [...records[index]].map((result, game): Recent => ({
            win: result === "1",
            kills: Math.round(2 * kda) - (game % 3),
            deaths: 3 + (game % 3),
            assists: Math.round(2 * kda) + (game % 3),
            role,
            champion,
            laneOpponent: index === 0 && game < 2 ? "Renekton" : "",
            items: index === 0 ? build : [],
            patch,
          })),
        },
      ];
    },
  ),
);

export const demoMatchup = {
  wins: 686,
  games: 1324,
  build,
};
