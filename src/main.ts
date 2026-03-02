import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

const PORT = parseInt(Deno.env.get("PORT") ?? "8000");

async function getDb(): Promise<Client> {
  const client = new Client({
    hostname: Deno.env.get("DB_HOST") ?? "localhost",
    port: parseInt(Deno.env.get("DB_PORT") ?? "5432"),
    user: Deno.env.get("DB_USER") ?? "postgres",
    password: Deno.env.get("DB_PASS") ?? "",
    database: Deno.env.get("DB_NAME") ?? "db",
    tls: { enabled: false },
  });
  await client.connect();
  return client;
}

Deno.serve({ port: PORT }, async (_req: Request) => {
  let greeting = "";
  let dbStatus = "OK";

  try {
    const client = await getDb();
    const result = await client.queryObject<{ message: string }>(
      "SELECT message FROM greetings LIMIT 1",
    );
    await client.end();
    greeting = result.rows[0]?.message ?? "";
  } catch (err) {
    dbStatus = `ERROR: ${err instanceof Error ? err.message : String(err)}`;
  }

  const status = dbStatus === "OK" ? 200 : 503;
  return Response.json(
    {
      type: "deno",
      greeting,
      status: { database: dbStatus },
    },
    { status },
  );
});

console.log(`Server listening on port ${PORT}`);
