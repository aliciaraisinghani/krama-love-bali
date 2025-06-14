const RIOT_API_KEY = import.meta.env.VITE_RIOT_API_KEY;
const BASE_URL = 'https://americas.api.riotgames.com';
const REGIONAL_URL = 'https://na1.api.riotgames.com';

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface SummonerData {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  profileIconId: number;
  revisionDate: number;
  summonerLevel: number;
}

export interface RankedData {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  summonerId: string;
  summonerName: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

export interface ChampionMastery {
  championId: number;
  championLevel: number;
  championPoints: number;
  lastPlayTime: number;
  championPointsSinceLastLevel: number;
  championPointsUntilNextLevel: number;
  chestGranted: boolean;
  tokensEarned: number;
  summonerId: string;
}

export interface PlayerStats {
  summoner: SummonerData;
  rankedStats: RankedData[];
  topChampions: ChampionMastery[];
}

class RiotApiService {
  private async makeRequest<T>(url: string): Promise<T> {
    if (!RIOT_API_KEY) {
      throw new Error('Riot API key not configured');
    }

    const response = await fetch(url, {
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Account not found');
      } else if (response.status === 403) {
        throw new Error('API key invalid or expired');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status}`);
      }
    }

    return response.json();
  }

  async getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
    const url = `${BASE_URL}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return this.makeRequest<RiotAccount>(url);
  }

  async getSummonerByPuuid(puuid: string): Promise<SummonerData> {
    const url = `${REGIONAL_URL}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return this.makeRequest<SummonerData>(url);
  }

  async getRankedStats(summonerId: string): Promise<RankedData[]> {
    const url = `${REGIONAL_URL}/lol/league/v4/entries/by-summoner/${summonerId}`;
    return this.makeRequest<RankedData[]>(url);
  }

  async getChampionMastery(summonerId: string, count: number = 5): Promise<ChampionMastery[]> {
    const url = `${REGIONAL_URL}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}/top?count=${count}`;
    return this.makeRequest<ChampionMastery[]>(url);
  }

  async getPlayerStats(gameName: string, tagLine: string): Promise<PlayerStats> {
    try {
      // Step 1: Get account by Riot ID
      const account = await this.getAccountByRiotId(gameName, tagLine);
      
      // Step 2: Get summoner data
      const summoner = await this.getSummonerByPuuid(account.puuid);
      
      // Step 3: Get ranked stats and champion mastery in parallel
      const [rankedStats, topChampions] = await Promise.all([
        this.getRankedStats(summoner.id),
        this.getChampionMastery(summoner.id, 3)
      ]);

      return {
        summoner,
        rankedStats,
        topChampions
      };
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  }

  async verifyAccount(gameName: string, tagLine: string): Promise<boolean> {
    try {
      await this.getAccountByRiotId(gameName, tagLine);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export const riotApiService = new RiotApiService();

// Champion ID to name mapping (subset for common champions)
export const CHAMPION_NAMES: Record<number, string> = {
  1: "Annie",
  2: "Olaf",
  3: "Galio",
  4: "Twisted Fate",
  5: "Xin Zhao",
  6: "Urgot",
  7: "LeBlanc",
  8: "Vladimir",
  9: "Fiddlesticks",
  10: "Kayle",
  11: "Master Yi",
  12: "Alistar",
  13: "Ryze",
  14: "Sion",
  15: "Sivir",
  16: "Soraka",
  17: "Teemo",
  18: "Tristana",
  19: "Warwick",
  20: "Nunu & Willump",
  21: "Miss Fortune",
  22: "Ashe",
  23: "Tryndamere",
  24: "Jax",
  25: "Morgana",
  26: "Zilean",
  27: "Singed",
  28: "Evelynn",
  29: "Twitch",
  30: "Karthus",
  31: "Cho'Gath",
  32: "Amumu",
  33: "Rammus",
  34: "Anivia",
  35: "Shaco",
  36: "Dr. Mundo",
  37: "Sona",
  38: "Kassadin",
  39: "Irelia",
  40: "Janna",
  41: "Gangplank",
  42: "Corki",
  43: "Karma",
  44: "Taric",
  45: "Veigar",
  51: "Caitlyn",
  53: "Blitzcrank",
  54: "Malphite",
  55: "Katarina",
  56: "Nocturne",
  57: "Maokai",
  58: "Renekton",
  59: "Jarvan IV",
  60: "Elise",
  61: "Orianna",
  62: "Wukong",
  63: "Brand",
  64: "Lee Sin",
  67: "Vayne",
  68: "Rumble",
  69: "Cassiopeia",
  72: "Skarner",
  74: "Heimerdinger",
  75: "Nasus",
  76: "Nidalee",
  77: "Udyr",
  78: "Poppy",
  79: "Gragas",
  80: "Pantheon",
  81: "Ezreal",
  82: "Mordekaiser",
  83: "Yorick",
  84: "Akali",
  85: "Kennen",
  86: "Garen",
  89: "Leona",
  90: "Malzahar",
  91: "Talon",
  92: "Riven",
  96: "Kog'Maw",
  98: "Shen",
  99: "Lux",
  101: "Xerath",
  102: "Shyvana",
  103: "Ahri",
  104: "Graves",
  105: "Fizz",
  106: "Volibear",
  107: "Rengar",
  110: "Varus",
  111: "Nautilus",
  112: "Viktor",
  113: "Sejuani",
  114: "Fiora",
  115: "Ziggs",
  117: "Lulu",
  119: "Draven",
  120: "Hecarim",
  121: "Kha'Zix",
  122: "Darius",
  126: "Jayce",
  127: "Lissandra",
  131: "Diana",
  133: "Quinn",
  134: "Syndra",
  136: "Aurelion Sol",
  141: "Kayn",
  142: "Zoe",
  143: "Zyra",
  145: "Kai'Sa",
  147: "Seraphine",
  150: "Gnar",
  154: "Zac",
  157: "Yasuo",
  161: "Vel'Koz",
  163: "Taliyah",
  164: "Camille",
  166: "Akshan",
  200: "Bel'Veth",
  201: "Braum",
  202: "Jhin",
  203: "Kindred",
  221: "Zeri",
  222: "Jinx",
  223: "Tahm Kench",
  234: "Viego",
  235: "Senna",
  236: "Lucian",
  238: "Zed",
  240: "Kled",
  245: "Ekko",
  246: "Qiyana",
  254: "Vi",
  266: "Aatrox",
  267: "Nami",
  268: "Azir",
  350: "Yuumi",
  360: "Samira",
  412: "Thresh",
  420: "Illaoi",
  421: "Rek'Sai",
  427: "Ivern",
  429: "Kalista",
  432: "Bard",
  516: "Ornn",
  517: "Sylas",
  518: "Neeko",
  523: "Aphelios",
  526: "Rell",
  555: "Pyke",
  711: "Vex",
  777: "Yone",
  875: "Sett",
  876: "Lillia",
  887: "Gwen",
  888: "Renata Glasc",
  895: "Nilah",
  897: "K'Sante",
  901: "Smolder",
  902: "Milio",
  910: "Hwei",
  950: "Naafiri"
};

export const getChampionName = (championId: number): string => {
  return CHAMPION_NAMES[championId] || `Champion ${championId}`;
}; 