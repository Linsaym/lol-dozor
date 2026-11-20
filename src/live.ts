import { useEffect, useState } from "react";
import {
  desktop,
  getSnapshot,
  getStats,
  type KeyStatus,
  type Player,
  type Snapshot,
  type Stats,
} from "./game";

export function useLeagueClient() {
  const [snapshot, setSnapshot] = useState<Snapshot>();
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!desktop) return;
    let disposed = false;
    let timeout: number | undefined;
    async function poll() {
      let delay = 2500;
      try {
        const next = await getSnapshot();
        if (next.phase === "ChampSelect" || next.phase === "ReadyCheck") {
          delay = 900;
        }
        if (!disposed) {
          setSnapshot(next);
          setError(false);
        }
      } catch {
        if (!disposed) setError(true);
      } finally {
        if (!disposed) timeout = window.setTimeout(poll, delay);
      }
    }
    void poll();
    return () => {
      disposed = true;
      window.clearTimeout(timeout);
    };
  }, []);
  return { snapshot, error };
}

const rosterSeparator = "|";

export function useMatchStats(
  id: string,
  players: Player[],
  key: KeyStatus,
  refresh: number,
) {
  const roster = players
    .filter((player) => player.gameName || player.isMe)
    .map((p) => p.slot)
    .join(rosterSeparator);
  const requestId = JSON.stringify([id, roster, key.revision, refresh]);
  const [result, setResult] = useState<{
    id: string;
    stats: Record<string, Stats>;
  }>({ id: "", stats: {} });
  useEffect(() => {
    if (!desktop || !id || !roster || !key.configured) return;
    let disposed = false;
    for (const slot of roster.split(rosterSeparator)) {
      void getStats(id, slot, key.revision)
        .catch((issue: Stats["issue"]): Stats => ({
          rank: null,
          matches: [],
          issue,
        }))
        .then((data) => {
          if (disposed) return;
          setResult((previous) => ({
            id: requestId,
            stats: {
              ...(previous.id === requestId ? previous.stats : {}),
              [slot]: data,
            },
          }));
        });
    }
    return () => {
      disposed = true;
    };
  }, [id, key.configured, key.revision, requestId, roster]);
  return {
    stats: result.id === requestId ? result.stats : {},
    loading:
      desktop &&
      key.configured &&
      Boolean(id && roster) &&
      (result.id !== requestId ||
        Object.keys(result.stats).length <
          roster.split(rosterSeparator).length),
  };
}
