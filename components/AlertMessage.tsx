type AlertMessageProps = {
  type: "error" | "success";
  message: string;
  details?: string[];
};

export function AlertMessage({ type, message, details }: AlertMessageProps) {
  const styles =
    type === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <p className="font-medium">{message}</p>
      {details && details.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
