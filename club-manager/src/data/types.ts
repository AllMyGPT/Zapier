// Raw data formats used by the league data files.

export type Pos = 'GK' | 'CB' | 'LB' | 'RB' | 'DM' | 'CM' | 'AM' | 'LW' | 'RW' | 'ST';

export interface RawClub {
  id: string;          // short unique slug, lowercase, e.g. 'rma'
  name: string;        // full club name, e.g. 'Real Madrid'
  short: string;       // 3-letter abbreviation, e.g. 'RMA'
  city: string;
  stadium: string;
  capacity: number;
  colors: [string, string]; // [primary kit colour, secondary kit colour] as hex
  reputation: number;  // 1-100 (Real Madrid ~97, mid-table ~70, newly promoted ~60)
  budget: number;      // transfer budget in millions of euros
  // One player per line: "Full Name|POS|birthYear|NAT|overall|potential"
  // POS in GK,CB,LB,RB,DM,CM,AM,LW,RW,ST ; NAT = 3-letter FIFA code ; overall/potential 40-95
  players: string;
}

export interface RawLeague {
  id: string;          // 'esp' | 'eng' | 'ita' | 'ger' | 'fra'
  name: string;        // display name, e.g. 'Liga Española'
  country: string;     // e.g. 'España'
  nat: string;         // 3-letter code of the country, used for generated players
  tier2Name: string;   // display name of the second division
  clubs: RawClub[];    // top-flight clubs
  // Real second-division clubs used as the promotion pool (squads are generated procedurally)
  tier2: { id: string; name: string; short: string; city: string; stadium: string; capacity: number; colors: [string, string]; reputation: number }[];
}
