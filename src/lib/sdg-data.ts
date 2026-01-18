export interface SDGInfo {
  code: string;
  name: string;
  color: string;
  icon: string;
}

export const SDG_DATA: Record<string, SDGInfo> = {
  sdg_1: {
    code: "sdg_1",
    name: "No Poverty",
    color: "#E5243B",
    icon: "🏠",
  },
  sdg_2: {
    code: "sdg_2",
    name: "Zero Hunger",
    color: "#DDA63A",
    icon: "🍽️",
  },
  sdg_3: {
    code: "sdg_3",
    name: "Good Health",
    color: "#4C9F38",
    icon: "❤️",
  },
  sdg_4: {
    code: "sdg_4",
    name: "Quality Education",
    color: "#C5192D",
    icon: "📚",
  },
  sdg_5: {
    code: "sdg_5",
    name: "Gender Equality",
    color: "#FF3A21",
    icon: "⚧️",
  },
  sdg_6: {
    code: "sdg_6",
    name: "Clean Water",
    color: "#26BDE2",
    icon: "💧",
  },
  sdg_7: {
    code: "sdg_7",
    name: "Clean Energy",
    color: "#FCC30B",
    icon: "⚡",
  },
  sdg_8: {
    code: "sdg_8",
    name: "Decent Work",
    color: "#A21942",
    icon: "💼",
  },
  sdg_9: {
    code: "sdg_9",
    name: "Industry & Innovation",
    color: "#FD6925",
    icon: "🏭",
  },
  sdg_10: {
    code: "sdg_10",
    name: "Reduced Inequalities",
    color: "#DD1367",
    icon: "⚖️",
  },
  sdg_11: {
    code: "sdg_11",
    name: "Sustainable Cities",
    color: "#FD9D24",
    icon: "🏙️",
  },
  sdg_12: {
    code: "sdg_12",
    name: "Responsible Consumption",
    color: "#BF8B2E",
    icon: "♻️",
  },
  sdg_13: {
    code: "sdg_13",
    name: "Climate Action",
    color: "#3F7E44",
    icon: "🌍",
  },
  sdg_14: {
    code: "sdg_14",
    name: "Life Below Water",
    color: "#0A97D9",
    icon: "🐋",
  },
  sdg_15: {
    code: "sdg_15",
    name: "Life on Land",
    color: "#56C02B",
    icon: "🌳",
  },
  sdg_16: {
    code: "sdg_16",
    name: "Peace & Justice",
    color: "#00689D",
    icon: "☮️",
  },
  sdg_17: {
    code: "sdg_17",
    name: "Partnerships",
    color: "#19486A",
    icon: "🤝",
  },
};

export function getSDGInfo(code: string): SDGInfo | undefined {
  return SDG_DATA[code];
}

export function getAllSDGs(): SDGInfo[] {
  return Object.values(SDG_DATA);
}
