/**
 * static.ts — serves frontend/public in the production (Nitro) server with
 * HTTP Range support. Nitro's built-in static handler always answers 200 with
 * the whole file, and Safari / iOS refuse to play <video> without 206 partial
 * responses. Registered in vite.config.ts in place of Nitro's handler.
 */
import { createReadStream } from "node:fs";
import { dirname, resolve } from "node:path";
import { Readable } from "node:stream";
import { fileURLToPath } from "node:url";
import { defineHandler } from "nitro/h3";
// @ts-expect-error Nitro virtual module: { [urlPath]: { type, etag, mtime, size, path, encoding } }
import assets from "#nitro/virtual/public-assets-data";

type Asset = {
  type?: string;
  etag?: string;
  mtime?: string;
  size: number;
  path: string;
  encoding?: string;
};

const table = assets as Record<string, Asset>;

function lookup(pathname: string): [string, Asset] | undefined {
  let id: string;
  try {
    id = decodeURIComponent(pathname);
  } catch {
    return undefined;
  }
  if (id.length > 1 && id.endsWith("/")) id = id.slice(0, -1);
  for (const candidate of [id, `${id === "/" ? "" : id}/index.html`]) {
    const asset = table[candidate];
    if (asset) return [candidate, asset];
  }
  return undefined;
}

/** Parse a single "bytes=a-b" / "bytes=a-" / "bytes=-n" range; null = unsatisfiable. */
function parseRange(
  header: string,
  size: number,
): { start: number; end: number } | null | undefined {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return undefined; // malformed or multi-range: ignore and send the whole file
  const [, a, b] = match;
  let start: number;
  let end: number;
  if (a === "") {
    if (b === "") return undefined;
    start = Math.max(0, size - Number(b));
    end = size - 1;
  } else {
    start = Number(a);
    end = b === "" ? size - 1 : Math.min(Number(b), size - 1);
  }
  if (start > end || start >= size) return null;
  return { start, end };
}

export default defineHandler((event) => {
  const method = event.req.method;
  if (method !== "GET" && method !== "HEAD") return;

  const found = lookup(event.url.pathname);
  if (!found) {
    // Hashed build assets that don't exist are a real 404, not a page route.
    if (event.url.pathname.startsWith("/assets/"))
      return new Response("Not Found", { status: 404 });
    return; // fall through to the app (SSR)
  }
  const [, asset] = found;

  const headers = new Headers({ "Accept-Ranges": "bytes" });
  if (asset.type) headers.set("Content-Type", asset.type);
  if (asset.etag) headers.set("ETag", asset.etag);
  if (asset.mtime) headers.set("Last-Modified", new Date(asset.mtime).toUTCString());
  if (asset.encoding) headers.set("Content-Encoding", asset.encoding);

  if (asset.etag && event.req.headers.get("if-none-match") === asset.etag) {
    return new Response(null, { status: 304, headers });
  }

  const file = resolve(
    dirname(
      fileURLToPath((globalThis as { __nitro_main__?: string }).__nitro_main__ ?? import.meta.url),
    ),
    asset.path,
  );
  const rangeHeader = event.req.headers.get("range");
  const range = rangeHeader && !asset.encoding ? parseRange(rangeHeader, asset.size) : undefined;

  if (range === null) {
    headers.set("Content-Range", `bytes */${asset.size}`);
    return new Response(null, { status: 416, headers });
  }

  const start = range?.start ?? 0;
  const end = range?.end ?? asset.size - 1;
  headers.set("Content-Length", String(asset.size === 0 ? 0 : end - start + 1));
  if (range) headers.set("Content-Range", `bytes ${start}-${end}/${asset.size}`);

  const body =
    method === "HEAD" || asset.size === 0
      ? null
      : (Readable.toWeb(createReadStream(file, { start, end })) as ReadableStream<Uint8Array>);
  return new Response(body, { status: range ? 206 : 200, headers });
});
