interface Envelope<T> {
  data?: T;
  error?: { code: string; message: string };
}

async function unwrap<T>(res: Response): Promise<T> {
  const json = (await res.json().catch(() => null)) as Envelope<T> | null;
  if (!res.ok || !json || json.data === undefined) {
    throw new Error(json?.error?.message ?? `Request failed (${res.status})`);
  }
  return json.data;
}

/** Typed fetch wrappers for the app's `{ data } | { error }` API envelope. */
export async function apiGet<T>(path: string): Promise<T> {
  return unwrap<T>(await fetch(path));
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return unwrap<T>(
    await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );
}
