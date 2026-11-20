import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Crosshair,
  Layers3,
  Plus,
  Search,
  Shield,
  Star,
  Swords,
  X,
} from "lucide-react";
import { Portrait } from "./Analytics";
import { hasBundledPortrait, type Catalog, type Champion } from "./catalog";
import {
  draftOptions,
  type DraftFocus,
  type DraftOption,
} from "./draft-recommendations";
import { normalizeRole, roles, type DraftState, type Position } from "./game";
import "./Draft.css";

const poolKey = "dozor.draft.pool.v1";
const positions = Object.keys(roles) as Position[];
const modes: readonly { id: DraftFocus; label: string }[] = [
  { id: "both", label: "Обе задачи" },
  { id: "counter", label: "Контрпики" },
  { id: "synergy", label: "Связки" },
];

export interface DraftSelection {
  role?: Position;
  opponent: number | null;
  ally: number | null;
}

type Target = "opponent" | "ally";
const targetNames: Record<Target, string> = {
  opponent: "Соперник",
  ally: "Союзник",
};

const extraNames: Record<string, string> = {
  MonkeyKing: "Wukong",
  Nunu: "Nunu Willump",
  Chogath: "Cho'Gath",
  Kaisa: "Kai'Sa",
};

function searchKey(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/g, "");
}

function loadPool(): string[] {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(poolKey) ?? "[]");
    return Array.isArray(data)
      ? data.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function DraftPortrait({
  champion,
  catalog,
}: {
  champion: Champion;
  catalog: Catalog;
}) {
  return (
    <Portrait
      champion={champion}
      catalog={catalog}
      demo={hasBundledPortrait(champion.id)}
    />
  );
}

interface PickerProps {
  title: string;
  catalog: Catalog;
  selected: ReadonlySet<string>;
  multiple: boolean;
  onPick: (champion: Champion) => void;
  onClose: () => void;
}

function ChampionPicker({
  title,
  catalog,
  selected,
  multiple,
  onPick,
  onClose,
}: PickerProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const headingId = useId();
  const [query, setQuery] = useState("");
  const normalized = searchKey(query);
  const results = catalog.champions
    .filter((champion) =>
      [champion.name, champion.id, extraNames[champion.id] ?? ""].some((name) =>
        searchKey(name).includes(normalized),
      ),
    )
    .sort((left, right) => {
      const exact = (champion: Champion) =>
        [champion.name, champion.id, extraNames[champion.id]].some(
          (name) => name && searchKey(name) === normalized,
        );
      return (
        Number(exact(right)) - Number(exact(left)) ||
        left.name.localeCompare(right.name, "ru")
      );
    });
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    searchInput.current?.focus();
    return () => element?.close();
  }, []);
  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (normalized && results[0]) onPick(results[0]);
  }
  return (
    <dialog
      className="draft-dialog"
      ref={dialog}
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <div className="draft-dialog-header">
        <h2 id={headingId}>{title}</h2>
        <button
          className="icon-button"
          type="button"
          onClick={onClose}
          aria-label="Закрыть выбор"
        >
          <X size={17} />
        </button>
      </div>
      <form className="draft-search" onSubmit={handleSearch} role="search">
        <Search size={17} aria-hidden="true" />
        <input
          ref={searchInput}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          aria-label="Поиск чемпиона"
          placeholder="Имя на русском или английском"
          autoComplete="off"
        />
      </form>
      <div className="draft-picker-list" role="group" aria-label="Чемпионы">
        {results.map((champion) => (
          <button
            className="draft-picker-option"
            key={champion.id}
            type="button"
            aria-pressed={selected.has(champion.id)}
            onClick={() => onPick(champion)}
          >
            <DraftPortrait champion={champion} catalog={catalog} />
            <span>{champion.name}</span>
            {selected.has(champion.id) && <Check size={15} />}
          </button>
        ))}
        {results.length === 0 && <p className="muted">Чемпионы не найдены.</p>}
      </div>
      {multiple && (
        <div className="draft-dialog-footer">
          <span className="muted">В пуле {selected.size}</span>
          <button type="button" className="button primary" onClick={onClose}>
            Готово <Check size={15} />
          </button>
        </div>
      )}
    </dialog>
  );
}

interface TargetProps {
  target: Target;
  selected?: Champion;
  quick: { champion: Champion; note: string }[];
  catalog: Catalog;
  onOpen: () => void;
  onPick: (key: number | null) => void;
}

function TargetField({
  target,
  selected,
  quick,
  catalog,
  onOpen,
  onPick,
}: TargetProps) {
  const heading = targetNames[target];
  return (
    <div className={`draft-target ${target}`}>
      <h3>
        {target === "opponent" ? <Crosshair size={17} /> : <Shield size={17} />}
        {heading}
      </h3>
      <div className="draft-field-row">
        <button
          className="draft-field"
          type="button"
          onClick={onOpen}
          aria-label={
            selected
              ? `Изменить: ${heading} — ${selected.name}`
              : `Выбрать: ${heading}`
          }
          aria-haspopup="dialog"
        >
          {selected ? (
            <DraftPortrait champion={selected} catalog={catalog} />
          ) : (
            <span className="draft-field-empty">
              <Plus size={19} />
            </span>
          )}
          <span>{selected?.name ?? "Выбрать чемпиона"}</span>
          <ChevronDown size={15} />
        </button>
        {selected && (
          <button
            className="icon-button draft-clear"
            type="button"
            aria-label={`Сбросить: ${heading}`}
            onClick={() => onPick(null)}
          >
            <X size={15} />
          </button>
        )}
      </div>
      {quick.length > 0 && (
        <div
          className="draft-quick"
          aria-label={
            target === "opponent"
              ? "Открытые пики противника"
              : "Пики и намерения союзников"
          }
        >
          {quick.map(({ champion, note }) => (
            <button
              className="draft-chip"
              key={champion.id}
              type="button"
              title={note}
              aria-pressed={selected?.key === champion.key}
              onClick={() => onPick(champion.key)}
            >
              <DraftPortrait champion={champion} catalog={catalog} />
              <span>{champion.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OptionCard({
  option,
  catalog,
  opponent,
  ally,
  togglePool,
}: {
  option: DraftOption;
  catalog: Catalog;
  opponent?: Champion;
  ally?: Champion;
  togglePool: (id: string) => void;
}) {
  const { champion, counter, synergy, inPool } = option;
  const reasons = [
    {
      evidence: counter,
      label: `Матчап · ${opponent?.name}`,
      icon: Crosshair,
      kind: "against",
    },
    {
      evidence: synergy,
      label: `Связка · ${ally?.name}`,
      icon: Shield,
      kind: "together",
    },
  ];
  return (
    <article className="draft-option">
      <div className="draft-option-header">
        <DraftPortrait champion={champion} catalog={catalog} />
        <h3>{champion.name}</h3>
        <button
          type="button"
          className="icon-button draft-star"
          aria-label={`В моём пуле: ${champion.name}`}
          aria-pressed={inPool}
          onClick={() => togglePool(champion.id)}
        >
          <Star size={16} fill={inPool ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="draft-reasons">
        {reasons.map(
          ({ evidence, label, icon: Icon, kind }) =>
            evidence && (
              <div className={`draft-reason ${kind}`} key={kind}>
                <strong>
                  <Icon size={14} />
                  {label}
                </strong>
                <p>{evidence.note[0]}</p>
                {evidence.note[1] && (
                  <p className="draft-tradeoff">{evidence.note[1]}</p>
                )}
              </div>
            ),
        )}
      </div>
    </article>
  );
}

interface DraftProps {
  catalog: Catalog;
  live?: DraftState;
  active: boolean;
  demo: boolean;
  selection: DraftSelection;
  onChange: (selection: DraftSelection) => void;
  onAnalytics?: () => void;
}

export default function Draft({
  catalog,
  live,
  active,
  demo,
  selection,
  onChange,
  onAnalytics,
}: DraftProps) {
  const [pool, setPool] = useState(loadPool);
  const [poolOnly, setPoolOnly] = useState(false);
  const [focus, setFocus] = useState<DraftFocus>("both");
  const [picker, setPicker] = useState<Target | "pool" | null>(null);
  const [showAll, setShowAll] = useState(false);
  const poolIds = new Set(pool);
  const role = selection.role ?? normalizeRole(live?.role ?? "");
  const byKey = new Map(
    catalog.champions.map((champion) => [champion.key, champion]),
  );
  const opponent = byKey.get(selection.opponent ?? 0);
  const ally = byKey.get(selection.ally ?? 0);
  const ownPick = byKey.get(live?.myChampion ?? 0);
  const currentFocus =
    opponent && ally ? focus : opponent ? "counter" : "synergy";
  const options =
    role && (opponent || ally)
      ? draftOptions({
          champions: catalog.champions,
          role,
          opponent,
          ally,
          focus: currentFocus,
          live,
          pool: poolIds,
          poolOnly,
        })
      : [];

  const quickOpponents = (live?.enemies ?? []).flatMap((key) => {
    const champion = byKey.get(key);
    return champion ? [{ champion, note: "Открытый пик противника" }] : [];
  });
  const seenAllies = new Set<number>();
  const quickAllies = (live?.allies ?? []).flatMap((entry) => {
    const champion = byKey.get(entry.champion);
    if (!champion || seenAllies.has(champion.key)) return [];
    seenAllies.add(champion.key);
    const position = normalizeRole(entry.role);
    return [
      {
        champion,
        note: [
          entry.locked ? "Подтверждён" : "Намерение",
          position ? roles[position] : "",
        ]
          .filter(Boolean)
          .join(" · "),
      },
    ];
  });
  function togglePool(id: string) {
    const next = poolIds.has(id)
      ? pool.filter((value) => value !== id)
      : [...pool, id];
    setPool(next);
    localStorage.setItem(poolKey, JSON.stringify(next));
  }
  function select(target: Target, champion: number | null) {
    setShowAll(false);
    const other = target === "opponent" ? "ally" : "opponent";
    onChange({
      ...selection,
      [target]: champion,
      [other]: champion === selection[other] ? null : selection[other],
    });
  }
  const hint = !role
    ? "Выберите позицию, чтобы отобрать подходящих чемпионов."
    : !opponent && !ally
      ? "Укажите соперника или союзника, чтобы сравнить варианты."
      : poolOnly
        ? "В вашем пуле нет доступных вариантов для этой задачи."
        : "Для выбранной ситуации нет подходящих вариантов с известной механикой.";

  return (
    <div className="draft">
      <header className="draft-header">
        <div>
          <div className="eyebrow">
            <Layers3 size={15} />
            {demo ? "ДЕМО-ДРАФТ" : active ? "ВЫБОР ЧЕМПИОНОВ" : "ПЛАНИРОВЩИК"}
          </div>
          <h1>Драфт</h1>
          <p>Сравните пики по матчапу и связкам с союзниками.</p>
        </div>
        {onAnalytics && (
          <button
            className="button secondary"
            type="button"
            onClick={onAnalytics}
          >
            К аналитике <ArrowRight size={16} />
          </button>
        )}
      </header>
      <div className="draft-layout">
        <section className="panel draft-setup" aria-labelledby="draft-context">
          <h2 id="draft-context">Ситуация в драфте</h2>
          <div
            className="draft-position"
            role="group"
            aria-label="Ваша позиция"
          >
            {positions.map((position) => (
              <button
                key={position}
                type="button"
                aria-pressed={role === position}
                onClick={() => {
                  onChange({ ...selection, role: position });
                  setShowAll(false);
                }}
              >
                {roles[position]}
              </button>
            ))}
          </div>
          {ownPick && (
            <p className="draft-current">
              {live?.locked ? "Ваш пик подтверждён" : "Ваш выбор в клиенте"} ·{" "}
              {ownPick.name}
            </p>
          )}
          {!live && active && (
            <p className="draft-current">
              Ждём состав от клиента. Уже можно выбрать чемпионов вручную.
            </p>
          )}
          <TargetField
            target="opponent"
            selected={opponent}
            quick={quickOpponents}
            catalog={catalog}
            onOpen={() => setPicker("opponent")}
            onPick={(key) => select("opponent", key)}
          />
          <TargetField
            target="ally"
            selected={ally}
            quick={quickAllies}
            catalog={catalog}
            onOpen={() => setPicker("ally")}
            onPick={(key) => select("ally", key)}
          />
          <div className="draft-pool">
            <div>
              <Star size={15} />
              <strong>Мой пул</strong>
              <span>{pool.length}</span>
            </div>
            <button
              className="button secondary"
              type="button"
              onClick={() => setPicker("pool")}
              aria-haspopup="dialog"
            >
              Настроить
            </button>
          </div>
          <label className="draft-pool-filter">
            <input
              type="checkbox"
              checked={poolOnly}
              onChange={(event) => {
                setPoolOnly(event.target.checked);
                setShowAll(false);
              }}
            />{" "}
            Показывать только мой пул
          </label>
        </section>
        <section className="draft-results" aria-labelledby="draft-results">
          <div className="draft-results-header">
            <div className="section-title">
              <Swords size={21} />
              <h2 id="draft-results">Варианты пика</h2>
            </div>
            <p role="status">
              {options.length > 0 ? `Вариантов: ${options.length}` : ""}
            </p>
          </div>
          {opponent && ally && (
            <div className="draft-focus" role="group" aria-label="Что важнее">
              {modes.map((mode) => (
                <button
                  type="button"
                  key={mode.id}
                  aria-pressed={focus === mode.id}
                  onClick={() => {
                    setFocus(mode.id);
                    setShowAll(false);
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          )}
          {!options.length ? (
            <div className="panel draft-empty">
              <CircleHelp size={22} />
              <p>{hint}</p>
            </div>
          ) : (
            <>
              <div className="draft-options">
                {options.slice(0, showAll ? undefined : 6).map((option) => (
                  <OptionCard
                    key={option.champion.id}
                    option={option}
                    catalog={catalog}
                    opponent={opponent}
                    ally={ally}
                    togglePool={togglePool}
                  />
                ))}
              </div>
              {options.length > 6 && (
                <button
                  className="button secondary draft-more"
                  type="button"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? "Свернуть список" : "Показать все варианты"}{" "}
                  <ChevronDown size={15} />
                </button>
              )}
            </>
          )}
          <details className="draft-method">
            <summary>Как сравниваются варианты</summary>
            <p>
              Подбор учитывает позицию, точные взаимодействия способностей и
              общие механики. В режиме «Обе задачи» ценятся пики, которые
              помогают и в матчапе, и в связке. При равных вариантах выше идут
              чемпионы из вашего пула.
            </p>
            <p>
              {live?.pickable?.length
                ? "Доступность чемпионов получена от клиента. Учитываются открытые пики и баны."
                : active
                  ? "Клиент ещё не передал список доступных чемпионов. Учитываются известные пики и баны."
                  : "В планировщике можно проверить любой матчап. Доступность чемпионов определяется в живом драфте."}
            </p>
          </details>
        </section>
      </div>
      {picker && (
        <ChampionPicker
          key={picker}
          title={
            picker === "pool"
              ? "Мой пул чемпионов"
              : `Выбрать: ${targetNames[picker]}`
          }
          catalog={catalog}
          multiple={picker === "pool"}
          selected={
            picker === "pool"
              ? poolIds
              : new Set([
                  picker === "ally" ? (ally?.id ?? "") : (opponent?.id ?? ""),
                ])
          }
          onClose={() => setPicker(null)}
          onPick={(champion) => {
            if (picker === "pool") {
              togglePool(champion.id);
            } else {
              select(picker, champion.key);
              setPicker(null);
            }
          }}
        />
      )}
    </div>
  );
}
