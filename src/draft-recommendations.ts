import type { Champion } from "./catalog";
import {
  counters,
  draftProfiles,
  synergies,
  type Note,
  type Trait,
} from "./draft-data";
import type { DraftState, Position } from "./game";

export type DraftFocus = "both" | "counter" | "synergy";

interface Evidence {
  strength: number;
  note: Note;
}

export interface DraftOption {
  champion: Champion;
  counter?: Evidence;
  synergy?: Evidence;
  inPool: boolean;
}

interface DraftQuery {
  champions: Champion[];
  role: Position;
  opponent?: Champion;
  ally?: Champion;
  focus: DraftFocus;
  live?: DraftState;
  pool: ReadonlySet<string>;
  poolOnly: boolean;
}

function has(champion: string, trait: Trait) {
  return draftProfiles[champion]?.slice(1).includes(trait) ?? false;
}

function counterEvidence(pick: string, opponent: string): Evidence | undefined {
  const note = counters[pick]?.[opponent];
  if (note) return { strength: 6, note };
  const own = (trait: Trait) => has(pick, trait);
  const enemy = (trait: Trait) => has(opponent, trait);
  if (own("stopsDashes") && enemy("dash")) {
    return {
      strength: 3,
      note: [
        "Контроль пространства осложняет рывки соперника и даёт время отойти или ответить.",
        "Сохраняйте ключевую способность до захода. Не все перемещения можно прервать.",
      ],
    };
  }
  if (own("blocksShots") && enemy("projectiles")) {
    return {
      strength: 2,
      note: [
        "Есть способ перекрыть часть летящих снарядов и пережить важное попадание.",
        "Учитывайте направление, длительность защиты и какие умения проходят сквозь неё.",
      ],
    };
  }
  if (own("peel") && enemy("dive")) {
    return {
      strength: 2,
      note: [
        "Защитный контроль помогает разорвать размен после врыва соперника.",
        "Берегите защитную способность, пока соперник может начать бой.",
      ],
    };
  }
  if (own("antiTank") && enemy("frontline")) {
    return {
      strength: 2,
      note: [
        "В наборе умений есть способ наносить урон живучим целям в затяжном бою.",
        "Пережить размен и реализовать урон важнее, чем форсировать ближний бой.",
      ],
    };
  }
  if (own("poke") && enemy("melee") && !enemy("dash") && !enemy("sustain")) {
    return {
      strength: 2,
      note: [
        "Дальние удары дают возможность навязывать короткие размены против ближнего боя.",
        "Контролируйте дистанцию. Преимущество исчезает, если соперник добрался до вас.",
      ],
    };
  }
  if ((own("sustain") || own("shields")) && enemy("poke")) {
    return {
      strength: 2,
      note: [
        "Лечение или щиты помогают переживать серии дальних попаданий.",
        "Приберегите защитные ресурсы на окно, в котором соперник может развить атаку.",
      ],
    };
  }
}

function synergyEvidence(pick: string, ally: string): Evidence | undefined {
  const note = synergies[pick]?.[ally] ?? synergies[ally]?.[pick];
  if (note) return { strength: 6, note };
  const pair = (left: Trait, right: Trait) =>
    (has(pick, left) && has(ally, right)) ||
    (has(ally, left) && has(pick, right));
  if (
    (pick === "Yasuo" && has(ally, "knockup")) ||
    (ally === "Yasuo" && has(pick, "knockup"))
  ) {
    return {
      strength: 4,
      note: [
        "Подбрасывание союзника открывает Ясуо окно для R.",
        "Сверьте готовность R и дистанцию, прежде чем начать бой.",
      ],
    };
  }
  if (pair("peel", "scalingCarry")) {
    return {
      strength: 3,
      note: [
        "Защитный контроль даёт керри больше времени наносить урон в драке.",
        "Держитесь в пределах защитных умений, особенно против врыва.",
      ],
    };
  }
  if (pair("setup", "shotFollowup")) {
    return {
      strength: 3,
      note: [
        "Первый контроль упрощает попадание ключевым умением напарника.",
        "Оставляйте умение для продолжения после попадания контроля.",
      ],
    };
  }
  if (pair("setup", "areaDamage")) {
    return {
      strength: 3,
      note: [
        "Контроль удерживает цель в зоне массового урона напарника.",
        "Если контроль потрачен, цели проще выйти из зоны.",
      ],
    };
  }
  if (pair("setup", "reset") || pair("dive", "reset")) {
    return {
      strength: 2,
      note: [
        "Инициация помогает быстро сфокусировать первую цель и открыть окно для сброса умений.",
        "Заранее выберите одну цель. Долгая драка до первого добивания сложнее.",
      ],
    };
  }
  if (pair("frontline", "scalingCarry")) {
    return {
      strength: 2,
      note: [
        "Фронт держит соперников на дистанции, чтобы керри мог продолжать наносить урон.",
      ],
    };
  }
  if (pair("poke", "poke")) {
    return {
      strength: 2,
      note: [
        "Оба чемпиона могут начать размягчать цель с дистанции до входа в драку.",
        "Ищите пространство для отхода от быстрой инициации.",
      ],
    };
  }
}

export function draftOptions({
  champions,
  role,
  opponent,
  ally,
  focus,
  live,
  pool,
  poolOnly,
}: DraftQuery): DraftOption[] {
  const picked = live?.duplicatePicks
    ? []
    : [
        ...(live?.enemies ?? []),
        ...(live?.allies.filter((p) => p.locked).map((p) => p.champion) ?? []),
      ];
  const unavailable = new Set([
    ...(live?.banned ?? []),
    ...picked,
    ...(ally ? [ally.key] : []),
  ]);
  const pickable = live?.pickable?.length ? new Set(live.pickable) : null;
  const result: DraftOption[] = [];
  for (const champion of champions) {
    const inPool = pool.has(champion.id);
    if (
      !draftProfiles[champion.id]?.[0].includes(role) ||
      unavailable.has(champion.key) ||
      champion.key === opponent?.key ||
      (pickable &&
        !pickable.has(champion.key) &&
        champion.key !== live?.myChampion) ||
      (poolOnly && !inPool)
    ) {
      continue;
    }
    const counter = opponent
      ? counterEvidence(champion.id, opponent.id)
      : undefined;
    const synergy = ally ? synergyEvidence(champion.id, ally.id) : undefined;
    if (
      (focus === "counter" && !counter) ||
      (focus === "synergy" && !synergy) ||
      (focus === "both" && !counter && !synergy)
    ) {
      continue;
    }
    result.push({ champion, counter, synergy, inPool });
  }
  const score = ({ counter, synergy }: DraftOption) => {
    const against = counter?.strength ?? 0;
    const together = synergy?.strength ?? 0;
    if (focus === "counter") return 3 * against + together;
    if (focus === "synergy") return against + 3 * together;
    return against + together + (counter && synergy ? 3 : 0);
  };
  return result.sort(
    (a, b) =>
      score(b) - score(a) ||
      Number(b.inPool) - Number(a.inPool) ||
      a.champion.name.localeCompare(b.champion.name, "ru"),
  );
}
