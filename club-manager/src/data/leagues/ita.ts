import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: 'ita',
  name: 'Liga Italiana',
  country: 'Italia',
  nat: 'ITA',
  tier2Name: 'Segunda Italiana',
  clubs: [
    {
      id: 'i_int', name: 'Inter', short: 'INT', city: 'Milano', stadium: 'San Siro', capacity: 75817,
      colors: ['#0068A8', '#000000'], reputation: 92, budget: 80,
      players: `Yann Sommer|GK|1988|SUI|85|85
Josep Martínez|GK|1998|ESP|77|80
Raffaele Di Gennaro|GK|1993|ITA|60|60
Alessandro Bastoni|CB|1999|ITA|86|87
Francesco Acerbi|CB|1988|ITA|81|81
Stefan de Vrij|CB|1992|NED|81|81
Yann Bisseck|CB|2000|GER|80|83
Manuel Akanji|CB|1995|SUI|84|84
Denzel Dumfries|RB|1996|NED|83|83
Federico Dimarco|LB|1997|ITA|85|85
Carlos Augusto|LB|1999|BRA|78|79
Luis Henrique|RB|2001|BRA|77|80
Nicolò Barella|CM|1997|ITA|87|87
Hakan Çalhanoğlu|DM|1994|TUR|86|86
Henrikh Mkhitaryan|CM|1989|ARM|82|82
Davide Frattesi|CM|1999|ITA|80|81
Piotr Zieliński|CM|1994|POL|80|80
Petar Sučić|CM|2003|CRO|77|84
Lautaro Martínez|ST|1997|ARG|88|88
Marcus Thuram|ST|1997|FRA|85|85
Ange-Yoan Bonny|ST|2003|FRA|76|82
Francesco Pio Esposito|ST|2005|ITA|72|84`,
    },
    {
      id: 'i_mil', name: 'AC Milan', short: 'MIL', city: 'Milano', stadium: 'San Siro', capacity: 75817,
      colors: ['#FB090B', '#000000'], reputation: 88, budget: 70,
      players: `Mike Maignan|GK|1995|FRA|87|87
Pietro Terracciano|GK|1990|ITA|72|72
Lorenzo Torriani|GK|2005|ITA|60|74
Matteo Gabbia|CB|1999|ITA|79|80
Fikayo Tomori|CB|1997|ENG|80|80
Strahinja Pavlović|CB|2001|SRB|79|82
Koni De Winter|CB|2002|BEL|77|81
Pervis Estupiñán|LB|1998|ECU|79|79
Alexis Saelemaekers|RB|1999|BEL|79|80
Davide Bartesaghi|LB|2006|ITA|67|80
Zachary Athekame|RB|2004|SUI|70|77
Luka Modrić|CM|1985|CRO|85|85
Adrien Rabiot|CM|1995|FRA|83|83
Youssouf Fofana|DM|1999|FRA|80|81
Ruben Loftus-Cheek|CM|1996|ENG|78|78
Samuele Ricci|DM|2001|ITA|79|82
Ardon Jashari|CM|2002|SUI|78|83
Rafael Leão|LW|1999|POR|85|86
Christian Pulisic|RW|1998|USA|84|84
Santiago Giménez|ST|2001|MEX|79|82
Christopher Nkunku|ST|1997|FRA|82|82`,
    },
    {
      id: 'i_juv', name: 'Juventus', short: 'JUV', city: 'Torino', stadium: 'Allianz Stadium', capacity: 41507,
      colors: ['#000000', '#FFFFFF'], reputation: 89, budget: 75,
      players: `Michele Di Gregorio|GK|1997|ITA|81|82
Mattia Perin|GK|1992|ITA|75|75
Carlo Pinsoglio|GK|1990|ITA|62|62
Gleison Bremer|CB|1997|BRA|85|85
Federico Gatti|CB|1998|ITA|79|80
Pierre Kalulu|CB|2000|FRA|80|82
Lloyd Kelly|CB|1998|ENG|77|78
Andrea Cambiaso|LB|2000|ITA|82|84
Juan Cabal|LB|2001|COL|75|79
João Mário|RB|2000|POR|75|77
Manuel Locatelli|DM|1998|ITA|81|81
Teun Koopmeiners|CM|1998|NED|80|80
Khéphren Thuram|CM|2001|FRA|81|84
Weston McKennie|CM|1998|USA|78|78
Fabio Miretti|CM|2003|ITA|72|78
Vasilije Adžić|AM|2006|MNE|66|80
Kenan Yıldız|LW|2005|TUR|84|90
Francisco Conceição|RW|2002|POR|81|85
Edon Zhegrova|RW|1999|KVX|81|82
Dušan Vlahović|ST|2000|SRB|82|83
Jonathan David|ST|2000|CAN|82|83
Loïs Openda|ST|2000|BEL|80|82`,
    },
    {
      id: 'i_nap', name: 'Napoli', short: 'NAP', city: 'Napoli', stadium: 'Stadio Diego Armando Maradona', capacity: 54726,
      colors: ['#12A0D7', '#FFFFFF'], reputation: 87, budget: 70,
      players: `Alex Meret|GK|1997|ITA|80|81
Vanja Milinković-Savić|GK|1997|SRB|78|79
Nikita Contini|GK|1996|ITA|60|60
Giovanni Di Lorenzo|RB|1993|ITA|82|82
Amir Rrahmani|CB|1994|KVX|81|81
Alessandro Buongiorno|CB|1999|ITA|82|84
Juan Jesus|CB|1991|BRA|72|72
Sam Beukema|CB|1998|NED|78|80
Mathías Olivera|LB|1997|URU|78|78
Leonardo Spinazzola|LB|1993|ITA|75|75
Miguel Gutiérrez|LB|2001|ESP|77|80
Stanislav Lobotka|DM|1994|SVK|83|83
André-Frank Zambo Anguissa|CM|1995|CMR|82|82
Scott McTominay|CM|1996|SCO|85|85
Kevin De Bruyne|AM|1991|BEL|86|86
Billy Gilmour|CM|2001|SCO|78|80
Eljif Elmas|CM|1999|MKD|76|77
Matteo Politano|RW|1993|ITA|79|79
David Neres|LW|1997|BRA|80|80
Noa Lang|LW|1999|NED|80|81
Rasmus Højlund|ST|2003|DEN|80|85
Romelu Lukaku|ST|1993|BEL|81|81`,
    },
    {
      id: 'i_ata', name: 'Atalanta', short: 'ATA', city: 'Bergamo', stadium: 'Gewiss Stadium', capacity: 24950,
      colors: ['#1E71B8', '#000000'], reputation: 83, budget: 50,
      players: `Marco Carnesecchi|GK|2000|ITA|81|84
Marco Sportiello|GK|1992|ITA|70|70
Francesco Rossi|GK|1991|ITA|60|60
Berat Djimsiti|CB|1993|ALB|79|79
Isak Hien|CB|1999|SWE|80|81
Sead Kolašinac|CB|1993|BIH|77|77
Giorgio Scalvini|CB|2003|ITA|77|84
Odilon Kossounou|CB|2001|CIV|78|80
Honest Ahanor|CB|2008|ITA|65|82
Raoul Bellanova|RB|2000|ITA|78|80
Davide Zappacosta|RB|1992|ITA|77|77
Nicola Zalewski|LB|2002|POL|75|78
Marten de Roon|DM|1991|NED|79|79
Éderson|CM|1999|BRA|82|83
Mario Pašalić|CM|1995|CRO|78|78
Yunus Musah|CM|2002|USA|76|80
Lazar Samardžić|AM|2002|SRB|77|80
Charles De Ketelaere|AM|2001|BEL|82|84
Ademola Lookman|LW|1997|NGA|84|84
Kamaldeen Sulemana|RW|2002|GHA|74|78
Gianluca Scamacca|ST|1999|ITA|79|80
Nikola Krstović|ST|2000|MNE|78|80`,
    },
    {
      id: 'i_rom', name: 'AS Roma', short: 'ROM', city: 'Roma', stadium: 'Stadio Olimpico', capacity: 70634,
      colors: ['#8E1F2F', '#F0BC42'], reputation: 84, budget: 45,
      players: `Mile Svilar|GK|1999|SRB|84|86
Pierluigi Gollini|GK|1995|ITA|70|70
Devis Vásquez|GK|1998|COL|68|71
Gianluca Mancini|CB|1996|ITA|80|80
Evan Ndicka|CB|1999|CIV|80|81
Mario Hermoso|CB|1995|ESP|79|79
Daniele Ghilardi|CB|2003|ITA|72|80
Zeki Çelik|RB|1997|TUR|76|76
Wesley|RB|2003|BRA|77|83
Angeliño|LB|1997|ESP|78|78
Kostas Tsimikas|LB|1996|GRE|77|77
Manu Koné|CM|2001|FRA|80|83
Bryan Cristante|DM|1995|ITA|77|77
Lorenzo Pellegrini|AM|1996|ITA|79|79
Neil El Aynaoui|CM|2001|MAR|76|80
Niccolò Pisilli|CM|2004|ITA|72|80
Paulo Dybala|AM|1993|ARG|82|82
Matías Soulé|RW|2003|ARG|80|84
Stephan El Shaarawy|LW|1992|ITA|74|74
Leon Bailey|RW|1997|JAM|78|78
Artem Dovbyk|ST|1997|UKR|80|80
Evan Ferguson|ST|2004|IRL|75|81`,
    },
    {
      id: 'i_laz', name: 'Lazio', short: 'LAZ', city: 'Roma', stadium: 'Stadio Olimpico', capacity: 70634,
      colors: ['#87D8F7', '#FFFFFF'], reputation: 80, budget: 5,
      players: `Ivan Provedel|GK|1994|ITA|80|80
Christos Mandas|GK|2001|GRE|74|79
Alessio Furlanetto|GK|2002|ITA|60|66
Alessio Romagnoli|CB|1995|ITA|80|80
Mario Gila|CB|2000|ESP|81|84
Patric|CB|1993|ESP|72|72
Oliver Provstgaard|CB|2003|DEN|70|77
Adam Marušić|RB|1992|MNE|77|77
Manuel Lazzari|RB|1993|ITA|75|75
Nuno Tavares|LB|2000|POR|79|80
Luca Pellegrini|LB|1999|ITA|71|72
Mattéo Guendouzi|CM|1999|FRA|80|81
Nicolò Rovella|DM|2001|ITA|80|83
Danilo Cataldi|DM|1994|ITA|74|74
Matías Vecino|CM|1991|URU|73|73
Fisayo Dele-Bashiru|CM|2001|NGA|73|77
Toma Bašić|CM|1996|CRO|70|70
Mattia Zaccagni|LW|1995|ITA|80|80
Gustav Isaksen|RW|2001|DEN|76|79
Pedro|RW|1987|ESP|74|74
Taty Castellanos|ST|1998|ARG|78|78
Boulaye Dia|ST|1996|SEN|77|77`,
    },
    {
      id: 'i_fio', name: 'Fiorentina', short: 'FIO', city: 'Firenze', stadium: 'Stadio Artemio Franchi', capacity: 43147,
      colors: ['#482E92', '#FFFFFF'], reputation: 78, budget: 35,
      players: `David de Gea|GK|1990|ESP|83|83
Tommaso Martinelli|GK|2006|ITA|60|76
Luca Lezzerini|GK|1995|ITA|62|62
Marin Pongračić|CB|1997|CRO|76|77
Luca Ranieri|CB|1999|ITA|77|78
Pietro Comuzzo|CB|2005|ITA|74|83
Pablo Marí|CB|1993|ESP|74|74
Mattia Viti|CB|2002|ITA|71|76
Dodô|RB|1998|BRA|79|80
Robin Gosens|LB|1994|GER|78|78
Fabiano Parisi|LB|2000|ITA|73|76
Rolando Mandragora|CM|1997|ITA|77|77
Nicolò Fagioli|CM|2001|ITA|77|81
Simon Sohm|CM|2001|SUI|75|78
Hans Nicolussi Caviglia|DM|2000|ITA|74|76
Cher Ndour|CM|2004|ITA|72|79
Albert Gudmundsson|AM|1997|ISL|80|80
Jacopo Fazzini|AM|2003|ITA|73|79
Moise Kean|ST|2000|ITA|82|83
Roberto Piccoli|ST|2001|ITA|76|79
Edin Džeko|ST|1986|BIH|75|75
Christian Kouamé|LW|1997|CIV|72|72`,
    },
    {
      id: 'i_bol', name: 'Bologna', short: 'BOL', city: 'Bologna', stadium: "Stadio Renato Dall'Ara", capacity: 36462,
      colors: ['#A21C26', '#1A2F48'], reputation: 78, budget: 35,
      players: `Łukasz Skorupski|GK|1991|POL|79|79
Federico Ravaglia|GK|1999|ITA|72|74
Massimo Pessina|GK|2007|ITA|58|74
Jhon Lucumí|CB|1998|COL|80|81
Torbjørn Heggem|CB|1999|NOR|74|76
Martin Vitík|CB|2003|CZE|74|80
Emil Holm|RB|2000|SWE|77|78
Nadir Zortea|RB|1999|ITA|74|75
Juan Miranda|LB|2000|ESP|77|78
Charalampos Lykogiannis|LB|1993|GRE|72|72
Nicolò Casale|CB|1998|ITA|73|73
Remo Freuler|DM|1992|SUI|79|79
Lewis Ferguson|CM|1999|SCO|80|81
Tommaso Pobega|CM|1999|ITA|75|76
Nikola Moro|CM|1998|CRO|73|74
Giovanni Fabbian|AM|2003|ITA|73|79
Jens Odgaard|AM|1999|DEN|76|77
Riccardo Orsolini|RW|1997|ITA|80|80
Jonathan Rowe|LW|2003|ENG|76|81
Federico Bernardeschi|RW|1994|ITA|76|76
Santiago Castro|ST|2004|ARG|77|84
Thijs Dallinga|ST|2000|NED|75|77`,
    },
    {
      id: 'i_com', name: 'Como', short: 'COM', city: 'Como', stadium: 'Stadio Giuseppe Sinigaglia', capacity: 13602,
      colors: ['#003DA5', '#FFFFFF'], reputation: 74, budget: 60,
      players: `Jean Butez|GK|1995|FRA|78|78
Mauro Vigorito|GK|1990|ITA|64|64
Nikola Čavlina|GK|2002|CRO|64|72
Marc-Oliver Kempf|CB|1995|GER|76|76
Diego Carlos|CB|1993|BRA|76|76
Jacobo Ramón|CB|2005|ESP|72|81
Ignace Van der Brempt|RB|2002|BEL|73|77
Ivan Smolčić|RB|2000|CRO|73|76
Álex Valle|LB|2004|ESP|74|80
Alberto Moreno|LB|1992|ESP|75|75
Nico Paz|AM|2004|ARG|81|88
Máximo Perrone|DM|2003|ARG|77|82
Lucas Da Cunha|CM|2001|FRA|77|79
Sergi Roberto|CM|1992|ESP|74|74
Maxence Caqueret|CM|2000|FRA|77|79
Martin Baturina|AM|2003|CRO|76|83
Nicolas Kühn|LW|2000|GER|77|79
Jesús Rodríguez|LW|2005|ESP|74|83
Assane Diao|RW|2005|SEN|75|84
Jayden Addai|RW|2005|NED|68|80
Tasos Douvikas|ST|1999|GRE|76|77
Álvaro Morata|ST|1992|ESP|78|78`,
    },
    {
      id: 'i_tor', name: 'Torino', short: 'TOR', city: 'Torino', stadium: 'Stadio Olimpico Grande Torino', capacity: 27958,
      colors: ['#8A1E03', '#FFFFFF'], reputation: 73, budget: 20,
      players: `Franco Israel|GK|2000|URU|76|78
Alberto Paleari|GK|1992|ITA|70|70
Mihai Popa|GK|2000|ROU|64|67
Guillermo Maripán|CB|1994|CHI|76|76
Saúl Coco|CB|1999|EQG|76|77
Ardian Ismajli|CB|1996|ALB|74|74
Adam Masina|CB|1994|MAR|71|71
Marcus Pedersen|RB|2000|NOR|73|75
Valentino Lazaro|RB|1996|AUT|73|73
Niels Nkounkou|LB|2000|FRA|72|74
Cesare Casadei|CM|2003|ITA|74|80
Ivan Ilić|CM|2001|SRB|75|77
Gvidas Gineitis|CM|2004|LTU|72|78
Kristjan Asllani|DM|2002|ALB|74|77
Tino Anjorin|CM|2001|ENG|72|75
Nikola Vlašić|AM|1997|CRO|76|76
Duván Zapata|ST|1991|COL|75|75
Giovanni Simeone|ST|1995|ARG|76|76
Ché Adams|ST|1996|SCO|75|75
Cyril Ngonge|RW|2000|BEL|74|76
Zakaria Aboukhlal|RW|2000|MAR|73|75`,
    },
    {
      id: 'i_udi', name: 'Udinese', short: 'UDI', city: 'Udine', stadium: 'Bluenergy Stadium', capacity: 25144,
      colors: ['#000000', '#FFFFFF'], reputation: 70, budget: 15,
      players: `Maduka Okoye|GK|1999|NGA|77|78
Răzvan Sava|GK|2002|ROU|70|75
Daniele Padelli|GK|1985|ITA|60|60
Oumar Solet|CB|2000|FRA|78|80
Thomas Kristensen|CB|2002|DEN|74|78
Christian Kabasele|CB|1991|BEL|72|72
Saba Goglichidze|CB|2004|GEO|70|78
Jordan Zemura|LB|1999|ZIM|73|74
Hassane Kamara|LB|1994|CIV|72|72
Kingsley Ehizibue|RB|1995|NED|72|72
Alessandro Zanoli|RB|2000|ITA|72|74
Jesper Karlström|DM|1995|SWE|75|75
Jurgen Ekkelenkamp|CM|2000|NED|75|77
Arthur Atta|AM|2003|FRA|75|82
Jakub Piotrowski|CM|1997|POL|74|74
Oier Zarraga|CM|1999|ESP|72|73
Nicolò Zaniolo|AM|1999|ITA|75|76
Keinan Davis|ST|1998|ENG|76|76
Vakoun Issouf Bayo|ST|1996|CIV|71|71
Iker Bravo|ST|2005|ESP|68|78
Adam Buksa|ST|1996|POL|70|70`,
    },
    {
      id: 'i_gen', name: 'Genoa', short: 'GEN', city: 'Genova', stadium: 'Stadio Luigi Ferraris', capacity: 33205,
      colors: ['#A41E35', '#002855'], reputation: 70, budget: 15,
      players: `Nicola Leali|GK|1993|ITA|74|74
Benjamin Siegrist|GK|1992|SUI|70|70
Daniele Sommariva|GK|1997|ITA|62|62
Johan Vásquez|CB|1998|MEX|77|78
Leo Østigård|CB|1999|NOR|74|75
Sebastian Otoa|CB|2003|DEN|70|76
Alessandro Marcandalli|CB|2002|ITA|70|75
Aarón Martín|LB|1997|ESP|75|75
Brooke Norton-Cuffy|RB|2004|ENG|73|79
Stefano Sabelli|RB|1993|ITA|70|70
Mikael Egill Ellertsson|LB|2002|ISL|71|74
Morten Frendrup|DM|2001|DEN|78|80
Ruslan Malinovskyi|AM|1993|UKR|75|75
Patrizio Masini|CM|2001|ITA|71|74
Morten Thorsby|CM|1996|NOR|73|73
Nicolae Stanciu|AM|1993|ROU|74|74
Valentín Carboni|AM|2005|ARG|70|80
Vitinha|LW|2000|POR|74|76
Maxwel Cornet|LW|1996|CIV|72|72
Lorenzo Colombo|ST|2002|ITA|73|76
Jeff Ekhator|ST|2006|ITA|68|80`,
    },
    {
      id: 'i_cag', name: 'Cagliari', short: 'CAG', city: 'Cagliari', stadium: 'Unipol Domus', capacity: 16416,
      colors: ['#A6192E', '#002F6C'], reputation: 67, budget: 10,
      players: `Elia Caprile|GK|2001|ITA|76|80
Alen Sherri|GK|2004|ALB|64|72
Giuseppe Ciocci|GK|2002|ITA|60|66
Yerry Mina|CB|1994|COL|74|74
Sebastiano Luperto|CB|1996|ITA|73|73
Juan Rodríguez|CB|2005|URU|70|78
Gabriele Zappa|RB|1999|ITA|72|73
Marco Palestra|RB|2005|ITA|72|82
Adam Obert|LB|2002|SVK|70|74
Riyad Idrissi|LB|2005|MAR|68|77
Michel Adopo|CM|2000|FRA|73|75
Matteo Prati|DM|2003|ITA|71|77
Alessandro Deiola|CM|1995|ITA|70|70
Gianluca Gaetano|AM|2000|ITA|73|75
Michael Folorunsho|CM|1998|ITA|74|75
Luca Mazzitelli|CM|1995|ITA|70|70
Zito Luvumbo|LW|2002|ANG|73|77
Gianluca Borrelli|ST|2000|ITA|72|73
Sebastiano Esposito|ST|2002|ITA|74|77
Andrea Belotti|ST|1993|ITA|71|71
Semih Kılıçsoy|ST|2005|TUR|70|80`,
    },
    {
      id: 'i_lec', name: 'Lecce', short: 'LEC', city: 'Lecce', stadium: 'Stadio Via del Mare', capacity: 31533,
      colors: ['#FFD700', '#C8102E'], reputation: 65, budget: 8,
      players: `Wladimiro Falcone|GK|1995|ITA|76|76
Christian Früchtl|GK|2000|GER|66|69
Jasper Samooja|GK|2003|FIN|60|68
Kialonda Gaspar|CB|1997|ANG|74|75
Tiago Gabriel|CB|2004|POR|70|78
Jamil Siebert|CB|2002|GER|68|73
Antonino Gallo|LB|2000|ITA|72|74
Danilo Veiga|RB|2002|POR|68|74
Corrie Ndaba|LB|1999|IRL|66|68
Frédéric Guilbert|RB|1994|FRA|69|69
Ylber Ramadani|DM|1996|ALB|74|74
Lassana Coulibaly|CM|1996|MLI|73|73
Medon Berisha|AM|2003|ALB|70|76
Thórir Jóhann Helgason|CM|2000|ISL|70|71
Balthazar Pierret|CM|2000|FRA|71|73
Mohamed Kaba|CM|2001|FRA|68|72
Nikola Štulić|ST|2001|SRB|70|74
Francesco Camarda|ST|2008|ITA|66|84
Lameck Banda|LW|2001|ZAM|71|73
Tete Morente|RW|1996|ESP|70|70
Santiago Pierotti|RW|2001|ARG|71|74
Konan N'Dri|LW|2000|CIV|69|71`,
    },
    {
      id: 'i_par', name: 'Parma', short: 'PAR', city: 'Parma', stadium: 'Stadio Ennio Tardini', capacity: 22352,
      colors: ['#FFFFFF', '#FFD200'], reputation: 68, budget: 20,
      players: `Zion Suzuki|GK|2002|JPN|76|81
Edoardo Corvi|GK|2001|ITA|64|68
Filippo Rinaldi|GK|2002|ITA|60|66
Alessandro Circati|CB|2003|AUS|74|80
Enrico Delprato|RB|1999|ITA|74|75
Lautaro Valenti|CB|1999|ARG|72|73
Emanuele Valeri|LB|1998|ITA|72|72
Abdoulaye Ndiaye|CB|2002|FRA|70|75
Mathias Løvik|LB|2003|NOR|70|76
Mariano Troilo|CB|2003|ARG|68|78
Adrián Bernabé|CM|2001|ESP|77|81
Mandela Keita|DM|2002|BEL|72|77
Nahuel Estévez|CM|1995|ARG|72|72
Oliver Sørensen|CM|2002|DEN|72|76
Hernani|CM|1994|BRA|71|71
Jacob Ondrejka|AM|2002|SWE|71|75
Mateo Pellegrino|ST|2001|ARG|75|78
Patrick Cutrone|ST|1998|ITA|72|72
Adrian Benedyczak|LW|2000|POL|70|72
Milan Đurić|ST|1990|BIH|69|69
Pontus Almqvist|RW|1999|SWE|71|72`,
    },
    {
      id: 'i_ver', name: 'Hellas Verona', short: 'VER', city: 'Verona', stadium: 'Stadio Marcantonio Bentegodi', capacity: 31045,
      colors: ['#002F6C', '#FFD200'], reputation: 66, budget: 8,
      players: `Lorenzo Montipò|GK|1996|ITA|75|75
Simone Perilli|GK|1995|ITA|64|64
Giacomo Toniolo|GK|2004|ITA|58|70
Victor Nelsson|CB|1998|DEN|74|75
Armel Bella-Kotchap|CB|2001|GER|72|76
Nicolás Valentini|CB|2001|ARG|71|75
Martin Frese|LB|1998|DEN|70|71
Domagoj Bradarić|LB|1999|CRO|70|71
Daniel Oyegoke|RB|2003|ENG|68|75
Rafik Belghali|RB|2002|ALG|70|76
Suat Serdar|CM|1997|GER|72|72
Ondrej Duda|CM|1994|SVK|73|73
Antoine Bernede|CM|1999|FRA|71|73
Jean-Daniel Akpa Akpro|CM|1992|CIV|69|69
Abdou Harroui|AM|1998|MAR|70|71
Al-Musrati|DM|1996|LBY|71|71
Giovane|ST|2003|BRA|71|77
Amin Sarr|ST|2001|SWE|72|74
Gift Orban|ST|2002|NGA|72|76
Daniel Mosquera|ST|1999|COL|70|72`,
    },
    {
      id: 'i_sas', name: 'Sassuolo', short: 'SAS', city: 'Sassuolo', stadium: 'Mapei Stadium – Città del Tricolore', capacity: 21525,
      colors: ['#00A752', '#000000'], reputation: 67, budget: 15,
      players: `Arijanet Murić|GK|1998|KVX|74|75
Stefano Turati|GK|2001|ITA|70|74
Giacomo Satalino|GK|1999|ITA|60|63
Tarik Muharemović|CB|2003|BIH|73|79
Jay Idzes|CB|2000|IDN|72|74
Filippo Romagna|CB|1997|ITA|70|70
Sebastian Walukiewicz|CB|2000|POL|71|72
Josh Doig|LB|2002|SCO|72|76
Jeremy Toljan|RB|1994|GER|70|70
Woyo Coulibaly|RB|1999|MLI|69|71
Nemanja Matić|DM|1988|SRB|75|75
Kristian Thorstvedt|CM|1999|NOR|73|74
Ismaël Koné|CM|2002|CAN|72|76
Daniel Boloca|CM|1998|ROU|70|71
Luca Lipani|CM|2005|ITA|66|76
Cristian Volpato|AM|2003|AUS|69|75
Domenico Berardi|RW|1994|ITA|79|79
Armand Laurienté|LW|1998|FRA|77|78
Alieu Fadera|LW|2001|GAM|72|75
Andrea Pinamonti|ST|1999|ITA|74|75
Samuele Mulattieri|ST|2000|ITA|68|71
Walid Cheddira|ST|1998|MAR|70|71`,
    },
    {
      id: 'i_pis', name: 'Pisa', short: 'PIS', city: 'Pisa', stadium: 'Arena Garibaldi – Romeo Anconetani', capacity: 9862,
      colors: ['#1B3C8C', '#000000'], reputation: 62, budget: 10,
      players: `Adrian Šemper|GK|1998|CRO|70|72
Nicolas|GK|1988|BRA|69|69
Simone Scuffet|GK|1996|ITA|70|70
Simone Canestrelli|CB|2000|ITA|70|72
Antonio Caracciolo|CB|1990|ITA|70|70
Giovanni Bonfanti|CB|2003|ITA|68|74
Arturo Calabresi|CB|1996|ITA|69|69
Samuele Angori|LB|2003|ITA|68|74
Juan Cuadrado|RB|1988|COL|72|72
Mateus Lusuardi|CB|2000|BRA|66|69
Marius Marin|DM|1998|ROU|72|73
Michel Aebischer|CM|1997|SUI|72|72
Malthe Højholt|CM|2001|DEN|68|71
Gabriele Piccinini|CM|2001|ITA|66|70
Matteo Tramoni|AM|2000|FRA|70|72
Isak Vural|CM|2006|TUR|64|76
Mehdi Léris|RW|1998|ALG|70|70
M'Bala Nzola|ST|1996|ANG|70|70
Henrik Meister|ST|2003|DEN|68|74
Stefano Moreo|ST|1993|ITA|68|68`,
    },
    {
      id: 'i_cre', name: 'Cremonese', short: 'CRE', city: 'Cremona', stadium: 'Stadio Giovanni Zini', capacity: 16003,
      colors: ['#BE1E2D', '#808080'], reputation: 61, budget: 10,
      players: `Emil Audero|GK|1997|ITA|73|74
Marco Silvestri|GK|1991|ITA|70|70
Andrea Fulignati|GK|1994|ITA|64|64
Federico Baschirotto|CB|1996|ITA|73|73
Matteo Bianchetti|CB|1993|ITA|69|69
Filippo Terracciano|CB|2003|ITA|70|76
Federico Ceccherini|CB|1992|ITA|69|69
Giuseppe Pezzella|LB|1997|ITA|71|71
Tommaso Barbieri|RB|2002|ITA|69|74
Romano Floriani Mussolini|RB|2003|ITA|68|72
Francesco Folino|CB|2002|ITA|65|70
Franco Vázquez|AM|1989|ITA|75|75
Warren Bondo|CM|2003|FRA|72|78
Alberto Grassi|CM|1995|ITA|68|68
Martín Payero|CM|1998|ARG|71|72
Michele Collocolo|CM|1999|ITA|68|69
Michele Castagnetti|DM|1989|ITA|67|67
Jamie Vardy|ST|1987|ENG|75|75
Federico Bonazzoli|ST|1997|ITA|71|71
Antonio Sanabria|ST|1996|PAR|72|72
Alessio Zerbin|LW|1999|ITA|70|71
Dennis Johnsen|RW|1998|NOR|68|69`,
    },
  ],
  tier2: [
    { id: 'i_emp', name: 'Empoli', short: 'EMP', city: 'Empoli', stadium: 'Stadio Carlo Castellani', capacity: 16284, colors: ['#0057B8', '#FFFFFF'], reputation: 66 },
    { id: 'i_ven', name: 'Venezia', short: 'VEN', city: 'Venezia', stadium: 'Stadio Pier Luigi Penzo', capacity: 11150, colors: ['#000000', '#F47920'], reputation: 66 },
    { id: 'i_mon', name: 'Monza', short: 'MON', city: 'Monza', stadium: 'U-Power Stadium', capacity: 16917, colors: ['#E30613', '#FFFFFF'], reputation: 67 },
    { id: 'i_pal', name: 'Palermo', short: 'PAL', city: 'Palermo', stadium: 'Stadio Renzo Barbera', capacity: 36365, colors: ['#F5A9C6', '#000000'], reputation: 65 },
    { id: 'i_sam', name: 'Sampdoria', short: 'SAM', city: 'Genova', stadium: 'Stadio Luigi Ferraris', capacity: 33205, colors: ['#1B5DAA', '#FFFFFF'], reputation: 64 },
    { id: 'i_spe', name: 'Spezia', short: 'SPE', city: 'La Spezia', stadium: 'Stadio Alberto Picco', capacity: 10336, colors: ['#FFFFFF', '#000000'], reputation: 62 },
    { id: 'i_bar', name: 'Bari', short: 'BAR', city: 'Bari', stadium: 'Stadio San Nicola', capacity: 58270, colors: ['#FFFFFF', '#E30613'], reputation: 60 },
    { id: 'i_mod', name: 'Modena', short: 'MOD', city: 'Modena', stadium: 'Stadio Alberto Braglia', capacity: 21151, colors: ['#FFD700', '#003DA5'], reputation: 60 },
    { id: 'i_fro', name: 'Frosinone', short: 'FRO', city: 'Frosinone', stadium: 'Stadio Benito Stirpe', capacity: 16227, colors: ['#FFD200', '#0050A0'], reputation: 61 },
    { id: 'i_cat', name: 'Catanzaro', short: 'CTZ', city: 'Catanzaro', stadium: 'Stadio Nicola Ceravolo', capacity: 14650, colors: ['#FFD200', '#C8102E'], reputation: 58 },
  ],
};
