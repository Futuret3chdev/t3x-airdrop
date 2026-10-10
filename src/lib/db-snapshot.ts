const KEY = "t3x-db.tgz";

function token(): string | undefined {
  const value = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  return value || undefined;
}

export function snapshotsEnabled(): boolean {
  return Boolean(token());
}

export async function readSnapshot(): Promise<Blob | null> {
  const access = token();
  if (!access) return null;
  const { list } = await import("@vercel/blob");
  const found = await list({ prefix: KEY, token: access, limit: 1 });
  const url = found.blobs.find((blob) => blob.pathname === KEY)?.url;
  if (!url) return null;
  const response = await fetch(url, { headers: { authorization: `Bearer ${access}` } });
  if (!response.ok) return null;
  return await response.blob();
}

export async function writeSnapshot(body: Blob): Promise<void> {
  const access = token();
  if (!access) return;
  const { put } = await import("@vercel/blob");
  await put(KEY, body, { access: "private", token: access, addRandomSuffix: false, allowOverwrite: true });
}
