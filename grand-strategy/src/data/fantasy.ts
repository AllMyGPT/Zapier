import type { ProvinceRow } from './provinces';

// "Valdoria": an original low-fantasy continent for the dynastic ruleset.
// Coordinates are abstract (rendered with the same projection as the real-world map).
export const FANTASY_PROVINCES: ProvinceRow[] = [
  // Marca Helada (north) — Casa Thornwall
  ['f_escarcha', 'Fortaleza Escarcha', 8, 62, 'm', 'main', 1, 3],
  ['f_lobos', 'Valle de los Lobos', 12, 61, 'f', 'main', 0, 2],
  ['f_pinar', 'Pinar Negro', 4.5, 60.2, 'f', 'main', 1, 2],
  ['f_glaciar', 'Puerto Glaciar', 16, 62.4, 'h', 'main', 1, 2],
  ['f_cumbre', 'Cumbres Grises', 10, 58.6, 'm', 'main', 0, 2],
  ['f_muralla', 'Muro de Ceniza', 14, 59.4, 'h', 'main', 0, 3],
  // Tierras de Ashmoor (northwest)
  ['f_brezal', 'Brezal de Ashmoor', 2, 57.2, 'w', 'main', 1, 3],
  ['f_ashmoor', 'Ashmoor', 5.5, 56.5, 'h', 'main', 1, 4],
  ['f_turba', 'Turberas', 7.8, 55.6, 'w', 'main', 0, 2],
  // Llanos de Stormvale (northeast)
  ['f_stormvale', 'Stormvale', 18, 57.6, 'p', 'main', 1, 5],
  ['f_trueno', 'Colinas del Trueno', 20.5, 59.5, 'h', 'main', 1, 3],
  ['f_estepa', 'Estepa Ventosa', 23, 56.5, 'p', 'main', 1, 3],
  ['f_vado', 'Vado del Rey', 15, 56.6, 'p', 'main', 0, 4],
  // Corona (centre) — Casa Valcrest
  ['f_corona', 'Altacorona', 11, 53.4, 'p', 'main', 0, 9],
  ['f_trigal', 'Trigales Dorados', 8, 52.5, 'p', 'main', 0, 6],
  ['f_rio', 'Riberas del Ámbar', 13.8, 52, 'p', 'main', 0, 6],
  ['f_bosqueviejo', 'Bosqueviejo', 10.6, 55.2, 'f', 'main', 0, 4],
  ['f_lagos', 'Tierra de Lagos', 16.6, 54.2, 'w', 'main', 0, 4],
  // Duskhaven (west coast)
  ['f_duskhaven', 'Duskhaven', 1.5, 53.5, 'p', 'main', 1, 7],
  ['f_acantilado', 'Acantilados Rojos', 0, 51, 'h', 'main', 1, 3],
  ['f_bahia', 'Bahía Sombría', 4.5, 54.4, 'p', 'main', 1, 4],
  ['f_viñedos', 'Viñedos de Ocaso', 4, 51.2, 'h', 'main', 0, 5],
  // Greyspire (mountains, west-centre)
  ['f_greyspire', 'Greyspire', 6.5, 49.5, 'm', 'main', 0, 5],
  ['f_minas', 'Minas de Plata', 9.4, 49.8, 'm', 'main', 0, 5],
  ['f_paso', 'Paso del Halcón', 3, 48.4, 'm', 'main', 1, 2],
  // Embermoor (east, wealthy)
  ['f_embermoor', 'Embermoor', 20.5, 52.4, 'p', 'main', 1, 7],
  ['f_forja', 'Ciudad Forja', 18, 50.7, 'h', 'main', 0, 6],
  ['f_azafran', 'Costa Azafrán', 23.5, 53.6, 'p', 'main', 1, 5],
  ['f_canal', 'Canales de Brasa', 21.6, 50, 'w', 'main', 1, 4],
  // Ironmere (south-centre, lakes)
  ['f_ironmere', 'Ironmere', 12.5, 48.4, 'w', 'main', 0, 5],
  ['f_juncal', 'Juncales', 15.4, 48.8, 'w', 'main', 0, 3],
  ['f_herreria', 'Herrerías del Sur', 10.4, 46.8, 'h', 'main', 0, 4],
  // Ducado del Sol (south)
  ['f_solaria', 'Solaria', 13.5, 44.7, 'p', 'main', 1, 7],
  ['f_dunas', 'Dunas Rojas', 17.6, 45.2, 'd', 'main', 1, 3],
  ['f_olivar', 'Olivares', 9.8, 44.5, 'p', 'main', 1, 5],
  ['f_oasis', 'Oasis de Nur', 19.4, 47.2, 'd', 'main', 0, 3],
  ['f_naranjos', 'Puerto Naranjo', 6.8, 46, 'p', 'main', 1, 5],
  // Islas
  ['f_isla_sal', 'Isla de la Sal', -3.5, 55.7, 'h', 'isla_sal', 1, 3],
  ['f_mareas', 'Señorío de las Mareas', -2.3, 49.6, 'h', 'isla_mareas', 1, 4],
  ['f_islas_hierro', 'Islas de Hierro', 26.6, 58.5, 'm', 'isla_hierro', 1, 3],
  ['f_perla', 'Isla Perla', 26.5, 49.5, 'p', 'isla_perla', 1, 5],
  ['f_volcan', 'Isla del Volcán', 15, 41.4, 'm', 'isla_volcan', 1, 3],
];
export const FANTASY_STRAITS: [string, string][] = [['f_isla_sal', 'f_brezal']];
