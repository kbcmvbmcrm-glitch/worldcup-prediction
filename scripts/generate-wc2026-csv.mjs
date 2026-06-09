import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const MONTHS = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function parseDate(dateStr) {
  const [day, month, year] = dateStr.split("-");
  return `20${year}-${MONTHS[month]}-${day.padStart(2, "0")}`;
}

function toKickoffAt(dateStr, timeStr) {
  const date = parseDate(dateStr);
  const [hour, minute] = timeStr.split(":");
  return `${date}T${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:00-04:00`;
}

function parseMatchup(matchup) {
  const [home, away] = matchup.split(" v ").map((team) => team.trim());
  return { home, away };
}

function betAmountForStage(stage) {
  if (stage.startsWith("group_")) return 100;
  if (stage === "round_of_32") return 150;
  if (stage === "round_of_16") return 200;
  if (stage === "quarter_final") return 300;
  if (stage === "semi_final") return 500;
  if (stage === "third_place") return 300;
  if (stage === "final") return 1000;
  return 100;
}

function escapeCsv(value) {
  const text = String(value);
  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

const groupMatches = [
  ["11-Jun-26", "15:00", "Mexico v South Africa", "A"],
  ["11-Jun-26", "22:00", "South Korea v Czechia", "A"],
  ["12-Jun-26", "15:00", "Canada v Bosnia and Herzegovina", "B"],
  ["12-Jun-26", "21:00", "USA v Paraguay", "D"],
  ["13-Jun-26", "21:00", "Haiti v Scotland", "C"],
  ["13-Jun-26", "00:00", "Australia v Türkiye", "D"],
  ["13-Jun-26", "18:00", "Brazil v Morocco", "C"],
  ["13-Jun-26", "15:00", "Qatar v Switzerland", "B"],
  ["14-Jun-26", "19:00", "Ivory Coast v Ecuador", "E"],
  ["14-Jun-26", "13:00", "Germany v Curaçao", "E"],
  ["14-Jun-26", "16:00", "Netherlands v Japan", "F"],
  ["14-Jun-26", "22:00", "Sweden v Tunisia", "F"],
  ["15-Jun-26", "18:00", "Saudi Arabia v Uruguay", "H"],
  ["15-Jun-26", "12:00", "Spain v Cape Verde", "H"],
  ["15-Jun-26", "21:00", "Iran v New Zealand", "G"],
  ["15-Jun-26", "15:00", "Belgium v Egypt", "G"],
  ["16-Jun-26", "15:00", "France v Senegal", "I"],
  ["16-Jun-26", "18:00", "Iraq v Norway", "I"],
  ["16-Jun-26", "21:00", "Argentina v Algeria", "J"],
  ["16-Jun-26", "00:00", "Austria v Jordan", "J"],
  ["17-Jun-26", "19:00", "Ghana v Panama", "L"],
  ["17-Jun-26", "16:00", "England v Croatia", "L"],
  ["17-Jun-26", "13:00", "Portugal v Congo DR", "K"],
  ["17-Jun-26", "22:00", "Uzbekistan v Colombia", "K"],
  ["18-Jun-26", "12:00", "Czechia v South Africa", "A"],
  ["18-Jun-26", "15:00", "Switzerland v Bosnia and Herzegovina", "B"],
  ["18-Jun-26", "18:00", "Canada v Qatar", "B"],
  ["18-Jun-26", "21:00", "Mexico v South Korea", "A"],
  ["19-Jun-26", "21:00", "Brazil v Haiti", "C"],
  ["19-Jun-26", "18:00", "Scotland v Morocco", "C"],
  ["19-Jun-26", "23:00", "Türkiye v Paraguay", "D"],
  ["19-Jun-26", "15:00", "USA v Australia", "D"],
  ["20-Jun-26", "16:00", "Germany v Ivory Coast", "E"],
  ["20-Jun-26", "20:00", "Ecuador v Curaçao", "E"],
  ["20-Jun-26", "13:00", "Netherlands v Sweden", "F"],
  ["20-Jun-26", "00:00", "Tunisia v Japan", "F"],
  ["21-Jun-26", "18:00", "Uruguay v Cape Verde", "H"],
  ["21-Jun-26", "12:00", "Spain v Saudi Arabia", "H"],
  ["21-Jun-26", "15:00", "Belgium v Iran", "G"],
  ["21-Jun-26", "21:00", "New Zealand v Egypt", "G"],
  ["22-Jun-26", "20:00", "Norway v Senegal", "I"],
  ["22-Jun-26", "17:00", "France v Iraq", "I"],
  ["22-Jun-26", "13:00", "Argentina v Austria", "J"],
  ["22-Jun-26", "23:00", "Jordan v Algeria", "J"],
  ["23-Jun-26", "16:00", "England v Ghana", "L"],
  ["23-Jun-26", "19:00", "Panama v Croatia", "L"],
  ["23-Jun-26", "13:00", "Portugal v Uzbekistan", "K"],
  ["23-Jun-26", "22:00", "Colombia v Congo DR", "K"],
  ["24-Jun-26", "18:00", "Scotland v Brazil", "C"],
  ["24-Jun-26", "18:00", "Morocco v Haiti", "C"],
  ["24-Jun-26", "15:00", "Switzerland v Canada", "B"],
  ["24-Jun-26", "15:00", "Bosnia and Herzegovina v Qatar", "B"],
  ["24-Jun-26", "21:00", "Czechia v Mexico", "A"],
  ["24-Jun-26", "21:00", "South Africa v South Korea", "A"],
  ["25-Jun-26", "16:00", "Curaçao v Ivory Coast", "E"],
  ["25-Jun-26", "16:00", "Ecuador v Germany", "E"],
  ["25-Jun-26", "19:00", "Japan v Sweden", "F"],
  ["25-Jun-26", "19:00", "Tunisia v Netherlands", "F"],
  ["25-Jun-26", "22:00", "Türkiye v USA", "D"],
  ["25-Jun-26", "22:00", "Paraguay v Australia", "D"],
  ["26-Jun-26", "15:00", "Norway v France", "I"],
  ["26-Jun-26", "15:00", "Senegal v Iraq", "I"],
  ["26-Jun-26", "23:00", "Egypt v Iran", "G"],
  ["26-Jun-26", "23:00", "New Zealand v Belgium", "G"],
  ["26-Jun-26", "20:00", "Cape Verde v Saudi Arabia", "H"],
  ["26-Jun-26", "20:00", "Uruguay v Spain", "H"],
  ["27-Jun-26", "17:00", "Panama v England", "L"],
  ["27-Jun-26", "17:00", "Croatia v Ghana", "L"],
  ["27-Jun-26", "22:00", "Algeria v Austria", "J"],
  ["27-Jun-26", "22:00", "Jordan v Argentina", "J"],
  ["27-Jun-26", "19:30", "Colombia v Portugal", "K"],
  ["27-Jun-26", "19:30", "Congo DR v Uzbekistan", "K"],
];

const knockoutMatches = [
  ["28-Jun-26", "15:00", "Group A Runners Up v Group B Runners Up", "round_of_32"],
  ["29-Jun-26", "16:30", "Group E Winners v Group A/B/C/D/F 3rd Place", "round_of_32"],
  ["29-Jun-26", "21:00", "Group F Winners v Group C Runners Up", "round_of_32"],
  ["29-Jun-26", "13:00", "Group C Winners v Group F Runners Up", "round_of_32"],
  ["30-Jun-26", "17:00", "Group I Winners v Group C/D/F/G/H 3rd Place", "round_of_32"],
  ["30-Jun-26", "13:00", "Group E Runners Up v Group I Runners Up", "round_of_32"],
  ["30-Jun-26", "21:00", "Group A Winners v Group C/E/F/H/I 3rd Place", "round_of_32"],
  ["1-Jul-26", "12:00", "Group L Winners v Group E/H/I/J/K 3rd Place", "round_of_32"],
  ["1-Jul-26", "20:00", "Group D Winners v Group B/E/F/I/J 3rd Place", "round_of_32"],
  ["1-Jul-26", "16:00", "Group G Winners v Group A/E/H/I/J 3rd Place", "round_of_32"],
  ["2-Jul-26", "19:00", "Group K Runners Up v Group L Runners Up", "round_of_32"],
  ["2-Jul-26", "15:00", "Group H Winners v Group J Runners Up", "round_of_32"],
  ["2-Jul-26", "23:00", "Group B Winners v Group E/F/G/I/J 3rd Place", "round_of_32"],
  ["3-Jul-26", "18:00", "Group J Winners v Group H Runners Up", "round_of_32"],
  ["3-Jul-26", "21:30", "Group K Winners v Group D/E/I/J/L 3rd Place", "round_of_32"],
  ["3-Jul-26", "14:00", "Group D Runners Up v Group G Runners Up", "round_of_32"],
  ["4-Jul-26", "17:00", "Match 74 Winner v Match 77 Winner", "round_of_16"],
  ["4-Jul-26", "13:00", "Match 73 Winner v Match 75 Winner", "round_of_16"],
  ["5-Jul-26", "16:00", "Match 76 Winner v Match 78 Winner", "round_of_16"],
  ["5-Jul-26", "20:00", "Match 79 Winner v Match 80 Winner", "round_of_16"],
  ["6-Jul-26", "15:00", "Match 83 Winner v Match 84 Winner", "round_of_16"],
  ["6-Jul-26", "20:00", "Match 81 Winner v Match 82 Winner", "round_of_16"],
  ["7-Jul-26", "12:00", "Match 86 Winner v Match 88 Winner", "round_of_16"],
  ["7-Jul-26", "16:00", "Match 85 Winner v Match 87 Winner", "round_of_16"],
  ["9-Jul-26", "16:00", "Match 89 Winner v Match 90 Winner", "quarter_final"],
  ["10-Jul-26", "15:00", "Match 93 Winner v Match 94 Winner", "quarter_final"],
  ["11-Jul-26", "17:00", "Match 91 Winner v Match 92 Winner", "quarter_final"],
  ["11-Jul-26", "21:00", "Match 95 Winner v Match 96 Winner", "quarter_final"],
  ["14-Jul-26", "15:00", "Match 97 Winner v Match 98 Winner", "semi_final"],
  ["15-Jul-26", "15:00", "Match 99 Winner v Match 100 Winner", "semi_final"],
  ["18-Jul-26", "17:00", "Match 101 Loser v Match 102 Loser", "third_place"],
  ["19-Jul-26", "15:00", "Match 101 Winner v Match 102 Winner", "final"],
];

const rows = [
  "home_team,away_team,kickoff_at,stage,bet_amount,result,settled",
];

for (const [date, time, matchup, group] of groupMatches) {
  const { home, away } = parseMatchup(matchup);
  const stage = `group_${group.toLowerCase()}`;
  const betAmount = betAmountForStage(stage);
  rows.push(
    [
      escapeCsv(home),
      escapeCsv(away),
      escapeCsv(toKickoffAt(date, time)),
      stage,
      betAmount,
      "",
      "false",
    ].join(","),
  );
}

for (const [date, time, matchup, stage] of knockoutMatches) {
  const { home, away } = parseMatchup(matchup);
  const betAmount = betAmountForStage(stage);
  rows.push(
    [
      escapeCsv(home),
      escapeCsv(away),
      escapeCsv(toKickoffAt(date, time)),
      stage,
      betAmount,
      "",
      "false",
    ].join(","),
  );
}

const csvContent = `${rows.join("\n")}\n`;
const outputPaths = [
  join(__dirname, "..", "data", "world-cup-2026-matches.csv"),
  join(__dirname, "..", "public", "data", "world-cup-2026-matches.csv"),
];

for (const outputPath of outputPaths) {
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, csvContent, "utf8");
  console.log(`Generated ${rows.length - 1} matches to ${outputPath}`);
}
