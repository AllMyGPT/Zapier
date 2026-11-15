import type { Condition, Effect, GameEvent, Mission } from '@/engine/types';

// ---------------------------------------------------------------- helpers
const chr = (text: string, tag?: string): Effect => (tag ? { type: 'chronicle', tag, text } : { type: 'chronicle', text });
const flag = (f: string, tag?: string): Effect => (tag ? { type: 'flag', tag, flag: f } : { type: 'flag', flag: f });
const trig = (event: string, days: number, tag?: string): Effect => (tag ? { type: 'trigger', tag, event, days } : { type: 'trigger', event, days });
const gold = (amount: number, tag?: string): Effect => (tag ? { type: 'treasury', tag, amount } : { type: 'treasury', amount });
const pres = (amount: number, tag?: string): Effect => (tag ? { type: 'prestige', tag, amount } : { type: 'prestige', amount });
const stab = (amount: number): Effect => ({ type: 'stability', amount });
const men = (amount: number): Effect => ({ type: 'manpower', amount });
const inf = (amount: number): Effect => ({ type: 'infamy', amount });
const x = (key: string, amount: number): Effect => ({ type: 'x', key, amount });
const tech = (key: string, amount = 1): Effect => ({ type: 'tech', key, amount });
const rel = (other: string, amount: number, tag?: string): Effect => (tag ? { type: 'relations', tag, other, amount } : { type: 'relations', other, amount });
const claim = (...provinces: string[]): Effect => ({ type: 'claim', provinces });
const has = (f: string, tag?: string): Condition => (tag ? { type: 'flag', flag: f, tag, value: true } : { type: 'flag', flag: f, value: true });

const AMERICAS = ['hispaniola', 'cuba', 'mexico', 'veracruz', 'yucatan', 'guatemala', 'panama', 'new_granada', 'venezuela', 'peru', 'pernambuco', 'bahia', 'florida', 'carolina', 'virginia', 'new_england', 'new_france', 'newfoundland'];
const CARIBBEAN = ['hispaniola', 'cuba', 'panama', 'venezuela', 'yucatan', 'veracruz', 'florida', 'new_granada'];
const MED_CHRISTIAN_COAST = ['andalucia', 'murcia', 'valencia', 'cataluna', 'baleares', 'sicilia', 'sardegna', 'napoli', 'calabria', 'puglia', 'provence', 'languedoc', 'corsica', 'genova', 'toscana', 'roma', 'venezia', 'dalmatia', 'crete', 'cyprus'];
const ENGLAND = ['london', 'wessex', 'cornwall', 'midlands', 'east_anglia', 'york', 'northumbria', 'wales'];

// ================================================================ 1492: historical chains
const EVENTS_1492: GameEvent[] = [
  // ------------------------------------------------------------ Castilla
  {
    id: 'em_cas_granada', tag: 'CAS', date: '1492-01-03', image: 'faith', condition: [{ type: 'owns', province: 'granada' }],
    title: 'Las capitulaciones de Granada',
    text: 'Boabdil ha entregado las llaves de la Alhambra. Las capitulaciones prometen a los vencidos sus mezquitas, sus leyes y sus jueces; el clero exige que la victoria sea también de la fe.',
    note: 'El 2 de enero de 1492 los Reyes Católicos entraron en Granada. Los pactos se respetaron hasta 1499, cuando Cisneros impuso los bautismos en masa.',
    options: [
      { label: 'Cumplir lo pactado con los mudéjares', effects: [stab(1), pres(20), { type: 'relationsWith', religion: 'sunni', amount: 15 }, flag('cas_mudejar_pact'), chr('Castilla jura respetar la ley y las mezquitas de los granadinos.')], aiWeight: 4, hint: 'Paz en el reino, pero Granada seguirá siendo de otra fe.' },
      { label: 'Encomendar a Cisneros la conversión', effects: [{ type: 'religion', provinces: ['granada'], value: 'catholic' }, { type: 'unrest', province: 'granada', amount: 6 }, pres(10), rel('PAP', 30), { type: 'relationsWith', religion: 'sunni', amount: -25 }, chr('Las mezquitas de Granada se consagran como iglesias. En las Alpujarras se afilan las armas.')], aiWeight: 6, hint: 'Unidad de fe a cambio de una revuelta segura.' },
    ],
  },
  {
    id: 'em_cas_alhambra', tag: 'CAS', date: '1492-03-31', image: 'faith',
    title: 'El edicto de la Alhambra',
    text: 'El inquisidor general pide a los reyes que los judíos de Castilla y Aragón se bauticen o abandonen sus reinos en cuatro meses. Con ellos se irían médicos, arrendadores de rentas y prestamistas de la Corona.',
    note: 'El decreto de expulsión se firmó el 31 de marzo de 1492. Muchos sefardíes hallaron refugio en Portugal, Italia y, sobre todo, en el Imperio otomano.',
    options: [
      { label: 'Firmar el edicto', effects: [rel('PAP', 20), pres(10), gold(-60), flag('cas_expulsion'), trig('em_ott_sephardim', 120, 'OTT'), chr('Miles de familias sefardíes parten de los puertos de Castilla hacia el exilio.')], aiWeight: 9, hint: 'La Corona pierde rentas y saberes que otros sabrán aprovechar.' },
      { label: 'Desoír al inquisidor', effects: [rel('PAP', -30), stab(-1), gold(40), chr('Los reyes se niegan a expulsar a sus súbditos judíos, para escándalo del Santo Oficio.')], aiWeight: 1 },
    ],
  },
  {
    id: 'em_cas_columbus_return', tag: 'CAS', date: '1493-03-15', image: 'explore', condition: [has('discovered'), { type: 'maxYear', value: 1500 }],
    title: 'El regreso del Almirante',
    text: 'La Niña ha entrado en Palos. Colón trae oro, papagayos y hombres de piel cobriza, y jura haber tocado las costas de Asia. Pide una flota mayor para volver.',
    note: 'El segundo viaje (1493) llevó diecisiete naves y unos mil quinientos hombres a La Española.',
    options: [
      { label: 'Armar una gran flota de poblamiento', effects: [gold(-80), x('colonists', 1), claim('hispaniola', 'cuba'), pres(20), chr('Diecisiete naves zarpan de Cádiz rumbo a las Indias con colonos, caballos y simiente.')], aiWeight: 7, hint: 'Caro, pero asegura las islas antes que nadie.' },
      { label: 'Esperar la bula del papa antes de gastar más', effects: [gold(-25), rel('PAP', 25), rel('POR', 15), pres(5)], aiWeight: 3, hint: 'Prudencia diplomática, a costa de tiempo en ultramar.' },
    ],
  },
  {
    id: 'em_cas_isabel', tag: 'CAS', date: '1504-11-26', image: 'court',
    title: 'Muere la Reina Católica',
    text: 'Isabel ha fallecido en Medina del Campo. Su testamento deja la corona a su hija Juana, casada con Felipe de Habsburgo, pero ordena que Fernando gobierne si ella no pudiera hacerlo.',
    note: 'La pugna entre Fernando el Católico y Felipe el Hermoso terminó con la Concordia de Villafáfila (1506) y la repentina muerte de Felipe en Burgos.',
    options: [
      { label: 'Que gobierne Fernando como regente', effects: [stab(1), rel('HAB', -30), flag('cas_fernando_regent'), chr('Fernando de Aragón asume la gobernación de Castilla en nombre de su hija.')], aiWeight: 4, hint: 'Continuidad, pero los Habsburgo no lo olvidarán.' },
      { label: 'Llamar a Juana y a Felipe desde Flandes', effects: [rel('HAB', 50), pres(20), stab(-1), trig('em_cas_felipe', 660), chr('Los grandes de Castilla acuden a besar la mano de Felipe el Hermoso.')], aiWeight: 6, hint: 'Lazos con los Habsburgo a cambio de una corte dividida.' },
    ],
  },
  {
    id: 'em_cas_felipe', tag: 'CAS', triggeredOnly: true, image: 'disaster',
    title: 'La muerte de Felipe el Hermoso',
    text: 'Tras un partido de pelota y un vaso de agua helada, el rey consorte ha muerto en Burgos. La reina Juana, desolada, recorre Castilla con el féretro de su esposo.',
    options: [
      { label: 'Recluir a la reina en Tordesillas y devolver el poder a Fernando', effects: [stab(1), pres(-10), rel('HAB', -15), chr('Juana queda recluida en Tordesillas; Cisneros y Fernando gobiernan el reino.')], aiWeight: 8 },
      { label: 'Gobernar mediante un consejo de grandes', effects: [x('pol_central', -1), gold(50), { type: 'unrestRealm', amount: 1 }], aiWeight: 2, hint: 'Los nobles pagan por su poder, y lo ejercerán.' },
    ],
  },
  {
    id: 'em_cas_charles', tag: 'CAS', date: '1517-09-19', image: 'court',
    title: 'Un rey venido de Flandes',
    text: 'El joven Carlos desembarca en Tazones sin hablar castellano y rodeado de consejeros flamencos que reparten cargos y obispados entre los suyos. Las ciudades murmuran.',
    note: 'El nombramiento de extranjeros y los subsidios para la elección imperial encendieron la revuelta de las Comunidades (1520-1521).',
    options: [
      { label: 'Confiar en Chièvres y en la corte flamenca', effects: [rel('HAB', 40), gold(-60), trig('em_cas_comuneros', 950), chr('Guillermo de Croy reparte las mercedes de Castilla entre los flamencos del rey.')], aiWeight: 7, hint: 'Las ciudades castellanas se sentirán ignoradas.' },
      { label: 'Jurar los fueros ante las Cortes y aprender la lengua', effects: [stab(1), pres(10), rel('HAB', -10), chr('El rey jura en Valladolid las leyes del reino y promete no dar oficios a extranjeros.')], aiWeight: 3 },
    ],
  },
  {
    id: 'em_cas_comuneros', tag: 'CAS', triggeredOnly: true, image: 'revolt',
    title: 'Las Comunidades de Castilla',
    text: 'Toledo, Segovia y Valladolid se han alzado. La Santa Junta reclama Cortes cada tres años y que el oro del reino no salga hacia el Imperio.',
    note: 'Los comuneros fueron vencidos en Villalar el 23 de abril de 1521; Padilla, Bravo y Maldonado fueron decapitados al día siguiente.',
    options: [
      { label: 'Aplastar la Junta en Villalar', effects: [men(-4000), pres(20), x('pol_central', 1), { type: 'unrestRealm', amount: 1 }, chr('Las tropas reales deshacen a los comuneros en Villalar. Las ciudades callan.')], aiWeight: 8, hint: 'El poder real sale reforzado; la deuda con las ciudades queda pendiente.' },
      { label: 'Atender las peticiones de las ciudades', effects: [gold(-120), stab(1), x('pol_central', -1), chr('El rey acepta parte de las peticiones de la Junta y perdona a los cabecillas.')], aiWeight: 2 },
    ],
  },
  {
    id: 'em_cas_manila', tag: 'CAS', date: '1565-10-08', image: 'explore', condition: [{ type: 'owns', province: 'mexico' }, { type: 'maxYear', value: 1620 }],
    title: 'El tornaviaje de Urdaneta',
    text: 'Un fraile agustino ha encontrado la ruta de vuelta de las Filipinas a Acapulco por las corrientes del norte. La seda y la porcelana de China pueden pagarse con plata de Nueva España.',
    note: 'El galeón de Manila unió Asia y América durante dos siglos y medio (1565-1815).',
    options: [
      { label: 'Fletar cada año la nao de la China', effects: [gold(-80), flag('cas_manila'), pres(25), chr('Zarpa de Acapulco el primer galeón cargado de plata rumbo a Manila.')], aiWeight: 8, hint: 'Ganancias anuales y más plata en circulación.' },
      { label: 'Proteger el monopolio de Sevilla', effects: [gold(30), x('pol_mercant', 1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_cas_armada', tag: 'CAS', date: '1587-12-01', image: 'war', condition: [{ type: 'exists', tag: 'ENG' }, has('eng_anglican', 'ENG'), { type: 'religionIs', value: 'catholic' }],
    title: 'La Empresa de Inglaterra',
    text: 'Los corsarios ingleses saquean las flotas de Indias y la reina escocesa ha sido decapitada. En Lisboa se reúne una armada para escoltar a los tercios de Flandes hasta la costa inglesa.',
    note: 'La Gran Armada zarpó en mayo de 1588. Los brulotes de Calais y las tormentas del norte la dispersaron.',
    options: [
      { label: 'Que zarpe la Armada', effects: [gold(-200), x('ships', -5), { type: 'declareWar', target: 'ENG' }, trig('em_eng_armada', 230, 'ENG'), chr('Ciento treinta naves salen de Lisboa con rumbo al canal de la Mancha.')], aiWeight: 6, hint: 'Un golpe decisivo o un desastre naval.' },
      { label: 'Contener a Inglaterra en Flandes', effects: [pres(-30), gold(50)], aiWeight: 4 },
    ],
  },

  // ------------------------------------------------------------ Portugal
  {
    id: 'em_por_gama', tag: 'POR', date: '1497-07-08', image: 'explore',
    title: 'La armada de la India',
    text: 'Bartolomeu Dias dobló el cabo de Buena Esperanza. El rey Manuel quiere que una flota llegue esta vez hasta Calicut, donde nace la pimienta.',
    note: 'Vasco da Gama zarpó de Lisboa el 8 de julio de 1497 y llegó a Calicut en mayo de 1498.',
    options: [
      { label: 'Despachar a Vasco da Gama', effects: [gold(-60), x('ships', -2), trig('em_por_gama_return', 730), chr('Cuatro naves de Vasco da Gama zarpan de Restelo rumbo a la India.')], aiWeight: 9, hint: 'Viaje largo y peligroso, pero puede cambiar el comercio del mundo.' },
      { label: 'Seguir con el comercio de Guinea', effects: [gold(30), claim('guinea', 'gold_coast', 'kongo'), pres(-10)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_por_gama_return', tag: 'POR', triggeredOnly: true, image: 'prosperity',
    title: 'Pimienta de Calicut',
    text: 'Han vuelto dos de las cuatro naves y menos de la mitad de los hombres. Lo que traen en las bodegas paga sesenta veces el viaje.',
    options: [
      { label: 'Monopolio real: la Casa da Índia', effects: [gold(150), pres(40), flag('por_india'), trig('em_por_cabral', 240), chr('Lisboa se convierte en el mercado de las especias de Europa.')], aiWeight: 5, hint: 'Ganancia inmediata para la Corona.' },
      { label: 'Fortalezas y armadas permanentes en el Índico', effects: [gold(40), x('ships', 5), tech('naval'), flag('por_india'), trig('em_por_cabral', 240), chr('Portugal decide quedarse en el Índico con factorías fortificadas.')], aiWeight: 5, hint: 'Menos oro hoy, más poder naval mañana.' },
    ],
  },
  {
    id: 'em_por_cabral', tag: 'POR', triggeredOnly: true, image: 'explore',
    title: 'La Tierra de Vera Cruz',
    text: 'La segunda armada de la India, apartándose hacia el oeste para evitar las calmas, ha avistado una costa desconocida al sur del ecuador, dentro de la parte portuguesa de Tordesillas.',
    note: 'Pedro Álvares Cabral llegó a Brasil el 22 de abril de 1500.',
    options: [
      { label: 'Tomar posesión y enviar pobladores', effects: [claim('pernambuco', 'bahia'), x('colonists', 1), pres(15), chr('Cabral planta una cruz en la Tierra de Vera Cruz en nombre del rey de Portugal.')], aiWeight: 7 },
      { label: 'No desviarse de la ruta de Calicut', effects: [gold(80), pres(5)], aiWeight: 3 },
    ],
  },
  {
    id: 'em_por_sebastian', tag: 'POR', date: '1578-06-01', image: 'war', condition: [{ type: 'exists', tag: 'MOR' }, { type: 'owns', province: 'tangier' }],
    title: 'La cruzada del rey Sebastián',
    text: 'El joven rey sueña con una cruzada en Marruecos y ha empeñado la Corona para armarla. Sus consejeros, y su tío Felipe de España, le ruegan que no vaya en persona.',
    note: 'En Alcazarquivir (4 de agosto de 1578) murieron el rey y la flor de la nobleza portuguesa. Sin heredero directo, Portugal entró en crisis.',
    options: [
      { label: 'Embarcar con la nobleza hacia Arcila', effects: [men(-3000), gold(-80), { type: 'spawnArmy', province: 'tangier', units: { infantry: 3, cavalry: 2 } }, { type: 'declareWar', target: 'MOR', goal: 'fez' }, trig('em_por_crisis', 600), chr('El rey Sebastián desembarca en Marruecos con lo mejor de su reino.')], aiWeight: 7, hint: 'Muy arriesgado: el rey no tiene heredero.' },
      { label: 'Renunciar a la cruzada', effects: [pres(-25), stab(1)], aiWeight: 3 },
    ],
  },
  {
    id: 'em_por_crisis', tag: 'POR', triggeredOnly: true, image: 'court', condition: [{ type: 'exists', tag: 'CAS' }],
    title: 'Un trono sin rey',
    text: 'El rey no volvió de África. Muerto también el viejo cardenal Enrique, Felipe de España reclama la corona como nieto de Manuel I; el pueblo de Lisboa aclama a Don Antonio, prior de Crato.',
    note: 'Las Cortes de Tomar (1581) reconocieron a Felipe II. Portugal conservó sus leyes y su imperio dentro de la Monarquía Hispánica hasta 1640.',
    options: [
      { label: 'Reconocer a Felipe en las Cortes de Tomar', effects: [{ type: 'alliance', other: 'CAS' }, rel('CAS', 100), stab(1), pres(-30), flag('por_iberian_union'), chr('Las Cortes de Tomar juran a Felipe como rey de Portugal.'), chr('Portugal y su imperio se unen a la Monarquía de Felipe II.', 'CAS')], aiWeight: 6, hint: 'Paz y protección a cambio de independencia de acción.' },
      { label: 'Aclamar a Don Antonio', effects: [rel('CAS', -80), rel('ENG', 30), stab(-1), pres(20), chr('Lisboa aclama a Don Antonio; Portugal se prepara para resistir a Castilla.')], aiWeight: 4 },
    ],
  },

  // ------------------------------------------------------------ Habsburgo
  {
    id: 'em_hab_spanish_match', tag: 'HAB', date: '1496-10-20', image: 'court', condition: [{ type: 'exists', tag: 'CAS' }],
    title: 'Las bodas de Lille',
    text: 'Maximiliano negocia un doble enlace: su hijo Felipe con la infanta Juana y su hija Margarita con el príncipe heredero de Castilla. Francia ofrece en cambio una alianza contra Venecia.',
    note: 'Felipe y Juana se casaron en Lier en octubre de 1496. De ellos nacerían Carlos V y Fernando I.',
    options: [
      { label: 'Enlazar con los Reyes Católicos', effects: [{ type: 'alliance', other: 'CAS' }, rel('CAS', 60), pres(30), flag('hab_spanish_match'), chr('Felipe de Habsburgo se casa con Juana de Castilla.')], aiWeight: 9, hint: 'Que otros hagan la guerra; tú, feliz Austria, cásate.' },
      { label: 'Aceptar la oferta francesa', effects: [rel('FRA', 60), rel('CAS', -20), pres(-10)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_hab_election', tag: 'HAB', date: '1519-02-01', image: 'court', condition: [{ type: 'exists', tag: 'FRA' }],
    title: 'La elección imperial',
    text: 'Ha muerto el emperador Maximiliano. Francisco de Francia ofrece a los siete electores más oro que nadie; los Fugger de Augsburgo están dispuestos a prestar a la casa de Austria lo que haga falta.',
    note: 'Carlos fue elegido el 28 de junio de 1519 gracias a unos 850.000 florines, más de la mitad prestados por Jakob Fugger.',
    options: [
      { label: 'Comprar a los electores con crédito Fugger', effects: [gold(-150), x('inflation', 2), pres(100), flag('hab_emperor'), rel('FRA', -40), trig('em_fra_rivalry', 45, 'FRA'), chr('Los electores coronan emperador al nieto de Maximiliano.')], aiWeight: 9, hint: 'Una corona imperial y un rival para siempre.' },
      { label: 'No endeudar a la casa', effects: [pres(-40), rel('FRA', 20)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_hab_worms', tag: 'HAB', date: '1521-04-17', image: 'faith',
    title: 'La Dieta de Worms',
    text: 'El fraile Martín Lutero comparece ante el emperador con salvoconducto y se niega a retractarse: «Aquí estoy, no puedo hacer otra cosa». Los príncipes esperan la sentencia.',
    note: 'El Edicto de Worms declaró proscrito a Lutero, pero el elector de Sajonia lo escondió en el castillo de Wartburg.',
    options: [
      { label: 'Proscribir al hereje con el Edicto de Worms', effects: [rel('PAP', 30), rel('SAX', -50), { type: 'relationsWith', religion: 'protestant', amount: -20 }, pres(20), flag('hab_worms_ban'), chr('El emperador declara proscrito a Lutero en todo el Imperio.')], aiWeight: 8 },
      { label: 'Dejarle marchar y pedir un concilio', effects: [rel('PAP', -40), { type: 'relationsWith', religion: 'protestant', amount: 25 }, stab(-1), chr('El emperador aplaza el juicio de Lutero hasta un concilio general.')], aiWeight: 2, hint: 'Gana tiempo con los príncipes, pierde a Roma.' },
    ],
  },
  {
    id: 'em_hab_vienna_siege', tag: 'HAB', triggeredOnly: true, image: 'war', condition: [{ type: 'owns', province: 'austria' }, { type: 'atWarWith', other: 'OTT' }],
    title: 'Los turcos ante Viena',
    text: 'El ejército del sultán ha acampado frente a las murallas. Los zapadores turcos minan los bastiones mientras la guarnición de Niklas Salm aguanta con lo que tiene.',
    note: 'El asedio de 1529 fracasó por las lluvias, la falta de artillería pesada y la llegada del invierno.',
    options: [
      { label: 'Resistir tras las murallas', effects: [men(-2000), { type: 'spawnArmy', province: 'austria', units: { infantry: 4, artillery: 1 } }, pres(40), chr('Viena resiste. Las lluvias de otoño obligan al sultán a levantar el cerco.')], aiWeight: 8 },
      { label: 'Ofrecer tributo por la paz', effects: [gold(-120), pres(-40), rel('OTT', 50)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_hab_augsburg', tag: 'HAB', date: '1555-09-25', image: 'peace', condition: [{ type: 'religionIs', value: 'catholic' }],
    title: 'La paz de Augsburgo',
    text: 'Tras años de guerra con la Liga de Esmalcalda, los príncipes proponen que cada señor decida la fe de sus tierras. El emperador ve cómo la unidad de la cristiandad se rompe para siempre.',
    note: 'El principio «cuius regio, eius religio» reconoció el luteranismo, pero no el calvinismo; la tregua duró hasta la guerra de los Treinta Años.',
    options: [
      { label: 'Aceptar que cada príncipe elija su fe', effects: [stab(1), pres(-20), { type: 'relationsWith', religion: 'protestant', amount: 30 }, flag('hab_augsburg'), chr('La paz de Augsburgo reconoce la fe luterana en el Imperio.')], aiWeight: 8 },
      { label: 'Restaurar la unidad por las armas', effects: [pres(20), stab(-1), { type: 'relationsWith', religion: 'protestant', amount: -40 }, { type: 'declareWar', target: 'SAX' }], aiWeight: 2, hint: 'Una guerra larga contra los príncipes reformados.' },
    ],
  },

  // ------------------------------------------------------------ Francia
  {
    id: 'em_fra_rivalry', tag: 'FRA', triggeredOnly: true, image: 'court', condition: [{ type: 'exists', tag: 'HAB' }, { type: 'exists', tag: 'OTT' }],
    title: 'Cercados por los Habsburgo',
    text: 'El nuevo emperador reina en Viena, Flandes, Castilla y Nápoles. Francia queda rodeada por una sola casa. Francisco I debe elegir cómo romper el cerco.',
    options: [
      { label: 'Guerra en Italia por Milán', effects: [{ type: 'declareWar', target: 'MIL', goal: 'lombardia' }, pres(10), trig('em_fra_pavia', 1500), chr('Francisco I cruza los Alpes para reclamar el ducado de Milán.')], aiWeight: 6 },
      { label: 'La alianza impía con el sultán', effects: [{ type: 'alliance', other: 'OTT' }, { type: 'relationsWith', religion: 'catholic', amount: -15 }, rel('HAB', -30), chr('París y Estambul pactan contra el emperador, para escándalo de la cristiandad.')], aiWeight: 3, hint: 'Un aliado temible, mal visto por los príncipes cristianos.' },
      { label: 'Esperar una ocasión mejor', effects: [stab(1), pres(-20)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_fra_pavia', tag: 'FRA', triggeredOnly: true, image: 'disaster', condition: [{ type: 'atWar', value: true }],
    title: 'Todo se ha perdido, salvo el honor',
    text: 'Bajo los muros de Pavía los arcabuceros imperiales han destrozado a la caballería francesa. El rey está cautivo y lo llevan a Madrid, donde le exigen Borgoña.',
    note: 'Francisco I firmó el tratado de Madrid (1526) y lo repudió en cuanto cruzó la frontera.',
    options: [
      { label: 'Firmar y repudiar el tratado al quedar libre', effects: [gold(-150), pres(-20), inf(2), rel('HAB', -40), chr('El rey de Francia jura el tratado de Madrid y lo declara nulo en cuanto pisa suelo francés.')], aiWeight: 9 },
      { label: 'Cumplir la palabra y ceder Borgoña', effects: [{ type: 'cede', from: 'FRA', to: 'HAB', provinces: ['bourgogne'] }, pres(-40), stab(1), rel('HAB', 60)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_fra_wassy', tag: 'FRA', date: '1562-03-01', image: 'faith', condition: [{ type: 'religionIs', value: 'catholic' }],
    title: 'La matanza de Wassy',
    text: 'Los hombres del duque de Guisa han disparado contra hugonotes reunidos en un granero. Las iglesias reformadas llaman a las armas; la reina madre busca un equilibrio imposible.',
    options: [
      { label: 'Edicto de tolerancia limitada', effects: [stab(-1), { type: 'relationsWith', religion: 'protestant', amount: 20 }, flag('fra_tolerance'), trig('em_fra_bartholomew', 3800)], aiWeight: 4, hint: 'Ni los católicos ni los hugonotes quedarán satisfechos.' },
      { label: 'Ponerse del lado de los Guisa', effects: [rel('PAP', 30), rel('CAS', 20), { type: 'unrestRealm', amount: 2 }, trig('em_fra_bartholomew', 3800)], aiWeight: 6 },
    ],
  },
  {
    id: 'em_fra_bartholomew', tag: 'FRA', triggeredOnly: true, image: 'disaster',
    title: 'La noche de San Bartolomé',
    text: 'París celebra la boda del rey de Navarra con la hermana del rey. Los jefes hugonotes están en la ciudad, y en el Louvre se habla de acabar con ellos de una vez.',
    note: 'La matanza comenzó el 24 de agosto de 1572 y se extendió a las provincias durante semanas.',
    options: [
      { label: 'Dejar que los Guisa actúen', effects: [stab(-1), pres(-20), rel('PAP', 20), { type: 'relationsWith', religion: 'protestant', amount: -40 }, { type: 'unrestRealm', amount: 2 }, chr('Las campanas de Saint-Germain-l\'Auxerrois dan la señal: miles de hugonotes mueren en París.')], aiWeight: 6 },
      { label: 'Proteger a los nobles hugonotes', effects: [stab(-1), rel('PAP', -30), { type: 'relationsWith', religion: 'protestant', amount: 30 }, flag('fra_tolerance')], aiWeight: 4 },
    ],
  },
  {
    id: 'em_fra_nantes', tag: 'FRA', date: '1598-04-13', image: 'peace', condition: [{ type: 'religionIs', value: 'catholic' }],
    title: 'El edicto de Nantes',
    text: 'Enrique IV, que abjuró del calvinismo para entrar en París, quiere cerrar treinta años de guerras civiles: libertad de conciencia para los hugonotes y plazas fuertes donde sentirse seguros.',
    options: [
      { label: 'Firmar el edicto', effects: [stab(2), rel('PAP', -20), { type: 'relationsWith', religion: 'protestant', amount: 20 }, chr('El edicto de Nantes pone fin a las guerras de religión en Francia.')], aiWeight: 8 },
      { label: 'Una sola fe para un solo rey', effects: [pres(15), rel('PAP', 20), { type: 'unrestRealm', amount: 2 }], aiWeight: 2 },
    ],
  },

  // ------------------------------------------------------------ Inglaterra
  {
    id: 'em_eng_cabot', tag: 'ENG', date: '1497-05-02', image: 'explore',
    title: 'Un veneciano en Bristol',
    text: 'Giovanni Caboto, marino veneciano, pide licencia para buscar por el norte la ruta de Catay que Colón no encontró. Solo pide patentes; la Corona no tendría que pagar el barco.',
    options: [
      { label: 'Conceder las patentes', effects: [gold(-20), claim('newfoundland', 'new_england'), x('colonists', 1), chr('El Matthew zarpa de Bristol hacia el oeste con licencia del rey.')], aiWeight: 7 },
      { label: 'Ni un penique para aventureros', effects: [gold(15), pres(-10)], aiWeight: 3 },
    ],
  },
  {
    id: 'em_eng_supremacy', tag: 'ENG', date: '1534-11-03', image: 'faith', condition: [{ type: 'religionIs', value: 'catholic' }],
    title: 'El Acta de Supremacía',
    text: 'El papa no anulará el matrimonio del rey con Catalina de Aragón. El Parlamento ofrece otra salida: declarar al rey cabeza suprema de la Iglesia de Inglaterra y quedarse con los bienes de los monasterios.',
    note: 'Tras la ruptura, Enrique VIII disolvió más de ochocientos monasterios entre 1536 y 1541.',
    options: [
      { label: 'Romper con Roma', effects: [flag('eng_supremacy'), rel('PAP', -60), rel('HAB', -40), gold(180), { type: 'unrestRealm', amount: 1 }, chr('El Parlamento proclama al rey cabeza suprema de la Iglesia de Inglaterra.')], aiWeight: 9, hint: 'Las tierras de los monasterios llenan las arcas; el norte se rebelará.' },
      { label: 'Someterse al papa', effects: [rel('PAP', 40), rel('HAB', 30), stab(-1), pres(-20)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_eng_settlement', tag: 'ENG', date: '1559-04-29', image: 'faith', condition: [has('eng_supremacy')],
    title: 'El acuerdo isabelino',
    text: 'Tras los vaivenes de Eduardo y María, la nueva reina debe fijar la fe del reino: una iglesia propia, con obispos y liturgia en inglés, o el regreso definitivo a la obediencia romana.',
    options: [
      { label: 'Una Iglesia de Inglaterra reformada', effects: [{ type: 'religion', provinces: ENGLAND, value: 'protestant', nation: true }, stab(-1), rel('PAP', -40), { type: 'relationsWith', religion: 'protestant', amount: 30 }, flag('eng_anglican'), chr('El Libro de Oración Común se impone en todas las parroquias de Inglaterra.')], aiWeight: 9 },
      { label: 'Volver a Roma', effects: [rel('PAP', 60), rel('CAS', 40), { type: 'unrestRealm', amount: 2 }], aiWeight: 1 },
    ],
  },
  {
    id: 'em_eng_armada', tag: 'ENG', triggeredOnly: true, image: 'war', condition: [{ type: 'exists', tag: 'CAS' }],
    title: 'La Armada en el Canal',
    text: 'La flota española avanza en media luna hacia Calais para recoger al ejército de Flandes. El almirante Howard propone lanzar brulotes en la noche contra los barcos fondeados.',
    options: [
      { label: 'Brulotes sobre Calais', effects: [pres(60), x('ships', -2), stab(1), flag('eng_armada_won'), rel('CAS', -30), chr('Los brulotes deshacen la formación de la Armada; el viento del norte hace el resto.'), chr('La Armada se dispersa ante Calais y vuelve rodeando Escocia e Irlanda.', 'CAS'), pres(-40, 'CAS'), { type: 'x', tag: 'CAS', key: 'ships', amount: -5 }], aiWeight: 8 },
      { label: 'Evitar el combate y guarnecer las costas', effects: [gold(-120), men(-2000), pres(-10)], aiWeight: 2, hint: 'Seguro, pero sin gloria.' },
    ],
  },

  // ------------------------------------------------------------ Imperio otomano
  {
    id: 'em_ott_sephardim', tag: 'OTT', triggeredOnly: true, image: 'prosperity',
    title: 'Los exiliados de Sefarad',
    text: 'Llegan a Salónica y a Estambul miles de judíos expulsados de los reinos de España. Traen imprentas, oficios y contactos con todos los puertos del Mediterráneo.',
    note: 'Se atribuye a Bayaceto II la frase de que el rey de España había empobrecido su reino para enriquecer el del sultán.',
    options: [
      { label: 'Acogerlos en Salónica y Estambul', effects: [tech('trade'), pres(10), chr('El sultán ordena acoger a los judíos de Sefarad en sus ciudades.')], aiWeight: 8 },
      { label: 'Gravarlos con la capitación y dejar hacer', effects: [gold(100)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_ott_vienna', tag: 'OTT', date: '1529-05-10', image: 'war', condition: [{ type: 'owns', province: 'hungary' }, { type: 'exists', tag: 'HAB' }, { type: 'atWar', value: false }],
    title: 'La manzana de oro',
    text: 'Buda es del sultán y Fernando de Habsburgo reclama Hungría. Los visires señalan Viena, la «manzana de oro» del norte, pero la campaña es larga y el otoño en el Danubio, lluvioso.',
    options: [
      { label: 'Marchar sobre Viena', effects: [{ type: 'declareWar', target: 'HAB', goal: 'austria' }, trig('em_hab_vienna_siege', 130, 'HAB'), chr('Solimán remonta el Danubio con un ejército inmenso camino de Viena.')], aiWeight: 6 },
      { label: 'Consolidar Hungría', effects: [stab(1), claim('croatia', 'transylvania', 'upper_hungary', 'pannonia')], aiWeight: 4 },
    ],
  },
  {
    id: 'em_ott_cyprus', tag: 'OTT', date: '1570-02-01', image: 'court', condition: [{ type: 'exists', tag: 'VEN' }, { type: 'owns', province: 'cyprus', tag: 'VEN' }],
    title: 'Chipre, isla del vino',
    text: 'El nuevo sultán Selim quiere la isla de Chipre, base de corsarios en el camino de Egipto. Sus consejeros recuerdan que Venecia paga tributo por ella y que la paz con la República enriquece a todos.',
    options: [
      { label: 'Exigir a Venecia la isla', effects: [rel('VEN', -40), trig('em_ven_cyprus', 30, 'VEN')], aiWeight: 8 },
      { label: 'Respetar la paz con la Serenísima', effects: [pres(-10), rel('VEN', 30), gold(40)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_ott_cyprus_war', tag: 'OTT', triggeredOnly: true, image: 'war', condition: [{ type: 'exists', tag: 'VEN' }],
    title: 'Venecia se niega',
    text: 'El bailo veneciano ha devuelto la carta del sultán sin abrir. La flota y el ejército están listos en Rodas.',
    options: [
      { label: 'Desembarcar en Chipre', effects: [{ type: 'declareWar', target: 'VEN', goal: 'cyprus' }, chr('El ejército otomano desembarca en Chipre y pone sitio a Nicosia.')], aiWeight: 9 },
      { label: 'Dejarlo estar', effects: [pres(-30)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_ott_lepanto', tag: 'OTT', triggeredOnly: true, image: 'disaster',
    title: 'Lepanto',
    text: 'En el golfo de Patrás las galeras de la Santa Liga han deshecho la flota del sultán. Murió el kapudan bajá Alí y miles de remeros cristianos han quedado libres.',
    note: 'La batalla, el 7 de octubre de 1571, no impidió que Chipre quedara en manos otomanas; al año siguiente la flota turca había sido reconstruida.',
    options: [
      { label: 'Reconstruir la flota en un invierno', effects: [gold(-150), x('ships', -5), pres(-10), chr('Los astilleros de Estambul trabajan día y noche: al año siguiente hay una flota nueva.'), pres(40, 'VEN'), chr('Las galeras de Venecia vuelven victoriosas de Lepanto.', 'VEN')], aiWeight: 8, hint: '«Nos han afeitado la barba; crecerá más fuerte».' },
      { label: 'Volcarse en los ejércitos de tierra', effects: [x('ships', -10), pres(-40), men(5000), pres(40, 'VEN'), chr('Las galeras de Venecia vuelven victoriosas de Lepanto.', 'VEN')], aiWeight: 2 },
    ],
  },

  // ------------------------------------------------------------ Venecia
  {
    id: 'em_ven_spices', tag: 'VEN', date: '1502-01-01', image: 'disaster', condition: [has('por_india', 'POR')],
    title: 'Las galeras vuelven vacías',
    text: 'En Alejandría no hay pimienta: los portugueses la compran en la India y la llevan a Lisboa por mar. El Consejo de los Diez debe decidir cómo salvar el comercio de la República.',
    note: 'Venecia llegó a estudiar en 1504 la apertura de un canal en Suez y apoyó la flota mameluca derrotada en Diu (1509).',
    options: [
      { label: 'Ayudar en secreto al sultán de Egipto', effects: [gold(-60), rel('MAM', 30), rel('POR', -40), chr('Carpinteros venecianos ayudan a armar una flota mameluca para el mar Rojo.')], aiWeight: 5 },
      { label: 'Invertir en la tierra firme y los telares', effects: [gold(-100), tech('production'), x('pol_mercant', -1)], aiWeight: 4, hint: 'La República busca su riqueza en tierra.' },
      { label: 'Estudiar un canal en Suez', effects: [gold(-150), pres(20), rel('MAM', 20)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_ven_cambrai', tag: 'VEN', date: '1508-12-10', image: 'war', condition: [{ type: 'exists', tag: 'FRA' }, { type: 'exists', tag: 'PAP' }],
    title: 'La Liga de Cambrai',
    text: 'El papa, el rey de Francia, el emperador y el rey de Aragón se han juramentado para repartirse las tierras venecianas. La República está sola.',
    note: 'Tras la derrota de Agnadello (1509), Venecia sobrevivió dividiendo a sus enemigos.',
    options: [
      { label: 'Resistir con los condotieros', effects: [men(-3000), gold(-100), pres(30), rel('FRA', -40), chr('Venecia arma a sus condotieros contra media Europa.')], aiWeight: 5 },
      { label: 'Separar al papa de la Liga', effects: [gold(-150), rel('PAP', 50), pres(-10), chr('La República compra la amistad del papa y la Liga se resquebraja.')], aiWeight: 5 },
    ],
  },
  {
    id: 'em_ven_cyprus', tag: 'VEN', triggeredOnly: true, image: 'court', condition: [{ type: 'owns', province: 'cyprus' }],
    title: 'El ultimátum del sultán',
    text: 'Un enviado de Estambul exige la entrega de Chipre. Ceder la isla evitaría la guerra; negarse obliga a buscar la ayuda de España y del papa, que siempre tienen otras prioridades.',
    options: [
      { label: 'Ceder Chipre', effects: [{ type: 'cede', from: 'VEN', to: 'OTT', provinces: ['cyprus'] }, pres(-40), rel('OTT', 40)], aiWeight: 2 },
      { label: 'Negarse y pedir socorro a la cristiandad', effects: [pres(10), trig('em_ott_cyprus_war', 20, 'OTT'), trig('em_ven_holy_league', 450), chr('El Senado veneciano rechaza el ultimátum del sultán.')], aiWeight: 8 },
    ],
  },
  {
    id: 'em_ven_holy_league', tag: 'VEN', triggeredOnly: true, image: 'war', condition: [{ type: 'atWarWith', other: 'OTT' }, { type: 'exists', tag: 'PAP' }],
    title: 'La Santa Liga',
    text: 'Pío V ha reunido a España, Venecia y la Santa Sede bajo el mando de don Juan de Austria. Firmar significa seguir la guerra; también se puede buscar una paz por separado con el sultán.',
    options: [
      { label: 'Firmar la Liga y salir al encuentro', effects: [{ type: 'alliance', other: 'PAP' }, rel('CAS', 40), pres(30), flag('ven_holy_league'), trig('em_ott_lepanto', 140, 'OTT'), chr('Las galeras de Venecia se unen a las de España y del papa en Mesina.')], aiWeight: 7 },
      { label: 'Paz por separado con el sultán', effects: [{ type: 'cede', from: 'VEN', to: 'OTT', provinces: ['cyprus'] }, gold(-100), rel('OTT', 60), pres(-30)], aiWeight: 3, hint: 'Se pierde Chipre, pero se salva el comercio de Levante.' },
    ],
  },

  // ------------------------------------------------------------ Moscovia
  {
    id: 'em_rus_tsar', tag: 'RUS', date: '1547-01-16', image: 'court',
    title: 'Zar de toda Rusia',
    text: 'El joven Iván, criado entre las intrigas de los boyardos, quiere coronarse no como gran príncipe sino como zar, heredero de Bizancio. El metropolitano Macario ha preparado el rito.',
    options: [
      { label: 'Coronarse zar en la Dormición', effects: [pres(60), stab(1), flag('rus_tsar'), { type: 'relationsWith', religion: 'orthodox', amount: 15 }, chr('Iván IV es coronado zar en la catedral de la Dormición del Kremlin.')], aiWeight: 9 },
      { label: 'Seguir siendo gran príncipe', effects: [gold(50), pres(-10)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_rus_kazan', tag: 'RUS', date: '1552-06-01', image: 'war', condition: [{ type: 'exists', tag: 'KAZ' }, { type: 'notOwns', province: 'kazan' }],
    title: 'La campaña de Kazán',
    text: 'Los tártaros de Kazán siguen saqueando las tierras rusas del Volga. Los ingenieros del zar proponen minar sus murallas; los boyardos prefieren poner en el trono a un kan amigo.',
    note: 'Kazán cayó el 2 de octubre de 1552. En memoria de la victoria se levantó la catedral de San Basilio.',
    options: [
      { label: 'Tomar Kazán', effects: [{ type: 'declareWar', target: 'KAZ', goal: 'kazan' }, chr('El ejército del zar parte hacia Kazán con cañones y zapadores.')], aiWeight: 9 },
      { label: 'Sostener un kan títere', effects: [rel('KAZ', 30), gold(40)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_rus_livonia', tag: 'RUS', date: '1558-01-22', image: 'war', condition: [{ type: 'exists', tag: 'LIV' }],
    title: 'Una ventana al Báltico',
    text: 'La Orden Livonia se niega a pagar el viejo tributo de Dorpat y cierra el paso a los artesanos que el zar contrata en Occidente. Los puertos de Riga y Narva están a su alcance.',
    note: 'La guerra de Livonia (1558-1583) empezó con victorias rusas y terminó con Suecia y Polonia-Lituania quedándose con la región.',
    options: [
      { label: 'Invadir Livonia', effects: [{ type: 'declareWar', target: 'LIV', goal: 'livonia' }, chr('Las tropas del zar cruzan hacia Narva y Dorpat.')], aiWeight: 7, hint: 'Suecia y Polonia no se quedarán mirando.' },
      { label: 'Cobrar el tributo y comerciar por Narva', effects: [gold(80), rel('LIV', -30)], aiWeight: 3 },
    ],
  },
  {
    id: 'em_rus_oprichnina', tag: 'RUS', date: '1565-02-01', image: 'revolt', condition: [has('rus_tsar')],
    title: 'La Opríchnina',
    text: 'El zar ha abandonado Moscú y amenaza con abdicar si no le dejan castigar a los traidores. Pide un dominio propio, gobernado por una guardia vestida de negro, fuera de la autoridad de los boyardos.',
    note: 'Entre 1565 y 1572 los opríchniki sembraron el terror; el saqueo de Nóvgorod (1570) fue su episodio más sangriento.',
    options: [
      { label: 'Conceder al zar su Opríchnina', effects: [x('pol_central', 2), stab(-2), gold(120), pres(10), { type: 'unrestRealm', amount: 2 }, chr('Jinetes con cabezas de perro en la silla recorren Rusia en nombre del zar.')], aiWeight: 7, hint: 'Poder absoluto a costa de años de terror.' },
      { label: 'Gobernar con la duma de boyardos', effects: [stab(1), x('pol_central', -1)], aiWeight: 3 },
    ],
  },
];

// ================================================================ 1492: mission trees
const M = (m: Mission): Mission => m;
const MISSIONS_1492: Mission[] = [
  // ------------------------------------------------------------ Castilla
  M({ id: 'm_cas_granada', tag: 'CAS', col: 0, icon: 'faith', title: 'Granada en paz', text: 'Asegurar el último reino conquistado y mantener el orden en Castilla.',
    conditions: [{ type: 'owns', province: 'granada' }, { type: 'minStability', value: 1 }], rewards: [stab(1), pres(30), claim('oran', 'algiers'), chr('Granada queda en paz bajo la corona de Castilla.')] }),
  M({ id: 'm_cas_presidios', tag: 'CAS', col: 0, icon: 'war', requires: ['m_cas_granada'], title: 'Los presidios de África', text: 'Llevar la guerra a la otra orilla: Orán, Argel, Túnez o Trípoli, nidos de corsarios.',
    conditions: [{ type: 'ownsCount', provinces: ['oran', 'algiers', 'tunis', 'tripoli'], count: 1 }], rewards: [pres(50), x('ships', 5), claim('tunis', 'tripoli'), chr('La bandera de Castilla ondea en la costa de Berbería.')] }),
  M({ id: 'm_cas_indies', tag: 'CAS', col: 1, icon: 'explore', title: 'Las Indias', text: 'Fundar en La Española la primera ciudad castellana del Nuevo Mundo.',
    conditions: [{ type: 'owns', province: 'hispaniola' }], rewards: [x('colonists', 1), claim('cuba', 'panama', 'venezuela', 'mexico', 'veracruz'), chr('Santo Domingo, primera ciudad de Castilla en las Indias.')] }),
  M({ id: 'm_cas_new_spain', tag: 'CAS', col: 1, icon: 'war', requires: ['m_cas_indies'], title: 'La Nueva España', text: 'Hacerse con Tenochtitlan y el corazón del mundo mexica.',
    conditions: [{ type: 'owns', province: 'mexico' }], rewards: [gold(200), pres(80), x('inflation', 2), claim('guatemala', 'yucatan', 'florida', 'peru'), chr('Sobre las ruinas de Tenochtitlan se levanta la ciudad de México.')] }),
  M({ id: 'm_cas_peru', tag: 'CAS', col: 1, icon: 'prosperity', requires: ['m_cas_new_spain'], title: 'La plata del Perú', text: 'Dominar el antiguo imperio de los incas y sus minas.',
    conditions: [{ type: 'owns', province: 'peru' }], rewards: [gold(250), x('inflation', 3), pres(80), chr('La plata de los Andes empieza a llegar a Sevilla.')] }),
  M({ id: 'm_cas_aragon', tag: 'CAS', col: 2, icon: 'court', title: 'La unión de las coronas', text: 'Reunir bajo un mismo cetro Aragón, Cataluña y Valencia.',
    conditions: [{ type: 'ownsAll', provinces: ['aragon', 'cataluna', 'valencia'] }], rewards: [pres(50), stab(1), claim('napoli', 'puglia', 'calabria', 'abruzzo'), chr('Castilla y Aragón comparten ya un solo rey.')] }),
  M({ id: 'm_cas_naples', tag: 'CAS', col: 2, icon: 'war', requires: ['m_cas_aragon'], title: 'El Gran Capitán', text: 'Arrebatar Nápoles a los franceses, como hizo Gonzalo Fernández de Córdoba.',
    conditions: [{ type: 'owns', province: 'napoli' }], rewards: [pres(60), gold(100), tech('land'), claim('lombardia'), chr('Nápoles se suma a la corona española tras Ceriñola y Garellano.')] }),
  M({ id: 'm_cas_navarra', tag: 'CAS', col: 3, icon: 'war', title: 'Navarra', text: 'Cerrar el paso de los Pirineos incorporando el reino de Navarra.',
    conditions: [{ type: 'owns', province: 'navarra' }], rewards: [pres(40), stab(1), chr('Navarra se incorpora a la corona de Castilla.')] }),
  M({ id: 'm_cas_iberia', tag: 'CAS', col: 3, icon: 'court', requires: ['m_cas_navarra'], title: 'La unión ibérica', text: 'Poner pie en Portugal: que al menos una de sus tierras obedezca al rey de Castilla.',
    conditions: [{ type: 'ownsCount', provinces: ['lisboa', 'porto', 'algarve'], count: 1 }], rewards: [pres(100), x('ships', 10), chr('Toda la península obedece al mismo rey.')] }),

  // ------------------------------------------------------------ Portugal
  M({ id: 'm_por_morocco', tag: 'POR', col: 0, icon: 'war', title: 'Las plazas de Marruecos', text: 'Ampliar el dominio portugués al norte de África.',
    conditions: [{ type: 'ownsCount', provinces: ['tangier', 'fez', 'marrakesh'], count: 2 }], rewards: [pres(50), gold(80), chr('Portugal se afianza en Marruecos.')] }),
  M({ id: 'm_por_guinea', tag: 'POR', col: 0, icon: 'prosperity', title: 'El oro de la Mina', text: 'Levantar factorías en la costa de Guinea o en la Costa de Oro.',
    conditions: [{ type: 'ownsCount', provinces: ['guinea', 'gold_coast'], count: 1 }], rewards: [gold(100), x('colonists', 1), claim('kongo'), chr('El castillo de San Jorge de la Mina envía oro a Lisboa.')] }),
  M({ id: 'm_por_kongo', tag: 'POR', col: 0, icon: 'faith', requires: ['m_por_guinea'], title: 'El Manicongo cristiano', text: 'Ganar la amistad del rey del Congo, bautizado por misioneros portugueses.',
    conditions: [{ type: 'allied', other: 'KON' }], rewards: [pres(40), gold(60), rel('KON', 50)] }),
  M({ id: 'm_por_brazil', tag: 'POR', col: 1, icon: 'explore', title: 'Terra do Brasil', text: 'Poblar la costa del palo brasil antes de que lo hagan los franceses.',
    conditions: [{ type: 'ownsCount', provinces: ['pernambuco', 'bahia'], count: 1 }], rewards: [x('colonists', 1), gold(60), claim('pernambuco', 'bahia'), chr('Nacen las primeras capitanías del Brasil.')] }),
  M({ id: 'm_por_sugar', tag: 'POR', col: 1, icon: 'prosperity', requires: ['m_por_brazil'], title: 'Los ingenios de azúcar', text: 'Unir Pernambuco y Bahía, el mayor productor de azúcar del mundo.',
    conditions: [{ type: 'ownsAll', provinces: ['pernambuco', 'bahia'] }], rewards: [gold(150), tech('trade'), chr('El azúcar del Brasil endulza las mesas de Europa.')] }),
  M({ id: 'm_por_fleet', tag: 'POR', col: 2, icon: 'explore', title: 'Señores del mar', text: 'Mantener una armada capaz de dominar las rutas del océano.',
    conditions: [{ type: 'minX', key: 'ships', value: 30 }], rewards: [tech('naval'), pres(30)] }),
  M({ id: 'm_por_india', tag: 'POR', col: 2, icon: 'prosperity', requires: ['m_por_fleet'], title: 'La Carreira da Índia', text: 'Abrir la ruta de la pimienta por el cabo de Buena Esperanza.',
    conditions: [has('por_india')], rewards: [tech('trade'), gold(150), chr('Cada año parte de Lisboa la armada de la India.')] }),
  M({ id: 'm_por_england', tag: 'POR', col: 3, icon: 'peace', title: 'El viejo aliado', text: 'Renovar la alianza de Windsor con Inglaterra.',
    conditions: [{ type: 'allied', other: 'ENG' }], rewards: [pres(30), rel('ENG', 40)] }),
  M({ id: 'm_por_independence', tag: 'POR', col: 3, icon: 'court', title: 'Portugal, reino libre', text: 'Llegar al siglo XVII sin rendir vasallaje a nadie.',
    conditions: [{ type: 'notVassal' }, { type: 'minYear', value: 1600 }], rewards: [stab(1), pres(60), chr('Portugal conserva su corona y su imperio.')] }),

  // ------------------------------------------------------------ Francia
  M({ id: 'm_fra_naples', tag: 'FRA', col: 0, icon: 'war', title: 'La herencia de Anjou', text: 'Hacer valer los derechos angevinos sobre el reino de Nápoles.',
    conditions: [{ type: 'owns', province: 'napoli' }], rewards: [pres(50), claim('puglia', 'calabria', 'abruzzo')] }),
  M({ id: 'm_fra_milan', tag: 'FRA', col: 0, icon: 'war', title: 'El ducado de Milán', text: 'Reclamar Milán por la herencia de los Visconti.',
    conditions: [{ type: 'owns', province: 'lombardia' }], rewards: [pres(60), claim('genova', 'piemonte')] }),
  M({ id: 'm_fra_italy', tag: 'FRA', col: 0, icon: 'prosperity', requires: ['m_fra_naples', 'm_fra_milan'], title: 'El jardín de Europa', text: 'Ser la potencia dominante en Italia.',
    conditions: [{ type: 'ownsCount', provinces: ['lombardia', 'piemonte', 'genova', 'napoli', 'toscana', 'puglia'], count: 4 }], rewards: [pres(100), gold(150), chr('Francia es dueña de Italia.')] }),
  M({ id: 'm_fra_lorraine', tag: 'FRA', col: 1, icon: 'war', title: 'Los Tres Obispados', text: 'Avanzar la frontera hacia el este por Lorena.',
    conditions: [{ type: 'owns', province: 'lorraine' }], rewards: [pres(50), claim('flandre', 'rhineland')] }),
  M({ id: 'm_fra_flanders', tag: 'FRA', col: 1, icon: 'war', requires: ['m_fra_lorraine'], title: 'La frontera de Flandes', text: 'Alejar de París la amenaza que llega desde los Países Bajos.',
    conditions: [{ type: 'owns', province: 'flandre' }], rewards: [pres(60), gold(100), chr('Francia avanza su frontera hacia Flandes.')] }),
  M({ id: 'm_fra_allies', tag: 'FRA', col: 2, icon: 'peace', title: 'Romper el cerco', text: 'Buscar aliados contra la casa de Austria, sean católicos, protestantes o turcos.',
    conditions: [{ type: 'minAllies', value: 2 }], rewards: [pres(40), gold(60)] }),
  M({ id: 'm_fra_absolutism', tag: 'FRA', col: 2, icon: 'court', requires: ['m_fra_allies'], title: 'La razón de Estado', text: 'Domar a los nobles y a los hugonotes; que el rey sea obedecido en todo el reino.',
    conditions: [{ type: 'minStability', value: 3 }, { type: 'minYear', value: 1600 }], rewards: [x('pol_central', 1), pres(80), chr('El rey de Francia gobierna sin rival dentro de su reino.')] }),
  M({ id: 'm_fra_new_france', tag: 'FRA', col: 3, icon: 'explore', title: 'La Nueva Francia', text: 'Fundar un asentamiento en el río San Lorenzo.',
    conditions: [{ type: 'owns', province: 'new_france' }], rewards: [x('colonists', 1), claim('newfoundland', 'new_england'), chr('Champlain funda Quebec junto al San Lorenzo.')] }),
  M({ id: 'm_fra_fur', tag: 'FRA', col: 3, icon: 'prosperity', requires: ['m_fra_new_france'], title: 'Pieles y bacalao', text: 'Dominar las pesquerías de Terranova y el comercio de pieles.',
    conditions: [{ type: 'ownsAll', provinces: ['new_france', 'newfoundland'] }], rewards: [gold(120), tech('trade')] }),

  // ------------------------------------------------------------ Inglaterra
  M({ id: 'm_eng_ireland', tag: 'ENG', col: 0, icon: 'war', title: 'Más allá del Pale', text: 'Someter a los señores gaélicos de Irlanda.',
    conditions: [{ type: 'ownsCount', provinces: ['munster', 'connacht', 'ulster'], count: 2 }], rewards: [pres(50), claim('munster', 'connacht', 'ulster')] }),
  M({ id: 'm_eng_ireland_all', tag: 'ENG', col: 0, icon: 'court', requires: ['m_eng_ireland'], title: 'El reino de Irlanda', text: 'Gobernar toda la isla como reino de la Corona inglesa.',
    conditions: [{ type: 'ownsAll', provinces: ['leinster', 'munster', 'connacht', 'ulster'] }], rewards: [stab(1), men(5000), chr('Toda Irlanda obedece al rey de Inglaterra.')] }),
  M({ id: 'm_eng_scotland', tag: 'ENG', col: 0, icon: 'court', title: 'Gran Bretaña', text: 'Unir bajo un solo soberano Inglaterra y Escocia.',
    conditions: [{ type: 'ownsAll', provinces: ['lowlands', 'highlands'] }], rewards: [pres(100), stab(1), chr('Inglaterra y Escocia comparten ya un solo rey.')] }),
  M({ id: 'm_eng_navy', tag: 'ENG', col: 1, icon: 'explore', title: 'La armada real', text: 'Construir una flota capaz de defender la isla.',
    conditions: [{ type: 'minX', key: 'ships', value: 30 }], rewards: [tech('naval'), pres(20)] }),
  M({ id: 'm_eng_channel', tag: 'ENG', col: 1, icon: 'war', requires: ['m_eng_navy'], title: 'Dueños de los mares', text: 'Que ninguna armada extranjera se atreva a entrar en el Canal.',
    conditions: [{ type: 'minX', key: 'ships', value: 50 }, { type: 'minYear', value: 1580 }], rewards: [pres(80), tech('trade'), chr('Inglaterra se convierte en la gran potencia naval de su tiempo.')] }),
  M({ id: 'm_eng_newfoundland', tag: 'ENG', col: 2, icon: 'explore', title: 'Las pesquerías de Terranova', text: 'Reclamar para la Corona la tierra que avistó Caboto.',
    conditions: [{ type: 'owns', province: 'newfoundland' }], rewards: [x('colonists', 1), claim('virginia', 'new_england')] }),
  M({ id: 'm_eng_virginia', tag: 'ENG', col: 2, icon: 'explore', requires: ['m_eng_newfoundland'], title: 'Virginia', text: 'Fundar una colonia en la bahía de Chesapeake.',
    conditions: [{ type: 'owns', province: 'virginia' }], rewards: [gold(80), claim('carolina'), chr('Jamestown sobrevive su primer invierno en Virginia.')] }),
  M({ id: 'm_eng_new_england', tag: 'ENG', col: 2, icon: 'faith', requires: ['m_eng_virginia'], title: 'Nueva Inglaterra', text: 'Dar tierra a los disidentes religiosos al otro lado del océano.',
    conditions: [{ type: 'ownsAll', provinces: ['virginia', 'new_england'] }], rewards: [x('colonists', 1), pres(60), tech('trade')] }),
  M({ id: 'm_eng_reform', tag: 'ENG', col: 3, icon: 'faith', title: 'La Iglesia de Inglaterra', text: 'Asentar una iglesia nacional bajo la autoridad del soberano.',
    conditions: [{ type: 'religionIs', value: 'protestant' }, { type: 'minStability', value: 1 }], rewards: [stab(1), gold(100)] }),

  // ------------------------------------------------------------ Habsburgo
  M({ id: 'm_hab_spain', tag: 'HAB', col: 0, icon: 'court', title: 'Tu felix Austria, nube', text: 'Unir la casa de Austria con la de Castilla.',
    conditions: [{ type: 'allied', other: 'CAS' }], rewards: [pres(50), rel('CAS', 50)] }),
  M({ id: 'm_hab_bohemia', tag: 'HAB', col: 0, icon: 'court', requires: ['m_hab_spain'], title: 'La corona de San Wenceslao', text: 'Hacerse con Bohemia, por herencia o por las armas.',
    conditions: [{ type: 'owns', province: 'bohemia' }], rewards: [pres(60), claim('moravia', 'silesia', 'hungary')] }),
  M({ id: 'm_hab_hungary', tag: 'HAB', col: 0, icon: 'war', requires: ['m_hab_bohemia'], title: 'La corona de San Esteban', text: 'Reclamar el reino de Hungría.',
    conditions: [{ type: 'ownsCount', provinces: ['hungary', 'pannonia', 'upper_hungary', 'croatia', 'transylvania'], count: 2 }], rewards: [pres(80), claim('hungary', 'pannonia', 'upper_hungary', 'croatia', 'transylvania')] }),
  M({ id: 'm_hab_vienna', tag: 'HAB', col: 1, icon: 'war', title: 'El baluarte de la cristiandad', text: 'Conservar Viena frente a las acometidas del sultán.',
    conditions: [{ type: 'owns', province: 'austria' }, { type: 'minYear', value: 1530 }], rewards: [pres(50), men(5000)] }),
  M({ id: 'm_hab_buda', tag: 'HAB', col: 1, icon: 'war', requires: ['m_hab_vienna', 'm_hab_hungary'], title: 'La reconquista de Hungría', text: 'Expulsar a los otomanos de toda la llanura húngara.',
    conditions: [{ type: 'ownsAll', provinces: ['hungary', 'pannonia', 'upper_hungary', 'croatia', 'transylvania'] }], rewards: [pres(120), stab(1), chr('Buda vuelve a manos cristianas tras siglo y medio.')] }),
  M({ id: 'm_hab_empire', tag: 'HAB', col: 2, icon: 'peace', title: 'Los príncipes del Imperio', text: 'Tejer una red de alianzas entre los príncipes alemanes.',
    conditions: [{ type: 'minAllies', value: 3 }], rewards: [pres(60), gold(80)] }),
  M({ id: 'm_hab_counter', tag: 'HAB', col: 2, icon: 'faith', requires: ['m_hab_empire'], title: 'La Contrarreforma', text: 'Mantener la fe católica en las tierras hereditarias tras el concilio de Trento.',
    conditions: [{ type: 'religionIs', value: 'catholic' }, { type: 'minYear', value: 1560 }, { type: 'minStability', value: 1 }], rewards: [rel('PAP', 50), stab(1), chr('Jesuitas y capuchinos reconquistan las almas de Austria.')] }),
  M({ id: 'm_hab_milan', tag: 'HAB', col: 3, icon: 'war', title: 'La llave de Italia', text: 'Dominar Milán, paso entre los dominios de la casa.',
    conditions: [{ type: 'owns', province: 'lombardia' }], rewards: [pres(60), claim('piemonte', 'genova')] }),
  M({ id: 'm_hab_lowlands', tag: 'HAB', col: 3, icon: 'prosperity', title: 'Las diecisiete provincias', text: 'Conservar los Países Bajos, el tesoro de la herencia borgoñona.',
    conditions: [{ type: 'ownsAll', provinces: ['flandre', 'brabant', 'holland', 'frisia'] }, { type: 'minYear', value: 1600 }], rewards: [gold(150), tech('trade')] }),

  // ------------------------------------------------------------ Imperio otomano
  M({ id: 'm_ott_hungary', tag: 'OTT', col: 0, icon: 'war', title: 'Buda', text: 'Abrir el camino de Europa central tomando Hungría.',
    conditions: [{ type: 'owns', province: 'hungary' }], rewards: [pres(60), claim('pannonia', 'upper_hungary', 'transylvania', 'croatia', 'austria')] }),
  M({ id: 'm_ott_vienna', tag: 'OTT', col: 0, icon: 'war', requires: ['m_ott_hungary'], title: 'La manzana de oro', text: 'Tomar Viena, la ciudad que se resistió a Solimán.',
    conditions: [{ type: 'owns', province: 'austria' }], rewards: [pres(150), gold(150), chr('La media luna ondea sobre Viena.')] }),
  M({ id: 'm_ott_syria', tag: 'OTT', col: 1, icon: 'war', title: 'Las puertas de Siria', text: 'Arrebatar Alepo y Damasco a los mamelucos.',
    conditions: [{ type: 'ownsAll', provinces: ['aleppo', 'damascus'] }], rewards: [pres(50), claim('cairo', 'alexandria', 'jerusalem', 'acre', 'sinai')] }),
  M({ id: 'm_ott_egypt', tag: 'OTT', col: 1, icon: 'prosperity', requires: ['m_ott_syria'], title: 'El granero de Egipto', text: 'Conquistar El Cairo y Alejandría.',
    conditions: [{ type: 'ownsAll', provinces: ['cairo', 'alexandria'] }], rewards: [gold(200), pres(80), chr('El último califa abasí entrega su dignidad al sultán.')] }),
  M({ id: 'm_ott_holy', tag: 'OTT', col: 1, icon: 'faith', requires: ['m_ott_egypt'], title: 'Servidor de las ciudades santas', text: 'Proteger Jerusalén y los caminos de la peregrinación.',
    conditions: [{ type: 'ownsAll', provinces: ['jerusalem', 'acre', 'sinai'] }], rewards: [{ type: 'relationsWith', religion: 'sunni', amount: 30 }, pres(50), stab(1)] }),
  M({ id: 'm_ott_fleet', tag: 'OTT', col: 2, icon: 'explore', title: 'La armada del sultán', text: 'Construir una flota que dispute el Mediterráneo a Venecia y España.',
    conditions: [{ type: 'minX', key: 'ships', value: 40 }], rewards: [tech('naval'), pres(30)] }),
  M({ id: 'm_ott_islands', tag: 'OTT', col: 2, icon: 'war', requires: ['m_ott_fleet'], title: 'Las islas venecianas', text: 'Expulsar a Venecia de Creta y Chipre.',
    conditions: [{ type: 'ownsAll', provinces: ['crete', 'cyprus'] }], rewards: [gold(100), x('ships', 5), pres(60)] }),
  M({ id: 'm_ott_maghreb', tag: 'OTT', col: 2, icon: 'war', requires: ['m_ott_fleet'], title: 'Las regencias de Berbería', text: 'Atraer a Argel, Túnez y Trípoli a la obediencia del sultán.',
    conditions: [{ type: 'ownsCount', provinces: ['algiers', 'tunis', 'tripoli'], count: 2 }], rewards: [x('ships', 10), pres(60), chr('Los corsarios de Berbería navegan bajo la bandera del sultán.')] }),
  M({ id: 'm_ott_baghdad', tag: 'OTT', col: 3, icon: 'war', title: 'La ciudad de los califas', text: 'Arrebatar Mesopotamia a los señores de Persia.',
    conditions: [{ type: 'ownsAll', provinces: ['baghdad', 'mosul'] }], rewards: [gold(120), pres(50), claim('basra', 'tabriz')] }),

  // ------------------------------------------------------------ Moscovia
  M({ id: 'm_rus_gather', tag: 'RUS', col: 0, icon: 'court', title: 'La reunión de las tierras rusas', text: 'Acabar con la autonomía de Pskov y Riazán.',
    conditions: [{ type: 'ownsAll', provinces: ['pskov', 'ryazan'] }], rewards: [pres(60), stab(1), chr('Pskov y Riazán pasan a depender directamente de Moscú.')] }),
  M({ id: 'm_rus_smolensk', tag: 'RUS', col: 0, icon: 'war', title: 'Smolensk', text: 'Recuperar la fortaleza de Smolensk de manos lituanas.',
    conditions: [{ type: 'owns', province: 'smolensk' }], rewards: [pres(50), claim('kiev', 'chernigov', 'belarus', 'poltava')] }),
  M({ id: 'm_rus_kiev', tag: 'RUS', col: 0, icon: 'faith', requires: ['m_rus_smolensk'], title: 'La madre de las ciudades rusas', text: 'Recuperar Kiev y la orilla izquierda del Dniéper.',
    conditions: [{ type: 'ownsAll', provinces: ['kiev', 'chernigov'] }], rewards: [pres(80), { type: 'relationsWith', religion: 'orthodox', amount: 20 }] }),
  M({ id: 'm_rus_kazan', tag: 'RUS', col: 1, icon: 'war', title: 'El Volga medio', text: 'Acabar con el kanato de Kazán.',
    conditions: [{ type: 'owns', province: 'kazan' }], rewards: [pres(60), claim('astrakhan', 'samara', 'ural')] }),
  M({ id: 'm_rus_astrakhan', tag: 'RUS', col: 1, icon: 'prosperity', requires: ['m_rus_kazan'], title: 'Hasta el Caspio', text: 'Controlar todo el curso del Volga hasta Astracán.',
    conditions: [{ type: 'owns', province: 'astrakhan' }], rewards: [gold(150), pres(40)] }),
  M({ id: 'm_rus_urals', tag: 'RUS', col: 1, icon: 'explore', requires: ['m_rus_astrakhan'], title: 'Más allá de los Urales', text: 'Abrir el camino de Siberia, como los cosacos de Yermak.',
    conditions: [{ type: 'ownsAll', provinces: ['ural', 'samara'] }], rewards: [pres(60), gold(100), chr('Los cosacos cruzan los Urales en nombre del zar.')] }),
  M({ id: 'm_rus_livonia', tag: 'RUS', col: 2, icon: 'war', title: 'Una ventana al Báltico', text: 'Conseguir un puerto en Livonia, Estonia o Curlandia.',
    conditions: [{ type: 'ownsCount', provinces: ['livonia', 'estonia', 'courland'], count: 1 }], rewards: [tech('trade'), claim('livonia', 'estonia', 'courland')] }),
  M({ id: 'm_rus_baltic', tag: 'RUS', col: 2, icon: 'explore', requires: ['m_rus_livonia'], title: 'Señores del Báltico oriental', text: 'Dominar toda la costa desde Carelia hasta Livonia.',
    conditions: [{ type: 'ownsAll', provinces: ['livonia', 'estonia', 'ingria', 'karelia'] }], rewards: [tech('naval'), pres(100), chr('Rusia se asoma al Báltico como gran potencia.')] }),
  M({ id: 'm_rus_tsar', tag: 'RUS', col: 3, icon: 'court', title: 'Tercera Roma', text: 'Que el soberano de Moscú se corone zar, heredero de Bizancio.',
    conditions: [has('rus_tsar')], rewards: [stab(1), pres(40)] }),

  // ------------------------------------------------------------ Venecia
  M({ id: 'm_ven_stato', tag: 'VEN', col: 0, icon: 'war', title: 'El Stato da Mar', text: 'Conservar Creta y Chipre más allá de 1575.',
    conditions: [{ type: 'ownsAll', provinces: ['crete', 'cyprus'] }, { type: 'minYear', value: 1575 }], rewards: [pres(60), x('ships', 5)] }),
  M({ id: 'm_ven_morea', tag: 'VEN', col: 0, icon: 'war', requires: ['m_ven_stato'], title: 'El reino de Morea', text: 'Recuperar el Peloponeso, como hizo Morosini.',
    conditions: [{ type: 'owns', province: 'morea' }], rewards: [pres(80), claim('thessaly', 'albania')] }),
  M({ id: 'm_ven_survive', tag: 'VEN', col: 0, icon: 'court', title: 'La Serenísima perdura', text: 'Llegar al siglo XVIII libre y dueña de la laguna.',
    conditions: [{ type: 'owns', province: 'venezia' }, { type: 'notVassal' }, { type: 'minYear', value: 1700 }], rewards: [pres(150), stab(1)] }),
  M({ id: 'm_ven_rialto', tag: 'VEN', col: 1, icon: 'prosperity', title: 'El banco de Rialto', text: 'Acumular un tesoro digno de la reina del Adriático.',
    conditions: [{ type: 'minTreasury', value: 600 }], rewards: [tech('trade'), x('inflation', -3)] }),
  M({ id: 'm_ven_arsenal', tag: 'VEN', col: 1, icon: 'explore', requires: ['m_ven_rialto'], title: 'El Arsenal', text: 'Mantener una flota de galeras capaz de botarse en un día.',
    conditions: [{ type: 'minX', key: 'ships', value: 40 }], rewards: [tech('naval'), pres(30)] }),
  M({ id: 'm_ven_terraferma', tag: 'VEN', col: 2, icon: 'war', title: 'La tierra firme', text: 'Ampliar el dominio veneciano en Lombardía o Romaña.',
    conditions: [{ type: 'ownsCount', provinces: ['lombardia', 'romagna'], count: 1 }], rewards: [pres(50), men(3000)] }),
  M({ id: 'm_ven_italy', tag: 'VEN', col: 2, icon: 'prosperity', requires: ['m_ven_terraferma'], title: 'Árbitro de Italia', text: 'Ser la primera potencia del norte de Italia.',
    conditions: [{ type: 'ownsCount', provinces: ['lombardia', 'romagna', 'toscana', 'genova'], count: 2 }], rewards: [pres(80), gold(120)] }),
  M({ id: 'm_ven_league', tag: 'VEN', col: 3, icon: 'peace', title: 'La Santa Liga', text: 'Unirse al papa en defensa de la cristiandad.',
    conditions: [{ type: 'allied', other: 'PAP' }], rewards: [rel('PAP', 40), pres(40)] }),
  M({ id: 'm_ven_adriatic', tag: 'VEN', col: 3, icon: 'war', requires: ['m_ven_league'], title: 'El golfo de Venecia', text: 'Asegurar la costa oriental del Adriático.',
    conditions: [{ type: 'ownsCount', provinces: ['albania', 'bosnia', 'croatia'], count: 1 }], rewards: [pres(50), claim('albania', 'bosnia', 'croatia')] }),
];

// ================================================================ dynamic pool (any early modern state)
const POOL_EVENTS: GameEvent[] = [
  {
    id: 'em_p_mutiny', mtthMonths: 360, oneShot: false, image: 'revolt', condition: [{ type: 'maxTreasury', value: 60 }, { type: 'minWarMonths', value: 12 }],
    title: 'Motín por las pagas', text: 'Los soldados llevan meses sin cobrar y han tomado la ciudad donde estaban acuartelados. Amenazan con saquearla si no llega el dinero.',
    options: [
      { label: 'Pagar los atrasos', effects: [gold(-70)], aiWeight: 5 },
      { label: 'Licenciar a los amotinados', effects: [men(-3000), pres(-10)], aiWeight: 3 },
      { label: 'Hacer la vista gorda con el saqueo', effects: [{ type: 'unrestRealm', amount: 2 }, inf(1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_bankruptcy', mtthMonths: 720, oneShot: false, image: 'disaster', condition: [{ type: 'minX', key: 'loans', value: 3 }, { type: 'maxTreasury', value: 100 }],
    title: 'Suspensión de pagos', text: 'Los contadores advierten que las rentas de los próximos años ya están empeñadas. Los banqueros genoveses no adelantarán más dinero sin nuevas garantías.',
    note: 'Felipe II suspendió pagos en 1557, 1560, 1575 y 1596; Francia lo hizo en 1558.',
    options: [
      { label: 'Decretar la suspensión', effects: [gold(100), pres(-30), stab(-1)], aiWeight: 5, hint: 'Respiro inmediato; el crédito tardará en volver.' },
      { label: 'Subir los impuestos', effects: [gold(100), { type: 'unrestRealm', amount: 2 }], aiWeight: 4 },
      { label: 'Labrar moneda de vellón', effects: [gold(120), x('inflation', 4)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_p_inflation', mtthMonths: 400, oneShot: false, image: 'disaster', condition: [{ type: 'minX', key: 'inflation', value: 10 }],
    title: 'La carestía', text: 'El trigo, el paño y el vino cuestan el doble que hace una generación. Los tratadistas discuten si la culpa es de la plata de Indias o de los acaparadores.',
    options: [
      { label: 'Recoger y reacuñar la moneda', effects: [x('inflation', -4), gold(-100)], aiWeight: 5 },
      { label: 'Fijar precios máximos', effects: [x('inflation', -2), { type: 'unrestRealm', amount: 2 }], aiWeight: 3 },
      { label: 'No hacer nada', effects: [stab(-1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_silver', mtthMonths: 360, oneShot: false, image: 'prosperity', condition: [{ type: 'ownsCount', provinces: ['mexico', 'peru', 'new_granada', 'panama'], count: 1 }],
    title: 'Llega la flota de la plata', text: 'Los galeones han entrado en puerto cargados de barras y monedas de las minas de las Indias. Los acreedores de la Corona ya esperan en el muelle.',
    options: [
      { label: 'Quedarse el quinto real', effects: [gold(90), x('inflation', 1.5)], aiWeight: 5 },
      { label: 'Gastarlo en galeones de escolta', effects: [gold(30), x('ships', 4)], aiWeight: 3 },
      { label: 'Embargar la plata de los particulares', effects: [gold(160), x('inflation', 3), { type: 'unrestRealm', amount: 1 }], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_galleon', mtthMonths: 300, oneShot: false, image: 'prosperity', condition: [has('cas_manila'), { type: 'owns', province: 'mexico' }],
    title: 'El galeón de Acapulco', text: 'La nao de la China ha llegado a Acapulco con sedas, porcelanas y especias. Los comerciantes de Lima y México pujan por cada fardo.',
    options: [
      { label: 'Cobrar el almojarifazgo', effects: [gold(70), x('inflation', 1)], aiWeight: 6 },
      { label: 'Tolerar el contrabando', effects: [gold(30), rel('POR', 10)], aiWeight: 4 },
    ],
  },
  {
    id: 'em_p_pirates', mtthMonths: 420, oneShot: false, image: 'war', condition: [{ type: 'ownsCount', provinces: CARIBBEAN, count: 1 }],
    title: 'Piratas en las Antillas', text: 'Corsarios extranjeros han saqueado un puerto del Caribe y quemado los barcos fondeados. Los vecinos piden murallas y galeones.',
    options: [
      { label: 'Fortificar los puertos', effects: [gold(-60), x('ships', 2)], aiWeight: 5 },
      { label: 'Contratar a nuestros propios corsarios', effects: [gold(-20), inf(1), x('ships', 3)], aiWeight: 3 },
      { label: 'Aceptar las pérdidas', effects: [gold(-30), pres(-10)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_barbary', mtthMonths: 480, oneShot: false, image: 'disaster', condition: [{ type: 'ownsCount', provinces: MED_CHRISTIAN_COAST, count: 1 }, { type: 'religionIs', value: 'catholic' }],
    title: 'Corsarios berberiscos', text: 'Galeotas de Argel han desembarcado de noche en la costa y se han llevado a cientos de cautivos. En los pueblos ya nadie quiere vivir junto al mar.',
    options: [
      { label: 'Levantar torres de vigía', effects: [gold(-50), stab(1)], aiWeight: 4 },
      { label: 'Pagar el rescate a través de los frailes', effects: [gold(-30), pres(10)], aiWeight: 3 },
      { label: 'Organizar una jornada de castigo', effects: [men(-2000), pres(20), gold(-20)], aiWeight: 3 },
    ],
  },
  {
    id: 'em_p_preacher', mtthMonths: 420, oneShot: false, image: 'faith', condition: [{ type: 'religionIs', value: 'catholic' }, { type: 'minYear', value: 1520 }, { type: 'maxYear', value: 1650 }],
    title: 'Un predicador reformista', text: 'Un antiguo fraile predica en las plazas contra las indulgencias y reparte libritos impresos en lengua vulgar. Los artesanos lo escuchan; el obispo exige su arresto.',
    options: [
      { label: 'Entregarlo al tribunal de la fe', effects: [rel('PAP', 10), { type: 'unrestRealm', amount: 1 }, pres(5)], aiWeight: 6 },
      { label: 'Dejarlo predicar', effects: [stab(-1), gold(30), { type: 'relationsWith', religion: 'protestant', amount: 10 }], aiWeight: 3, hint: 'Los mercaderes lo agradecerán; Roma no.' },
      { label: 'Desterrarlo en silencio', effects: [gold(-20)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_p_jesuits', mtthMonths: 480, oneShot: false, image: 'faith', condition: [{ type: 'religionIs', value: 'protestant' }, { type: 'minYear', value: 1550 }],
    title: 'Misioneros de la Compañía', text: 'Jesuitas disfrazados de mercaderes predican en secreto en casas nobles y abren colegios donde enseñan gratis a los hijos de la nobleza.',
    options: [
      { label: 'Expulsarlos del reino', effects: [stab(1), rel('PAP', -10)], aiWeight: 6 },
      { label: 'Tolerar sus colegios', effects: [tech('production'), gold(-60), { type: 'unrestRealm', amount: 1 }], aiWeight: 2, hint: 'Buenos maestros, pero lealtades dudosas.' },
    ],
  },
  {
    id: 'em_p_plague', mtthMonths: 600, oneShot: false, image: 'disaster', condition: [{ type: 'minProvinces', value: 4 }],
    title: 'Vuelve la peste', text: 'Un barco ha traído la pestilencia a un puerto del reino. Las campanas tocan a muerto día y noche y los ricos huyen al campo.',
    options: [
      { label: 'Cordón sanitario y lazaretos', effects: [gold(-50), men(-2000)], aiWeight: 5 },
      { label: 'Procesiones y rogativas', effects: [men(-5000), stab(-1)], aiWeight: 3 },
      { label: 'Que la corte abandone la capital', effects: [men(-4000), pres(-10)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_academy', mtthMonths: 600, oneShot: false, image: 'prosperity', condition: [{ type: 'minStability', value: 2 }, { type: 'minTreasury', value: 300 }, { type: 'minYear', value: 1600 }],
    title: 'Una academia de ciencias', text: 'Un grupo de sabios pide protección real para reunirse, hacer experimentos y mantener correspondencia con sus colegas de toda Europa.',
    options: [
      { label: 'Concederles patronazgo y sede', effects: [gold(-150), tech('production'), pres(20)], aiWeight: 5 },
      { label: 'Que se paguen sus experimentos', effects: [], aiWeight: 5 },
    ],
  },
  {
    id: 'em_p_printing', mtthMonths: 600, oneShot: false, image: 'prosperity', condition: [{ type: 'minProvinces', value: 3 }, { type: 'maxYear', value: 1600 }],
    title: 'Las prensas de la capital', text: 'Los impresores multiplican libros, pliegos de cordel y gacetas. Los teólogos piden licencias previas; los libreros, libertad.',
    options: [
      { label: 'Imponer licencias reales', effects: [gold(20), stab(1)], aiWeight: 5 },
      { label: 'Favorecer a los impresores', effects: [gold(-120), tech('trade'), pres(10)], aiWeight: 3, hint: 'Más saber circulando, también ideas incómodas.' },
    ],
  },
  {
    id: 'em_p_cartographers', mtthMonths: 500, oneShot: false, image: 'explore', condition: [{ type: 'minX', key: 'ships', value: 15 }, { type: 'maxYear', value: 1700 }],
    title: 'Cartógrafos extranjeros', text: 'Un piloto mayor, despedido por un rey rival, ofrece sus cartas de marear secretas y sus conocimientos de las rutas de ultramar.',
    options: [
      { label: 'Contratarle a precio de oro', effects: [gold(-60), x('colonists', 1)], aiWeight: 6 },
      { label: 'No fiarse de un traidor', effects: [], aiWeight: 4 },
    ],
  },
  {
    id: 'em_p_smuggling', mtthMonths: 480, oneShot: false, image: 'revolt', condition: [{ type: 'minX', key: 'inflation', value: 5 }, { type: 'minProvinces', value: 5 }],
    title: 'Contrabandistas', text: 'Los aranceles son tan altos que medio comercio del reino entra por calas escondidas. Los aduaneros están comprados.',
    options: [
      { label: 'Perseguirlos con dureza', effects: [gold(-40), { type: 'unrestRealm', amount: 1 }, stab(1)], aiWeight: 4 },
      { label: 'Bajar los aranceles', effects: [gold(30), x('pol_mercant', -1)], aiWeight: 4 },
      { label: 'Cobrarles en secreto', effects: [gold(50), x('inflation', 1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_succession', mtthMonths: 500, oneShot: false, image: 'court', condition: [{ type: 'maxStability', value: 0 }, { type: 'minYear', value: 1500 }],
    title: 'Pleito por la sucesión', text: 'La salud del soberano flaquea y dos parientes se disputan ya el derecho a sucederle. Cada uno tiene su partido en la corte y sus amigos en el extranjero.',
    options: [
      { label: 'Jurar heredero ante las Cortes', effects: [gold(-60), stab(1)], aiWeight: 5 },
      { label: 'Dejar que los grandes elijan', effects: [{ type: 'unrestRealm', amount: 2 }, x('pol_central', -1)], aiWeight: 3 },
      { label: 'Encerrar al pretendiente', effects: [pres(-20), stab(1), inf(1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_favorite', mtthMonths: 600, oneShot: false, image: 'court', condition: [{ type: 'minProvinces', value: 6 }, { type: 'minYear', value: 1580 }],
    title: 'El valido', text: 'Un noble encantador se ha ganado la confianza del soberano. Ofrece despachar los asuntos de Estado y librarle del peso de gobernar.',
    options: [
      { label: 'Confiarle el gobierno', effects: [gold(80), stab(-1), trig('em_p_favorite_fall', 1500)], aiWeight: 5, hint: 'Gobierno eficaz al principio; enemigos para siempre.' },
      { label: 'Gobernar por sí mismo', effects: [pres(10), gold(-20)], aiWeight: 5 },
    ],
  },
  {
    id: 'em_p_favorite_fall', triggeredOnly: true, image: 'court',
    title: 'La caída del valido', text: 'Los enemigos del favorito han convencido al soberano de que se ha enriquecido a su costa. Su casa está llena de cuadros, tapices y escrituras de tierras.',
    options: [
      { label: 'Confiscar sus bienes', effects: [gold(120), x('pol_central', 1)], aiWeight: 6 },
      { label: 'Dejarle retirarse con honor', effects: [stab(1)], aiWeight: 4 },
    ],
  },
  {
    id: 'em_p_war_weariness', mtthMonths: 300, oneShot: false, image: 'revolt', condition: [{ type: 'minWarMonths', value: 18 }, { type: 'maxStability', value: 0 }],
    title: 'El reino está cansado de guerra', text: 'Las levas vacían los campos y los impuestos extraordinarios arruinan las ciudades. En las iglesias se reza por la paz.',
    options: [
      { label: 'Levas forzosas', effects: [men(5000), { type: 'unrestRealm', amount: 2 }], aiWeight: 4 },
      { label: 'Pedir un servicio extraordinario', effects: [gold(80), x('pol_central', -1)], aiWeight: 4 },
      { label: 'Prometer la paz', effects: [pres(-20), stab(1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_golden_age', mtthMonths: 600, oneShot: false, image: 'prosperity', condition: [{ type: 'minStability', value: 3 }],
    title: 'Una edad de oro', text: 'Poetas, pintores y arquitectos acuden a la corte. Los teatros se llenan y las imprentas no dan abasto.',
    options: [
      { label: 'Mecenazgo de las artes', effects: [gold(-80), pres(40)], aiWeight: 5 },
      { label: 'Caminos, puentes y canales', effects: [gold(-100), tech('infra')], aiWeight: 5 },
    ],
  },
  {
    id: 'em_p_colonial_revolt', mtthMonths: 600, oneShot: false, image: 'revolt', condition: [{ type: 'ownsCount', provinces: AMERICAS, count: 3 }],
    title: 'Los encomenderos se rebelan', text: 'Los colonos de ultramar se niegan a cumplir las nuevas leyes que limitan su poder sobre los indígenas y amenazan con alzarse contra el virrey.',
    options: [
      { label: 'Enviar un virrey con tropas', effects: [gold(-80), men(-2000), stab(1)], aiWeight: 4 },
      { label: 'Suspender las leyes', effects: [gold(40), pres(-20)], aiWeight: 5 },
      { label: 'Negociar con los cabildos', effects: [x('pol_central', -1), gold(20)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_p_privateer', mtthMonths: 400, oneShot: false, image: 'war', condition: [{ type: 'atWar', value: true }, { type: 'minX', key: 'ships', value: 10 }],
    title: 'Un corsario ofrece sus servicios', text: 'Un capitán con tres barcos y mala fama pide patente de corso para atacar los navíos del enemigo a cambio de una parte del botín.',
    options: [
      { label: 'Concederle la patente', effects: [x('ships', 3), gold(30), inf(2)], aiWeight: 6 },
      { label: 'No tratar con bandidos', effects: [pres(5)], aiWeight: 4 },
    ],
  },
  {
    id: 'em_p_empty_coffers', mtthMonths: 360, oneShot: false, image: 'disaster', condition: [{ type: 'maxTreasury', value: 20 }, { type: 'minProvinces', value: 3 }],
    title: 'Las arcas vacías', text: 'El tesorero anuncia que no hay con qué pagar a los oficiales de la casa real ni a las guarniciones de frontera. Hay que sacar dinero de donde sea.',
    options: [
      { label: 'Vender oficios y títulos', effects: [gold(90), x('pol_central', -1)], aiWeight: 4, hint: 'Regidores y escribanos que compran su cargo gobiernan para sí.' },
      { label: 'Pedir un donativo a las ciudades', effects: [gold(60), { type: 'unrestRealm', amount: 1 }], aiWeight: 4 },
      { label: 'Empeñar las joyas de la corona', effects: [gold(50), pres(-15)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_sound_coin', mtthMonths: 600, oneShot: false, image: 'prosperity', condition: [{ type: 'maxX', key: 'inflation', value: 1 }, { type: 'minTreasury', value: 400 }, { type: 'minYear', value: 1530 }],
    title: 'Una moneda de fiar', text: 'Mientras otros reinos llenan sus monedas de cobre, la nuestra conserva su ley. Los mercaderes extranjeros prefieren cobrar en ella.',
    options: [
      { label: 'Atraer a los cambistas extranjeros', effects: [gold(60), tech('trade')], aiWeight: 5 },
      { label: 'Prestar al tesoro de un príncipe vecino', effects: [gold(-100), pres(30), { type: 'relationsWith', religion: 'catholic', amount: 5 }], aiWeight: 3 },
    ],
  },
  {
    id: 'em_p_long_war', mtthMonths: 300, oneShot: false, image: 'war', condition: [{ type: 'minWarMonths', value: 36 }],
    title: 'Una guerra sin fin', text: 'La guerra dura ya años. Los veteranos conocen el oficio mejor que sus capitanes, pero las aldeas no tienen ya hijos que enviar a los tercios.',
    options: [
      { label: 'Reformar el ejército con los veteranos', effects: [gold(-80), tech('land')], aiWeight: 4 },
      { label: 'Contratar mercenarios extranjeros', effects: [gold(-60), men(4000), x('inflation', 1)], aiWeight: 4 },
      { label: 'Buscar mediadores para la paz', effects: [pres(-15), stab(1)], aiWeight: 2 },
    ],
  },
  {
    id: 'em_p_bandits', mtthMonths: 300, oneShot: false, image: 'revolt', condition: [{ type: 'minUnrest', value: 8 }],
    title: 'Bandoleros en los caminos', text: 'Partidas de bandoleros, a veces amparadas por señores locales, asaltan a los arrieros y cobran su propio peaje en los pasos de montaña.',
    options: [
      { label: 'Enviar compañías de la Santa Hermandad', effects: [gold(-40), men(-1000), { type: 'unrestRealm', amount: -2 }], aiWeight: 5 },
      { label: 'Indultar a los que se alisten', effects: [men(2000), { type: 'unrestRealm', amount: -1 }, pres(-10)], aiWeight: 4 },
      { label: 'Dejar el asunto a los señores', effects: [x('pol_central', -1)], aiWeight: 1 },
    ],
  },
  {
    id: 'em_p_vassal_tribute', mtthMonths: 480, oneShot: false, image: 'court', condition: [{ type: 'isVassal' }],
    title: 'El tributo del señor', text: 'El enviado de nuestro soberano exige un subsidio extraordinario para sus guerras. Los consejeros discuten si conviene pagarlo o hacerse de rogar.',
    options: [
      { label: 'Pagar sin rechistar', effects: [gold(-50), stab(1)], aiWeight: 6 },
      { label: 'Dilatar el pago con excusas', effects: [pres(10), { type: 'unrestRealm', amount: 1 }], aiWeight: 4, hint: 'El orgullo del país lo agradece; el señor tomará nota.' },
    ],
  },
  {
    id: 'em_p_mercenaries', mtthMonths: 500, oneShot: false, image: 'war', condition: [{ type: 'maxProvinces', value: 3 }, { type: 'atWar', value: false }, { type: 'minYear', value: 1500 }],
    title: 'Soldados para alquilar', text: 'Un gran príncipe ofrece buen dinero por compañías de nuestros hombres para sus campañas. Es la riqueza de los Estados pequeños, y también su sangría.',
    options: [
      { label: 'Ajustar el contrato', effects: [gold(70), men(-2000)], aiWeight: 6 },
      { label: 'Guardar a los hombres en casa', effects: [], aiWeight: 4 },
    ],
  },
  {
    id: 'em_p_mockery', mtthMonths: 500, oneShot: false, image: 'court', condition: [{ type: 'maxPrestige', value: -20 }],
    title: 'Burlas en las cortes extranjeras', text: 'Los embajadores cuentan que en las cortes vecinas se ríen de nuestro soberano y de sus derrotas. Ningún príncipe quiere casar a sus hijas con nuestra casa.',
    options: [
      { label: 'Fiestas y torneos para lavar la imagen', effects: [gold(-80), pres(25)], aiWeight: 5 },
      { label: 'Encargar crónicas que canten nuestra gloria', effects: [gold(-30), pres(10)], aiWeight: 5 },
    ],
  },
];

/** Historical event chains and national mission trees for the earlymodern era. */
export const STORY: Record<string, { events: GameEvent[]; missions: Mission[] }> = {
  em1492: { events: EVENTS_1492, missions: MISSIONS_1492 },
};
/** Situation-driven events that can happen to any realm of the era. */
export const POOL: GameEvent[] = POOL_EVENTS;
