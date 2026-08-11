/**
 * Browser-side calls to our own /api routes. Cookies ride along on same-origin
 * requests, so the session travels without any header work.
 *
 * The API answers errors as `{ error: "…" }` in Arabic, so the message is
 * shown to the user as-is.
 */
export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number; error: string };

export async function apiFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<ApiResult<T>> {
  let response: Response;

  try {
    response = await fetch(path, {
      ...init,
      headers: { "content-type": "application/json", ...init?.headers },
    });
  } catch {
    return { ok: false, status: 0, error: "تعذّر الاتصال بالخادم" };
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body
        ? String((body as { error: unknown }).error)
        : "تعذّر إتمام العملية";
    return { ok: false, status: response.status, error: message };
  }

  return { ok: true, data: body as T };
}
