/* =========================================================
   BASE DE DONNÉES — Postgres
   Production (Vercel) : Neon, via la variable DATABASE_URL (ou POSTGRES_URL).
   En local, sans DATABASE_URL : Postgres embarqué (PGlite), stocké dans .data/pglite.
   Les tables sont créées automatiquement au premier appel.
   ========================================================= */
import { mkdirSync } from "node:fs";
import path from "node:path";

export type Row = Record<string, unknown>;
export type Q = { text: string; params?: unknown[] };
type Driver = { query: (text: string, params?: unknown[]) => Promise<Row[]>; tx: (qs: Q[]) => Promise<Row[][]> };

/** Base non configurée en production : la réservation est désactivée proprement. */
export class DbUnavailable extends Error {}

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS clients (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL UNIQUE,
    email text,
    notes text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    service_id text NOT NULL,
    service_name text NOT NULL,
    duration_min int NOT NULL,
    price_cents int NOT NULL,
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'done', 'no_show', 'cancelled')),
    source text NOT NULL DEFAULT 'site',
    note text NOT NULL DEFAULT '',
    token text NOT NULL UNIQUE,
    ip_hash text,
    created_at timestamptz NOT NULL DEFAULT now(),
    cancelled_at timestamptz
  )`,
  `CREATE INDEX IF NOT EXISTS appointments_starts_at_idx ON appointments (starts_at)`,
  `CREATE INDEX IF NOT EXISTS appointments_client_idx ON appointments (client_id)`,
  `CREATE TABLE IF NOT EXISTS blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    starts_at timestamptz NOT NULL,
    ends_at timestamptz NOT NULL,
    reason text NOT NULL DEFAULT '',
    created_at timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE TABLE IF NOT EXISTS settings (key text PRIMARY KEY, value jsonb NOT NULL)`
];

async function connect(): Promise<Driver> {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  let d: Driver;
  if (url) {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(url);
    d = {
      query: (text, params = []) => sql.query(text, params) as Promise<Row[]>,
      tx: async qs => (await sql.transaction(qs.map(q => sql.query(q.text, q.params ?? [])))) as Row[][]
    };
  } else if (process.env.VERCEL) {
    throw new DbUnavailable("DATABASE_URL n’est pas configurée");
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const dir = path.join(process.cwd(), ".data", "pglite");
    mkdirSync(dir, { recursive: true });
    const pg = await PGlite.create(dir);
    d = {
      query: async (text, params = []) => (await pg.query<Row>(text, params)).rows,
      tx: qs => pg.transaction(async t => { const out: Row[][] = []; for (const q of qs) out.push((await t.query<Row>(q.text, q.params ?? [])).rows); return out; })
    };
  }
  for (const s of SCHEMA) await d.query(s);
  return d;
}

const g = globalThis as unknown as { __finnsDb?: Promise<Driver> };
export function db(): Promise<Driver> {
  if (!g.__finnsDb) g.__finnsDb = connect().catch(e => { g.__finnsDb = undefined; throw e; });
  return g.__finnsDb;
}
