const RIOT_API_KEY = import.meta.env.VITE_RIOT_API_KEY?.trim();

// Validate API key format
if (RIOT_API_KEY && !RIOT_API_KEY.startsWith('RGAPI-')) {
  console.error('Invalid API key format. API key should start with "RGAPI-"');
}

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

// Add match history interfaces
export interface MatchInfo {
  matchId: string;
  gameCreation: number;
  gameDuration: number;
  gameMode: string;
  gameType: string;
  queueId: number;
}

export interface MatchParticipant {
  puuid: string;
  championId: number;
  championName: string;
  teamPosition: string;
  individualPosition: string;
  role: string;
  lane: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

export interface MatchDetails {
  metadata: {
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameMode: string;
    queueId: number;
    participants: MatchParticipant[];
  };
}

export interface PlayerStats {
  account: RiotAccount;
  summoner: SummonerData;
  rankedStats: RankedData[];
  topChampions: ChampionMastery[];
  recentMatches?: MatchDetails[];
}

class RiotApiService {
  private async makeRequest<T>(url: string): Promise<T> {
    if (!RIOT_API_KEY) {
      console.error('API Key check failed:', {
        envVar: import.meta.env.VITE_RIOT_API_KEY,
        processed: RIOT_API_KEY,
        available: !!import.meta.env.VITE_RIOT_API_KEY
      });
      throw new Error('Riot API key not configured');
    }

    console.log('Making API request:', {
      url,
      apiKeyLength: RIOT_API_KEY.length,
      apiKeyStart: RIOT_API_KEY.substring(0, 10) + '...'
    });

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Riot-Token': RIOT_API_KEY,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    console.log('API Response:', {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      // Get response text for better error debugging
      let errorText = '';
      try {
        errorText = await response.text();
      } catch (e) {
        errorText = 'Could not read error response';
      }

      console.error('API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        responseText: errorText,
        apiKeyLength: RIOT_API_KEY.length
      });

      if (response.status === 404) {
        throw new Error('Account not found');
      } else if (response.status === 403) {
        // Enhanced 403 error handling with more context
        console.error('403 Forbidden Error Analysis:', {
          endpoint: url,
          isChampionMastery: url.includes('champion-mastery'),
          isRankedStats: url.includes('league/v4/entries'),
          isSummonerData: url.includes('summoner/v4'),
          isMatchHistory: url.includes('match/v5'),
          apiKeyFormat: RIOT_API_KEY.startsWith('RGAPI-'),
          apiKeyLength: RIOT_API_KEY.length,
          responseBody: errorText
        });
        
        if (url.includes('champion-mastery')) {
          throw new Error(`Champion mastery endpoint forbidden. This is common with development API keys. Response: ${errorText}`);
        } else {
          throw new Error(`API key invalid or expired. Status: ${response.status}, Response: ${errorText}`);
        }
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`API error: ${response.status} - ${errorText}`);
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

  // Alternative method to get champion mastery - sometimes works when the main endpoint doesn't
  async getChampionMasteryAlternative(summonerId: string): Promise<ChampionMastery[]> {
    const url = `${REGIONAL_URL}/lol/champion-mastery/v4/champion-masteries/by-summoner/${summonerId}`;
    const allMasteries = await this.makeRequest<ChampionMastery[]>(url);
    return allMasteries.sort((a, b) => b.championPoints - a.championPoints).slice(0, 5);
  }

  async getMatchHistory(puuid: string, count: number = 20): Promise<string[]> {
    const url = `${BASE_URL}/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`;
    return this.makeRequest<string[]>(url);
  }

  async getMatchDetails(matchId: string): Promise<MatchDetails> {
    const url = `${BASE_URL}/lol/match/v5/matches/${matchId}`;
    return this.makeRequest<MatchDetails>(url);
  }

  async getPlayerStats(gameName: string, tagLine: string): Promise<PlayerStats> {
    try {
      // Step 1: Get account by Riot ID
      console.log('Step 1: Getting account by Riot ID...');
      const account = await this.getAccountByRiotId(gameName, tagLine);
      console.log('Account found:', account);
      
      // Step 2: Get summoner data
      console.log('Step 2: Getting summoner data...');
      const summoner = await this.getSummonerByPuuid(account.puuid);
      console.log('Summoner data:', summoner);
      
      // Step 3: Get ranked stats
      console.log('Step 3: Getting ranked stats...');
      let rankedStats: RankedData[] = [];
      try {
        rankedStats = await this.getRankedStats(summoner.id);
        console.log('Ranked stats found:', rankedStats);
        console.log('Number of ranked entries:', rankedStats.length);
        rankedStats.forEach((rank, index) => {
          console.log(`Rank ${index + 1}:`, {
            queueType: rank.queueType,
            tier: rank.tier,
            rank: rank.rank,
            lp: rank.leaguePoints,
            wins: rank.wins,
            losses: rank.losses
          });
        });
      } catch (rankedError) {
        console.error('Failed to get ranked stats:', rankedError);
      }
      
      // Step 4: Try to get champion mastery
      console.log('Step 4: Getting champion mastery...');
      let topChampions: ChampionMastery[] = [];
      try {
        topChampions = await this.getChampionMastery(summoner.id, 5);
        console.log('Champion mastery found:', topChampions);
        console.log('Number of mastery entries:', topChampions.length);
        topChampions.forEach((champ, index) => {
          console.log(`Champion ${index + 1}:`, {
            championId: champ.championId,
            championName: getChampionName(champ.championId),
            level: champ.championLevel,
            points: champ.championPoints
          });
        });
      } catch (championError) {
        console.error('Champion mastery failed:', championError);
        
        // Try alternative mastery endpoint
        console.log('Trying alternative champion mastery endpoint...');
        try {
          topChampions = await this.getChampionMasteryAlternative(summoner.id);
          console.log('Alternative champion mastery found:', topChampions);
        } catch (altError) {
          console.error('Alternative champion mastery also failed:', altError);
          console.log('Attempting to get match history for champion data...');
          
          // Fallback: Try to get recent matches to determine champions played
          try {
            const matchIds = await this.getMatchHistory(account.puuid, 20);
            console.log('Match IDs found:', matchIds.length);
            
            if (matchIds.length > 0) {
              // Get details for more matches to get better data
              const matchPromises = matchIds.slice(0, 10).map(matchId => 
                this.getMatchDetails(matchId).catch(err => {
                  console.error(`Failed to get match ${matchId}:`, err);
                  return null;
                })
              );
              
              const matches = await Promise.all(matchPromises);
              const validMatches = matches.filter(match => match !== null) as MatchDetails[];
              console.log('Valid matches found:', validMatches.length);
              
              if (validMatches.length > 0) {
                // Store matches for role analysis
                const result = {
                  account,
                  summoner,
                  rankedStats,
                  topChampions: [],
                  recentMatches: validMatches
                };
                
                // Extract champion data from matches with better analysis
                const championStats: Record<number, {
                  count: number;
                  wins: number;
                  totalKills: number;
                  totalDeaths: number;
                  totalAssists: number;
                  roles: string[];
                }> = {};
                
                validMatches.forEach(match => {
                  const playerData = match.info.participants.find(p => p.puuid === account.puuid);
                  if (playerData) {
                    const champId = playerData.championId;
                    if (!championStats[champId]) {
                      championStats[champId] = {
                        count: 0,
                        wins: 0,
                        totalKills: 0,
                        totalDeaths: 0,
                        totalAssists: 0,
                        roles: []
                      };
                    }
                    
                    championStats[champId].count++;
                    if (playerData.win) championStats[champId].wins++;
                    championStats[champId].totalKills += playerData.kills;
                    championStats[champId].totalDeaths += playerData.deaths;
                    championStats[champId].totalAssists += playerData.assists;
                    
                    // Track roles played
                    const role = playerData.teamPosition || playerData.individualPosition;
                    if (role && !championStats[champId].roles.includes(role)) {
                      championStats[champId].roles.push(role);
                    }
                    
                    console.log(`Found ${getChampionName(playerData.championId)} in match ${match.metadata.matchId} (${role})`);
                  }
                });
                
                // Convert to champion mastery-like format with better scoring
                topChampions = Object.entries(championStats)
                  .sort(([,a], [,b]) => {
                    // Sort by games played, then by performance
                    const scoreA = a.count * 100 + (a.wins / a.count) * 50;
                    const scoreB = b.count * 100 + (b.wins / b.count) * 50;
                    return scoreB - scoreA;
                  })
                  .slice(0, 5)
                  .map(([championId, stats]) => ({
                    championId: parseInt(championId),
                    championLevel: Math.min(7, Math.floor(stats.count / 2) + 1), // More realistic mastery level
                    championPoints: stats.count * 1500 + stats.wins * 500, // Better point estimation
                    lastPlayTime: Date.now(),
                    championPointsSinceLastLevel: 0,
                    championPointsUntilNextLevel: 1000,
                    chestGranted: false,
                    tokensEarned: 0,
                    summonerId: summoner.id
                  }));
                
                console.log('Generated enhanced champion data from matches:', topChampions);
                
                // Return early with match data included
      return {
                  ...result,
                  topChampions
                };
              }
            }
          } catch (matchError) {
            console.error('Match history fallback also failed:', matchError);
            console.log('All champion data methods failed - proceeding with empty champion list');
          }
        }
      }

      const result = {
        account,
        summoner,
        rankedStats,
        topChampions
      };

      console.log('Final player stats result:', {
        hasAccount: !!result.account,
        hasSummoner: !!result.summoner,
        rankedStatsCount: result.rankedStats.length,
        topChampionsCount: result.topChampions.length,
        summonerLevel: result.summoner.summonerLevel
      });

      return result;
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

// Champion primary roles mapping
const CHAMPION_ROLES: Record<number, string[]> = {
  1: ["Mid"], // Annie
  2: ["Top", "Jungle"], // Olaf
  3: ["Support"], // Galio
  4: ["Mid"], // Twisted Fate
  5: ["Jungle"], // Xin Zhao
  6: ["Top"], // Urgot
  7: ["Mid"], // LeBlanc
  8: ["Mid"], // Vladimir
  9: ["Support", "Jungle"], // Fiddlesticks
  10: ["Top"], // Kayle
  11: ["Jungle"], // Master Yi
  12: ["Support"], // Alistar
  13: ["Mid"], // Ryze
  14: ["Top"], // Sion
  15: ["ADC"], // Sivir
  16: ["Support"], // Soraka
  17: ["Top"], // Teemo
  18: ["ADC"], // Tristana
  19: ["Jungle"], // Warwick
  20: ["Jungle"], // Nunu & Willump
  21: ["ADC"], // Miss Fortune
  22: ["ADC"], // Ashe
  23: ["Top"], // Tryndamere
  24: ["Top", "Jungle"], // Jax
  25: ["Support"], // Morgana
  26: ["Support"], // Zilean
  27: ["Top"], // Singed
  28: ["Jungle"], // Evelynn
  29: ["ADC"], // Twitch
  30: ["Mid"], // Karthus
  31: ["Top"], // Cho'Gath
  32: ["Support", "Jungle"], // Amumu
  33: ["Jungle"], // Rammus
  34: ["Mid"], // Anivia
  35: ["Support", "Jungle"], // Shaco
  36: ["Top"], // Dr. Mundo
  37: ["Support"], // Sona
  38: ["Mid"], // Kassadin
  39: ["Top"], // Irelia
  40: ["Support"], // Janna
  41: ["Top"], // Gangplank
  42: ["Mid"], // Corki
  43: ["Support"], // Karma
  44: ["Support"], // Taric
  45: ["Mid"], // Veigar
  51: ["ADC"], // Caitlyn
  53: ["Support"], // Blitzcrank
  54: ["Top"], // Malphite
  55: ["Mid"], // Katarina
  56: ["Jungle"], // Nocturne
  57: ["Top"], // Maokai
  58: ["Top"], // Renekton
  59: ["Jungle"], // Jarvan IV
  60: ["Jungle"], // Elise
  61: ["Mid"], // Orianna
  62: ["Top", "Jungle"], // Wukong
  63: ["Support"], // Brand
  64: ["Jungle"], // Lee Sin
  67: ["ADC"], // Vayne
  68: ["Top"], // Rumble
  69: ["Mid"], // Cassiopeia
  72: ["Jungle"], // Skarner
  74: ["Mid"], // Heimerdinger
  75: ["Top"], // Nasus
  76: ["Jungle"], // Nidalee
  77: ["Jungle"], // Udyr
  78: ["Support"], // Poppy
  79: ["Jungle"], // Gragas
  80: ["Support"], // Pantheon
  81: ["ADC"], // Ezreal
  82: ["Top"], // Mordekaiser
  83: ["Top"], // Yorick
  84: ["Mid"], // Akali
  85: ["Top"], // Kennen
  86: ["Top"], // Garen
  89: ["Support"], // Leona
  90: ["Mid"], // Malzahar
  91: ["Mid"], // Talon
  92: ["Top"], // Riven
  96: ["ADC"], // Kog'Maw
  98: ["Support"], // Shen
  99: ["Support"], // Lux
  101: ["Mid"], // Xerath
  102: ["Jungle"], // Shyvana
  103: ["Mid"], // Ahri
  104: ["Jungle"], // Graves
  105: ["Mid"], // Fizz
  106: ["Top"], // Volibear
  107: ["Jungle"], // Rengar
  110: ["ADC"], // Varus
  111: ["Support"], // Nautilus
  112: ["Mid"], // Viktor
  113: ["Jungle"], // Sejuani
  114: ["Top"], // Fiora
  115: ["Mid"], // Ziggs
  117: ["Support"], // Lulu
  119: ["ADC"], // Draven
  120: ["Jungle"], // Hecarim
  121: ["Jungle"], // Kha'Zix
  122: ["Top"], // Darius
  126: ["Mid"], // Jayce
  127: ["Mid"], // Lissandra
  131: ["Jungle"], // Diana
  133: ["Top"], // Quinn
  134: ["Mid"], // Syndra
  136: ["Mid"], // Aurelion Sol
  141: ["Jungle"], // Kayn
  142: ["Mid"], // Zoe
  143: ["Support"], // Zyra
  145: ["ADC"], // Kai'Sa
  147: ["Support"], // Seraphine
  150: ["Top"], // Gnar
  154: ["Jungle"], // Zac
  157: ["Mid"], // Yasuo
  161: ["Support"], // Vel'Koz
  163: ["Mid"], // Taliyah
  164: ["Top"], // Camille
  166: ["Mid"], // Akshan
  200: ["Jungle"], // Bel'Veth
  201: ["Support"], // Braum
  202: ["ADC"], // Jhin
  203: ["Jungle"], // Kindred
  221: ["ADC"], // Zeri
  222: ["ADC"], // Jinx
  223: ["Support"], // Tahm Kench
  234: ["Jungle"], // Viego
  235: ["Support"], // Senna
  236: ["ADC"], // Lucian
  238: ["Mid"], // Zed
  240: ["Top"], // Kled
  245: ["Jungle"], // Ekko
  246: ["Mid"], // Qiyana
  254: ["Jungle"], // Vi
  266: ["Top"], // Aatrox
  267: ["Support"], // Nami
  268: ["Mid"], // Azir
  350: ["Support"], // Yuumi
  360: ["ADC"], // Samira
  412: ["Support"], // Thresh
  420: ["Top"], // Illaoi
  421: ["Jungle"], // Rek'Sai
  427: ["Support"], // Ivern
  429: ["ADC"], // Kalista
  432: ["Support"], // Bard
  516: ["Top"], // Ornn
  517: ["Mid"], // Sylas
  518: ["Support"], // Neeko
  523: ["ADC"], // Aphelios
  526: ["Support"], // Rell
  555: ["Support"], // Pyke
  711: ["Mid"], // Vex
  777: ["Mid"], // Yone
  875: ["Top"], // Sett
  876: ["Jungle"], // Lillia
  887: ["Top"], // Gwen
  888: ["Support"], // Renata Glasc
  895: ["ADC"], // Nilah
  897: ["Top"], // K'Sante
  901: ["ADC"], // Smolder
  902: ["Support"], // Milio
  910: ["Mid"], // Hwei
  950: ["Mid"] // Naafiri
};

export const getMostPlayedRole = (topChampions: ChampionMastery[]): string => {
  if (!topChampions.length) return 'Unknown';
  
  const roleScores: Record<string, number> = {
    'Top Lane': 0,
    'Jungle': 0,
    'Mid Lane': 0,
    'Bot Lane': 0,
    'Support': 0
  };
  
  // Weight champions by mastery points (higher mastery = more influence)
  topChampions.forEach((champion, index) => {
    const roles = CHAMPION_ROLES[champion.championId] || ['Unknown'];
    const weight = Math.max(1, 6 - index); // Give more weight to higher mastery champions
    
    roles.forEach(role => {
      // Map old role names to lane names
      let laneRole = role;
      if (role === 'Top') laneRole = 'Top Lane';
      else if (role === 'Mid') laneRole = 'Mid Lane';
      else if (role === 'ADC') laneRole = 'Bot Lane';
      // Jungle and Support stay the same
      
      if (roleScores[laneRole] !== undefined) {
        roleScores[laneRole] += weight;
      }
    });
  });
  
  // Find role with highest score
  let maxScore = 0;
  let mostPlayedRole = 'Unknown';
  
  Object.entries(roleScores).forEach(([role, score]) => {
    if (score > maxScore) {
      maxScore = score;
      mostPlayedRole = role;
    }
  });
  
  return mostPlayedRole;
};

export const getMostPlayedRoleFromMatches = (matches: MatchDetails[], playerPuuid: string): string => {
  if (!matches.length) return 'Unknown';
  
  const roleCounts: Record<string, number> = {
    'Top Lane': 0,
    'Jungle': 0,
    'Mid Lane': 0,
    'Bot Lane': 0,
    'Support': 0
  };
  
  matches.forEach(match => {
    const playerData = match.info.participants.find(p => p.puuid === playerPuuid);
    if (playerData) {
      let role = 'Unknown';
      
      // Map Riot's position names to our lane names
      if (playerData.teamPosition === 'TOP') role = 'Top Lane';
      else if (playerData.teamPosition === 'JUNGLE') role = 'Jungle';
      else if (playerData.teamPosition === 'MIDDLE') role = 'Mid Lane';
      else if (playerData.teamPosition === 'BOTTOM') role = 'Bot Lane';
      else if (playerData.teamPosition === 'UTILITY') role = 'Support';
      
      // Fallback to individualPosition if teamPosition is empty
      if (role === 'Unknown') {
        if (playerData.individualPosition === 'TOP') role = 'Top Lane';
        else if (playerData.individualPosition === 'JUNGLE') role = 'Jungle';
        else if (playerData.individualPosition === 'MIDDLE') role = 'Mid Lane';
        else if (playerData.individualPosition === 'BOTTOM') role = 'Bot Lane';
        else if (playerData.individualPosition === 'UTILITY') role = 'Support';
      }
      
      if (roleCounts[role] !== undefined) {
        roleCounts[role]++;
      }
    }
  });
  
  // Find most played role
  let maxCount = 0;
  let mostPlayedRole = 'Unknown';
  
  Object.entries(roleCounts).forEach(([role, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostPlayedRole = role;
    }
  });
  
  console.log('Role analysis from matches:', roleCounts, 'Most played:', mostPlayedRole);
  return mostPlayedRole;
}; 