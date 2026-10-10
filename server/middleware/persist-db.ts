import { flushDbIfDirty } from "../../src/lib/db";

export default async function persistDb(_event: unknown, next: () => unknown | Promise<unknown>) {
  const result = await next();
  await flushDbIfDirty();
  return result;
}
