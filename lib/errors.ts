export function toJapaneseDbError(context: string): string {
  return `${context}に失敗しました。しばらくしてから再度お試しください。`;
}

export function getErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof Error && error.message) {
    const message = error.message;

    if (
      message.startsWith("Failed to fetch") ||
      message.includes("JWT") ||
      message.includes("permission denied") ||
      message.includes("row-level security")
    ) {
      return toJapaneseDbError(fallback);
    }

    return message;
  }

  return fallback;
}
