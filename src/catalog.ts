import { useEffect, useState } from "react";
import offline from "./demo-catalog.json";
import champions from "./champions-ru.json";
import type { Player } from "./game";

const cdn = "https://ddragon.leagueoflegends.com";
const cacheKey = "dozor.catalog.v1";
const updateInterval = 30 * 60 * 1000;

export interface Champion {
  id: string;
  key: number;
  name: string;
}

export interface Spell {
  name: string;
  description: string;
  image: string;
  cooldown: number | null;
}

interface DragonSpell {
  name: string;
  description: string;
  cooldown: number[];
  image: { full: string };
}

export interface Catalog {
  patch: string;
  champions: Champion[];
  items: Record<string, string>;
}

export const demoCatalog: Catalog = { ...offline, champions };
const bundledPortraits = new Set(
  offline.champions.map((champion) => champion.id),
);
export const hasBundledPortrait = (id: string) => bundledPortraits.has(id);

async function json<T>(path: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(cdn + path, { signal });
  if (!response.ok) throw new Error("Data Dragon unavailable");
  return (await response.json()) as T;
}

function cachedCatalog(): Catalog | null {
  try {
    return JSON.parse(
      localStorage.getItem(cacheKey) ?? "null",
    ) as Catalog | null;
  } catch {
    return null;
  }
}

export function useCatalog() {
  const [catalog, setCatalog] = useState(() => cachedCatalog() ?? demoCatalog);
  const [state, setState] = useState<"loading" | "ready" | "offline">(
    "loading",
  );
  useEffect(() => {
    let controller: AbortController | undefined;
    const refresh = async () => {
      controller?.abort();
      const request = new AbortController();
      controller = request;
      const signal = AbortSignal.any([
        request.signal,
        AbortSignal.timeout(10000),
      ]);
      try {
        const [patch] = await json<string[]>("/api/versions.json", signal);
        if (!/^\d+\.\d+\.\d+$/.test(patch)) throw new Error("Unexpected patch");
        const cached = cachedCatalog();
        if (cached?.patch === patch && cached.champions.length > 100) {
          setCatalog(cached);
        } else {
          const base = `/cdn/${patch}/data/ru_RU`;
          const [champions, items] = await Promise.all([
            json<{ data: Record<string, Champion> }>(
              `${base}/champion.json`,
              signal,
            ),
            json<{ data: Record<string, { name: string }> }>(
              `${base}/item.json`,
              signal,
            ),
          ]);
          const next = {
            patch,
            champions: Object.values(champions.data).map(
              ({ id, key, name }) => ({
                id,
                key: Number(key),
                name,
              }),
            ),
            items: Object.fromEntries(
              Object.entries(items.data).map(([id, item]) => [id, item.name]),
            ),
          };
          if (request.signal.aborted) return;
          setCatalog(next);
          try {
            localStorage.setItem(cacheKey, JSON.stringify(next));
          } catch {
            // The catalog remains available for this session.
          }
        }
        if (!request.signal.aborted) setState("ready");
      } catch {
        if (!request.signal.aborted) setState("offline");
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, updateInterval);
    return () => {
      controller?.abort();
      window.clearInterval(interval);
    };
  }, []);
  return { catalog, state };
}

const spellCache = new Map<string, Spell[]>();

export function useSpells(patch: string, championId: string, demo: boolean) {
  const key = `${patch}/${championId}`;
  const [result, setResult] = useState<{
    key: string;
    spells: Spell[] | null;
  }>();
  useEffect(() => {
    if (!championId || demo || spellCache.has(key)) return;
    const controller = new AbortController();
    const signal = AbortSignal.any([
      controller.signal,
      AbortSignal.timeout(8000),
    ]);
    void json<{ data: Record<string, { spells: DragonSpell[] }> }>(
      `/cdn/${patch}/data/ru_RU/champion/${encodeURIComponent(championId)}.json`,
      signal,
    )
      .then(({ data }) => {
        const spells = data[championId].spells.map((spell) => ({
          name: spell.name,
          description: spell.description,
          image: spell.image.full,
          cooldown: spell.cooldown[0] > 0 ? spell.cooldown[0] : null,
        }));
        if (controller.signal.aborted) return;
        spellCache.set(key, spells);
        setResult({ key, spells });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, spells: null });
      });
    return () => controller.abort();
  }, [championId, demo, key, patch]);
  const fallback = offline.champions.find(
    (champion) => champion.id === championId,
  )?.spells;
  if (demo) return { spells: fallback ?? null, loading: false, offline: false };
  const spells =
    spellCache.get(key) ?? (result?.key === key ? result.spells : undefined);
  const matchingFallback = patch === offline.patch ? fallback : undefined;
  return {
    spells: spells ?? matchingFallback ?? null,
    loading: Boolean(championId) && spells === undefined && !matchingFallback,
    offline: spells === null && Boolean(matchingFallback),
  };
}

export function championFor(catalog: Catalog, player?: Player) {
  if (!player) return undefined;
  return (
    catalog.champions.find((champion) => champion.key === player.championId) ??
    catalog.champions.find(
      (champion) => champion.id.toLowerCase() === player.champion.toLowerCase(),
    ) ??
    (player.champion
      ? { id: player.champion, key: player.championId, name: player.champion }
      : undefined)
  );
}

export function gameImage(
  patch: string,
  type: "champion" | "spell" | "item" | "splash",
  file: string,
  demo: boolean,
) {
  if (type === "splash") {
    return demo
      ? `/demo/${file}.jpg`
      : `${cdn}/cdn/img/champion/splash/${encodeURIComponent(file)}_0.jpg`;
  }
  return demo
    ? `/demo/${file}`
    : `${cdn}/cdn/${patch}/img/${type}/${encodeURIComponent(file)}`;
}
