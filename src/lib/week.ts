const ZONE = "Australia/Sydney";

function ymdParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return { ymd: `${get("year")}-${get("month")}-${get("day")}`, weekday: get("weekday") };
}

function addDays(ymd: string, days: number): string {
  const [year, month, day] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + days));
  return next.toISOString().slice(0, 10);
}

/** Midnight at the start of a Sydney calendar date, as a UTC timestamp. */
export function sydneyMidnight(ymd: string): number {
  let guess = Date.parse(`${ymd}T00:00:00Z`);
  for (let i = 0; i < 6; i += 1) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(guess));
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
    const got = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
    guess -= got - Date.parse(`${ymd}T00:00:00Z`);
  }
  return guess;
}

export function weekKey(now = new Date()): string {
  const { ymd, weekday } = ymdParts(now);
  const index = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(weekday);
  return addDays(ymd, -(index < 0 ? 0 : index));
}

export function nextResetIso(now = new Date()): string {
  return new Date(sydneyMidnight(addDays(weekKey(now), 7))).toISOString();
}

export function weekStartMs(week: string): number {
  return sydneyMidnight(week);
}
