import { useEffect, useState, type FormEvent } from "react";
import {
  Activity,
  ArrowRight,
  AudioLines,
  Check,
  ChevronRight,
  CircleAlert,
  Crosshair,
  ExternalLink,
  FlaskConical,
  Gamepad2,
  Gauge,
  KeyRound,
  Layers3,
  LayoutDashboard,
  ListOrdered,
  LockKeyhole,
  PanelTop,
  Radio,
  ScanLine,
  Settings2,
  Shield,
  Swords,
  Unplug,
} from "lucide-react";
import Analytics, { type LinkHandler } from "./Analytics";
import { demoCatalog, gameImage, useCatalog } from "./catalog";
import { demoDraft, demoMatch, demoStats } from "./demo";
import Draft, { type DraftSelection } from "./Draft";
import {
  checkKey,
  desktop,
  errorText,
  getKeyStatus,
  issueText,
  openReference,
  saveKey,
  type KeyStatus,
} from "./game";
import { useLeagueClient, useMatchStats } from "./live";
import "./App.css";

type Page = "overview" | "draft" | "analytics" | "settings";

const routes = [
  { page: "overview", label: "Обзор", icon: LayoutDashboard },
  { page: "draft", label: "Драфт", icon: Layers3 },
  { page: "analytics", label: "Аналитика", icon: Swords },
  { page: "settings", label: "Настройки", icon: Settings2 },
] as const;

const emptyDraft: DraftSelection = { opponent: null, ally: null };
const demoDraftSelection: DraftSelection = {
  opponent: demoDraft.enemies[0],
  ally: demoDraft.allies[0].champion,
};

const phases: Record<string, string> = {
  Disconnected: "Клиент не подключён",
  None: "Ожидание матча",
  Lobby: "Лобби",
  Matchmaking: "Поиск матча",
  ReadyCheck: "Подтверждение матча",
  ChampSelect: "Выбор чемпионов",
  GameStart: "Загрузка игры",
  InProgress: "Матч идёт",
  Reconnect: "Переподключение",
  WaitingForStats: "Подведение итогов",
  PreEndOfGame: "Матч завершён",
  EndOfGame: "Матч завершён",
};

function preference(key: string, fallback: boolean) {
  const value = localStorage.getItem(`dozor.${key}`);
  return value === null ? fallback : value === "true";
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-icon">
        <Crosshair size={23} strokeWidth={1.9} />
      </span>
      <span>
        LoL <b>Dozor</b>
      </span>
    </div>
  );
}

function PlannedControls() {
  return (
    <section className="planned">
      <div className="section-heading">
        <div className="section-title">
          <ListOrdered size={20} />
          <h2>Подготовка к игре</h2>
        </div>
        <span className="section-note">ЗАПЛАНИРОВАНО</span>
      </div>
      <fieldset className="panel automation" disabled>
        <legend className="sr-only">Запланированные функции</legend>
        <label className="auto-accept">
          <span className="feature-icon">
            <Gamepad2 size={19} />
          </span>
          <span>
            <strong>Автопринятие матча</strong>
            <small>Подтверждать найденный матч автоматически</small>
          </span>
          <span className="toggle">
            <input type="checkbox" aria-label="Автопринятие матча" />
            <span />
          </span>
        </label>
        <div className="priorities">
          {[
            ["Чемпионы", "Основной чемпион", "Запасной чемпион"],
            ["Баны", "Основной бан", "Запасной бан"],
          ].map(([title, first, second]) => (
            <div key={title}>
              <h3>{title}</h3>
              <div className="priority-fields">
                {[first, second, `${second} 2`].map((label) => (
                  <label key={label}>
                    <span>{label}</span>
                    <select aria-label={label}>
                      <option>Не выбрано</option>
                    </select>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </fieldset>
    </section>
  );
}

function Overview({
  phase,
  connected,
  account,
  error,
  demo,
  hasMatch,
  onDraft,
  onAnalytics,
  onDemo,
}: {
  phase: string;
  connected: boolean;
  account: string;
  error: boolean;
  demo: boolean;
  hasMatch: boolean;
  onDraft?: () => void;
  onAnalytics: () => void;
  onDemo: () => void;
}) {
  return (
    <>
      <header className="match-hero overview-hero">
        <img
          src={gameImage(demoCatalog.patch, "splash", "Aatrox", true)}
          alt=""
        />
        <div className="hero-copy">
          <div className="eyebrow">
            <Radio size={15} /> LEAGUE OF LEGENDS
          </div>
          <h1>LoL Dozor</h1>
          <p>Составы команд и матчапы на втором экране</p>
        </div>
      </header>
      <section className="overview-status">
        <div className="section-heading">
          <div className="section-title">
            <Activity size={21} />
            <h2>Состояние клиента</h2>
          </div>
        </div>
        <div className="panel connection">
          <span className={`feature-icon ${connected ? "connected" : ""}`}>
            {connected ? <Radio /> : <Unplug />}
          </span>
          <div>
            <h3>
              {error
                ? "Ошибка подключения"
                : connected
                  ? "League of Legends подключён"
                  : phase}
            </h3>
            <p>
              {error
                ? "Пробуем восстановить связь с настольным приложением."
                : connected
                  ? [account, phase].filter(Boolean).join(" · ")
                  : desktop
                    ? "Запустите League of Legends и войдите в клиент."
                    : "Подключение к League of Legends доступно в приложении Windows."}
            </p>
          </div>
          {hasMatch ? (
            <button
              className="button primary"
              type="button"
              onClick={onAnalytics}
            >
              К аналитике <ArrowRight size={17} />
            </button>
          ) : onDraft ? (
            <button className="button primary" type="button" onClick={onDraft}>
              К драфту <ArrowRight size={17} />
            </button>
          ) : (
            <button className="button secondary" type="button" onClick={onDemo}>
              <FlaskConical size={17} />{" "}
              {demo ? "Открыть демо-матч" : "Попробовать демо"}
            </button>
          )}
        </div>
      </section>
      <PlannedControls />
    </>
  );
}

function Preferences({
  keyStatus,
  compact,
  onCompact,
  updateKey,
  onLink,
}: {
  keyStatus: KeyStatus;
  compact: boolean;
  onCompact: () => void;
  updateKey: (next: KeyStatus) => void;
  onLink: LinkHandler;
}) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ error: boolean; text: string }>();
  async function handleKey(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setBusy(true);
    setNotice(undefined);
    try {
      if (event && key.trim()) {
        updateKey(await saveKey(key));
        setKey("");
      }
      updateKey(await checkKey());
      setNotice({
        error: false,
        text: "Ключ Riot API принят. Подключение работает.",
      });
    } catch (error) {
      setNotice({ error: true, text: errorText(error) });
      void getKeyStatus()
        .then(updateKey)
        .catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="page-heading">
        <h1>Настройки</h1>
        <p>Подключение к Riot API и отображение аналитики</p>
      </header>
      <section className="panel preferences" aria-labelledby="riot-settings">
        <div className="settings-heading">
          <span className="feature-icon">
            <KeyRound size={21} />
          </span>
          <div>
            <h2 id="riot-settings">Riot Developer API</h2>
            <p>Ранги, винрейты и последние матчи игроков</p>
          </div>
          <span
            className={`badge ${keyStatus.configured && !keyStatus.issue ? "green" : ""}`}
          >
            {keyStatus.issue
              ? "Требует внимания"
              : keyStatus.configured
                ? "Ключ сохранён"
                : "Ключ не задан"}
          </span>
        </div>
        <form onSubmit={(event) => void handleKey(event)}>
          <label htmlFor="riot-key">Developer API Key</label>
          <div className="key-field">
            <input
              id="riot-key"
              type="password"
              placeholder={
                keyStatus.configured
                  ? "Вставьте новый ключ для замены"
                  : "RGAPI-…"
              }
              value={key}
              onChange={(event) => setKey(event.target.value)}
              maxLength={128}
              autoComplete="off"
              spellCheck={false}
              disabled={!desktop || busy}
            />
            <button
              className="button primary"
              type="submit"
              disabled={!desktop || busy || !key.trim()}
            >
              Сохранить и проверить
            </button>
            <button
              className="button secondary"
              type="button"
              onClick={() => void handleKey()}
              disabled={!desktop || busy || !keyStatus.configured}
            >
              Проверить ключ
            </button>
          </div>
        </form>
        <div className="key-note">
          <span>
            <LockKeyhole size={15} /> Ключ хранится в зашифрованном виде в
            профиле Windows.
          </span>
          <a
            href="https://developer.riotgames.com/"
            rel="noreferrer"
            target="_blank"
            onClick={onLink}
          >
            Портал Riot <ArrowRight size={15} />
          </a>
        </div>
        <div aria-live="polite">
          {busy && (
            <p className="feedback">
              <ScanLine size={16} /> Проверяем подключение…
            </p>
          )}
          {(notice || keyStatus.issue) && !busy && (
            <p
              className={`feedback ${notice?.error || !notice ? "warning-text" : "positive"}`}
            >
              {notice && !notice.error ? (
                <Check size={16} />
              ) : (
                <CircleAlert size={16} />
              )}{" "}
              {notice?.text ?? (keyStatus.issue && issueText[keyStatus.issue])}
            </p>
          )}
          {!desktop && (
            <p className="feedback">
              <CircleAlert size={16} /> Ввод ключа доступен в приложении
              Windows.
            </p>
          )}
        </div>
      </section>
      <section
        className="panel preferences display-pref"
        aria-labelledby="display-settings"
      >
        <div className="settings-heading">
          <span className="feature-icon">
            <PanelTop size={21} />
          </span>
          <div>
            <h2 id="display-settings">Отображение</h2>
            <p>Настройка плотности интерфейса для второго монитора</p>
          </div>
        </div>
        <label className="display-option">
          <span>
            <strong>Компактный режим</strong>
            <small>Уменьшает строки команд и интервалы между блоками.</small>
          </span>
          <span className="toggle">
            <input type="checkbox" checked={compact} onChange={onCompact} />
            <span />
          </span>
        </label>
      </section>
    </>
  );
}

export default function App() {
  const [demoSetting, setDemoSetting] = useState(() =>
    preference("demo", !desktop),
  );
  const [compact, setCompact] = useState(() => preference("compact", false));
  const [navigation, setNavigation] = useState<{
    page: Page;
    stage: string;
  }>();
  const [draftSelections, setDraftSelections] = useState<
    Partial<
      Record<
        "demo" | "planner" | "live",
        { context: string; selection: DraftSelection }
      >
    >
  >({});
  const [key, setKey] = useState<KeyStatus>({ configured: false, revision: 0 });
  const [refresh, setRefresh] = useState(0);
  const [linkError, setLinkError] = useState(false);
  const { snapshot, error } = useLeagueClient();
  const { catalog, state: catalogState } = useCatalog();
  const demo = demoSetting;
  const game = demo ? demoMatch : snapshot?.game;
  const gameId = game?.id ?? "";
  const draftActive = !demo && snapshot?.phase === "ChampSelect";
  const draftContext = demo
    ? "demo"
    : snapshot?.draftContext != null
      ? `draft:${snapshot.draftContext}`
      : draftActive
        ? "draft:pending"
        : "planner";
  const draftMode = demo
    ? "demo"
    : draftContext === "planner"
      ? "planner"
      : "live";
  const savedDraft = draftSelections[draftMode];
  const currentDraft =
    savedDraft?.context === draftContext ? savedDraft.selection : undefined;
  const draftOpponent =
    game && draftContext !== "planner" ? currentDraft?.opponent : undefined;
  const matchLoading = !demo && snapshot?.phase === "GameStart";
  const stage = game
    ? `match:${gameId}`
    : draftActive
      ? draftContext
      : matchLoading
        ? "match:loading"
        : "idle";
  const page =
    navigation?.page === "settings" || navigation?.stage === stage
      ? navigation.page
      : game || matchLoading
        ? "analytics"
        : draftActive
          ? "draft"
          : "overview";
  useEffect(() => {
    if (page !== "settings") window.scrollTo(0, 0);
  }, [page, stage]);
  const live = useMatchStats(
    !demo ? gameId : "",
    !demo ? (game?.players ?? []) : [],
    key,
    refresh,
  );
  useEffect(() => {
    if (desktop)
      void getKeyStatus()
        .then(setKey)
        .catch(() => undefined);
  }, []);
  const visibleCatalog = demo ? demoCatalog : catalog;
  const phase = error
    ? "Ошибка связи"
    : snapshot
      ? (phases[snapshot.phase] ?? snapshot.phase)
      : desktop
        ? "Подключение к клиенту…"
        : "Клиент не подключён";
  const status = demo ? "Демо-матч" : phase;
  const statsIssue = Object.values(live.stats).find(
    (value) => value.issue && value.issue !== "notFound",
  )?.issue;
  const jump = (next: Page) => {
    setNavigation({ page: next, stage });
    window.scrollTo(0, 0);
  };
  const switchMode = (enabled: boolean) => {
    setDemoSetting(enabled);
    localStorage.setItem("dozor.demo", String(enabled));
    setNavigation(undefined);
    window.scrollTo(0, 0);
  };
  const toggleCompact = () => {
    setCompact(!compact);
    localStorage.setItem("dozor.compact", String(!compact));
  };
  const handleLink: LinkHandler = (event) => {
    if (!desktop) return;
    event.preventDefault();
    setLinkError(false);
    void openReference(event.currentTarget.href).catch(() =>
      setLinkError(true),
    );
  };
  return (
    <div className={`shell${compact ? " compact" : ""}`}>
      <aside className="sidebar">
        <Brand />
        <nav aria-label="Разделы">
          {routes.map(({ page: target, label, icon: Icon }) => (
            <button
              key={target}
              className={page === target ? "nav-active" : ""}
              type="button"
              aria-current={page === target ? "page" : undefined}
              title={label}
              onClick={() => jump(target)}
            >
              <Icon size={19} />
              <span>{label}</span>
              {page === target && (
                <ChevronRight className="nav-chevron" size={14} />
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="source">
            <h2>ИСТОЧНИК ДАННЫХ</h2>
            <button
              type="button"
              title="Клиент League of Legends"
              aria-pressed={!demo}
              onClick={() => switchMode(false)}
            >
              <Radio size={17} />
              <span>Клиент League</span>
            </button>
            <button
              type="button"
              title="Демонстрация"
              aria-pressed={demo}
              onClick={() => switchMode(true)}
            >
              <FlaskConical size={17} />
              <span>Демонстрация</span>
            </button>
          </div>
          <div className="sidebar-footer">
            <span
              className={`status-dot ${!demo && catalogState === "offline" ? "dim" : ""}`}
            />
            <span>
              <strong>
                Патч {visibleCatalog.patch.split(".").slice(0, 2).join(".")}
              </strong>
              <small>
                {demo
                  ? "Демо-данные"
                  : catalogState === "offline"
                    ? "Локальные данные"
                    : catalogState === "loading"
                      ? "Проверяем обновления"
                      : "Data Dragon"}
              </small>
            </span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <Shield size={16} />
            <span>League of Legends</span>
            <ChevronRight size={13} />
            <strong>
              {routes.find((route) => route.page === page)?.label}
            </strong>
          </div>
          <div className="top-actions">
            <span
              className={`live-badge ${demo ? "is-demo" : snapshot?.connected || game ? "is-live" : ""}`}
            >
              <span className="status-dot" />
              {status}
            </span>
            <button
              className="icon-button"
              type="button"
              aria-pressed={compact}
              aria-label="Компактный режим"
              title="Компактный режим"
              onClick={toggleCompact}
            >
              <Gauge size={18} />
            </button>
          </div>
        </header>
        <main>
          {linkError && (
            <div role="alert" className="notice">
              <ExternalLink size={17} /> Не удалось открыть системный браузер.
              <button
                type="button"
                className="text-button"
                onClick={() => setLinkError(false)}
              >
                Закрыть
              </button>
            </div>
          )}
          {page === "settings" ? (
            <Preferences
              keyStatus={key}
              updateKey={setKey}
              compact={compact}
              onCompact={toggleCompact}
              onLink={handleLink}
            />
          ) : page === "overview" ? (
            <Overview
              phase={phase}
              connected={Boolean(snapshot?.connected)}
              account={snapshot?.account ?? ""}
              error={error}
              demo={demo}
              hasMatch={Boolean(game)}
              onDraft={draftActive ? () => jump("draft") : undefined}
              onAnalytics={() => jump("analytics")}
              onDemo={() => switchMode(true)}
            />
          ) : page === "draft" ? (
            <Draft
              key={draftContext}
              catalog={visibleCatalog}
              demo={demo}
              active={draftActive}
              live={demo ? demoDraft : (snapshot?.draft ?? undefined)}
              selection={
                currentDraft ?? (demo ? demoDraftSelection : emptyDraft)
              }
              onChange={(selection) =>
                setDraftSelections((previous) => ({
                  ...previous,
                  [draftMode]: { context: draftContext, selection },
                }))
              }
              onAnalytics={game ? () => jump("analytics") : undefined}
            />
          ) : game ? (
            <>
              {!demo && (!key.configured || statsIssue) && (
                <div role="status" className="notice">
                  <CircleAlert size={17} />
                  <span>{issueText[statsIssue ?? "missingKey"]}</span>
                  {key.configured && statsIssue !== "invalidKey" ? (
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => setRefresh(refresh + 1)}
                    >
                      Обновить
                    </button>
                  ) : (
                    <button
                      className="text-button"
                      type="button"
                      onClick={() => jump("settings")}
                    >
                      Настройки <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              )}
              <Analytics
                game={game}
                stats={demo ? demoStats : live.stats}
                loading={!demo && live.loading}
                catalog={visibleCatalog}
                platform={demo ? "ru" : (snapshot?.platform ?? "")}
                demo={demo}
                onLink={handleLink}
                initialOpponent={draftOpponent ?? undefined}
              />
            </>
          ) : (
            <>
              <header className="page-heading">
                <h1>Аналитика матча</h1>
                <p>{phase}</p>
              </header>
              <div className="panel waiting">
                <span className="feature-icon">
                  <AudioLines size={26} />
                </span>
                <h2>Ожидаем активный матч</h2>
                <p>
                  Составы команд появятся здесь, когда клиент передаст данные
                  игры.
                </p>
                <button
                  className="button secondary"
                  type="button"
                  onClick={() => switchMode(true)}
                >
                  <FlaskConical size={16} /> Попробовать демо
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
