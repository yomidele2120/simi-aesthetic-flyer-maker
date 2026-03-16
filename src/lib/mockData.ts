export type Article = {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  subcategory?: string;
  author: string;
  date: string;
  imageUrl: string;
  readTime: string;
  isBreaking?: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  isOpinion?: boolean;
};

export const breakingNews = [
  "BREAKING: Central Bank of Nigeria announces new monetary policy framework",
  "LIVE: National Assembly debates constitutional amendments",
  "UPDATE: Lagos-Calabar coastal highway construction reaches Phase 3",
  "ALERT: OPEC+ production cuts impact Nigerian crude oil exports",
];

export const articles: Article[] = [
  {
    id: "1",
    title: "Fuel Subsidy Reform: Central Bank Projects 3.2% Growth by Q4",
    summary: "The Central Bank of Nigeria released its quarterly economic outlook today, projecting a GDP growth rate of 3.2% by the fourth quarter, driven in part by the reallocation of funds from the fuel subsidy removal.",
    content: "The Central Bank of Nigeria released its quarterly economic outlook today, projecting a GDP growth rate of 3.2% by the fourth quarter. The projection is driven in part by the reallocation of funds from the fuel subsidy removal, which has freed up approximately ₦3.6 trillion in government spending.\n\nGovernor of the Central Bank stated that the funds are being channeled into critical infrastructure projects, healthcare expansion, and agricultural modernization programs across the six geopolitical zones.\n\nEconomists have noted that while the short-term impact on consumer prices has been significant, the medium-term outlook suggests stabilization as new transportation infrastructure comes online and alternative energy sources become more accessible.\n\nThe report also highlighted improvements in foreign exchange reserves, which have grown by 12% since the beginning of the year, providing a buffer against external economic shocks.",
    category: "Business & Economy",
    subcategory: "Nigerian Economy",
    author: "Adunni Okafor",
    date: "2026-03-15",
    imageUrl: "",
    readTime: "6 min",
    isBreaking: true,
    isFeatured: true,
  },
  {
    id: "2",
    title: "Senate Passes Historic Digital Rights Bill After Two-Year Deliberation",
    summary: "The Nigerian Senate has passed the Digital Rights and Data Protection Bill, establishing comprehensive frameworks for data privacy, digital identity, and online freedom of expression.",
    content: "",
    category: "Nigeria",
    subcategory: "Politics",
    author: "Chukwuemeka Nwosu",
    date: "2026-03-15",
    imageUrl: "",
    readTime: "5 min",
    isFeatured: true,
    isTrending: true,
  },
  {
    id: "3",
    title: "Lagos Tech Hub Secures $200M in Foreign Investment",
    summary: "Yaba's technology district has attracted a record $200 million in foreign direct investment, solidifying Nigeria's position as Africa's leading tech ecosystem.",
    content: "",
    category: "Technology",
    author: "Funke Adeyemi",
    date: "2026-03-14",
    imageUrl: "",
    readTime: "4 min",
    isTrending: true,
  },
  {
    id: "4",
    title: "UN Security Council Calls Emergency Session on Sahel Crisis",
    summary: "The United Nations Security Council convened an emergency session to address the escalating humanitarian crisis in the Sahel region, with Nigeria playing a key diplomatic role.",
    content: "",
    category: "World",
    author: "Ibrahim Yakubu",
    date: "2026-03-14",
    imageUrl: "",
    readTime: "7 min",
    isTrending: true,
  },
  {
    id: "5",
    title: "Investigation: How ₦45 Billion in Public Funds Disappeared from State Infrastructure Projects",
    summary: "A six-month CoreNews investigation reveals systematic irregularities in the allocation and disbursement of state infrastructure funds across three Nigerian states.",
    content: "",
    category: "Investigations",
    author: "CoreNews Investigative Desk",
    date: "2026-03-13",
    imageUrl: "",
    readTime: "15 min",
    isFeatured: true,
  },
  {
    id: "6",
    title: "Naira Strengthens Against Dollar as Export Revenues Surge",
    summary: "The Nigerian Naira appreciated by 4.2% against the US Dollar in the parallel market, buoyed by increased non-oil export revenues and improved investor confidence.",
    content: "",
    category: "Business & Economy",
    subcategory: "Currency",
    author: "Amara Obi",
    date: "2026-03-13",
    imageUrl: "",
    readTime: "4 min",
    isTrending: true,
  },
  {
    id: "7",
    title: "Nigeria's AI Startup Raises $50M Series B to Expand Across Africa",
    summary: "Lagos-based artificial intelligence company IntelliAfrica has raised $50 million in Series B funding to expand its agricultural AI solutions across 15 African countries.",
    content: "",
    category: "Technology",
    author: "Yemi Alade",
    date: "2026-03-12",
    imageUrl: "",
    readTime: "5 min",
  },
  {
    id: "8",
    title: "Opinion: The Case for Restructuring Nigeria's Federal System",
    summary: "As Nigeria approaches its 66th year of independence, the conversation around restructuring has moved from the margins to the center of national discourse.",
    content: "",
    category: "Opinions",
    author: "Prof. Nnamdi Azikiwe Jr.",
    date: "2026-03-12",
    imageUrl: "",
    readTime: "8 min",
    isOpinion: true,
  },
  {
    id: "9",
    title: "Military Operation Dismantles Major Bandit Camp in Zamfara",
    summary: "The Nigerian Armed Forces announced the successful dismantling of a major bandit encampment in Zamfara State, rescuing over 200 hostages held for months.",
    content: "",
    category: "Nigeria",
    subcategory: "Security",
    author: "Musa Garba",
    date: "2026-03-12",
    imageUrl: "",
    readTime: "5 min",
  },
  {
    id: "10",
    title: "OPEC+ Agrees to Gradual Production Increase Starting April",
    summary: "OPEC+ members have agreed to a phased production increase beginning in April, with Nigeria set to benefit from an additional 120,000 barrels per day quota.",
    content: "",
    category: "Business & Economy",
    subcategory: "Oil & Energy",
    author: "Bola Tinubu-Martins",
    date: "2026-03-11",
    imageUrl: "",
    readTime: "6 min",
  },
];

export const categories = [
  { name: "Nigeria", path: "/nigeria", subcategories: ["Politics", "Economy", "Security", "Society", "Government Policies"] },
  { name: "World", path: "/world", subcategories: ["International Politics", "Global Conflicts", "Diplomatic Relations"] },
  { name: "Business & Economy", path: "/business", subcategories: ["Nigerian Economy", "Global Markets", "Companies", "Oil & Energy", "Currency"] },
  { name: "Technology", path: "/technology", subcategories: ["AI", "Startups", "Gadgets", "Internet & Social Media"] },
  { name: "Investigations", path: "/investigations", subcategories: [] },
  { name: "Opinions", path: "/opinions", subcategories: [] },
  { name: "Videos", path: "/videos", subcategories: [] },
];

export const navigationItems = [
  { name: "Home", path: "/" },
  ...categories,
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
];
