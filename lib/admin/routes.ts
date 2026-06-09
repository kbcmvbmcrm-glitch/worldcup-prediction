/**
 * 管理画面のルート定義。
 * 将来の管理者パスワード保護は middleware や layout でこの配列を参照しやすい。
 */
export const ADMIN_ROUTES = {
  participants: {
    href: "/admin/participants",
    label: "参加者管理",
  },
  results: {
    href: "/admin/results",
    label: "結果確定・精算",
  },
  import: {
    href: "/admin/import",
    label: "CSVインポート",
  },
} as const;

export const ADMIN_ROUTE_LIST = Object.values(ADMIN_ROUTES);
