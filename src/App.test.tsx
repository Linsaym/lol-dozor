import "@testing-library/jest-dom/vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import App from "./App";
import { demoDraft, demoMatch } from "./demo";
import { profileUrl } from "./game";

const ipc = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@tauri-apps/api/core", () => ({
  isTauri: () => true,
  invoke: ipc.invoke,
}));

beforeEach(() => {
  localStorage.clear();
  ipc.invoke.mockReset();
  ipc.invoke.mockImplementation(async (command: string) => {
    if (command === "key_status") return { configured: false, revision: 0 };
    if (command === "client_snapshot")
      return {
        connected: true,
        phase: "None",
        platform: "ru",
        account: "",
        game: null,
      };
    throw new Error(`Unexpected fixture command: ${command}`);
  });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(new Error("offline fixture")),
  );
  vi.stubGlobal("scrollTo", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

test("opens demo analytics and changes the lane opponent offline", () => {
  localStorage.setItem("dozor.demo", "true");
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Аналитика матча" }),
  ).toBeVisible();
  expect(
    screen.getByText("Демонстрационный матч", { exact: false }),
  ).toBeVisible();
  expect(screen.getByRole("heading", { name: "Союзники" })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Противники" })).toBeVisible();
  const matchup = screen.getByRole("link", { name: "МАТЧАП НА YOUTUBE" });
  expect(matchup).toHaveAttribute(
    "href",
    expect.stringContaining("Aatrox+vs+Renekton"),
  );
  expect(
    screen.getByRole("heading", { name: "Способности · Ренектон" }),
  ).toBeVisible();
  fireEvent.change(screen.getByRole("combobox", { name: "Соперник" }), {
    target: { value: "demo-7" },
  });
  expect(
    screen.getByRole("heading", { name: "Способности · Синдра" }),
  ).toBeVisible();
  expect(matchup).toHaveAttribute(
    "href",
    expect.stringContaining("Aatrox+vs+Syndra"),
  );
  expect(
    screen.getByRole("link", { name: "Iron Warden#RU1 · LeagueOfGraphs" }),
  ).toHaveAttribute(
    "href",
    "https://www.leagueofgraphs.com/ru/summoner/ru/Iron+Warden-RU1/last-30-days",
  );
});

test("shows planned controls disabled and remembers compact mode", () => {
  localStorage.setItem("dozor.demo", "false");
  render(<App />);
  expect(
    screen.getByRole("heading", { level: 1, name: "LoL Dozor" }),
  ).toBeVisible();
  const controls = within(
    screen.getByRole("group", { name: "Запланированные функции" }),
  );
  expect(controls.getByRole("checkbox")).toBeDisabled();
  expect(controls.getAllByRole("combobox")).toHaveLength(6);
  for (const select of controls.getAllByRole("combobox"))
    expect(select).toBeDisabled();
  const toggle = screen.getByRole("button", { name: "Компактный режим" });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "true");
  expect(localStorage.getItem("dozor.compact")).toBe("true");
});

test("encodes Riot ID and maps different platform regions", () => {
  expect(profileUrl("ru", "Добрая Лулу", "meow")).toBe(
    "https://www.leagueofgraphs.com/ru/summoner/ru/%D0%94%D0%BE%D0%B1%D1%80%D0%B0%D1%8F+%D0%9B%D1%83%D0%BB%D1%83-meow/last-30-days",
  );
  expect(profileUrl("eun1", "Space Name", "EUNE")).toContain(
    "/summoner/eune/Space+Name-EUNE/",
  );
  expect(profileUrl("unknown", "Player", "RU1")).toBeNull();
});

test("opens a detected match automatically and exposes missing Riot credentials", async () => {
  vi.useFakeTimers();
  const fixture = {
    connected: true,
    phase: "None",
    platform: "ru",
    account: "Fixture Player",
    game: null,
  };
  ipc.invoke
    .mockResolvedValueOnce(fixture)
    .mockResolvedValueOnce({ configured: false, revision: 0 })
    .mockResolvedValueOnce({
      ...fixture,
      phase: "InProgress",
      game: { ...demoMatch, id: "fixture-game" },
    });
  render(<App />);
  await act(async () => {});
  expect(
    screen.getByRole("heading", { name: "League of Legends подключён" }),
  ).toBeVisible();
  await act(async () => vi.advanceTimersByTimeAsync(2500));
  expect(
    screen.getByRole("heading", { level: 1, name: "Аналитика матча" }),
  ).toBeVisible();
  expect(
    screen.getByText("Добавьте ключ Riot API в настройках."),
  ).toBeVisible();
  expect(
    screen.queryByText("Демонстрационный матч", { exact: false }),
  ).toBeNull();
  expect(ipc.invoke).not.toHaveBeenCalledWith(
    "player_stats",
    expect.anything(),
  );
});

test("opens champion select and carries a chosen enemy into that match", async () => {
  vi.useFakeTimers();
  const fixture = {
    connected: true,
    platform: "ru",
    account: "Fixture Player",
    draftContext: 17,
  };
  ipc.invoke
    .mockResolvedValueOnce({
      ...fixture,
      phase: "ChampSelect",
      draft: demoDraft,
      game: null,
    })
    .mockResolvedValueOnce({ configured: false, revision: 0 })
    .mockResolvedValueOnce({
      ...fixture,
      phase: "InProgress",
      game: { ...demoMatch, id: "fixture-game" },
    });
  render(<App />);
  await act(async () => {});
  expect(
    screen.getByRole("heading", { level: 1, name: "Драфт" }),
  ).toBeVisible();
  expect(screen.getByRole("button", { name: "Топ" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  fireEvent.click(screen.getByRole("button", { name: "Ли Син" }));
  expect(screen.getByRole("heading", { name: "Поппи" })).toBeVisible();
  await act(async () => vi.advanceTimersByTimeAsync(900));
  expect(
    screen.getByRole("heading", { level: 1, name: "Аналитика матча" }),
  ).toBeVisible();
  expect(screen.getByRole("combobox", { name: "Соперник" })).toHaveValue(
    demoMatch.players.find((player) => player.champion === "LeeSin")?.slot,
  );
});
