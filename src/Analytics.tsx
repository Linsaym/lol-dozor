import { useState, type MouseEventHandler } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  CircleHelp,
  Clock3,
  Crosshair,
  ExternalLink,
  Gem,
  Layers3,
  Play,
  Shield,
  Swords,
  Target,
  TrendingUp,
} from "lucide-react";
import {
  championFor,
  gameImage,
  useSpells,
  type Catalog,
  type Champion,
} from "./catalog";
import { demoMatchup } from "./demo";
import {
  normalizeRole,
  percentage,
  profileUrl,
  roles,
  tiers,
  youtubeUrl,
  type Match,
  type Player,
  type Stats,
} from "./game";

export type LinkHandler = MouseEventHandler<HTMLAnchorElement>;

interface AnalyticsProps {
  game: Match;
  stats: Record<string, Stats>;
  loading: boolean;
  catalog: Catalog;
  platform: string;
  demo: boolean;
  onLink: LinkHandler;
  initialOpponent?: number;
}

export function Portrait({
  champion,
  catalog,
  demo,
}: {
  champion?: Champion;
  catalog: Catalog;
  demo: boolean;
}) {
  const [broken, setBroken] = useState("");
  const url = champion
    ? gameImage(catalog.patch, "champion", `${champion.id}.png`, demo)
    : "";
  return (
    <span className="portrait">
      {url && broken !== url ? (
        <img src={url} alt="" loading="lazy" onError={() => setBroken(url)} />
      ) : (
        <Shield size={17} />
      )}
    </span>
  );
}

function Team({
  players,
  stats,
  loading,
  catalog,
  platform,
  demo,
  onLink,
  allied,
}: Omit<AnalyticsProps, "game"> & { players: Player[]; allied: boolean }) {
  return (
    <section className={`team-card ${allied ? "allied" : "enemy"}`}>
      <div className="team-heading">
        <span className="team-symbol">
          {allied ? <Shield size={17} /> : <Swords size={17} />}
        </span>
        <h3>{allied ? "Союзники" : "Противники"}</h3>
        <span className="team-count">{players.length} игроков</span>
      </div>
      {players.length ? (
        <table className="roster">
          <thead>
            <tr>
              <th scope="col">Игрок</th>
              <th scope="col" title="Ранг Solo/Duo">
                Ранг
              </th>
              <th scope="col" title="Доля побед в Solo/Duo">
                WR
              </th>
              <th
                scope="col"
                className="kda-col"
                title="KDA по последним матчам"
              >
                KDA
              </th>
              <th scope="col">Форма</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => {
              const champion = championFor(catalog, player);
              const url = profileUrl(platform, player.gameName, player.tagLine);
              const role = normalizeRole(player.role);
              const rank = stats[player.slot]?.rank;
              const history = stats[player.slot]?.matches.slice(0, 5) ?? [];
              const totals = history.reduce(
                (sum, game) => [
                  sum[0] + game.kills + game.assists,
                  sum[1] + game.deaths,
                ],
                [0, 0],
              );
              const wr = rank
                ? percentage(rank.wins, rank.wins + rank.losses)
                : "—";
              return (
                <tr
                  key={player.slot}
                  className={player.isMe ? "my-row" : undefined}
                >
                  <td>
                    <div className="player">
                      <Portrait
                        champion={champion}
                        catalog={catalog}
                        demo={demo}
                      />
                      <div className="player-copy">
                        <div className="player-id">
                          {url ? (
                            <a
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              onClick={onLink}
                              aria-label={`${player.gameName}#${player.tagLine} · LeagueOfGraphs`}
                            >
                              <span>{player.gameName}</span>
                              <span className="tag">#{player.tagLine}</span>
                              <ArrowUpRight size={11} aria-hidden="true" />
                            </a>
                          ) : (
                            <span>{player.gameName || "Игрок"}</span>
                          )}
                          {player.isMe && <span className="you">ВЫ</span>}
                        </div>
                        <div className="player-sub">
                          {champion?.name ?? "Чемпион скрыт"}
                          {role ? ` · ${roles[role]}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {rank ? (
                      <span
                        className="rank"
                        title={`${tiers[rank.tier] ?? rank.tier} ${rank.division} · ${rank.lp} LP`}
                      >
                        <Gem
                          className={`tier-${rank.tier.toLowerCase()}`}
                          size={13}
                        />
                        <span>
                          {tiers[rank.tier] ?? rank.tier} {rank.division}
                        </span>
                      </span>
                    ) : (
                      <span className="muted">
                        {loading && !stats[player.slot] ? "…" : "—"}
                      </span>
                    )}
                  </td>
                  <td
                    className={
                      rank && rank.wins > rank.losses
                        ? "positive numeric"
                        : "numeric"
                    }
                  >
                    {wr}
                  </td>
                  <td className="kda-col numeric">
                    {history.length
                      ? (totals[0] / Math.max(1, totals[1])).toFixed(1)
                      : "—"}
                  </td>
                  <td className="form-cell">
                    {history.length ? (
                      <div
                        className="form-dots"
                        aria-label={`Последние игры: ${history.map((game) => (game.win ? "победа" : "поражение")).join(", ")}`}
                      >
                        {history.map((game, index) => (
                          <span
                            key={index}
                            className={game.win ? "win" : "loss"}
                            title={game.win ? "Победа" : "Поражение"}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="empty-team">Клиент ещё не передал состав команды.</p>
      )}
    </section>
  );
}

function Matchup({
  game,
  stats,
  catalog,
  demo,
  onLink,
  loading,
  initialOpponent,
}: Omit<AnalyticsProps, "platform">) {
  const me = game.players.find((p) => p.isMe);
  const opponents = game.players.filter(
    (p) => p.team !== me?.team && Boolean(p.champion || p.championId),
  );
  const myRole = normalizeRole(me?.role ?? "");
  const inferred = opponents.find(
    (p) => myRole && normalizeRole(p.role) === myRole,
  );
  const fromDraft =
    me && initialOpponent !== undefined
      ? opponents.find(
          (player) => championFor(catalog, player)?.key === initialOpponent,
        )
      : undefined;
  const [selection, setSelection] = useState({ gameId: "", slot: "" });
  const opponent =
    (selection.gameId === game.id &&
      opponents.find((p) => p.slot === selection.slot)) ||
    fromDraft ||
    inferred;
  const ours = championFor(catalog, me);
  const theirs = championFor(catalog, opponent || undefined);
  const {
    spells,
    loading: spellsLoading,
    offline,
  } = useSpells(catalog.patch, theirs?.id ?? "", demo);
  const ownGames = me ? (stats[me.slot]?.matches ?? []) : [];
  const sameChamp = ownGames.filter(
    (record) =>
      record.champion === ours?.id &&
      record.role &&
      (!myRole || record.role === myRole),
  );
  const direct = sameChamp.filter(
    (record) => record.laneOpponent === theirs?.id,
  );
  const wins = direct.filter((record) => record.win).length;
  const exactBuild = direct.some(
    (record) => record.win && record.items.some((item) => catalog.items[item]),
  );
  const counts = new Map<number, number>();
  for (const record of exactBuild ? direct : sameChamp) {
    if (record.win) {
      for (const item of new Set(record.items)) {
        if (catalog.items[item]) counts.set(item, (counts.get(item) ?? 0) + 1);
      }
    }
  }
  const ratedDemo = demo && theirs?.id === "Renekton";
  const items =
    demo && theirs
      ? demoMatchup.build
      : [...counts]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([item]) => item);
  const rate = ratedDemo
    ? percentage(demoMatchup.wins, demoMatchup.games)
    : percentage(wins, direct.length);
  const youtube = ours && theirs ? youtubeUrl(ours.id, theirs.id) : null;
  return (
    <section className="matchup">
      <div className="section-heading">
        <div className="section-title">
          <Crosshair size={21} />
          <h2>Матчап на линии</h2>
        </div>
        {me && opponents.length > 0 && (
          <label className="opponent-picker">
            <span>Соперник</span>
            <select
              aria-label="Соперник"
              value={opponent ? opponent.slot : ""}
              onChange={(event) =>
                setSelection({ gameId: game.id, slot: event.target.value })
              }
            >
              <option value="" disabled>
                Выберите чемпиона
              </option>
              {opponents.map((p) => (
                <option key={p.slot} value={p.slot}>
                  {championFor(catalog, p)?.name ?? p.gameName}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </label>
        )}
      </div>
      {!ours || !theirs ? (
        <div className="panel matchup-empty">
          <CircleHelp size={22} />
          <p>
            {ours
              ? "Выберите чемпиона противника, чтобы открыть сравнение."
              : "Ждём, пока клиент определит вашего чемпиона."}
          </p>
        </div>
      ) : (
        <>
          <div className="duel panel">
            <div className="duel-art duel-art-left">
              <img
                src={gameImage(catalog.patch, "splash", ours.id, demo)}
                alt=""
              />
            </div>
            <div className="duel-art duel-art-right">
              <img
                src={gameImage(catalog.patch, "splash", theirs.id, demo)}
                alt=""
              />
            </div>
            <div className="duel-content">
              <div className="duel-champion">
                <Portrait champion={ours} catalog={catalog} demo={demo} />
                <div>
                  <small>ВАШ ЧЕМПИОН</small>
                  <strong>{ours.name}</strong>
                </div>
              </div>
              <span className="versus">
                <Swords size={19} />
                <span>VS</span>
              </span>
              <div className="duel-champion">
                <Portrait champion={theirs} catalog={catalog} demo={demo} />
                <div>
                  <small>СОПЕРНИК</small>
                  <strong>{theirs.name}</strong>
                </div>
              </div>
            </div>
            {youtube && (
              <a
                className="button secondary youtube"
                href={youtube}
                target="_blank"
                rel="noreferrer"
                onClick={onLink}
              >
                <Play size={15} /> МАТЧАП НА YOUTUBE <ExternalLink size={13} />
              </a>
            )}
          </div>
          <div className="matchup-metrics">
            <div className="panel metric">
              <div className="panel-label">
                <TrendingUp size={17} /> ВИНРЕЙТ МАТЧАПА
              </div>
              <strong className={rate === "—" ? "" : "positive"}>{rate}</strong>
              <p>
                {ratedDemo
                  ? "1 324 игры · демо-выборка"
                  : direct.length
                    ? `${wins} из ${direct.length} · ваша недавняя история`
                    : loading
                      ? "Загружаем историю…"
                      : "Нет игр с этим соперником в выборке."}
              </p>
            </div>
            <div className="panel build">
              <div className="panel-label">
                <Layers3 size={17} /> РЕКОМЕНДУЕМЫЙ БИЛД
              </div>
              {items.length ? (
                <>
                  <div className="item-list">
                    {items.map((item) => (
                      <span
                        className="item"
                        key={item}
                        title={catalog.items[item]}
                      >
                        <img
                          src={gameImage(
                            catalog.patch,
                            "item",
                            `${item}.png`,
                            demo,
                          )}
                          alt={catalog.items[item]}
                        />
                      </span>
                    ))}
                  </div>
                  <p>
                    {demo
                      ? "Пример сборки"
                      : exactBuild
                        ? "Частые предметы из ваших побед в этом матчапе"
                        : "Частые предметы из ваших побед на чемпионе"}
                  </p>
                </>
              ) : (
                <p>
                  {loading
                    ? "Загружаем историю…"
                    : "Для рекомендации нужны победы на этом чемпионе."}
                </p>
              )}
            </div>
          </div>
          <div className="panel abilities">
            <div className="abilities-heading">
              <h3>Способности · {theirs.name}</h3>
              <span>
                <Clock3 size={14} /> Перезарядка на 1-м ранге
              </span>
            </div>
            {offline && (
              <p className="muted">Сохранённые данные Data Dragon.</p>
            )}
            {spells ? (
              <div className="spells-grid">
                {spells.map((spell, index) => (
                  <article className="spell" key={spell.image}>
                    <div className="spell-head">
                      <span className="spell-icon">
                        <img
                          src={gameImage(
                            catalog.patch,
                            "spell",
                            spell.image,
                            demo,
                          )}
                          alt=""
                        />
                        <kbd>{"QWER"[index]}</kbd>
                      </span>
                      <div>
                        <strong>{spell.name}</strong>
                        <span className="spell-cd">
                          {spell.cooldown === null
                            ? "КД зависит от условий"
                            : `${spell.cooldown} сек.`}
                        </span>
                      </div>
                    </div>
                    <p>
                      {spell.description
                        .replace(/<br\s*\/?\s*>/gi, " ")
                        .replace(/<[^>]*>/g, "")}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted">
                {spellsLoading
                  ? "Загружаем способности…"
                  : "Data Dragon не передал способности этого чемпиона."}
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default function Analytics(props: AnalyticsProps) {
  const { game, catalog, demo, loading } = props;
  const me = game.players.find((p) => p.isMe);
  const champion = championFor(catalog, me);
  const alliedTeam = me?.team ?? game.players[0]?.team;
  return (
    <>
      <header className="match-hero">
        {champion && (
          <img
            src={gameImage(catalog.patch, "splash", champion.id, demo)}
            alt=""
          />
        )}
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="status-dot" />{" "}
            {demo ? "ДЕМОНСТРАЦИОННЫЙ МАТЧ" : "МАТЧ ОБНАРУЖЕН"}
          </div>
          <h1>Аналитика матча</h1>
          <p>
            {game.queue} <span> / </span> {game.map}
          </p>
        </div>
      </header>
      <section className="lineups" aria-label="Составы команд">
        <div className="section-heading">
          <div className="section-title">
            <Target size={20} />
            <h2>Составы команд</h2>
          </div>
          <span className="section-note">
            {loading
              ? "Обновляем статистику…"
              : demo
                ? "ПРИМЕР СТАТИСТИКИ"
                : "RIOT API · SOLO/DUO"}
          </span>
        </div>
        <div className="team-grid">
          <Team
            {...props}
            players={game.players.filter((p) => p.team === alliedTeam)}
            allied
          />
          <Team
            {...props}
            players={game.players.filter((p) => p.team !== alliedTeam)}
            allied={false}
          />
        </div>
      </section>
      <Matchup key={game.id} {...props} />
    </>
  );
}
