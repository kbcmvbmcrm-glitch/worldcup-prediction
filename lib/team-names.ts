/**
 * 2026 FIFA World Cup 出場国（48チーム）の英語→日本語変換辞書。
 * DBには英語名のまま保存し、表示時のみこの辞書を使う。
 */
export const TEAM_NAME_JA: Record<string, string> = {
  Algeria: "アルジェリア",
  Argentina: "アルゼンチン",
  Australia: "オーストラリア",
  Austria: "オーストリア",
  Belgium: "ベルギー",
  "Bosnia and Herzegovina": "ボスニア・ヘルツェゴビナ",
  Brazil: "ブラジル",
  Canada: "カナダ",
  "Cape Verde": "カーボベルデ",
  Colombia: "コロンビア",
  "Congo DR": "コンゴ民主共和国",
  Croatia: "クロアチア",
  Curaçao: "キュラソー",
  Czechia: "チェコ",
  Ecuador: "エクアドル",
  Egypt: "エジプト",
  England: "イングランド",
  France: "フランス",
  Germany: "ドイツ",
  Ghana: "ガーナ",
  Haiti: "ハイチ",
  Iran: "イラン",
  Iraq: "イラク",
  "Ivory Coast": "コートジボワール",
  Japan: "日本",
  Jordan: "ヨルダン",
  Mexico: "メキシコ",
  Morocco: "モロッコ",
  Netherlands: "オランダ",
  "New Zealand": "ニュージーランド",
  Norway: "ノルウェー",
  Panama: "パナマ",
  Paraguay: "パラグアイ",
  Portugal: "ポルトガル",
  Qatar: "カタール",
  "Saudi Arabia": "サウジアラビア",
  Scotland: "スコットランド",
  Senegal: "セネガル",
  "South Africa": "南アフリカ",
  "South Korea": "韓国",
  Spain: "スペイン",
  Sweden: "スウェーデン",
  Switzerland: "スイス",
  Tunisia: "チュニジア",
  Türkiye: "トルコ",
  USA: "アメリカ",
  Uruguay: "ウルグアイ",
  Uzbekistan: "ウズベキスタン",
};

export function translateTeamName(name: string): string {
  return TEAM_NAME_JA[name] ?? name;
}

export function formatMatchup(homeTeam: string, awayTeam: string): string {
  return `${translateTeamName(homeTeam)} vs ${translateTeamName(awayTeam)}`;
}

export function formatSettledResult(
  homeTeam: string,
  awayTeam: string,
  result: "home" | "draw" | "away",
): string {
  if (result === "home") {
    return `結果：${translateTeamName(homeTeam)}勝利`;
  }

  if (result === "draw") {
    return "結果：引き分け";
  }

  return `結果：${translateTeamName(awayTeam)}勝利`;
}

export type SettlementReasonType = "win" | "lose" | "no_winner";

export function formatSettlementReason(
  homeTeam: string,
  awayTeam: string,
  type: SettlementReasonType,
): string {
  const matchup = formatMatchup(homeTeam, awayTeam);

  if (type === "win") {
    return `${matchup} 的中`;
  }

  if (type === "lose") {
    return `${matchup} 外れ`;
  }

  return `${matchup} 的中者なし`;
}
