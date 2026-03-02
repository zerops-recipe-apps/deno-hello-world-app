import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const client = new Client({
  hostname: Deno.env.get("DB_HOST") ?? "localhost",
  port: parseInt(Deno.env.get("DB_PORT") ?? "5432"),
  user: Deno.env.get("DB_USER") ?? "postgres",
  password: Deno.env.get("DB_PASS") ?? "",
  database: Deno.env.get("DB_NAME") ?? "db",
  tls: { enabled: false },
});

await client.connect();

await client.queryArray(`
  CREATE TABLE IF NOT EXISTS greetings (
    id INTEGER PRIMARY KEY,
    message TEXT NOT NULL
  )
`);

await client.queryArray(`
  INSERT INTO greetings (id, message) VALUES (1, 'Hello from Zerops!')
  ON CONFLICT (id) DO NOTHING
`);

console.log("Migration completed successfully.");
await client.end();
