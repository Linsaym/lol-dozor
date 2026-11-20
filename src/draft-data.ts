import type { Position } from "./game";

export type Trait =
  | "antiTank"
  | "areaDamage"
  | "blocksShots"
  | "dash"
  | "dive"
  | "frontline"
  | "knockup"
  | "melee"
  | "peel"
  | "poke"
  | "projectiles"
  | "reset"
  | "scalingCarry"
  | "setup"
  | "shields"
  | "shotFollowup"
  | "stopsDashes"
  | "sustain";

type Profile = [positions: Position[], ...traits: Trait[]];

export const draftProfiles: Record<string, Profile> = {
  Aatrox: [["TOP"], "melee", "sustain", "dash", "knockup", "areaDamage"],
  Ahri: [["MIDDLE"], "setup", "dash", "projectiles", "reset"],
  Akali: [["MIDDLE", "TOP"], "melee", "dive", "dash"],
  Akshan: [["MIDDLE", "TOP"], "projectiles", "dash", "poke"],
  Alistar: [["UTILITY"], "melee", "frontline", "knockup", "peel", "setup"],
  Amumu: [["JUNGLE", "UTILITY"], "melee", "frontline", "dive", "dash", "setup"],
  Ambessa: [["TOP"], "melee", "dive", "dash", "shields", "sustain"],
  Anivia: [["MIDDLE"], "peel", "areaDamage", "setup", "projectiles"],
  Annie: [["MIDDLE", "UTILITY"], "setup", "shields", "areaDamage"],
  Aphelios: [
    ["BOTTOM"],
    "scalingCarry",
    "projectiles",
    "areaDamage",
    "shotFollowup",
  ],
  Ashe: [["BOTTOM", "UTILITY"], "poke", "setup", "peel", "projectiles"],
  AurelionSol: [
    ["MIDDLE"],
    "scalingCarry",
    "areaDamage",
    "antiTank",
    "knockup",
  ],
  Aurora: [["MIDDLE", "TOP"], "dash", "areaDamage", "projectiles"],
  Azir: [["MIDDLE"], "scalingCarry", "poke", "areaDamage", "dash", "peel"],
  Bard: [["UTILITY"], "setup", "peel", "projectiles"],
  Belveth: [["JUNGLE"], "melee", "dive", "dash", "reset"],
  Blitzcrank: [
    ["UTILITY"],
    "melee",
    "frontline",
    "setup",
    "knockup",
    "projectiles",
  ],
  Brand: [
    ["UTILITY", "JUNGLE", "MIDDLE"],
    "areaDamage",
    "antiTank",
    "projectiles",
    "shotFollowup",
  ],
  Braum: [
    ["UTILITY"],
    "melee",
    "frontline",
    "blocksShots",
    "dash",
    "peel",
    "knockup",
  ],
  Briar: [["JUNGLE"], "melee", "dive", "dash", "sustain", "setup"],
  Caitlyn: [["BOTTOM"], "poke", "projectiles", "shotFollowup", "scalingCarry"],
  Camille: [["TOP"], "melee", "antiTank", "dive", "dash", "setup"],
  Cassiopeia: [
    ["MIDDLE", "TOP"],
    "antiTank",
    "setup",
    "stopsDashes",
    "scalingCarry",
  ],
  Chogath: [["TOP"], "melee", "frontline", "knockup", "setup", "sustain"],
  Corki: [["BOTTOM", "MIDDLE"], "dash", "poke", "projectiles", "shotFollowup"],
  Darius: [["TOP"], "melee", "frontline", "antiTank", "sustain", "reset"],
  Diana: [
    ["JUNGLE", "MIDDLE"],
    "melee",
    "dive",
    "dash",
    "areaDamage",
    "knockup",
  ],
  DrMundo: [["TOP"], "melee", "frontline", "sustain", "poke"],
  Draven: [["BOTTOM"], "projectiles", "shotFollowup"],
  Ekko: [["JUNGLE", "MIDDLE"], "melee", "dive", "dash", "areaDamage", "setup"],
  Elise: [["JUNGLE"], "dive", "setup", "projectiles"],
  Evelynn: [["JUNGLE"], "melee", "dive", "setup"],
  Ezreal: [["BOTTOM"], "poke", "projectiles", "shotFollowup", "scalingCarry"],
  Fiddlesticks: [["JUNGLE"], "areaDamage", "dive", "setup"],
  Fiora: [["TOP"], "melee", "antiTank", "dash", "sustain"],
  Fizz: [["MIDDLE"], "melee", "dive", "dash", "projectiles"],
  Galio: [
    ["MIDDLE", "UTILITY"],
    "melee",
    "frontline",
    "knockup",
    "setup",
    "peel",
  ],
  Gangplank: [["TOP"], "melee", "poke", "areaDamage", "scalingCarry"],
  Garen: [["TOP"], "melee", "frontline", "sustain"],
  Gnar: [["TOP"], "frontline", "projectiles", "dash", "setup", "peel"],
  Gragas: [
    ["TOP", "JUNGLE", "MIDDLE"],
    "melee",
    "frontline",
    "sustain",
    "dash",
    "knockup",
    "peel",
  ],
  Graves: [["JUNGLE"], "dash", "projectiles"],
  Gwen: [["TOP", "JUNGLE"], "melee", "antiTank", "dive", "dash", "sustain"],
  Hecarim: [["JUNGLE"], "melee", "dive", "areaDamage", "setup"],
  Heimerdinger: [["MIDDLE", "UTILITY"], "poke", "projectiles", "setup"],
  Hwei: [
    ["MIDDLE", "UTILITY"],
    "projectiles",
    "areaDamage",
    "poke",
    "setup",
    "shotFollowup",
  ],
  Illaoi: [["TOP"], "melee", "frontline", "sustain", "areaDamage"],
  Irelia: [["TOP", "MIDDLE"], "melee", "dive", "dash", "sustain"],
  Ivern: [["JUNGLE"], "peel", "shields", "setup"],
  Janna: [["UTILITY"], "peel", "shields", "knockup"],
  JarvanIV: [
    ["JUNGLE"],
    "melee",
    "frontline",
    "dive",
    "dash",
    "knockup",
    "setup",
  ],
  Jax: [["TOP", "JUNGLE"], "melee", "dive", "dash", "scalingCarry"],
  Jayce: [["TOP", "MIDDLE"], "poke", "projectiles", "shotFollowup"],
  Jhin: [["BOTTOM"], "poke", "projectiles", "setup", "shotFollowup"],
  Jinx: [["BOTTOM"], "scalingCarry", "projectiles", "reset", "shotFollowup"],
  Kaisa: [["BOTTOM"], "scalingCarry", "projectiles", "dive", "shotFollowup"],
  Kalista: [["BOTTOM"], "projectiles", "dash", "knockup", "shotFollowup"],
  Karma: [["UTILITY", "MIDDLE"], "poke", "projectiles", "shields", "peel"],
  Karthus: [["JUNGLE", "BOTTOM"], "areaDamage", "scalingCarry"],
  Kassadin: [["MIDDLE"], "melee", "dive", "dash", "scalingCarry"],
  Katarina: [["MIDDLE"], "melee", "dive", "areaDamage", "reset"],
  Kayn: [["JUNGLE"], "melee", "dive", "dash", "areaDamage"],
  Kayle: [["TOP", "MIDDLE"], "scalingCarry", "peel", "areaDamage"],
  Kennen: [["TOP"], "setup", "areaDamage", "projectiles"],
  Khazix: [["JUNGLE"], "melee", "dive", "dash", "reset"],
  Kindred: [["JUNGLE"], "projectiles", "dash", "scalingCarry", "peel"],
  Kled: [["TOP"], "melee", "dive", "dash", "frontline"],
  KogMaw: [["BOTTOM"], "scalingCarry", "antiTank", "poke", "projectiles"],
  KSante: [["TOP"], "melee", "frontline", "dash", "knockup", "peel"],
  Leblanc: [["MIDDLE"], "dash", "dive", "setup", "projectiles"],
  LeeSin: [["JUNGLE"], "melee", "dive", "dash", "shields", "knockup", "setup"],
  Leona: [["UTILITY"], "melee", "frontline", "dive", "dash", "setup"],
  Lillia: [["JUNGLE"], "melee", "antiTank", "setup", "areaDamage"],
  Lissandra: [["MIDDLE"], "setup", "peel", "areaDamage", "dive"],
  Locke: [["MIDDLE"], "melee", "dive", "dash", "projectiles"],
  Lucian: [["BOTTOM", "MIDDLE"], "projectiles", "dash", "shotFollowup"],
  Lulu: [["UTILITY"], "shields", "peel", "knockup"],
  Lux: [
    ["MIDDLE", "UTILITY"],
    "poke",
    "projectiles",
    "shields",
    "setup",
    "shotFollowup",
  ],
  Malphite: [
    ["TOP", "MIDDLE"],
    "melee",
    "frontline",
    "knockup",
    "setup",
    "dive",
  ],
  Malzahar: [["MIDDLE"], "setup", "antiTank", "peel"],
  Maokai: [
    ["TOP", "JUNGLE", "UTILITY"],
    "melee",
    "frontline",
    "setup",
    "sustain",
    "peel",
  ],
  MasterYi: [["JUNGLE"], "melee", "antiTank", "dive", "reset"],
  Mel: [["MIDDLE", "UTILITY"], "poke", "projectiles", "blocksShots", "setup"],
  Milio: [["UTILITY"], "peel", "shields", "sustain"],
  MissFortune: [
    ["BOTTOM"],
    "poke",
    "projectiles",
    "areaDamage",
    "shotFollowup",
  ],
  Mordekaiser: [["TOP"], "melee", "frontline", "antiTank", "shields"],
  Morgana: [["UTILITY", "MIDDLE"], "peel", "shields", "setup", "projectiles"],
  Naafiri: [["MIDDLE", "JUNGLE"], "melee", "dive", "dash", "projectiles"],
  Nami: [["UTILITY"], "setup", "peel", "sustain", "knockup"],
  Nasus: [["TOP"], "melee", "frontline", "sustain", "scalingCarry"],
  Nautilus: [
    ["UTILITY"],
    "melee",
    "frontline",
    "dive",
    "dash",
    "knockup",
    "setup",
  ],
  Neeko: [["MIDDLE", "UTILITY"], "projectiles", "areaDamage", "setup"],
  Nidalee: [
    ["JUNGLE"],
    "dash",
    "poke",
    "projectiles",
    "shotFollowup",
    "sustain",
  ],
  Nilah: [["BOTTOM"], "melee", "dive", "dash", "scalingCarry", "areaDamage"],
  Nocturne: [["JUNGLE"], "melee", "dive", "setup"],
  Nunu: [["JUNGLE"], "melee", "frontline", "knockup", "setup", "sustain"],
  Olaf: [["TOP", "JUNGLE"], "melee", "dive", "frontline", "sustain"],
  Orianna: [["MIDDLE"], "areaDamage", "shields", "setup", "shotFollowup"],
  Ornn: [["TOP"], "melee", "frontline", "knockup", "setup", "dash"],
  Pantheon: [
    ["TOP", "MIDDLE", "JUNGLE", "UTILITY"],
    "melee",
    "dive",
    "dash",
    "setup",
  ],
  Poppy: [
    ["TOP", "JUNGLE", "UTILITY"],
    "melee",
    "frontline",
    "stopsDashes",
    "peel",
    "dash",
  ],
  Pyke: [["UTILITY"], "melee", "dash", "setup", "reset", "projectiles"],
  Qiyana: [
    ["MIDDLE", "JUNGLE"],
    "melee",
    "dash",
    "dive",
    "setup",
    "areaDamage",
  ],
  Quinn: [["TOP"], "poke", "projectiles", "peel"],
  Rakan: [
    ["UTILITY"],
    "melee",
    "setup",
    "knockup",
    "shields",
    "dash",
    "dive",
    "peel",
  ],
  Rammus: [["JUNGLE"], "melee", "frontline", "setup", "peel"],
  RekSai: [["JUNGLE"], "melee", "dive", "dash", "knockup", "setup"],
  Rell: [["UTILITY"], "melee", "frontline", "setup", "knockup", "dash", "dive"],
  Renata: [["UTILITY"], "peel", "setup", "shields", "projectiles"],
  Renekton: [["TOP"], "melee", "frontline", "dash", "setup", "sustain"],
  Rengar: [["JUNGLE", "TOP"], "melee", "dive", "dash", "setup"],
  Riven: [["TOP"], "melee", "dash", "knockup", "setup", "shields"],
  Rumble: [
    ["TOP", "MIDDLE", "JUNGLE"],
    "melee",
    "areaDamage",
    "shields",
    "poke",
  ],
  Ryze: [["MIDDLE", "TOP"], "scalingCarry", "projectiles", "setup"],
  Samira: [["BOTTOM"], "blocksShots", "dash", "dive", "areaDamage", "reset"],
  Sejuani: [
    ["JUNGLE", "TOP"],
    "melee",
    "frontline",
    "setup",
    "dash",
    "knockup",
  ],
  Senna: [["UTILITY", "BOTTOM"], "poke", "scalingCarry", "peel", "sustain"],
  Seraphine: [
    ["UTILITY", "BOTTOM", "MIDDLE"],
    "setup",
    "shields",
    "areaDamage",
    "projectiles",
  ],
  Sett: [["TOP"], "melee", "frontline", "areaDamage", "setup"],
  Shaco: [["JUNGLE", "UTILITY"], "melee", "dive", "setup"],
  Shen: [["TOP"], "melee", "frontline", "dash", "setup", "shields", "peel"],
  Shyvana: [["JUNGLE"], "melee", "dash", "areaDamage", "poke"],
  Singed: [["TOP"], "melee", "frontline", "stopsDashes", "peel", "areaDamage"],
  Sion: [["TOP"], "melee", "frontline", "setup", "knockup"],
  Sivir: [["BOTTOM"], "projectiles", "areaDamage", "scalingCarry", "poke"],
  Skarner: [["JUNGLE"], "melee", "frontline", "setup", "dash"],
  Smolder: [["BOTTOM"], "projectiles", "areaDamage", "scalingCarry"],
  Sona: [["UTILITY"], "shields", "peel", "sustain", "setup"],
  Soraka: [["UTILITY"], "peel", "sustain"],
  Swain: [
    ["MIDDLE", "BOTTOM", "UTILITY"],
    "areaDamage",
    "setup",
    "sustain",
    "projectiles",
  ],
  Sylas: [
    ["MIDDLE", "JUNGLE", "TOP"],
    "melee",
    "dash",
    "dive",
    "sustain",
    "knockup",
  ],
  Syndra: [["MIDDLE"], "poke", "peel", "setup", "projectiles", "shotFollowup"],
  TahmKench: [
    ["TOP", "UTILITY"],
    "melee",
    "frontline",
    "peel",
    "sustain",
    "shields",
  ],
  Taliyah: [
    ["MIDDLE", "JUNGLE"],
    "stopsDashes",
    "setup",
    "poke",
    "projectiles",
    "shotFollowup",
  ],
  Talon: [["MIDDLE", "JUNGLE"], "melee", "dive", "dash"],
  Taric: [["UTILITY"], "melee", "peel", "shields", "setup", "sustain"],
  Teemo: [["TOP"], "poke", "projectiles", "peel"],
  Thresh: [["UTILITY"], "setup", "peel", "projectiles", "knockup"],
  Tristana: [
    ["BOTTOM", "MIDDLE"],
    "projectiles",
    "dash",
    "dive",
    "reset",
    "scalingCarry",
  ],
  Trundle: [
    ["JUNGLE", "TOP"],
    "melee",
    "antiTank",
    "frontline",
    "sustain",
    "setup",
  ],
  Tryndamere: [["TOP"], "melee", "dash", "dive", "sustain"],
  TwistedFate: [["MIDDLE", "TOP"], "setup", "projectiles"],
  Twitch: [["BOTTOM"], "projectiles", "areaDamage", "scalingCarry"],
  Udyr: [["JUNGLE", "TOP"], "melee", "frontline", "sustain", "areaDamage"],
  Urgot: [["TOP"], "frontline", "setup", "dash"],
  Varus: [
    ["BOTTOM"],
    "poke",
    "antiTank",
    "projectiles",
    "setup",
    "shotFollowup",
  ],
  Vayne: [
    ["BOTTOM", "TOP"],
    "antiTank",
    "projectiles",
    "dash",
    "scalingCarry",
    "peel",
  ],
  Veigar: [["MIDDLE"], "stopsDashes", "setup", "projectiles", "scalingCarry"],
  Velkoz: [
    ["MIDDLE", "UTILITY"],
    "poke",
    "projectiles",
    "antiTank",
    "setup",
    "shotFollowup",
  ],
  Vex: [["MIDDLE"], "peel", "dive", "dash", "projectiles", "setup"],
  Vi: [["JUNGLE"], "melee", "dive", "dash", "setup", "knockup"],
  Viego: [["JUNGLE"], "melee", "dive", "dash", "reset"],
  Viktor: [["MIDDLE"], "poke", "areaDamage", "scalingCarry"],
  Vladimir: [["MIDDLE", "TOP"], "areaDamage", "sustain", "scalingCarry"],
  Volibear: [
    ["TOP", "JUNGLE"],
    "melee",
    "frontline",
    "dive",
    "sustain",
    "setup",
  ],
  Warwick: [["JUNGLE", "TOP"], "melee", "dive", "sustain", "setup"],
  MonkeyKing: [
    ["JUNGLE", "TOP"],
    "melee",
    "dash",
    "dive",
    "knockup",
    "areaDamage",
  ],
  Xayah: [["BOTTOM"], "projectiles", "peel", "areaDamage", "scalingCarry"],
  Xerath: [["MIDDLE", "UTILITY"], "poke", "projectiles", "shotFollowup"],
  XinZhao: [["JUNGLE"], "melee", "dive", "frontline", "dash", "knockup"],
  Yasuo: [
    ["MIDDLE", "TOP", "BOTTOM"],
    "melee",
    "areaDamage",
    "blocksShots",
    "dash",
    "knockup",
  ],
  Yone: [["MIDDLE", "TOP"], "melee", "dive", "dash", "knockup", "areaDamage"],
  Yorick: [["TOP"], "melee", "frontline", "setup"],
  Yunara: [["BOTTOM"], "projectiles", "scalingCarry", "areaDamage"],
  Yuumi: [["UTILITY"], "shields", "peel"],
  Zaahen: [["TOP", "JUNGLE"], "melee", "dive", "dash", "sustain", "knockup"],
  Zac: [
    ["JUNGLE", "TOP"],
    "melee",
    "frontline",
    "dive",
    "dash",
    "knockup",
    "setup",
  ],
  Zed: [["MIDDLE", "JUNGLE"], "melee", "dive", "projectiles"],
  Zeri: [["BOTTOM"], "dash", "scalingCarry", "areaDamage", "projectiles"],
  Ziggs: [
    ["MIDDLE", "BOTTOM"],
    "poke",
    "projectiles",
    "areaDamage",
    "shotFollowup",
  ],
  Zilean: [["UTILITY", "MIDDLE"], "peel", "setup"],
  Zoe: [["MIDDLE"], "poke", "projectiles", "setup", "shotFollowup"],
  Zyra: [["UTILITY", "MIDDLE"], "poke", "projectiles", "areaDamage", "setup"],
};

export type Note = [reason: string, tradeoff?: string];
type Interactions = Record<string, Record<string, Note>>;

// Entries describe ability interactions. Their order makes no claim about win rates.
export const counters: Interactions = {
  Fiora: {
    Aatrox: [
      "W может парировать подбрасывание Q. Если парирование попало в Атрокса, он получит оглушение.",
      "У Атрокса три удара Q. Берегите W для того, из которого не успеете выйти.",
    ],
    Renekton: [
      "W парирует оглушение Ренектона. Q помогает отойти от его второго рывка.",
      "Ренектон может выманить W коротким разменом. Следите за его яростью.",
    ],
    Ornn: [
      "Пассивная «Дуэль танцоров» наносит чистый урон, а W может парировать рывок E или возврат R.",
      "Не тратьте W, пока Орнн ещё может подбросить вас.",
    ],
    Mordekaiser: [
      "W может заблокировать применение R, если нажать её во время замаха Мордекайзера.",
      "Парирование требует точного тайминга. Держите дистанцию от одиночной Q.",
    ],
  },
  Poppy: {
    Aatrox: [
      "W останавливает рывок E, которым Атрокс поправляет зону удара Q.",
      "Атрокс всё ещё может попасть краем Q без рывка. Не стойте в зоне удара.",
    ],
    Renekton: [
      "W блокирует E Ренектона и может сорвать его вход в ближний бой.",
      "Если Ренектон уже рядом, W не защитит от оглушения.",
    ],
    Riven: [
      "W прерывает рывки Q и E. Ривен сложнее войти в размен и выйти из него.",
      "Сохраните W до её попытки сблизиться.",
    ],
    Irelia: [
      "W останавливает рывок Q к миньону или чемпиону и ломает цепочку сбросов.",
      "У Ирелии остаётся оглушение E. Держитесь подальше от миньонов с низким здоровьем.",
    ],
    Ambessa: [
      "W может остановить один из рывков пассивного умения Амбессы и прервать серию сближений.",
      "R Амбессы не стоит пытаться остановить W. Оставьте себе место, чтобы выйти из зоны ульты.",
    ],
    Camille: [
      "W мешает Камилле влететь с дальней части E. У стены Поппи может ответить оглушением.",
      "R Камиллы всё ещё ограничивает отход.",
    ],
    LeeSin: [
      "W мешает Ли Сину долететь по второй Q или уйти рывком W.",
      "Следите за меткой Q. Ли Син может задержать повторное применение.",
    ],
    Zac: [
      "W может прервать прыжок Зака с E, если он пересечёт зону.",
      "Отступите от точки приземления, если W на перезарядке.",
    ],
    Leona: [
      "W может сорвать рывок Леоны с E и оставить её вдали от стрелка.",
      "Оглушение R не требует рывка. Разойдитесь со стрелком.",
    ],
    Rakan: [
      "W мешает Рэйкану зайти с W и уйти к союзнику на E.",
      "Рэйкан может начать R пешком. Смотрите, откуда он подходит.",
    ],
  },
  Taliyah: {
    Yasuo: [
      "Камни E оглушают Ясуо, когда он использует E через них.",
      "Стена Ясуо блокирует летящие снаряды Q. Сохраняйте угол для отхода.",
    ],
    Irelia: [
      "E перекрывает цепочку рывков Ирелии через волну миньонов.",
      "После применения E отойдите от помеченных целей, пока способность не восстановится.",
    ],
    LeeSin: [
      "E создаёт зону, через которую Ли Сину опасно лететь второй Q или W.",
      "Без E избегайте ближнего боя у стен и в узких проходах.",
    ],
    Talon: [
      "E помогает перекрыть маршрут Q и привычные выходы после прыжка через стену.",
      "Держите обзор на флангах. Талон может обойти зону.",
    ],
  },
  Cassiopeia: {
    Yasuo: [
      "W накладывает эффект «Приземление» и перекрывает рывки E к миньонам.",
      "Ясуо может выйти из зоны пешком. Не подходите к волне без W.",
    ],
    Irelia: [
      "Внутри W Ирелия не может применить Q. Это даёт время отойти от волны.",
      "У Ирелии остаётся дальнее оглушение E.",
    ],
  },
  Quinn: {
    Renekton: [
      "Дальность автоатак и E помогают держать Ренектона на расстоянии и наказывать после его рывков.",
      "Если он сохранил вторую E, не тратьте отскок слишком рано.",
    ],
    Darius: [
      "E создаёт дистанцию, а дальние автоатаки вынуждают Дариуса искать вход.",
      "Если Дариус притянет вас до отскока, короткий размен может затянуться.",
    ],
  },
  Malphite: {
    Quinn: [
      "Броня снижает урон от автоатак Квинн, а R помогает достать её после отскока.",
      "До шестого уровня собирайте фарм с безопасной дистанции.",
    ],
    Tryndamere: [
      "E снижает скорость атак Триндамира, а броня уменьшает его урон.",
      "Оставьте путь отхода, когда у Триндамира готова R.",
    ],
  },
  Jax: {
    Irelia: [
      "E уклоняется от автоатак Ирелии и помогает пережить серию ударов с заряженной пассивкой.",
      "Ирелия может дождаться конца E в стороне и вернуться рывком.",
    ],
    Tryndamere: [
      "E прикрывает от автоатак Триндамира во время его захода.",
      "Не тратьте всё время контроля в его R, если можно сначала отойти.",
    ],
  },
  Trundle: {
    Sejuani: [
      "R забирает часть брони и сопротивления магии у Седжуани, помогая команде быстрее пробить её фронт.",
      "В узких проходах у Седжуани остаётся сильный контроль.",
    ],
    Rammus: [
      "R крадёт сопротивления Раммуса. Это даёт магам и стрелкам окно для фокуса.",
      "Не продолжайте автоатаки в W Раммуса только ради размена.",
    ],
  },
  Lissandra: {
    Zed: [
      "После R Зед появляется за целью. Самоприменение R помогает Лиссандре пережить его заход, а W удерживает рядом.",
      "Если R Лиссандры недоступна, не оставляйте Зеду простой выход из тени.",
    ],
    Fizz: [
      "W и R дают контроль после приземления Физза с E. Самоприменение R помогает пережить взрыв его ульты.",
      "Дождитесь, пока Физз снова станет доступной целью.",
    ],
    Katarina: [
      "R по Катарине прерывает её R, а W удерживает её после прыжка к кинжалу.",
      "Не отдавайте R до захода Катарины, если вокруг много раненых союзников.",
    ],
  },
  Malzahar: {
    Katarina: [
      "Прицельное подавление R прерывает «Лотос смерти», даже если Катарина прыгает к кинжалам.",
      "Во время R Малзахар сам остаётся на месте и уязвим для контроля других врагов.",
    ],
    Akali: [
      "R можно применить, пока Акали видима, чтобы остановить её вход и дать команде время на фокус.",
      "В дыму Акали может быть недоступна для прицельного заклинания.",
    ],
  },
  Vex: {
    Yasuo: [
      "Рывки Ясуо дают Векс метки пассивного умения. С готовым страхом W можно встретить его вблизи.",
      "Стена Ясуо блокирует снаряды. Не расходуйте страх на волну, если он готов войти.",
    ],
    Ahri: [
      "Рывки R Ари дают Векс метки, а страх помогает встретить её сближение.",
      "Держите дистанцию и следите за очарованием, пока страх недоступен.",
    ],
  },
  Morgana: {
    Blitzcrank: [
      "E предотвращает контроль от крюка, пока держится щит. Наложите его на выбранную цель до попадания.",
      "Блицкранк может сменить цель, пока E на перезарядке.",
    ],
    Nautilus: [
      "E защищает выбранную цель от обездвиживания и подбрасывания, пока держится щит.",
      "Магический урон может разбить щит. Наутилус может выбрать другого союзника.",
    ],
    Leona: [
      "E мешает Леоне закрепить вход оглушением Q или R, пока держится щит.",
      "Дайте щит цели до контроля и учитывайте, что Леона может сменить цель.",
    ],
    Vi: [
      "E может предотвратить контроль от R Вай на выбранной цели. Рывок и физический урон самой Вай сохраняются.",
      "Щит должен держаться в момент попадания ульты.",
    ],
  },
  Janna: {
    Rakan: [
      "Подготовленная Q подбрасывает на траектории его входа. R помогает разорвать бой после сближения.",
      "Рэйкан может начать с очарования R. Сохраняйте дистанцию.",
    ],
    Leona: [
      "Q и R дают два инструмента, чтобы прервать вход или оттолкнуть Леону от стрелка.",
      "Сама Жанна уязвима для дальнего оглушения R Леоны.",
    ],
    Diana: [
      "R отталкивает Диану после её рывка и может вывести её из удобной позиции для R.",
      "Действуйте до того, как Диана соберёт несколько союзников в центре.",
    ],
  },
  Braum: {
    MissFortune: [
      "E, направленная к Мисс Фортуне, перехватывает волны её R и прикрывает союзников за Браумом.",
      "Поддерживайте нужное направление щита и учитывайте его длительность.",
    ],
    Jhin: [
      "Браум может закрыть союзника от выстрелов R Джина с помощью E.",
      "Стойте между Джином и целью. Щит прикрывает только со стороны атаки.",
    ],
    Ezreal: [
      "E перехватывает летящие Q и R Эзреаля, пока союзники стоят за щитом.",
      "Эзреаль может стрелять под другим углом после E.",
    ],
  },
  Samira: {
    MissFortune: [
      "W уничтожает снаряды её R, пока вращение Самиры активно.",
      "W Самиры короче полной R Мисс Фортуны. Уходите из конуса после блока.",
    ],
    Jhin: [
      "W может уничтожить летящий выстрел, включая четвёртый выстрел R.",
      "Не тратьте W на ранний снаряд, если решающий ещё впереди.",
    ],
  },
  Sivir: {
    Ashe: [
      "E может поглотить попадание стрелы R и сохранить мобильность Сивир.",
      "Эш может сначала снять щит с помощью W.",
    ],
    Nautilus: [
      "E может заблокировать одно попадание, включая R Наутилуса, если сохранить щит до нужного момента.",
      "Следующее заклинание или атака с пассивкой всё ещё опасны.",
    ],
  },
  Xayah: {
    Kaisa: [
      "R Ксайи уводит её из-под удара после входа Кай’Сы и раскладывает перья для ответной E.",
      "Следите за метками плазмы и сохраняйте R до сближения.",
    ],
    Vi: [
      "R даёт Ксайе короткое окно недоступности, которым можно сорвать момент входа Вай.",
      "После приземления Ксайе нужен путь отхода от остальных врагов.",
    ],
  },
};

export const synergies: Interactions = {
  Orianna: {
    JarvanIV: [
      "Дайте шар E Джарвану перед входом. Его R удерживает цели в зоне для «Ударной волны».",
      "Договоритесь, кто начинает. Слишком дальний рывок вернёт шар к Орианне.",
    ],
    Malphite: [
      "Мальфит доставляет шар в центр драки с R и подбрасывает цели перед R Орианны.",
      "Сохраняйте дистанцию до носителя шара, чтобы он не вернулся к Орианне.",
    ],
    Diana: [
      "Диана сближает несколько целей своей R, а Орианна продолжает контроль и урон шаром.",
      "Не используйте обе R до того, как противник потратит средства отхода.",
    ],
    Nocturne: [
      "Щит ставит шар на Ноктюрна для продолжения атаки, если он влетает в пределах привязки шара.",
      "При далёком перелёте шар вернётся к Орианне. Смотрите на дистанцию.",
    ],
  },
  Yasuo: {
    Malphite: [
      "R Мальфита подбрасывает несколько целей и открывает окно для R Ясуо.",
    ],
    Diana: [
      "Стягивание Дианы подбрасывает цели и даёт Ясуо возможность продолжить с R.",
    ],
    MonkeyKing: [
      "Вуконг может подбросить несколько целей двумя применениями R. Ясуо выбирает окно для продолжения.",
    ],
    Zac: [
      "E и R Зака подбрасывают цели и дают Ясуо несколько возможностей для R.",
    ],
    Rakan: [
      "W Рэйкана подбрасывает цели в зоне, позволяя Ясуо сразу продолжить R.",
    ],
    Gragas: ["E и R Грагаса подбрасывают или смещают цели, открывая R Ясуо."],
    Alistar: [
      "Q Алистара подбрасывает цели рядом и позволяет Ясуо применить R.",
    ],
  },
  Viego: {
    Ahri: [
      "Очарование Ари удерживает цель для быстрого фокуса. Ари и Виего получают возможность продолжить бой после участия в убийстве.",
    ],
    Pantheon: [
      "Пантеон начинает прицельным оглушением W, чтобы Виего мог попасть W и получить первое вселение.",
    ],
    Gnar: [
      "Мега-Гнар удерживает несколько целей у стены, давая Виего время добить первую и получить вселение.",
      "Согласуйте атаку со шкалой ярости Гнара.",
    ],
    Renekton: [
      "Ренектон начинает коротким оглушением W, которое помогает Виего попасть собственной W.",
      "Учитывайте ярость Ренектона и не начинайте размен вне дистанции союзника.",
    ],
  },
  Nami: {
    Lucian: [
      "E Нами усиливает серию атак и заклинаний Люциана, а лечение и усиление помогают активировать его пассивку.",
      "Разыграйте короткий размен, пока действует усиление.",
    ],
    Draven: [
      "E Нами помогает Дрейвену удерживать цель под усиленными автоатаками, а W поддерживает его в разменах.",
    ],
  },
  Lulu: {
    KogMaw: [
      "W ускоряет атаки Ког’Мао, E прикрывает от урона, а R помогает пережить врыв в ближний бой.",
    ],
    Twitch: [
      "Щит и ускорение атак помогают Твичу реализовать R. Полиморф удерживает чемпиона, который до него добрался.",
    ],
    Jinx: [
      "Лулу даёт Джинкс время на первый добитый фраг: E поглощает урон, W останавливает врыв, R подбрасывает врагов рядом.",
    ],
    Zeri: [
      "Лулу страхует Зери щитом и контролем, пока та набирает скорость в продолжительном бою.",
    ],
    Yunara: [
      "Щит и скорость атак помогают Юнаре дольше наносить урон автоатаками, а W и R Лулу прикрывают от врыва.",
    ],
  },
  Milio: {
    Caitlyn: [
      "W Милио увеличивает дальность автоатак Кейтлин. Это расширяет зону, в которой она может давить на линии.",
    ],
    KogMaw: [
      "W Милио добавляет дальность к усиленным автоатакам Ког’Мао, а щиты помогают удержать позицию.",
    ],
  },
  Rakan: {
    Xayah: [
      "Ксайя увеличивает дальность E Рэйкана. После его W она может разложить перья и продолжить контроль своей E.",
    ],
    Samira: [
      "W Рэйкана подбрасывает цель и даёт Самире подойти через пассивное умение.",
    ],
  },
  Nautilus: {
    Kaisa: [
      "Контроль Наутилуса накладывает на цель плазму Кай’Сы и создаёт окно для её R.",
    ],
    Samira: [
      "Подбрасывание R Наутилуса даёт Самире цель для пассивки, а его корень помогает ей остаться в нужной зоне.",
    ],
    MissFortune: [
      "Наутилус задерживает противников в конусе R Мисс Фортуны. Начинайте стрельбу после его контроля.",
    ],
  },
  Rell: {
    Samira: [
      "Подбрасывание Релл открывает вход Самире, а притягивание R удерживает рядом несколько целей.",
    ],
    MissFortune: [
      "Релл собирает и удерживает цели в конусе R Мисс Фортуны.",
      "Выберите угол, с которого противники не выйдут за край конуса.",
    ],
  },
  Lux: {
    Caitlyn: [
      "После попадания Q Люкс Кейтлин успевает положить W под связанную цель, продлив контроль и открыв выстрел в голову.",
    ],
    Jhin: [
      "Урон Люкс открывает метку для W Джина. Связывание Джина, в свою очередь, даёт Люкс удобный угол для Q.",
    ],
  },
  Morgana: {
    Caitlyn: [
      "Длительность Q Морганы даёт Кейтлин время положить капкан под цель.",
    ],
  },
  Braum: {
    Lucian: [
      "Два выстрела пассивки Люциана быстро набирают заряды оглушения Браума после попадания его Q.",
    ],
    Ashe: [
      "Автоатаки Эш набирают заряды оглушения Браума, а замедление помогает не потерять цель.",
    ],
  },
  Ivern: {
    Rengar: [
      "Кусты W Айверна дают Ренгару дополнительные точки для прыжка, а щит помогает пережить ответный урон.",
    ],
    Jinx: [
      "Щит Айверна и корень Q дают Джинкс пространство для стрельбы и время на первый сброс пассивки.",
    ],
  },
  Nidalee: {
    Renekton: [
      "Прицельное оглушение Ренектона позволяет Нидали надёжнее попасть копьём, прежде чем прыгать в форме пумы.",
    ],
    TwistedFate: [
      "Золотая карта удерживает цель для копья Нидали. Дождитесь, пока союзник выберет карту.",
    ],
  },
  Sejuani: {
    Renekton: [
      "Двойной удар W Ренектона помогает быстрее набрать заряды E Седжуани в ближнем бою.",
    ],
    Jax: [
      "Частые атаки Джакса помогают Седжуани набрать заряды E. Держитесь рядом с одной целью.",
    ],
  },
  Galio: {
    Camille: [
      "Камилла фиксирует выбранную цель в R, а Галио может приземлиться к ней с R и продолжить подбрасыванием.",
    ],
    JarvanIV: [
      "Вход Джарвана даёт Галио цель для R. Арена Джарвана помогает удержать противников в зоне приземления.",
    ],
  },
  Taric: {
    Nilah: [
      "Нила сближается, пока Тарик готовит E через связанного союзника. Она получает бонус от его лечения и щитов.",
      "Начинайте размен с учётом задержки E и R Тарика.",
    ],
    Samira: [
      "Тарик передаёт E через Самиру, вошедшую в бой. R может прикрыть её канал после задержки.",
      "Согласуйте применение R заранее, чтобы не опоздать к началу боя.",
    ],
  },
  Thresh: {
    Jinx: [
      "После крюка или E Треша Джинкс может поставить ловушки. Фонарь даёт ей выход из ответного врыва.",
    ],
    Kalista: [
      "R Калисты помогает Трешу начать бой через подбрасывание или выйти из опасной позиции.",
    ],
  },
  Amumu: {
    MissFortune: [
      "R Амуму удерживает несколько целей в конусе R Мисс Фортуны.",
    ],
    Katarina: [
      "Амуму удерживает несколько целей, чтобы Катарина вошла после ключевого контроля соперника.",
    ],
  },
};
