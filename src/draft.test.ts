import { expect, test } from "vitest";
import { demoCatalog } from "./catalog";
import { demoDraft } from "./demo";
import { draftOptions } from "./draft-recommendations";

function champion(id: string) {
  return demoCatalog.champions.find((entry) => entry.id === id)!;
}

test("ranks a combined answer using a counter and an ally interaction", () => {
  const result = draftOptions({
    champions: demoCatalog.champions,
    role: "UTILITY",
    opponent: champion("Rakan"),
    ally: champion("Jinx"),
    focus: "both",
    pool: new Set(),
    poolOnly: false,
  });
  const poppy = result.find((option) => option.champion.id === "Poppy");
  expect(poppy?.counter?.note[0]).toMatch(/Рэйкану зайти с W/);
  expect(poppy?.synergy?.note[0]).toContain("больше времени");
});

test("uses the same duo mechanic when either member needs a pick", () => {
  const shared = {
    champions: demoCatalog.champions,
    focus: "synergy" as const,
    pool: new Set<string>(),
    poolOnly: false,
  };
  const carry = draftOptions({
    ...shared,
    role: "BOTTOM",
    ally: champion("Rakan"),
  }).find((option) => option.champion.id === "Xayah");
  const support = draftOptions({
    ...shared,
    role: "UTILITY",
    ally: champion("Xayah"),
  }).find((option) => option.champion.id === "Rakan");
  expect(carry?.synergy?.note[0]).toContain("дальность E");
  expect(carry?.synergy?.note).toEqual(support?.synergy?.note);
});

test("filters banned, locked, unavailable and out-of-pool picks", () => {
  const result = draftOptions({
    champions: demoCatalog.champions,
    role: "TOP",
    opponent: champion("Renekton"),
    focus: "counter",
    live: {
      ...demoDraft,
      banned: [champion("Poppy").key],
      allies: [{ champion: champion("Quinn").key, role: "TOP", locked: true }],
      pickable: ["Poppy", "Fiora", "Quinn", "Vayne"].map(
        (id) => champion(id).key,
      ),
    },
    pool: new Set(["Poppy", "Fiora", "Quinn", "Camille"]),
    poolOnly: true,
  });
  expect(result.map((option) => option.champion.id)).toEqual(["Fiora"]);
});
