export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  console.error("[CRIC Runtime Error]", error, context);
}
