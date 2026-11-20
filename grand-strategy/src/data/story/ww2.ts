import type { Condition, Effect, EventOption, GameEvent, Mission } from '@/engine/types';

/*
 * Historia y dinámica de la Segunda Guerra Mundial (escenarios 1936 y 1939).
 * Órdenes de magnitud del ruleset ww2: mano de obra en hombres (una división ≈ 12 000),
 * reservas (stock_*) en torno a 500–20 000, CI nacional 8–110 (las fábricas se suman con x.factory),
 * disidencia 0–100, unidad nacional (nu) en % y multiplicador de combate (combat) alrededor de 1.
 */

// ------------------------------------------------------------------ helpers
const E = (e: GameEvent): GameEvent => ({ oneShot: true, ...e });
const T = (e: GameEvent): GameEvent => ({ oneShot: true, triggeredOnly: true, ...e });
const opt = (label: string, effects: Effect[], aiWeight?: number, hint?: string): EventOption => ({ label, effects, aiWeight, hint });
const X = (key: string, amount: number, tag?: string): Effect => (tag ? { type: 'x', tag, key, amount } : { type: 'x', key, amount });
const MP = (amount: number, tag?: string): Effect => (tag ? { type: 'manpower', tag, amount } : { type: 'manpower', amount });
const PR = (amount: number, tag?: string): Effect => (tag ? { type: 'prestige', tag, amount } : { type: 'prestige', amount });
const INF = (amount: number): Effect => ({ type: 'infamy', amount });
const REL = (other: string, amount: number, tag?: string): Effect => (tag ? { type: 'relations', tag, other, amount } : { type: 'relations', other, amount });
const TECH = (key: string, amount: number, tag?: string): Effect => (tag ? { type: 'tech', tag, key, amount } : { type: 'tech', key, amount });
const FL = (flag: string, tag?: string): Effect => (tag ? { type: 'flag', tag, flag } : { type: 'flag', flag });
const TR = (event: string, days: number, tag?: string): Effect => (tag ? { type: 'trigger', tag, event, days } : { type: 'trigger', event, days });
const CH = (text: string, tag?: string): Effect => (tag ? { type: 'chronicle', tag, text } : { type: 'chronicle', text });
const IC = (amount: number, tag?: string): Effect => X('factory', amount, tag);
const DIS = (amount: number, tag?: string): Effect => X('dissent', amount, tag);
const SUP = (amount: number, tag?: string): Effect => X('stock_supplies', amount, tag);
const OIL = (amount: number, tag?: string): Effect => X('stock_oil', amount, tag);
const NU = (amount: number, tag?: string): Effect => X('nu', amount, tag);
const CMB = (amount: number, tag?: string): Effect => X('combat', amount, tag);

const war = (other: string, tag?: string): Condition => (tag ? { type: 'atWarWith', tag, other } : { type: 'atWarWith', other });
const exists = (tag: string): Condition => ({ type: 'exists', tag });
const owns = (province: string, tag?: string): Condition => (tag ? { type: 'owns', province, tag } : { type: 'owns', province });
const minX = (key: string, value: number): Condition => ({ type: 'minX', key, value });
const year = (value: number): Condition => ({ type: 'minYear', value });


// ------------------------------------------------------------------ 1936: el camino a la guerra
const PREWAR: GameEvent[] = [
  // --- Renania
  E({ id: 's36_rhineland', tag: 'GER', date: '1936-03-07', image: 'war', title: 'Las tropas cruzan el Rin',
    text: 'Unos pocos batallones esperan la orden de entrar en la zona desmilitarizada de Renania. Los generales temen que una sola división francesa baste para obligarles a retroceder.',
    note: 'El 7 de marzo de 1936 la Wehrmacht reocupó Renania en abierta violación de los tratados de Versalles y Locarno. Francia, en plena campaña electoral, no movilizó.',
    options: [
      opt('Dar la orden de avanzar', [PR(25), NU(5), INF(3), REL('FRA', -30), FL('rhineland'), TR('s36_rhineland_fra', 3, 'FRA'), CH('Las tropas alemanas entran en Renania entre aclamaciones; en París se reúne el Consejo de Ministros.')], 9, 'Un golpe de efecto. Si París reacciona con firmeza, habrá que decidir de nuevo.'),
      opt('Esperar a que el ejército esté preparado', [DIS(3), PR(-10)], 1, 'Prudente, pero el régimen pierde iniciativa.'),
    ] }),
  T({ id: 's36_rhineland_fra', tag: 'FRA', image: 'court', title: 'Renania: ¿responder?',
    text: 'Los alemanes han vuelto a la orilla izquierda del Rin. El Estado Mayor asegura que cualquier respuesta exige una movilización general, y Londres no quiere oír hablar de sanciones.',
    options: [
      opt('Protestar ante la Sociedad de Naciones', [REL('GER', -20), PR(-10), NU(-3), CH('Francia se limita a protestar por la remilitarización de Renania.')], 8, 'Lo que hicieron Sarraut y Flandin: evitar la guerra a costa de credibilidad.'),
      opt('Movilizar y exigir la retirada', [SUP(-600), DIS(8), REL('GER', -60), REL('ENG', -20), PR(15), TR('s36_rhineland_bluff', 7, 'GER'), CH('Francia moviliza a sus reservistas y exige la evacuación de Renania.')], 2, 'Costoso y sin respaldo británico, pero puede desmontar el farol alemán.'),
    ] }),
  T({ id: 's36_rhineland_bluff', tag: 'GER', image: 'court', title: 'París moviliza',
    text: 'Francia ha llamado a sus reservistas. Los batallones de Renania no resistirían un ataque serio.',
    options: [
      opt('Mantener las posiciones y apostar', [PR(20), INF(4), REL('FRA', -40), CH('Berlín mantiene sus tropas en Renania pese a la movilización francesa.')], 7),
      opt('Retirar los batallones', [PR(-40), NU(-5), DIS(5), REL('FRA', 30), FL('rhine_retreat'), CH('Las tropas alemanas abandonan Renania: una humillación para el régimen.')], 3, 'Evita la guerra, pero el régimen queda en entredicho ante sus propios generales.'),
    ] }),
  E({ id: 's36_four_year', tag: 'GER', date: '1936-09-09', image: 'prosperity', title: 'El Plan Cuatrienal',
    text: 'El rearme consume divisas que el país no tiene. Unos proponen la autarquía a cualquier precio; otros, volver a exportar para pagar las materias primas.',
    options: [
      opt('Autarquía: combustible y caucho sintéticos', [IC(3), OIL(400), DIS(4), CH('Se lanza el Plan Cuatrienal: fábricas de combustible sintético y acero nacional.')], 7, 'Más industria propia, menos bienes de consumo.'),
      opt('Exportar para comprar materias primas', [X('stock_metal', 800), X('stock_rare', 400), IC(1), DIS(-2)], 3, 'Menos ambicioso y más dependiente del comercio exterior.'),
    ] }),
  // --- Guerra Civil Española
  E({ id: 's36_spain_ger', tag: 'GER', date: '1936-07-25', image: 'war', title: 'Aviones para España', condition: [exists('SPR')],
    text: 'Los militares sublevados piden aviones de transporte para cruzar el Estrecho. Enviar ayuda daría experiencia a la aviación, pero nos enfrentaría a Londres y París.',
    note: 'La Legión Cóndor combatió en España de 1936 a 1939. Su bombardeo de Gernika (abril de 1937) se convirtió en símbolo de los ataques aéreos contra población civil.',
    options: [
      opt('Enviar aviones y una legión de voluntarios', [X('fighters', -1), X('bombers', -1), TECH('doctrine', 1), REL('SPR', 40), REL('ENG', -15), INF(1), FL('ger_spain'), CH('Aviones alemanes aterrizan en Tetuán: Alemania interviene en la guerra de España.')], 8, 'Se pierden aparatos, se gana doctrina.'),
      opt('No implicarse', [REL('ITA', -20)], 2),
    ] }),
  E({ id: 's36_spain_ita', tag: 'ITA', date: '1936-08-01', image: 'war', title: 'Voluntarios para España', condition: [exists('SPR')],
    text: 'Franco pide hombres y material. Roma podría enviar un cuerpo expedicionario entero, aunque el ejército aún no se ha recuperado de Abisinia.',
    options: [
      opt('Enviar el Corpo Truppe Volontarie', [MP(-40000), SUP(-500), REL('SPR', 40), REL('GER', 20), PR(10), CH('Decenas de miles de soldados italianos desembarcan en Cádiz.')], 8, 'Prestigio y amistad con Berlín a costa de hombres y suministros.'),
      opt('Limitarse a enviar material', [SUP(-200), REL('SPR', 15)], 2),
    ] }),
  E({ id: 's36_spain_sov', tag: 'SOV', date: '1936-09-15', image: 'war', title: 'Ayuda a la República', condition: [exists('SPR')],
    text: 'El gobierno de Madrid solicita armas. Ayudarle daría prestigio internacional al movimiento comunista, pero alarmaría a Londres y París, a quienes Moscú busca como aliados contra Alemania.',
    options: [
      opt('Enviar tanques, aviones y asesores', [X('fighters', -1), SUP(-400), REL('SPR', 40), REL('ENG', -15), PR(15), TECH('armor', 1), FL('sov_spain'), CH('Los primeros tanques soviéticos llegan a Cartagena.')], 7),
      opt('Priorizar la seguridad colectiva', [REL('ENG', 15), REL('FRA', 15), PR(-10)], 3, 'Mejor relación con las democracias, menos influencia.'),
    ] }),
  E({ id: 's36_blum_spain', tag: 'FRA', date: '1936-08-08', image: 'court', title: 'El dilema de Blum', condition: [exists('SPR')],
    text: 'Un gobierno hermano pide ayuda al otro lado de los Pirineos. La derecha francesa amenaza con una crisis y Londres desaconseja cualquier implicación.',
    options: [
      opt('Cerrar la frontera: no intervención', [DIS(5), REL('ENG', 20), CH('Francia propone un pacto de no intervención en España.')], 7, 'Fiel a Londres, pero la izquierda se siente traicionada.'),
      opt('Dejar pasar armas discretamente', [X('fighters', -1), REL('GER', -30), REL('ITA', -30), REL('ENG', -20), REL('SPR', 30), DIS(2), PR(10)], 3),
    ] }),
  E({ id: 's36_nonintervention', tag: 'ENG', date: '1936-09-09', image: 'peace', title: 'El Comité de No Intervención',
    text: 'Veintisiete países se comprometen en Londres a no enviar armas a España. Todos saben que Alemania, Italia y la URSS no lo cumplirán.',
    options: [
      opt('Sostener el comité pese a todo', [REL('GER', 10), REL('ITA', 10), DIS(2), CH('Londres preside el Comité de No Intervención.')], 9, 'Evita la escalada a costa de la credibilidad.'),
      opt('Denunciar las violaciones del Eje', [REL('GER', -30), REL('ITA', -30), REL('SOV', 10), DIS(4), PR(10)], 1),
    ] }),
  // --- Francia
  E({ id: 's36_front_populaire', tag: 'FRA', date: '1936-06-07', image: 'faith', title: 'Los acuerdos de Matignon',
    text: 'Dos millones de obreros ocupan las fábricas. El nuevo gobierno del Frente Popular puede pactar la semana de cuarenta horas y las vacaciones pagadas, o pedir sacrificios en nombre del rearme.',
    note: 'Los acuerdos de Matignon (junio de 1936) trajeron convenios colectivos, subidas salariales y dos semanas de vacaciones pagadas.',
    options: [
      opt('Firmar: cuarenta horas y vacaciones pagadas', [DIS(-10), IC(-1), CH('Las huelgas terminan con los acuerdos de Matignon.')], 7, 'Paz social, menos horas en las fábricas de armas.'),
      opt('Priorizar el rearme', [DIS(8), IC(2), TECH('armor', 1)], 3),
    ] }),
  // --- Italia
  E({ id: 's36_ita_sanctions', tag: 'ITA', date: '1936-05-09', image: 'court', title: 'Después de Abisinia',
    text: 'Addis Abeba ha caído y la Sociedad de Naciones mantiene sus sanciones. Roma debe decidir si vuelve a acercarse a Londres y París o se inclina hacia Berlín.',
    note: 'La invasión de Etiopía (1935–1936) incluyó el uso de gas tóxico contra combatientes y civiles, pese a la prohibición internacional.',
    options: [
      opt('Romper con Ginebra y mirar a Berlín', [REL('GER', 40), REL('ENG', -30), REL('FRA', -30), PR(20), FL('ita_berlin')], 7),
      opt('Buscar un nuevo entendimiento con Londres', [REL('ENG', 30), REL('FRA', 30), REL('GER', -20), DIS(3)], 3, 'El espíritu de Stresa: incómodo para el régimen.'),
    ] }),
  // --- Antikomintern
  E({ id: 's36_anticomintern', tag: 'GER', date: '1936-11-25', image: 'faith', title: 'El Pacto Antikomintern', condition: [exists('SOV')],
    text: 'Tokio propone un acuerdo contra la Internacional Comunista. Es más un gesto ideológico que una alianza, pero Moscú lo leerá como una amenaza.',
    options: [
      opt('Firmar con Japón', [PR(15), REL('SOV', -50), FL('anticomintern'), TR('s36_anticomintern_ita', 340, 'ITA'), CH('Alemania y Japón firman el Pacto Antikomintern.')], 9),
      opt('Evitar compromisos ideológicos', [REL('SOV', 20), PR(-5)], 1),
    ] }),
  T({ id: 's36_anticomintern_ita', tag: 'ITA', image: 'court', title: 'Roma y el Antikomintern', condition: [exists('GER')],
    text: 'Berlín y Tokio invitan a Italia a sumarse a su pacto contra el comunismo.',
    options: [
      opt('Adherirse al pacto', [REL('GER', 30), REL('SOV', -40), PR(10), { type: 'joinFaction', faction: 'axis' }, CH('Italia se adhiere al Pacto Antikomintern.')], 8),
      opt('Mantener las manos libres', [REL('GER', -20), REL('ENG', 10)], 2),
    ] }),
  // --- Estados Unidos
  E({ id: 's36_usa_neutrality', tag: 'USA', date: '1937-05-01', image: 'court', title: 'Las leyes de neutralidad',
    text: 'El Congreso quiere que el país no vuelva a verse arrastrado a una guerra europea. La Casa Blanca propone al menos que los beligerantes puedan comprar si pagan al contado y transportan la mercancía.',
    options: [
      opt('Neutralidad estricta', [DIS(-5), REL('ENG', -10), REL('FRA', -10)], 4),
      opt('«Cash and carry»', [IC(2), REL('ENG', 20), REL('FRA', 20), REL('GER', -15), DIS(2), CH('Estados Unidos autoriza la venta al contado a los beligerantes.')], 6, 'Pedidos para la industria y amistad con las democracias.'),
    ] }),
  E({ id: 's36_usa_vinson', tag: 'USA', date: '1938-05-17', image: 'prosperity', title: 'La ley Vinson',
    text: 'El Congreso está dispuesto a financiar una gran expansión de las fuerzas armadas. Los almirantes quieren acorazados; el Cuerpo Aéreo, bombarderos de largo alcance.',
    options: [
      opt('Una armada para dos océanos', [X('navy', 3), TECH('naval', 1)], 6),
      opt('Poder aéreo', [X('fighters', 2), X('bombers', 2), TECH('air', 1)], 4),
    ] }),
  // --- URSS
  E({ id: 's36_sov_fiveyear', tag: 'SOV', date: '1937-01-01', image: 'prosperity', title: 'El segundo plan quinquenal',
    text: 'Los planificadores piden más acero, más tractores convertibles en tanques y nuevas ciudades industriales tras el Volga. Los almacenes de bienes de consumo siguen vacíos.',
    note: 'En 1937–1938 la represión estalinista alcanzó su punto álgido: cientos de miles de ejecuciones, incluida buena parte de la cúpula del Ejército Rojo.',
    options: [
      opt('Industria pesada ante todo', [IC(4), DIS(6), CH('El plan quinquenal concentra todos los recursos en la industria pesada.')], 8),
      opt('Aflojar la presión sobre el consumo', [IC(1), DIS(-6)], 2),
    ] }),
  // --- Reino Unido
  E({ id: 's36_abdication', tag: 'ENG', date: '1936-12-10', image: 'court', title: 'La crisis de la abdicación',
    text: 'El rey quiere casarse con una divorciada estadounidense. El gobierno amenaza con dimitir y los dominios no aceptarían a la nueva reina.',
    options: [
      opt('Aceptar la abdicación', [DIS(-2), PR(-5), CH('Eduardo VIII abdica; su hermano reina como Jorge VI.')], 9),
      opt('Buscar un matrimonio morganático', [DIS(10), PR(-15), REL('CAN', -20)], 1, 'Abre una crisis constitucional en plena tensión europea.'),
    ] }),
  // --- Múnich
  E({ id: 's36_munich_eng', tag: 'ENG', date: '1938-09-15', image: 'peace', title: 'La crisis de los Sudetes', condition: [exists('CZE'), exists('GER')],
    text: 'Berlín amenaza con la guerra si no recibe los territorios fronterizos de Checoslovaquia. El primer ministro se ofrece a volar a Alemania para negociar.',
    options: [
      opt('Negociar: la paz ante todo', [REL('GER', 30), DIS(-3), PR(-10), FL('appeasement'), TR('s36_munich_rearm', 120), CH('Londres acepta negociar sobre los Sudetes. «Paz para nuestro tiempo», dirá el primer ministro al volver.')], 8, 'Gana tiempo para rearmarse a costa de un aliado ajeno.'),
      opt('Respaldar a Praga', [{ type: 'alliance', other: 'CZE' }, REL('GER', -60), DIS(6), PR(15), FL('eng_cze')], 2, 'Puede arrastrarnos a la guerra antes de estar preparados.'),
    ] }),
  E({ id: 's36_munich_fra', tag: 'FRA', date: '1938-09-18', image: 'peace', title: 'Nuestro tratado con Praga', condition: [exists('CZE'), exists('GER')],
    text: 'Francia está obligada por tratado a defender Checoslovaquia. Sin Londres, el Estado Mayor no se ve capaz de atacar en el Rin.',
    options: [
      opt('Seguir la línea británica', [REL('GER', 20), REL('CZE', -50), PR(-15), DIS(-2), CH('Daladier firma en Múnich junto a Chamberlain.')], 8),
      opt('Cumplir el tratado', [{ type: 'alliance', other: 'CZE' }, REL('GER', -60), DIS(8), PR(20)], 2),
    ] }),
  T({ id: 's36_munich_rearm', tag: 'ENG', image: 'prosperity', title: 'Rearmarse después de Múnich',
    text: 'El acuerdo ha comprado tiempo, no la paz. Ministerios y fábricas discuten adónde destinar el dinero del rearme.',
    options: [
      opt('Cazas modernos y la cadena de radares', [X('fighters', 3), TECH('air', 1), CH('Las primeras escuadrillas de Spitfire entran en servicio.')], 7),
      opt('Ampliar la flota', [X('navy', 2), TECH('naval', 1)], 2),
      opt('Fábricas «en la sombra»', [IC(3)], 1),
    ] }),
  // --- Polonia
  E({ id: 's36_pol_cop', tag: 'POL', date: '1937-02-01', image: 'prosperity', title: 'La Región Industrial Central',
    text: 'El ministro de Hacienda propone levantar un gran polo industrial lejos de las fronteras, entre el Vístula y el San. Los militares preferirían gastar el dinero en aviones y blindados.',
    options: [
      opt('Construir la región industrial', [IC(3), SUP(-300), DIS(2), CH('Comienzan las obras de la Región Industrial Central.')], 7),
      opt('Modernizar el ejército ya', [X('fighters', 2), TECH('infantry', 1), SUP(-200)], 3),
    ] }),
  E({ id: 's36_pol_balance', tag: 'POL', date: '1938-01-15', image: 'court', title: 'Entre Berlín y Moscú', condition: [exists('GER'), exists('SOV')],
    text: 'La diplomacia polaca intenta mantenerse equidistante entre sus dos grandes vecinos. Berlín sugiere un entendimiento sobre Danzig y una carretera a través del corredor.',
    options: [
      opt('Mantener la equidistancia', [REL('GER', 15), REL('SOV', 15)], 6),
      opt('Estrechar lazos con París y Londres', [REL('FRA', 40), REL('ENG', 30), REL('GER', -20), FL('pol_west')], 3),
      opt('Aceptar la propuesta alemana sobre Danzig', [{ type: 'cede', from: 'POL', to: 'GER', provinces: ['danzig'] }, REL('GER', 60), NU(-10), DIS(12)], 1, 'Una concesión que nadie en Varsovia perdonaría.'),
    ] }),
  E({ id: 's36_danzig_crisis', tag: 'POL', date: '1939-03-26', image: 'court', title: 'Danzig: la exigencia alemana', condition: [exists('GER'), owns('danzig')],
    text: 'Tras ocupar Praga, Berlín exige la devolución de Danzig y una vía extraterritorial a través del corredor. Ceder ahora sería ceder siempre.',
    options: [
      opt('Rechazar: «no conocemos la paz a cualquier precio»', [NU(8), PR(15), REL('GER', -60), FL('danzig_refused'), CH('Varsovia rechaza las exigencias alemanas sobre Danzig.')], 9),
      opt('Entregar Danzig', [{ type: 'cede', from: 'POL', to: 'GER', provinces: ['danzig'] }, NU(-15), DIS(15), REL('GER', 40)], 1, 'Quizá compre la paz. Quizá solo la próxima exigencia.'),
    ] }),
  E({ id: 's36_pact_steel', tag: 'ITA', date: '1939-05-22', image: 'court', title: 'El Pacto de Acero', condition: [exists('GER')],
    text: 'Berlín propone una alianza militar sin cláusulas de escape. El ejército advierte de que Italia no estará lista para una guerra antes de 1943.',
    options: [
      opt('Firmar la alianza', [{ type: 'alliance', other: 'GER' }, REL('GER', 40), FL('pact_steel'), CH('Roma y Berlín firman el Pacto de Acero.')], 8),
      opt('Conservar la libertad de acción', [REL('GER', -30), REL('ENG', 20)], 2),
    ] }),
];

// ------------------------------------------------------------------ la guerra (compartida por 1936 y 1939)
const tripartite = (id: string, tag: string, date: string, extra: Effect[] = []): GameEvent => E({
  id, tag, date, image: 'court', title: 'El Pacto Tripartito', condition: [exists('GER'), { type: 'notVassal' }],
  text: 'Berlín invita a adherirse al pacto entre Alemania, Italia y Japón. Negarse puede costar caro a un país rodeado por el Eje; aceptar ata nuestra suerte a la suya.',
  options: [
    opt('Adherirse al Eje', [{ type: 'joinFaction', faction: 'axis' }, REL('GER', 30), ...extra, CH('El gobierno firma el Pacto Tripartito.')], 8),
    opt('Mantener la neutralidad', [REL('GER', -40), DIS(4)], 2, 'Neutral, pero expuesto.'),
  ],
});

const WAR: GameEvent[] = [
  // --- Polonia, 1939
  E({ id: 'ww_enigma', tag: 'POL', date: '1939-07-25', image: 'explore', title: 'El secreto de Enigma', condition: [exists('ENG'), exists('FRA')],
    text: 'Los criptólogos del Estado Mayor polaco han conseguido leer mensajes de la máquina Enigma alemana. Compartirlo con británicos y franceses podría cambiar la guerra; guardarlo nos daría una ventaja propia.',
    note: 'En julio de 1939, en Pyry, cerca de Varsovia, los criptólogos polacos entregaron a británicos y franceses sus réplicas de Enigma y sus métodos.',
    options: [
      opt('Compartirlo con los aliados', [REL('ENG', 40), REL('FRA', 40), FL('enigma_shared'), TR('ww_bletchley', 240, 'ENG'), CH('En el bosque de Pyry, los criptólogos polacos revelan Enigma a sus aliados.')], 9),
      opt('Guardar el secreto', [CMB(0.05)], 1),
    ] }),
  T({ id: 'ww_bletchley', tag: 'ENG', image: 'explore', title: 'Bletchley Park', condition: [war('GER')],
    text: 'Con los métodos polacos y las primeras máquinas electromecánicas, los analistas de Bletchley Park leen el tráfico alemán. La gran pregunta es cuánto usar sin delatar la fuente.',
    options: [
      opt('Proteger el secreto: usarlo solo cuando sea decisivo', [CMB(0.06), TECH('naval', 1), CH('Bletchley Park empieza a descifrar el tráfico alemán.')], 8),
      opt('Explotarlo en cada ocasión', [CMB(0.12), TR('ww_enigma_suspect', 120, 'GER')], 2, 'Más ventaja inmediata; el enemigo podría sospechar.'),
    ] }),
  T({ id: 'ww_enigma_suspect', tag: 'GER', image: 'court', title: '¿Nos leen los mensajes?', condition: [war('ENG')],
    text: 'Demasiados convoyes esquivan a nuestros submarinos. Un oficial de transmisiones sospecha que el enemigo descifra Enigma.',
    options: [
      opt('Cambiar claves y añadir un rotor', [X('stock_rare', -300), CMB(-0.1, 'ENG'), CH('La Kriegsmarine introduce una cuarta rueda en sus máquinas Enigma.')], 6),
      opt('Enigma es indescifrable', [], 4, 'Ahorra recursos si la sospecha es infundada.'),
    ] }),
  E({ id: 'ww_pol_mobilize', tag: 'POL', date: '1939-08-29', image: 'war', title: 'Movilización general', condition: [exists('GER')],
    text: 'Las tropas alemanas se concentran en la frontera. Londres y París piden que no movilicemos para no dar pretextos a Berlín.',
    options: [
      opt('Movilizar ya', [MP(150000), DIS(3), REL('ENG', -10), REL('FRA', -10)], 4, 'Más hombres, aliados molestos.'),
      opt('Escuchar a los aliados y esperar', [REL('ENG', 15), REL('FRA', 15), CMB(-0.05)], 6, 'Lo que ocurrió: la movilización llegó tarde.'),
    ] }),
  E({ id: 'ww_westerplatte', tag: 'POL', date: '1939-09-01', image: 'war', title: 'Westerplatte', condition: [war('GER')],
    text: 'Un acorazado alemán abre fuego sobre la guarnición del depósito de Westerplatte, en Danzig. Sus doscientos hombres tenían orden de resistir doce horas.',
    options: [
      opt('Resistir hasta el final', [MP(-3000), NU(6), PR(15), CH('La guarnición de Westerplatte resiste una semana.')], 7),
      opt('Capitular con honor y salvar a los hombres', [PR(5)], 3),
    ] }),
  E({ id: 'ww_bzura', tag: 'POL', date: '1939-09-09', image: 'war', title: 'Contraataque en el Bzura', condition: [war('GER')],
    text: 'Los ejércitos Poznań y Pomorze, rebasados por el avance alemán, pueden golpear el flanco del enemigo que marcha sobre Varsovia, o replegarse para defender la capital.',
    options: [
      opt('Atacar el flanco alemán', [MP(-60000), PR(30), NU(5), CMB(0.05), CH('El ejército polaco contraataca a orillas del Bzura.')], 6),
      opt('Fortificar Varsovia', [{ type: 'spawnArmy', province: 'mazovia', units: { militia: 4 } }, MP(-40000), SUP(-300)], 4, 'Milicias y voluntarios para la defensa de la capital.'),
    ] }),
  E({ id: 'ww_pol_exile', tag: 'POL', date: '1939-09-17', image: 'disaster', title: 'Golpe por la espalda', condition: [war('SOV')],
    text: 'El Ejército Rojo cruza la frontera oriental. Con dos enemigos y sin ayuda aliada, el gobierno debe elegir entre luchar hasta el final o salvar lo que pueda para seguir combatiendo desde el extranjero.',
    options: [
      opt('Evacuar a Rumanía y seguir desde el exilio', [FL('pol_exile'), REL('FRA', 40), REL('ENG', 40), MP(40000, 'FRA'), X('fighters', 1, 'ENG'), CH('El gobierno polaco cruza a Rumanía; miles de soldados y pilotos se reagrupan en Francia y Gran Bretaña.')], 7),
      opt('Combatir en ambos frentes', [MP(-50000), PR(20), NU(10)], 3),
    ] }),
  // --- Frente occidental, 1939–1940
  E({ id: 'ww_saar', tag: 'FRA', date: '1939-09-07', image: 'war', title: 'La ofensiva del Sarre', condition: [war('GER')],
    text: 'Prometimos a Polonia una ofensiva en el oeste. El Rin está defendido por divisiones de segunda línea, pero el mando prefiere esperar tras la Línea Maginot.',
    options: [
      opt('Avanzar unos kilómetros y detenerse', [SUP(500), REL('POL', -20), DIS(2), CH('Las tropas francesas avanzan en el Sarre y vuelven a sus posiciones: empieza la «guerra de broma».')], 8, 'Lo que ocurrió: una ofensiva simbólica.'),
      opt('Atacar en serio', [MP(-40000), SUP(-800), PR(25), REL('POL', 40), CMB(0.03)], 2, 'Costoso, pero aliviaría a Polonia.'),
    ] }),
  E({ id: 'ww_bef', tag: 'ENG', date: '1939-09-10', image: 'war', title: 'La Fuerza Expedicionaria', condition: [war('GER'), exists('FRA')],
    text: 'Francia espera divisiones británicas en su frontera norte. El Estado Mayor quiere conservar reservas para el Imperio y para defender las islas.',
    options: [
      opt('Enviar más divisiones a Francia', [{ type: 'spawnArmy', province: 'picardie', units: { infantry: 4 } }, MP(-48000), REL('FRA', 30)], 7),
      opt('Conservar las reservas en casa', [REL('FRA', -20), SUP(400)], 3),
    ] }),
  E({ id: 'ww_fin_defense', tag: 'FIN', date: '1939-12-10', image: 'war', title: 'La defensa de Finlandia', condition: [war('SOV')],
    text: 'Columnas soviéticas avanzan por los bosques nevados. Finlandia puede fiarlo todo a sus esquiadores y a la Línea Mannerheim, o pedir ayuda a Suecia y a las democracias.',
    options: [
      opt('Emboscadas en los bosques', [CMB(0.15), NU(5), CH('Las columnas soviéticas quedan atrapadas en los bosques de Suomussalmi.')], 6),
      opt('Pedir voluntarios al extranjero', [MP(20000), REL('SWE', 30), REL('ENG', 20), REL('FRA', 20)], 4),
    ] }),
  E({ id: 'ww_winter_lessons', tag: 'SOV', date: '1940-02-01', image: 'court', title: 'Las lecciones de Finlandia', condition: [war('FIN')],
    text: 'Una pequeña nación humilla al Ejército Rojo. El comisario de Defensa propone devolver autoridad a los mandos y reformar la instrucción; otros prefieren lanzar más divisiones.',
    options: [
      opt('Reformar el ejército', [CMB(0.1), TECH('doctrine', 1), DIS(3), CH('Tras la guerra de Invierno, el Ejército Rojo revisa sus métodos.')], 7),
      opt('Aplastar la resistencia con masas', [MP(-150000), PR(10), SUP(-800)], 3),
    ] }),
  E({ id: 'ww_churchill', tag: 'ENG', date: '1940-05-10', image: 'court', title: 'Cambio en Downing Street', condition: [war('GER')],
    text: 'El desastre de Noruega ha hundido al gobierno. El Parlamento espera un nuevo primer ministro: uno dispuesto a explorar una paz negociada o uno decidido a luchar.',
    options: [
      opt('Churchill: luchar hasta el final', [NU(5), DIS(-5), PR(20), FL('churchill'), CH('Winston Churchill forma un gobierno de coalición: «sangre, esfuerzo, lágrimas y sudor».')], 9),
      opt('Halifax: explorar una paz', [REL('GER', 40), NU(-10), DIS(5), FL('halifax')], 1, 'Quizá ahorre vidas. Quizá deje Europa en manos de Berlín.'),
    ] }),
  E({ id: 'ww_sedan', tag: 'FRA', date: '1940-05-15', image: 'disaster', title: 'La brecha de Sedán', condition: [war('GER')],
    text: 'Los blindados alemanes han cruzado el Mosa por donde nadie los esperaba. El mando se desmorona y París pide ayuda a Londres.',
    options: [
      opt('Pedir más escuadrillas británicas', [TR('ww_dowding', 2, 'ENG'), DIS(3)], 6),
      opt('Cambiar el mando: Weygand sustituye a Gamelin', [CMB(0.05), NU(5), DIS(2)], 4),
    ] }),
  T({ id: 'ww_dowding', tag: 'ENG', image: 'court', title: 'París pide más cazas', condition: [war('GER')],
    text: 'El jefe del Mando de Caza advierte que, si se envían más escuadrillas a Francia, no quedará nada para defender las islas.',
    options: [
      opt('Conservarlas para defender Inglaterra', [REL('FRA', -30), FL('dowding'), CH('Londres se niega a enviar más cazas a Francia.')], 7),
      opt('Enviarlas a Francia', [X('fighters', -3), X('fighters', 3, 'FRA'), REL('FRA', 40)], 3),
    ] }),
  E({ id: 'ww_dunkirk', tag: 'ENG', date: '1940-05-26', image: 'disaster', title: 'Dunkerque', condition: [war('GER')],
    text: 'La Fuerza Expedicionaria está cercada contra el mar. Destructores, transbordadores y cientos de embarcaciones civiles pueden intentar sacarla, a costa de abandonar todo el material.',
    note: 'La Operación Dynamo evacuó unos 338 000 soldados británicos y franceses entre el 26 de mayo y el 4 de junio de 1940.',
    options: [
      opt('Operación Dynamo: rescatar a todos los hombres', [MP(80000), X('navy', -1), SUP(-1000), CH('Desde las playas de Dunkerque, una flota improvisada evacúa a cientos de miles de soldados.')], 8, 'Se salvan los hombres; se pierden el equipo y algunos barcos.'),
      opt('Mantener la cabeza de puente', [MP(-60000), PR(15), REL('FRA', 30)], 2),
    ] }),
  E({ id: 'ww_mers_el_kebir', tag: 'ENG', date: '1940-07-01', image: 'war', title: 'La flota francesa',
    condition: [war('GER'), exists('FRA'), { type: 'notOwns', tag: 'FRA', province: 'ile_de_france' }],
    text: 'Francia ha caído. Su flota, intacta en Mazalquivir, podría acabar en manos alemanas. El almirante francés da su palabra de que eso nunca ocurrirá.',
    options: [
      opt('Neutralizar la flota francesa', [X('navy', -4, 'FRA'), REL('FRA', -60), PR(10), CH('La Royal Navy abre fuego sobre la flota francesa en Mazalquivir.')], 7, 'Una decisión amarga contra un antiguo aliado.'),
      opt('Confiar en la palabra del almirante', [REL('FRA', 20), X('navy', 2, 'GER')], 3, 'Si la palabra no basta, Alemania ganará barcos.'),
    ] }),
  E({ id: 'ww_battle_britain', tag: 'ENG', date: '1940-08-13', image: 'war', title: 'La batalla de Inglaterra', condition: [war('GER')],
    text: 'La Luftwaffe ataca los aeródromos del sur. El Mando de Caza tiene pocos pilotos y no puede estar en todas partes.',
    options: [
      opt('Defender los aeródromos y el radar', [X('fighters', -2), PR(25), NU(3), FL('bob_won'), CH('«Nunca tantos debieron tanto a tan pocos»: la RAF resiste sobre el sur de Inglaterra.')], 7),
      opt('Replegar las escuadrillas al norte de Londres', [X('bombed', 15), DIS(5)], 3, 'Conserva aviones; la industria sufre los bombardeos.'),
    ] }),
  E({ id: 'ww_blitz', tag: 'GER', date: '1940-09-07', image: 'war', title: 'Bombardear Inglaterra', condition: [war('ENG')],
    text: 'La RAF no ha sido destruida. El mando aéreo discute si insistir sobre los aeródromos, atacar la industria y los puertos o renunciar al desembarco y mirar hacia el este.',
    note: 'El Blitz (septiembre de 1940 – mayo de 1941) mató a unos 43 000 civiles británicos sin quebrar la moral ni la producción.',
    options: [
      opt('Insistir sobre los aeródromos', [X('bombers', -2), X('fighters', -2, 'ENG')], 3),
      opt('Atacar la industria y los puertos', [X('bombers', -2), X('bombed', 15, 'ENG'), NU(5, 'ENG'), INF(3)], 5, 'Daña la producción enemiga, pero endurece su resistencia.'),
      opt('Aplazar el desembarco', [FL('sealion_off'), SUP(800), CH('El desembarco en Inglaterra queda aplazado sin fecha.')], 2),
    ] }),
  E({ id: 'ww_ita_nonbelligerence', tag: 'ITA', date: '1939-09-03', image: 'court', title: 'No beligerancia', condition: [war('FRA', 'GER')],
    text: 'Alemania está en guerra con Francia y Gran Bretaña. Las fuerzas armadas italianas aún no se han repuesto de Abisinia y de España.',
    options: [
      opt('Declararse «no beligerante»', [SUP(800), IC(1), REL('ENG', 10)], 8, 'Comerciar y rearmarse mientras otros combaten.'),
      opt('Entrar en guerra junto a Alemania', [{ type: 'declareWar', target: 'FRA', goal: 'provence' }, DIS(8)], 2),
    ] }),
  // --- Europa oriental 1940–1941
  E({ id: 'ww_baltic', tag: 'SOV', date: '1940-06-15', image: 'court', title: 'Ultimátum a los Estados bálticos',
    condition: [{ type: 'flag', tag: 'GER', flag: 'mr_pact', value: true }, exists('EST'), exists('LAT'), exists('LIT')],
    text: 'Con Alemania ocupada en Francia, Moscú puede reclamar lo pactado en agosto: exigir gobiernos «amigos» en Tallin, Riga y Kaunas.',
    note: 'La anexión de 1940 fue seguida de deportaciones masivas a Siberia en junio de 1941. Las potencias occidentales nunca la reconocieron.',
    options: [
      opt('Ocupar y anexionar', [{ type: 'annex', target: 'EST' }, { type: 'annex', target: 'LAT' }, { type: 'annex', target: 'LIT' }, INF(6), REL('ENG', -20), REL('USA', -20)], 8),
      opt('Imponer bases y gobiernos dependientes', [{ type: 'vassalize', target: 'EST' }, { type: 'vassalize', target: 'LAT' }, { type: 'vassalize', target: 'LIT' }, INF(2)], 2),
    ] }),
  E({ id: 'ww_bessarabia', tag: 'ROM', date: '1940-06-27', image: 'court', title: 'Ultimátum por Besarabia',
    condition: [exists('SOV'), owns('moldavia'), { type: 'flag', tag: 'GER', flag: 'mr_pact', value: true }],
    text: 'Moscú exige Besarabia en veinticuatro horas. Berlín aconseja ceder.',
    options: [
      opt('Ceder Besarabia', [{ type: 'cede', from: 'ROM', to: 'SOV', provinces: ['moldavia'] }, DIS(10), NU(-5), REL('GER', 20)], 8),
      opt('Resistir', [{ type: 'declareWar', tag: 'SOV', target: 'ROM', goal: 'moldavia' }, NU(10)], 2, 'Solos frente al Ejército Rojo.'),
    ] }),
  E({ id: 'ww_vienna_award', tag: 'ROM', date: '1940-08-30', image: 'court', title: 'El arbitraje de Viena',
    condition: [exists('HUN'), exists('GER'), owns('transylvania')],
    text: 'Alemania e Italia «arbitran» la disputa con Hungría: el norte de Transilvania debe pasar a Budapest.',
    options: [
      opt('Aceptar el arbitraje', [{ type: 'cede', from: 'ROM', to: 'HUN', provinces: ['transylvania'] }, REL('GER', 30), DIS(15)], 8, 'El rey abdicará y el país quedará en manos de los militares.'),
      opt('Rechazarlo', [REL('GER', -60), REL('HUN', -50), NU(5)], 2),
    ] }),
  tripartite('ww_tripartite_hun', 'HUN', '1940-11-20'),
  tripartite('ww_tripartite_rom', 'ROM', '1940-11-23', [OIL(-300), OIL(300, 'GER')]),
  tripartite('ww_tripartite_bul', 'BUL', '1941-03-01'),
  E({ id: 'ww_yug_coup', tag: 'YUG', date: '1941-03-27', image: 'revolt', title: 'Golpe en Belgrado', condition: [exists('GER')],
    text: 'El regente ha firmado el Pacto Tripartito. En Belgrado, oficiales de aviación preparan un golpe y la calle grita «mejor la guerra que el pacto».',
    options: [
      opt('Dejar que triunfe el golpe', [REL('ENG', 40), REL('GER', -80), NU(5), TR('ww_yug_punish', 7, 'GER'), CH('Un golpe militar en Belgrado anula la adhesión al Eje.')], 7),
      opt('Mantener el pacto', [{ type: 'joinFaction', faction: 'axis' }, DIS(20)], 3),
    ] }),
  T({ id: 'ww_yug_punish', tag: 'GER', image: 'war', title: 'La afrenta de Belgrado', condition: [exists('YUG')],
    text: 'Yugoslavia ha roto el pacto. Una campaña en los Balcanes retrasaría la ofensiva del este; no hacer nada dejaría el flanco sur abierto.',
    options: [
      opt('Invadir Yugoslavia', [{ type: 'declareWar', target: 'YUG', goal: 'serbia' }], 8),
      opt('No desviarse del objetivo principal', [PR(-15)], 2),
    ] }),
  // --- El frente del este
  E({ id: 'ww_warnings', tag: 'SOV', date: '1941-06-10', image: 'court', title: 'Advertencias de invasión',
    condition: [exists('GER'), { type: 'flag', tag: 'GER', flag: 'mr_pact', value: true }],
    text: 'Espías, desertores y gobiernos extranjeros avisan de que Alemania atacará en días. Movilizar podría servir de pretexto a Berlín.',
    options: [
      opt('Descartarlo como una provocación', [REL('GER', 20)], 7, 'Lo que ocurrió: el ataque sorprendió a las tropas en sus cuarteles.'),
      opt('Alertar a los distritos fronterizos', [CMB(0.08), MP(100000), REL('GER', -40), DIS(2)], 3),
    ] }),
  E({ id: 'ww_evacuation', tag: 'SOV', date: '1941-07-04', image: 'disaster', title: 'Evacuar las fábricas', condition: [war('GER')],
    text: 'El avance alemán amenaza las industrias de Ucrania y del oeste. Desmontarlas y llevarlas en tren al Ural y Siberia paralizaría la producción durante meses.',
    note: 'Entre 1941 y 1942 se trasladaron hacia el este unas 1 500 empresas y millones de trabajadores.',
    options: [
      opt('Evacuar hacia el Ural', [IC(6), SUP(-1500), DIS(5), CH('Trenes cargados de maquinaria parten hacia el Ural.')], 9),
      opt('Producir hasta el último momento', [SUP(1000), MP(-50000)], 1),
    ] }),
  E({ id: 'ww_winter', tag: 'GER', date: '1941-12-05', image: 'disaster', title: 'El invierno ruso', condition: [war('SOV')],
    text: 'A cuarenta grados bajo cero los motores no arrancan y los soldados no tienen ropa de invierno. Los generales piden replegarse a posiciones defendibles.',
    options: [
      opt('Ni un paso atrás', [MP(-150000), SUP(-1500), NU(3)], 6, 'Conserva el terreno a un coste enorme.'),
      opt('Acortar el frente', [PR(-20), DIS(3), SUP(500), CMB(0.03)], 4),
    ] }),
  E({ id: 'ww_moscow_counter', tag: 'SOV', date: '1941-12-05', image: 'war', title: 'Contraofensiva ante Moscú', condition: [war('GER'), owns('moscow')],
    text: 'Divisiones frescas de Siberia llegan a la capital. El enemigo está agotado y congelado a pocos kilómetros del Kremlin.',
    note: 'La ocupación alemana del oeste soviético estuvo acompañada desde el primer día de asesinatos masivos de civiles, en especial de la población judía, y de la muerte de millones de prisioneros.',
    options: [
      opt('Lanzar las reservas siberianas', [{ type: 'spawnArmy', province: 'moscow', units: { infantry: 6, cavalry: 2 } }, MP(-90000), PR(30), CH('El Ejército Rojo contraataca ante Moscú.')], 8),
      opt('Consolidar la defensa', [CMB(0.05), SUP(800)], 2),
    ] }),
  // --- Estados Unidos y el Atlántico
  E({ id: 'ww_lendlease', tag: 'USA', date: '1941-03-11', image: 'prosperity', title: 'Préstamo y Arriendo', condition: [war('GER', 'ENG')],
    text: 'Gran Bretaña ya no puede pagar al contado. La Casa Blanca propone prestar el material y cobrar después, como quien presta una manguera al vecino cuya casa arde.',
    options: [
      opt('Aprobar la ley', [SUP(3000, 'ENG'), OIL(1500, 'ENG'), IC(2), REL('ENG', 40), REL('GER', -40), FL('lendlease'), CH('El Congreso aprueba la ley de Préstamo y Arriendo.')], 8),
      opt('Mantener el pago al contado', [REL('ENG', 10), DIS(-3)], 2),
    ] }),
  E({ id: 'ww_lendlease_sov', tag: 'USA', date: '1941-10-01', image: 'prosperity', title: 'Ayuda a la URSS',
    condition: [war('GER', 'SOV'), { type: 'flag', flag: 'lendlease', value: true }],
    text: 'Moscú resiste contra todo pronóstico. Extender el préstamo y arriendo a la Unión Soviética exigiría convoyes por el Ártico y por Persia.',
    options: [
      opt('Extender la ayuda', [SUP(2500, 'SOV'), OIL(1000, 'SOV'), REL('SOV', 40), DIS(3), CH('Los primeros convoyes con ayuda estadounidense parten hacia Múrmansk.')], 8),
      opt('Reservar el material para Gran Bretaña', [SUP(1000, 'ENG'), REL('SOV', -20)], 2),
    ] }),
  E({ id: 'ww_atlantic_charter', tag: 'ENG', date: '1941-08-14', image: 'peace', title: 'La Carta del Atlántico', condition: [exists('USA'), war('GER')],
    text: 'A bordo de un buque de guerra frente a Terranova, Washington propone principios comunes para la posguerra, incluido el derecho de los pueblos a elegir su gobierno.',
    options: [
      opt('Firmar sin reservas', [REL('USA', 50), PR(15), { type: 'unrest', province: 'jerusalem', amount: 2 }], 6, 'Un compromiso que también leerán en el Imperio.'),
      opt('Firmar con reservas sobre el Imperio', [REL('USA', 15), PR(5)], 4),
    ] }),
  E({ id: 'ww_pearl_harbor', tag: 'USA', date: '1941-12-07', image: 'disaster', title: 'Pearl Harbor', condition: [exists('GER')],
    text: 'Aviones japoneses han atacado por sorpresa la flota del Pacífico en Hawái. El país entero exige respuesta, y Berlín podría declararnos la guerra en días.',
    note: 'El ataque del 7 de diciembre de 1941 causó 2 403 muertos. Alemania e Italia declararon la guerra a Estados Unidos el 11 de diciembre.',
    options: [
      opt('Alemania primero', [X('navy', -3), NU(10), DIS(-10), REL('ENG', 30), FL('germany_first'), CH('Tras Pearl Harbor, Washington decide derrotar primero a Alemania.')], 8, 'La estrategia acordada con Londres.'),
      opt('Volcarse en el Pacífico', [X('navy', -3), NU(10), DIS(-10), MP(-200000), FL('pacific_first')], 2, 'Menos fuerzas para Europa.'),
    ] }),
  E({ id: 'ww_arsenal', tag: 'USA', date: '1942-01-15', image: 'prosperity', title: 'El arsenal de la democracia', condition: [war('GER')],
    text: 'La Junta de Producción de Guerra puede prohibir la fabricación de coches civiles y convertir cada cadena de montaje en una línea de tanques y aviones.',
    options: [
      opt('Conversión total', [IC(8), DIS(3), SUP(2000, 'ENG'), CH('Las fábricas de Detroit dejan de producir coches para fabricar tanques y bombarderos.')], 8),
      opt('Conversión gradual', [IC(4), DIS(-3)], 2),
    ] }),
  // --- África y el Mediterráneo
  E({ id: 'ww_alamein', tag: 'ENG', date: '1942-10-23', image: 'war', title: 'El Alamein', condition: [war('ITA')],
    text: 'El 8.º Ejército ha acumulado tanques y cañones frente a la línea enemiga en Egipto. El nuevo comandante quiere una batalla metódica; Londres, una victoria rápida.',
    options: [
      opt('Una ofensiva metódica', [MP(-60000), SUP(-1500), PR(40), NU(3), TR('ww_africa_lost', 20, 'ITA'), CH('El 8.º Ejército rompe el frente en El Alamein.')], 8),
      opt('Esperar más refuerzos', [SUP(1000), PR(-10)], 2),
    ] }),
  T({ id: 'ww_africa_lost', tag: 'ITA', image: 'disaster', title: 'Retirada en el desierto', condition: [war('ENG')],
    text: 'Tras El Alamein, las divisiones italianas, sin camiones ni gasolina, quedan atrás mientras el aliado alemán se repliega.',
    options: [
      opt('Sacrificar la retaguardia para salvar el grueso', [MP(-40000), PR(-20), DIS(6)], 6),
      opt('Pedir a Berlín más combustible y aviones', [REL('GER', -10), OIL(400), DIS(3)], 4),
    ] }),
  E({ id: 'ww_torch', tag: 'USA', date: '1942-11-08', image: 'war', title: 'Operación Antorcha', condition: [war('GER')],
    text: 'Los británicos proponen desembarcar en el norte de África este mismo año. Los generales estadounidenses prefieren reservarlo todo para cruzar el Canal cuanto antes.',
    options: [
      opt('Desembarcar en el norte de África', [MP(-50000), PR(20), REL('ENG', 20), CMB(0.05), CH('Tropas estadounidenses desembarcan en Marruecos y Argelia.')], 7, 'Experiencia de combate para un ejército novato.'),
      opt('Preparar el desembarco en Francia', [FL('early_overlord'), REL('SOV', 30), REL('ENG', -20), SUP(1500)], 3),
    ] }),
  E({ id: 'ww_stalingrad', tag: 'SOV', date: '1942-11-19', image: 'war', title: 'Operación Urano', condition: [war('GER'), owns('tsaritsyn')],
    text: 'El 6.º Ejército alemán está atascado en las ruinas de Stalingrado. Sus flancos los cubren tropas rumanas mal equipadas.',
    options: [
      opt('Cerrar la tenaza', [MP(-200000), SUP(-2000), CMB(0.1), PR(50), TR('ww_sixth_army', 15, 'GER'), CH('Dos frentes soviéticos se encuentran en Kalach: el 6.º Ejército alemán queda cercado.')], 8),
      opt('Defender solo la ciudad', [MP(-100000), NU(5)], 2),
    ] }),
  T({ id: 'ww_sixth_army', tag: 'GER', image: 'disaster', title: 'El 6.º Ejército cercado', condition: [war('SOV')],
    text: 'Trescientos mil hombres están rodeados en Stalingrado. Su comandante pide permiso para romper el cerco; la Luftwaffe promete abastecerlos por el aire.',
    options: [
      opt('Romper el cerco ahora', [MP(-100000), PR(-20), DIS(3)], 4, 'Se salva una parte, se reconoce la derrota.'),
      opt('Resistir y abastecer por el aire', [MP(-250000), X('bombers', -2), PR(-40), DIS(6), NU(-5), CH('El 6.º Ejército capitula en Stalingrado.')], 6, 'Lo que ocurrió: el puente aéreo fracasó.'),
    ] }),
  E({ id: 'ww_kursk', tag: 'GER', date: '1943-07-05', image: 'war', title: 'El saliente de Kursk', condition: [war('SOV')],
    text: 'Un gran saliente soviético se adentra en nuestras líneas. Atacarlo con los nuevos tanques pesados podría devolvernos la iniciativa, si el enemigo no lo ha fortificado ya.',
    options: [
      opt('Operación Ciudadela', [MP(-150000), OIL(-800), PR(10)], 6),
      opt('Defensa elástica', [SUP(1000), CMB(0.05), PR(-10)], 4, 'Desgastar al enemigo cuando ataque.'),
    ] }),
  E({ id: 'ww_husky', tag: 'ENG', date: '1943-07-10', image: 'war', condition: [war('ITA'), owns('sicilia', 'ITA')], title: 'Desembarco en Sicilia',
    text: 'Con el norte de África despejado, el siguiente paso puede ser Sicilia y la península, el «bajo vientre» del Eje.',
    options: [
      opt('Desembarcar en Sicilia', [{ type: 'spawnArmy', province: 'sicilia', units: { infantry: 6, armor: 1 } }, MP(-70000), SUP(-1000), CH('Fuerzas aliadas desembarcan en Sicilia.')], 7),
      opt('Reservar las fuerzas para Francia', [SUP(1500), REL('SOV', 10)], 3),
    ] }),
  E({ id: 'ww_grand_council', tag: 'ITA', date: '1943-07-25', image: 'revolt', title: 'El Gran Consejo', condition: [war('ENG'), war('USA')],
    text: 'Las ciudades están bombardeadas y los aliados en suelo nacional. El Gran Consejo del fascismo vota contra el Duce y el rey busca una salida.',
    options: [
      opt('Destituir al Duce y negociar en secreto', [{ type: 'government', value: 'authoritarian' }, NU(-25), REL('ENG', 40), REL('USA', 40), REL('GER', -60), DIS(-5), FL('ita_armistice'), CH('El rey destituye a Mussolini; Italia negocia en secreto con los aliados.')], 5),
      opt('Seguir la guerra junto a Alemania', [DIS(12), CMB(-0.05), REL('GER', 10)], 5),
    ] }),
  E({ id: 'ww_tehran', tag: 'ENG', date: '1943-11-28', image: 'peace', title: 'La conferencia de Teherán', condition: [war('GER'), { type: 'allied', other: 'USA' }],
    text: 'Por primera vez se reúnen los tres grandes. Moscú exige un segundo frente en Francia; Londres sigue prefiriendo el Mediterráneo y los Balcanes.',
    options: [
      opt('Comprometerse con el desembarco en Francia', [REL('SOV', 40), REL('USA', 20), FL('tehran'), CH('En Teherán, los aliados fijan el desembarco en Francia para la primavera de 1944.')], 8),
      opt('Defender la estrategia mediterránea', [REL('SOV', -30), REL('USA', -10), PR(10)], 2),
    ] }),
  E({ id: 'ww_overlord', tag: 'USA', date: '1944-06-06', image: 'war', title: 'El Día D', condition: [war('GER'), owns('normandie', 'GER')],
    text: 'La mayor flota de desembarco de la historia espera una pausa en el temporal. El meteorólogo promete un día aceptable.',
    note: 'El 6 de junio de 1944 desembarcaron en Normandía unos 156 000 soldados aliados.',
    options: [
      opt('Desembarcar en Normandía', [{ type: 'spawnArmy', province: 'normandie', units: { infantry: 8, armor: 2, motorized: 2 } }, MP(-150000), SUP(-3000), PR(50), TR('ww_dday_response', 2, 'GER'), CH('Tropas aliadas desembarcan en las playas de Normandía.')], 9),
      opt('Esperar a un tiempo mejor', [PR(-10), REL('SOV', -20)], 1),
    ] }),
  T({ id: 'ww_dday_response', tag: 'GER', image: 'disaster', title: 'Desembarco en Normandía', condition: [war('USA')],
    text: 'Los aliados han desembarcado en Normandía. ¿Es el ataque principal o una maniobra de distracción antes del verdadero golpe en Calais?',
    options: [
      opt('Lanzar los blindados de reserva ya', [OIL(-600), CMB(0.03)], 4),
      opt('Esperar el desembarco «real» en Calais', [CMB(-0.05), PR(-10)], 6, 'Lo que ocurrió: el engaño aliado funcionó.'),
    ] }),
  E({ id: 'ww_bagration', tag: 'SOV', date: '1944-06-22', image: 'war', title: 'Operación Bagratión', condition: [war('GER'), owns('moscow')],
    text: 'Tres años después de la invasión, el Ejército Rojo puede golpear en Bielorrusia, donde el enemigo menos lo espera.',
    options: [
      opt('Ofensiva en Bielorrusia', [{ type: 'spawnArmy', province: 'smolensk', units: { infantry: 8, armor: 3 } }, MP(-200000), SUP(-2000), PR(40), CH('El Grupo de Ejércitos Centro alemán se derrumba en Bielorrusia.')], 8),
      opt('Ofensiva prudente en el sur', [MP(-80000), PR(10)], 2),
    ] }),
];

/** Latest year in which a dated event still makes sense: avoids Dunkirk firing in 1943 when a war starts late. */
const UNTIL: Record<string, number> = {
  s36_rhineland: 1936, s36_four_year: 1937, s36_spain_ger: 1937, s36_spain_ita: 1937, s36_spain_sov: 1937, s36_blum_spain: 1937, s36_nonintervention: 1937,
  s36_front_populaire: 1936, s36_ita_sanctions: 1936, s36_anticomintern: 1937, s36_usa_neutrality: 1938, s36_usa_vinson: 1939, s36_sov_fiveyear: 1937,
  s36_abdication: 1937, s36_munich_eng: 1938, s36_munich_fra: 1938, s36_pol_cop: 1938, s36_pol_balance: 1939, s36_danzig_crisis: 1939, s36_pact_steel: 1939,
  ww_enigma: 1939, ww_pol_mobilize: 1939, ww_westerplatte: 1939, ww_bzura: 1939, ww_pol_exile: 1940, ww_saar: 1939, ww_bef: 1940, ww_fin_defense: 1940,
  ww_winter_lessons: 1941, ww_churchill: 1940, ww_sedan: 1940, ww_dunkirk: 1940, ww_mers_el_kebir: 1941, ww_battle_britain: 1941, ww_blitz: 1941,
  ww_ita_nonbelligerence: 1940, ww_baltic: 1941, ww_bessarabia: 1941, ww_vienna_award: 1941, ww_tripartite_hun: 1941, ww_tripartite_rom: 1941,
  ww_tripartite_bul: 1942, ww_yug_coup: 1941, ww_warnings: 1941, ww_evacuation: 1942, ww_winter: 1942, ww_moscow_counter: 1942, ww_lendlease: 1942,
  ww_lendlease_sov: 1943, ww_atlantic_charter: 1942, ww_arsenal: 1943, ww_alamein: 1943, ww_torch: 1943, ww_stalingrad: 1943, ww_kursk: 1943,
  ww_husky: 1944, ww_grand_council: 1944, ww_tehran: 1944, ww_overlord: 1945, ww_bagration: 1945,
  s39_enigma: 1939, s39_last_hours: 1939, s39_ger_war_economy: 1940, s39_sov_border: 1939,
};
const timed = (evs: GameEvent[]): GameEvent[] => evs.map((e) => (UNTIL[e.id] ? { ...e, condition: [...(e.condition ?? []), { type: 'maxYear', value: UNTIL[e.id] }] } : e));

// ------------------------------------------------------------------ misiones
const M = (id: string, tag: string, col: number, icon: string, title: string, text: string, conditions: Condition[], rewards: Effect[], requires?: string[]): Mission =>
  ({ id, tag, col, icon, title, text, conditions, rewards, ...(requires ? { requires } : {}) });

function gerTree(p: string, early: boolean): Mission[] {
  const t = 'GER';
  const id = (k: string) => `${p}_ger_${k}`;
  const out: Mission[] = [
    M(id('rearm'), t, 0, 'prosperity', 'Economía de rearme', 'Llevar la capacidad industrial al nivel que exige una guerra continental.',
      [minX('ic', early ? 95 : 115)], [IC(2), DIS(-3), CH('La industria alemana alcanza su objetivo de rearme.')]),
    M(id('luftwaffe'), t, 0, 'war', 'Dominio del aire', 'Una aviación con cazas y bombarderos suficientes para dominar el cielo de cualquier frente.',
      [minX('fighters', 14), minX('bombers', 10)], [TECH('air', 1), PR(30)], [id('rearm')]),
  ];
  if (early) {
    out.push(
      M(id('anschluss'), t, 1, 'court', 'Unión con Austria', 'Incorporar Austria al Reich.', [owns('austria')], [MP(100000), PR(30), CH('Austria queda incorporada al Reich.')]),
      M(id('sudetes'), t, 1, 'court', 'Las fábricas de Bohemia', 'Hacerse con Bohemia y sus fábricas de armamento.', [owns('bohemia')], [IC(2), X('stock_metal', 600), PR(20)], [id('anschluss')]),
      M(id('danzig'), t, 1, 'war', 'Danzig', 'Recuperar la ciudad libre de Danzig.', [owns('danzig')], [PR(40), MP(50000)], [id('sudetes')]),
    );
  } else {
    out.push(
      M(id('poland'), t, 1, 'war', 'Campaña de Polonia', 'Ocupar Danzig y la mayor parte de Polonia antes de que el oeste reaccione.', [owns('danzig'), { type: 'ownsCount', provinces: ['wielkopolska', 'mazovia', 'malopolska'], count: 2 }], [MP(150000), PR(40), CH('La campaña de Polonia ha terminado.')]),
      M(id('norway'), t, 1, 'war', 'La ruta del hierro', 'Asegurar las costas noruegas y el hierro sueco que pasa por ellas.', [owns('oslo')], [X('stock_metal', 1000), X('subs', 2)], [id('poland')]),
    );
  }
  out.push(
    M(id('lowlands'), t, 2, 'war', 'Los Países Bajos', 'Ocupar Bélgica o los Países Bajos para flanquear la Línea Maginot.', [{ type: 'ownsCount', provinces: ['brabant', 'flandre', 'holland'], count: 1 }], [PR(30), SUP(1000)]),
    M(id('paris'), t, 2, 'war', 'Derrotar a Francia', 'Imponer la paz a Francia y dominar su norte industrial.', [{ type: 'ownsCount', provinces: ['ile_de_france', 'picardie', 'champagne', 'lorraine'], count: 2 }], [PR(80), NU(5), IC(3), CH('Francia ha sido derrotada.')], [id('lowlands')]),
    M(id('britain'), t, 2, 'war', 'Doblegar a Gran Bretaña', 'Poner pie en las islas británicas.', [{ type: 'ownsCount', provinces: ['london', 'wessex', 'east_anglia', 'cornwall'], count: 1 }], [PR(150), CH('Las islas británicas ya no son inexpugnables.')], [id('paris')]),
    M(id('oil'), t, 3, 'prosperity', 'Petróleo', 'Ningún ejército mecanizado avanza sin combustible: asegurar un gran yacimiento.', [{ type: 'ownsCount', provinces: ['wallachia', 'azerbaijan', 'kuban', 'samara'], count: 1 }], [OIL(2000), PR(20)]),
  );
  if (!early) out.push(M(id('east'), t, 3, 'war', 'El gran frente del este', 'Tomar al menos dos de las grandes ciudades soviéticas: Moscú, Leningrado y Kiev.', [{ type: 'ownsCount', provinces: ['moscow', 'ingria', 'kiev'], count: 2 }], [PR(150), CH('Las grandes ciudades soviéticas caen una tras otra.')], [id('oil')]));
  else out.push(M(id('axis'), t, 3, 'peace', 'El Eje Roma-Berlín', 'Atraer a Italia a nuestro bloque.', [{ type: 'allied', other: 'ITA' }], [PR(20), REL('ITA', 30)]));
  return out;
}

function engTree(p: string): Mission[] {
  const t = 'ENG';
  const id = (k: string) => `${p}_eng_${k}`;
  return [
    M(id('shadow'), t, 0, 'prosperity', 'Fábricas en la sombra', 'Preparar la industria civil para fabricar aviones y motores en cuanto empiece la guerra.', [minX('ic', 75)], [IC(2), CH('Las fábricas «en la sombra» empiezan a producir.')]),
    M(id('radar'), t, 0, 'explore', 'La cadena de radares', 'Un Mando de Caza con escuadrillas modernas y una red de radares en la costa.', [minX('fighters', 12)], [TECH('air', 1), NU(3)], [id('shadow')]),
    M(id('fleet'), t, 1, 'explore', 'La Home Fleet', 'Mantener una flota capaz de dominar el mar del Norte y el Atlántico.', [minX('navy', 18)], [TECH('naval', 1), PR(20)]),
    M(id('atlantic'), t, 1, 'prosperity', 'Ganar el Atlántico', 'Que los convoyes lleguen: acumular reservas pese a los submarinos.', [year(1941), minX('stock_supplies', 10000)], [SUP(2000), OIL(800)], [id('fleet')]),
    M(id('alone'), t, 2, 'war', 'Resistir solos', 'Seguir en guerra y conservar Londres hasta 1941.', [year(1941), owns('london'), { type: 'atWar', value: true }], [NU(5), PR(60), CH('Gran Bretaña resiste.')]),
    M(id('suez'), t, 2, 'war', 'Defender Oriente Medio', 'Conservar Palestina y Chipre, la llave de Suez, hasta 1942.', [year(1942), { type: 'ownsAll', provinces: ['jerusalem', 'acre', 'cyprus'] }], [MP(80000), PR(30)], [id('alone')]),
    M(id('usa'), t, 3, 'peace', 'La relación especial', 'Tener a Estados Unidos en el mismo bloque.', [{ type: 'allied', other: 'USA' }], [SUP(2500), PR(30), CH('Estados Unidos y Gran Bretaña combaten codo con codo.')]),
    M(id('france'), t, 3, 'war', 'Francia en pie', 'En 1944, con la guerra aún en curso, que París esté en manos francesas.', [year(1944), war('GER'), owns('ile_de_france', 'FRA')], [PR(60), REL('FRA', 40)], [id('usa')]),
    M(id('victory'), t, 3, 'war', 'La derrota de Alemania', 'Que Berlín deje de estar en manos del régimen alemán.', [year(1943), { type: 'notOwns', tag: 'GER', province: 'brandenburg' }], [PR(200), DIS(-10), CH('La guerra en Europa ha terminado.')], [id('france')]),
  ];
}

function fraTree(p: string): Mission[] {
  const t = 'FRA';
  const id = (k: string) => `${p}_fra_${k}`;
  return [
    M(id('industry'), t, 0, 'prosperity', 'Nacionalizar el armamento', 'Llevar la industria a un nivel capaz de sostener una guerra larga.', [minX('ic', 52)], [IC(2), DIS(-2)]),
    M(id('tanks'), t, 0, 'war', 'Divisiones acorazadas', 'Reservas suficientes para formar divisiones blindadas modernas.', [minX('stock_supplies', 6000)], [TECH('armor', 1), CH('Francia forma sus primeras divisiones acorazadas.')], [id('industry')]),
    M(id('entente'), t, 1, 'peace', 'La Entente', 'Mantener la alianza con Gran Bretaña.', [{ type: 'allied', other: 'ENG' }], [PR(15), REL('ENG', 20)]),
    M(id('east'), t, 1, 'peace', 'Aliados en el este', 'Contar con Polonia para obligar a Alemania a luchar en dos frentes.', [{ type: 'allied', other: 'POL' }], [PR(20), REL('POL', 30)], [id('entente')]),
    M(id('paris'), t, 2, 'war', 'Tenir', 'Seguir en guerra en 1941 sin haber perdido París.', [year(1941), owns('ile_de_france'), { type: 'atWar', value: true }], [NU(8), PR(80), CH('París resiste.')]),
    M(id('empire'), t, 2, 'explore', 'El Imperio', 'Conservar el norte de África hasta 1942.', [year(1942), { type: 'ownsAll', provinces: ['algiers', 'oran', 'tunis', 'fez'] }], [MP(60000), PR(20)], [id('paris')]),
    M(id('usa'), t, 3, 'peace', 'El Nuevo Mundo', 'Atraer a Estados Unidos al bloque aliado.', [{ type: 'allied', other: 'USA' }], [SUP(2000), IC(1)]),
    M(id('rhine'), t, 3, 'war', 'Al otro lado del Rin', 'Ocupar Renania o el Ruhr.', [{ type: 'ownsCount', provinces: ['rhineland', 'westfalen'], count: 1 }], [PR(120), X('stock_energy', 1500), CH('Las tropas francesas ocupan la orilla izquierda del Rin.')], [id('entente')]),
  ];
}

function sovTree(p: string): Mission[] {
  const t = 'SOV';
  const id = (k: string) => `${p}_sov_${k}`;
  return [
    M(id('plan'), t, 0, 'prosperity', 'Cumplir el plan', 'Superar los objetivos industriales del plan quinquenal.', [minX('ic', 95)], [IC(3), CH('El plan quinquenal se da por cumplido antes de plazo.')]),
    M(id('ural'), t, 0, 'prosperity', 'La industria del Ural', 'Una base industrial fuera del alcance de cualquier invasor.', [minX('ic', 120), owns('ural')], [TECH('industry', 1), IC(2)], [id('plan')]),
    M(id('baltic'), t, 1, 'court', 'El glacis báltico', 'Controlar al menos dos de las costas bálticas.', [{ type: 'ownsCount', provinces: ['estonia', 'livonia', 'courland', 'lithuania'], count: 2 }], [MP(80000), PR(30)]),
    M(id('bessarabia'), t, 1, 'court', 'Besarabia', 'Recuperar Besarabia.', [owns('moldavia')], [PR(20), MP(40000)]),
    M(id('finland'), t, 1, 'war', 'La frontera de Leningrado', 'Alejar la frontera de Leningrado ocupando Finlandia.', [owns('finland')], [PR(40), CMB(0.05)], [id('baltic')]),
    M(id('moscow'), t, 2, 'war', 'Moscú no caerá', 'Conservar Moscú y Leningrado en guerra con Alemania hasta 1942.', [year(1942), war('GER'), { type: 'ownsAll', provinces: ['moscow', 'ingria'] }], [NU(5), CMB(0.1), CH('Moscú y Leningrado resisten.')]),
    M(id('volga'), t, 2, 'war', 'El Volga', 'Conservar Stalingrado en 1943 sin haber salido de la guerra.', [year(1943), war('GER'), owns('tsaritsyn')], [PR(100), MP(150000)], [id('moscow')]),
    M(id('berlin'), t, 2, 'war', 'Berlín', 'Llevar la guerra hasta la capital enemiga.', [owns('brandenburg')], [PR(250), CH('La bandera roja ondea sobre Berlín.')], [id('volga')]),
    M(id('victory'), t, 3, 'war', 'Primera victoria', 'Ganar una guerra.', [{ type: 'warsWon', value: 1 }], [PR(40), MP(60000)]),
  ];
}

function itaTree(p: string, early: boolean): Mission[] {
  const t = 'ITA';
  const id = (k: string) => `${p}_ita_${k}`;
  const out: Mission[] = [
    M(id('autarchia'), t, 0, 'prosperity', 'Autarquía', 'Una industria capaz de equipar al ejército sin depender del exterior.', [minX('ic', 45)], [IC(2), DIS(-2)]),
    M(id('navy'), t, 0, 'explore', 'Mare Nostrum', 'Una flota capaz de disputar el Mediterráneo a la Royal Navy.', [minX('navy', 12)], [TECH('naval', 1), PR(20)], [id('autarchia')]),
  ];
  if (early) out.push(M(id('albania'), t, 1, 'court', 'Albania', 'Asegurar la otra orilla del Adriático.', [owns('albania')], [MP(30000), PR(15)]));
  out.push(
    M(id('nice'), t, 1, 'war', 'Niza y Córcega', 'Recuperar territorio de Francia.', [{ type: 'ownsCount', provinces: ['provence', 'corsica'], count: 1 }], [PR(40), MP(30000)], early ? [id('albania')] : undefined),
    M(id('tunis'), t, 1, 'war', 'Túnez', 'Completar el dominio del Mediterráneo central.', [owns('tunis')], [PR(30), SUP(800)], [id('nice')]),
    M(id('egypt'), t, 2, 'war', 'Hacia el Nilo', 'Tomar Alejandría o El Cairo.', [{ type: 'ownsCount', provinces: ['alexandria', 'cairo'], count: 1 }], [PR(100), CH('Las tropas italianas entran en Egipto.')]),
    M(id('suez'), t, 2, 'war', 'El canal de Suez', 'Cortar la arteria del Imperio británico.', [owns('sinai')], [PR(80), OIL(1000)], [id('egypt')]),
    M(id('axis'), t, 3, 'peace', 'El Eje', 'Estar en el mismo bloque que Alemania.', [{ type: 'allied', other: 'GER' }], [PR(15), REL('GER', 30)]),
    M(id('balkans'), t, 3, 'war', 'Los Balcanes', 'Dominar al menos dos provincias de Grecia o Yugoslavia.', [{ type: 'ownsCount', provinces: ['dalmatia', 'croatia', 'thessaly', 'morea'], count: 2 }], [PR(60), MP(40000)], [id('axis')]),
  );
  return out;
}

function usaTree(p: string): Mission[] {
  const t = 'USA';
  const id = (k: string) => `${p}_usa_${k}`;
  return [
    M(id('newdeal'), t, 0, 'prosperity', 'Recuperación', 'Sacar a la industria de la Depresión.', [minX('ic', 65)], [IC(3), DIS(-3)]),
    M(id('arsenal'), t, 0, 'prosperity', 'El arsenal de la democracia', 'Una capacidad industrial sin rival en el mundo.', [minX('ic', 90)], [IC(4), TECH('industry', 1), CH('La industria estadounidense supera a la de todas las potencias del Eje juntas.')], [id('newdeal')]),
    M(id('liberty'), t, 0, 'prosperity', 'Barcos Liberty', 'Acumular reservas suficientes para abastecer a los aliados.', [minX('stock_supplies', 20000)], [SUP(3000, 'ENG'), PR(30)], [id('arsenal')]),
    M(id('two_oceans'), t, 1, 'explore', 'Una armada para dos océanos', 'Una flota capaz de operar a la vez en el Atlántico y el Pacífico.', [minX('navy', 18)], [TECH('naval', 1)]),
    M(id('air'), t, 1, 'war', 'Bombarderos estratégicos', 'Una fuerza aérea capaz de golpear la industria enemiga.', [minX('bombers', 10)], [TECH('air', 1)], [id('two_oceans')]),
    M(id('allies'), t, 2, 'peace', 'Las Naciones Unidas', 'Entrar en el bloque aliado.', [{ type: 'allied', other: 'ENG' }], [PR(30), MP(150000)]),
    M(id('europe'), t, 2, 'war', 'Rumbo a Europa', 'Estar en guerra con Alemania.', [war('GER')], [MP(200000), DIS(-5)], [id('allies')]),
    M(id('victory'), t, 2, 'war', 'Rendición incondicional', 'Que Berlín deje de estar en manos del régimen alemán.', [year(1943), { type: 'notOwns', tag: 'GER', province: 'brandenburg' }], [PR(200), CH('Alemania se rinde sin condiciones.')], [id('europe')]),
  ];
}

function polTree(p: string, late: boolean): Mission[] {
  const t = 'POL';
  const id = (k: string) => `${p}_pol_${k}`;
  const out: Mission[] = [
    M(id('cop'), t, 0, 'prosperity', 'La Región Industrial Central', 'Levantar una industria propia lejos de las fronteras.', [minX('ic', 12)], [IC(2), CH('La Región Industrial Central produce sus primeras armas.')]),
    M(id('army'), t, 0, 'war', 'Modernizar el ejército', 'Reservas suficientes para equipar y motorizar a las divisiones.', [minX('stock_supplies', 3000)], [TECH('infantry', 1), MP(60000)], [id('cop')]),
    M(id('pilots'), t, 0, 'war', 'Las alas polacas', 'Una aviación digna de ese nombre.', [minX('fighters', 5)], [TECH('air', 1)], [id('army')]),
    M(id('danzig'), t, 1, 'court', 'Danzig sigue siendo polaca', 'Conservar Danzig y la salida al mar en 1940.', [year(1940), owns('danzig')], [NU(8), PR(40)]),
    M(id('free'), t, 1, 'war', 'Polonia libre', 'Conservar Varsovia hasta 1942.', [year(1942), owns('mazovia')], [PR(150), CH('Polonia sigue en pie.')], [id('danzig')]),
    M(id('france'), t, 2, 'peace', 'La alianza francesa', 'Contar con Francia como aliada.', [{ type: 'allied', other: 'FRA' }], [PR(15), REL('FRA', 20)]),
    M(id('britain'), t, 2, 'peace', 'La garantía británica', 'Contar con Gran Bretaña como aliada.', [{ type: 'allied', other: 'ENG' }], [X('fighters', 2), PR(15)], [id('france')]),
    M(id('prussia'), t, 3, 'war', 'Prusia Oriental', 'Eliminar el enclave alemán que amenaza el norte del país.', [owns('prussia')], [PR(100), MP(50000)]),
  ];
  if (late) out.push(M(id('exile'), t, 3, 'court', 'El gobierno en el exilio', 'Mantener vivo el Estado polaco desde el extranjero.', [{ type: 'flag', flag: 'pol_exile', value: true }], [REL('ENG', 30), REL('FRA', 30), PR(30)]));
  return out;
}

// ------------------------------------------------------------------ export
export const STORY: Record<string, { events: GameEvent[]; missions: Mission[] }> = {
  ww1936: {
    events: timed([...PREWAR, ...WAR]),
    missions: [...gerTree('m36', true), ...engTree('m36'), ...fraTree('m36'), ...sovTree('m36'), ...itaTree('m36', true), ...usaTree('m36'), ...polTree('m36', false)],
  },
  ww1939: {
    events: timed([...WAR.filter((e) => !['ww_enigma', 'ww_pol_mobilize'].includes(e.id)),
      // 1939 empieza con la invasión en marcha: los preparativos se resuelven al instante
      E({ id: 's39_enigma', tag: 'POL', date: '1939-08-31', image: 'explore', title: 'El secreto de Enigma', condition: [exists('ENG')],
        text: 'En julio, los criptólogos polacos revelaron a británicos y franceses cómo leer la máquina Enigma. Falta decidir cuánto entregar de lo que siguen descubriendo.',
        note: 'Los criptólogos polacos Rejewski, Różycki y Zygalski rompieron Enigma por primera vez a finales de 1932.',
        options: [
          opt('Entregarlo todo a Londres', [REL('ENG', 30), FL('enigma_shared'), TR('ww_bletchley', 180, 'ENG')], 9),
          opt('Reservar los últimos avances', [CMB(0.05)], 1),
        ] }),
      E({ id: 's39_last_hours', tag: 'POL', date: '1939-08-31', image: 'war', title: 'Las últimas horas de paz', condition: [exists('GER')],
        text: 'La movilización general, retrasada a petición de Londres y París, llega cuando las columnas alemanas ya están en la frontera.',
        options: [
          opt('Movilizar a todos los reservistas', [MP(150000), DIS(3), SUP(-300)], 7),
          opt('Concentrarse en defender la línea del Vístula', [CMB(0.05), PR(-10)], 3, 'Ceder terreno para ganar tiempo.'),
        ] }),
      E({ id: 's39_ger_war_economy', tag: 'GER', date: '1939-10-01', image: 'prosperity', title: 'Economía de guerra', condition: [war('ENG')],
        text: 'El bloqueo británico corta el caucho, el petróleo y los metales de ultramar. Hay que decidir si se convierte la economía civil o se confía en una guerra corta.',
        options: [
          opt('Confiar en una guerra corta', [DIS(-3), SUP(600)], 6, 'Lo que ocurrió hasta 1942.'),
          opt('Movilización industrial total', [IC(4), DIS(6), X('stock_metal', -400)], 4),
        ] }),
      E({ id: 's39_sov_border', tag: 'SOV', date: '1939-09-28', image: 'court', title: 'El tratado de fronteras', condition: [{ type: 'flag', tag: 'GER', flag: 'mr_pact', value: true }],
        text: 'Berlín y Moscú fijan la línea que divide Polonia. A cambio de Lituania, Alemania pide más trigo y petróleo soviéticos.',
        note: 'Ambos ocupantes persiguieron a las élites polacas; en la primavera de 1940 la NKVD asesinó a unos 22 000 oficiales y civiles polacos en Katyn y otros lugares.',
        options: [
          opt('Firmar y enviar materias primas', [OIL(-500), OIL(500, 'GER'), REL('GER', 30), { type: 'claim', provinces: ['lithuania'] }], 7),
          opt('Firmar, pero retrasar las entregas', [REL('GER', -20), { type: 'claim', provinces: ['lithuania'] }], 3),
        ] }),
    ]),
    missions: [...gerTree('m39', false), ...polTree('m39', true), ...engTree('m39'), ...fraTree('m39'), ...sovTree('m39'), ...itaTree('m39', false)],
  },
};

// ------------------------------------------------------------------ eventos dinámicos de situación
const P = (e: Omit<GameEvent, 'oneShot'>): GameEvent => ({ ...e, oneShot: false });

/** Situation-driven events that can happen to any realm of the era. */
export const POOL: GameEvent[] = [
  P({ id: 'ww2p_strikes', mtthMonths: 220, image: 'revolt', title: 'Oleada de huelgas', condition: [minX('dissent', 25)],
    text: 'Los obreros de varias fábricas paran contra jornadas interminables y salarios congelados.',
    options: [opt('Subir salarios', [DIS(-6), SUP(-400)], 6), opt('Militarizar las fábricas', [DIS(4), NU(-2)], 4, 'La producción sigue, el malestar crece.')] }),
  P({ id: 'ww2p_rationing', mtthMonths: 300, image: 'disaster', title: 'Cartillas de racionamiento', condition: [{ type: 'minWarMonths', value: 6 }],
    text: 'Faltan carne, azúcar y ropa. El ministerio propone un racionamiento estricto para garantizar el abastecimiento del ejército.',
    options: [opt('Racionamiento estricto', [DIS(3), SUP(600)], 6), opt('Proteger el consumo civil', [DIS(-3), SUP(-300)], 4)] }),
  P({ id: 'ww2p_black_market', mtthMonths: 300, image: 'revolt', title: 'Mercado negro', condition: [{ type: 'atWar', value: true }, minX('dissent', 15)],
    text: 'Los productos racionados reaparecen a precios desorbitados en trastiendas y estaciones.',
    options: [opt('Perseguir a los estraperlistas', [DIS(2), SUP(300)], 5), opt('Hacer la vista gorda', [DIS(-2), SUP(-300)], 5, 'Una válvula de escape que vacía los almacenes.')] }),
  P({ id: 'ww2p_fuel_crisis', mtthMonths: 260, image: 'disaster', title: 'Crisis de combustible',
    condition: [{ type: 'atWar', value: true }, { type: 'maxX', key: 'stock_oil', value: 150 }],
    text: 'Los depósitos de combustible están casi vacíos. Cada tonelada hay que comprarla, capturarla o fabricarla, y los blindados empiezan a quedarse parados.',
    options: [opt('Plantas de combustible sintético', [OIL(400), X('stock_energy', -600)], 5), opt('Restringir el uso civil', [OIL(250), DIS(3)], 5)] }),
  P({ id: 'ww2p_supply_crisis', mtthMonths: 200, image: 'disaster', title: 'Crisis de intendencia', condition: [{ type: 'atWar', value: true }, { type: 'maxX', key: 'stock_supplies', value: 300 }],
    text: 'Las divisiones del frente reciben media ración de munición y nada de recambios. Los jefes de intendencia piden medidas inmediatas.',
    options: [opt('Requisar la producción civil', [SUP(800), DIS(5)], 6, 'Suministros ya, a costa del consumo.'), opt('Reducir las operaciones ofensivas', [SUP(300), CMB(-0.03)], 4)] }),
  P({ id: 'ww2p_occupation', mtthMonths: 300, image: 'revolt', title: 'Bajo tutela extranjera', condition: [{ type: 'isVassal' }, { type: 'atWar', value: true }],
    text: 'La potencia protectora exige más trabajadores, más trigo y más soldados. En las ciudades crece una resistencia clandestina.',
    options: [opt('Cumplir las exigencias', [MP(-20000), SUP(-300), DIS(6)], 6), opt('Dar largas y proteger a la población', [DIS(-3), PR(-10)], 4, 'El protector no lo olvidará.')] }),
  P({ id: 'ww2p_spies', mtthMonths: 360, image: 'court', title: 'Una red de espionaje', condition: [{ type: 'atWar', value: true }],
    text: 'El contraespionaje ha descubierto a un grupo que pasaba información al enemigo.',
    options: [opt('Convertirlos en agentes dobles', [CMB(0.03)], 5, 'Engañar al enemigo con informes falsos.'), opt('Juzgarlos públicamente', [NU(2), DIS(-2)], 5)] }),
  P({ id: 'ww2p_science', mtthMonths: 400, image: 'explore', title: 'Un avance científico', condition: [minX('ic', 30), year(1937)],
    text: 'Un laboratorio pide fondos para llevar a la producción un descubrimiento prometedor.',
    options: [opt('Radar y radiocomunicaciones', [TECH('air', 1), SUP(-300)], 4), opt('Nuevas aleaciones para blindados', [TECH('armor', 1), SUP(-300)], 3), opt('Procesos industriales', [TECH('industry', 1), SUP(-300)], 3)] }),
  P({ id: 'ww2p_propaganda', mtthMonths: 300, image: 'faith', title: 'La guerra de la propaganda', condition: [{ type: 'atWar', value: true }, minX('dissent', 10)],
    text: 'Los noticiarios y la radio pueden sostener la moral. La cuestión es cuánto contar de la verdad.',
    options: [opt('Grandes actos y noticias de victorias', [DIS(-5), SUP(-200)], 5), opt('Hablar con franqueza de las dificultades', [NU(3), DIS(2)], 5, 'Menos euforia, más confianza a largo plazo.')] }),
  P({ id: 'ww2p_sabotage', mtthMonths: 360, image: 'disaster', title: 'Sabotaje ferroviario', condition: [{ type: 'atWar', value: true }, year(1941)],
    text: 'Una explosión ha cortado un nudo ferroviario clave. Los trenes de suministros acumulan días de retraso.',
    options: [opt('Reforzar la vigilancia de las vías', [MP(-15000)], 5), opt('Asumir las pérdidas', [SUP(-500)], 5)] }),
  P({ id: 'ww2p_weariness', mtthMonths: 260, image: 'revolt', title: 'Cansancio de la guerra', condition: [{ type: 'minWarMonths', value: 30 }, minX('dissent', 20)],
    text: 'Demasiados años de guerra. En las colas se habla más de la paz que de la victoria.',
    options: [opt('Prometer reformas tras la victoria', [DIS(-5), NU(-2)], 5), opt('Movilización total', [MP(50000), DIS(5)], 5)] }),
  P({ id: 'ww2p_convoy', mtthMonths: 300, image: 'prosperity', title: 'Un convoy aliado', condition: [{ type: 'atWar', value: true }, { type: 'minAllies', value: 1 }],
    text: 'Un aliado ofrece material si somos capaces de escoltar el convoy hasta nuestros puertos.',
    options: [opt('Escoltarlo con la flota', [SUP(700), OIL(200), X('subs', -1)], 5, 'Más carga a salvo, a costa de algún buque.'), opt('Que navegue sin escolta', [SUP(300)], 5)] }),
  P({ id: 'ww2p_refugees', mtthMonths: 320, image: 'disaster', title: 'Columnas de refugiados', condition: [{ type: 'atWar', value: true }, year(1940)],
    text: 'Miles de civiles huyen de los combates por las mismas carreteras que necesita el ejército.',
    options: [opt('Abrir albergues y desviar víveres', [SUP(-300), DIS(-2), PR(5)], 6), opt('Reservar las carreteras al tráfico militar', [DIS(3), CMB(0.02)], 4)] }),
  P({ id: 'ww2p_air_raid', mtthMonths: 220, image: 'disaster', title: 'Bombardeo de una ciudad industrial', condition: [{ type: 'atWar', value: true }, minX('bombed', 10)],
    text: 'Los bombarderos enemigos han alcanzado una gran ciudad industrial. Las fábricas arden y los obreros duermen en los refugios.',
    options: [opt('Dispersar la producción', [X('bombed', -6), IC(-1)], 5, 'Menos vulnerable, menos eficiente.'), opt('Reconstruir en el mismo sitio', [X('bombed', -3), SUP(-400), NU(2)], 5)] }),
  P({ id: 'ww2p_women_industry', mtthMonths: 360, image: 'prosperity', title: 'Mujeres en las fábricas', condition: [{ type: 'atWar', value: true }, year(1941)],
    text: 'Con millones de hombres en el frente, las fábricas necesitan brazos. Hay quien pide incorporar a las mujeres a gran escala.',
    options: [opt('Incorporación masiva', [MP(30000), IC(1), DIS(1)], 6, 'Libera hombres para el frente.'), opt('Mantener los papeles tradicionales', [DIS(-2)], 4)] }),
  P({ id: 'ww2p_surplus', mtthMonths: 240, image: 'prosperity', title: 'Almacenes rebosantes', condition: [minX('stock_supplies', 15000)],
    text: 'Los depósitos militares están llenos. Los responsables de la intendencia proponen dar salida a parte de las reservas.',
    options: [opt('Cambiarlas por materias primas', [SUP(-3000), X('stock_metal', 800), X('stock_rare', 400)], 5), opt('Repartirlas entre la población civil', [SUP(-2000), DIS(-4)], 3), opt('Conservarlas', [], 2)] }),
  P({ id: 'ww2p_pacifism', mtthMonths: 300, image: 'faith', title: 'El movimiento pacifista', condition: [{ type: 'atWar', value: false }, minX('dissent', 15), { type: 'maxYear', value: 1941 }],
    text: 'Manifestaciones multitudinarias piden que no se repita la carnicería de 1914.',
    options: [opt('Seguir con el rearme', [DIS(3), IC(1)], 5), opt('Recortar el gasto militar', [DIS(-4), SUP(-300)], 5)] }),
  P({ id: 'ww2p_defector', mtthMonths: 420, image: 'explore', title: 'Un desertor con planos', condition: [{ type: 'atWar', value: true }, year(1940)],
    text: 'Un ingeniero enemigo ha cruzado las líneas con documentos técnicos. Los servicios de inteligencia dudan entre explotarlo o sospechar un engaño.',
    options: [opt('Estudiar sus planos de aviones', [TECH('air', 1)], 4), opt('Estudiar sus planos de tanques', [TECH('armor', 1)], 4), opt('Desconfiar: podría ser una trampa', [CMB(0.02)], 2)] }),
];
