import { Client } from "https://deno.land/x/postgres@v0.19.3/mod.ts";

function createClient(): Client {
  return new Client({
    hostname: Deno.env.get("DB_HOST") ?? "localhost",
    port: parseInt(Deno.env.get("DB_PORT") ?? "5432"),
    user: Deno.env.get("DB_USER") ?? "postgres",
    password: Deno.env.get("DB_PASS") ?? "",
    database: Deno.env.get("DB_NAME") ?? "db",
    tls: { enabled: false },
  });
}

async function connectWithRetry(
  maxAttempts = 60,
  delayMs = 2000,
): Promise<Client> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const client = createClient();
    try {
      await client.connect();
      return client;
    } catch (err) {
      lastError = err;
      try {
        await client.end();
      } catch {
        // Ignore cleanup errors after a failed connect.
      }

      const message = err instanceof Error ? err.message : String(err);
      if (attempt === maxAttempts) {
        break;
      }

      console.log(
        `Database not ready (attempt ${attempt}/${maxAttempts}): ${message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  const message = lastError instanceof Error
    ? lastError.message
    : String(lastError);
  throw new Error(`Failed to connect to database: ${message}`);
}

async function migrate(): Promise<void> {
  const client = await connectWithRetry();

  try {
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
  } finally {
    await client.end();
  }
}

migrate().catch((err) => {
  console.error(err);
  Deno.exit(1);
});
