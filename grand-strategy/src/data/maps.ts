import { FANTASY_PROVINCES, FANTASY_STRAITS } from './fantasy';
import { PROVINCES, STRAITS, type ProvinceRow } from './provinces';
import { WORLD_PROVINCES, WORLD_STRAITS } from './provinces_world';

export interface MapDef { id: string; rows: ProvinceRow[]; straits: [string, string][]; lanes: [string, string][]; seaColor: string }

export const MAPS: Record<string, MapDef> = {
  earth: {
    id: 'earth', rows: PROVINCES, straits: STRAITS, seaColor: '#1d3a52',
    lanes: [['azores', 'newfoundland'], ['azores', 'hispaniola'], ['canarias', 'hispaniola'], ['cape_verde', 'pernambuco'], ['azores', 'lisboa'], ['canarias', 'andalucia'], ['azores', 'new_england'], ['cape_verde', 'bahia']],
  },
  // contemporary map: the historical map plus the Middle East and Asia-Pacific
  world: {
    id: 'world', rows: [...PROVINCES, ...WORLD_PROVINCES], straits: [...STRAITS, ...WORLD_STRAITS], seaColor: '#18344a',
    lanes: [['hawaii', 'california'], ['hawaii', 'guam'], ['azores', 'newfoundland'], ['azores', 'hispaniola'], ['canarias', 'hispaniola'], ['cape_verde', 'pernambuco'], ['azores', 'lisboa'], ['canarias', 'andalucia'], ['azores', 'new_england'], ['cape_verde', 'bahia']],
  },
  valdoria: { id: 'valdoria', rows: FANTASY_PROVINCES, straits: FANTASY_STRAITS, lanes: [], seaColor: '#22344a' },
};
