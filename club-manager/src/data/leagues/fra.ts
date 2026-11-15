import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: 'fra',
  name: 'Liga Francesa',
  country: 'Francia',
  nat: 'FRA',
  tier2Name: 'Segunda Francesa',
  clubs: [
    {
      id: 'f_psg',
      name: 'Paris Saint-Germain',
      short: 'PSG',
      city: 'París',
      stadium: 'Parc des Princes',
      capacity: 47929,
      colors: ['#004170', '#DA291C'],
      reputation: 93,
      budget: 150,
      players: `Lucas Chevalier|GK|2001|FRA|84|88
Matvey Safonov|GK|1999|RUS|78|81
Renato Marin|GK|2006|ITA|64|78
Marquinhos|CB|1994|BRA|85|85
Willian Pacho|CB|2001|ECU|84|88
Illia Zabarnyi|CB|2002|UKR|81|86
Lucas Beraldo|CB|2003|BRA|77|84
Lucas Hernández|LB|1996|FRA|80|80
Nuno Mendes|LB|2002|POR|87|90
Achraf Hakimi|RB|1998|MAR|88|88
Vitinha|CM|2000|POR|88|90
João Neves|CM|2004|POR|86|91
Fabián Ruiz|CM|1996|ESP|84|84
Warren Zaïre-Emery|CM|2006|FRA|80|89
Lee Kang-in|AM|2001|KOR|80|82
Senny Mayulu|CM|2006|FRA|72|84
Ousmane Dembélé|RW|1997|FRA|90|90
Khvicha Kvaratskhelia|LW|2001|GEO|87|89
Désiré Doué|RW|2005|FRA|84|91
Bradley Barcola|LW|2002|FRA|83|87
Gonçalo Ramos|ST|2001|POR|80|83
Ibrahim Mbaye|LW|2008|FRA|66|84`,
    },
    {
      id: 'f_om',
      name: 'Olympique de Marseille',
      short: 'OMA',
      city: 'Marsella',
      stadium: 'Orange Vélodrome',
      capacity: 67394,
      colors: ['#FFFFFF', '#2FAEE0'],
      reputation: 83,
      budget: 50,
      players: `Gerónimo Rulli|GK|1992|ARG|82|82
Jeffrey de Lange|GK|1998|NED|68|70
Rubén Blanco|GK|1995|ESP|70|70
Leonardo Balerdi|CB|1999|ARG|80|82
Nayef Aguerd|CB|1996|MAR|79|79
Benjamin Pavard|CB|1996|FRA|80|80
CJ Egan-Riley|CB|2003|ENG|72|79
Facundo Medina|CB|1999|ARG|77|79
Emerson Palmieri|LB|1994|ITA|74|74
Amir Murillo|RB|1996|PAN|74|75
Pierre-Emile Højbjerg|DM|1995|DEN|80|80
Geoffrey Kondogbia|DM|1993|CAF|75|75
Arthur Vermeeren|CM|2005|BEL|74|84
Angel Gomes|CM|2000|ENG|77|80
Matt O'Riley|CM|2000|DEN|78|81
Hamed Junior Traorè|AM|2000|CIV|75|77
Mason Greenwood|RW|2001|ENG|83|86
Pierre-Emerick Aubameyang|ST|1989|GAB|78|78
Amine Gouiri|ST|2000|ALG|79|81
Igor Paixão|LW|2000|BRA|78|81
Timothy Weah|RW|2000|USA|75|77
Neal Maupay|ST|1996|FRA|72|72`,
    },
    {
      id: 'f_asm',
      name: 'AS Monaco',
      short: 'ASM',
      city: 'Mónaco',
      stadium: 'Stade Louis II',
      capacity: 16360,
      colors: ['#E30613', '#FFFFFF'],
      reputation: 81,
      budget: 45,
      players: `Philipp Köhn|GK|1998|SUI|76|79
Lukáš Hrádecký|GK|1989|FIN|79|79
Yann Liénard|GK|2003|FRA|60|72
Thilo Kehrer|CB|1996|GER|77|77
Mohammed Salisu|CB|1999|GHA|77|79
Eric Dier|CB|1994|ENG|75|75
Christian Mawissa|CB|2005|FRA|70|80
Jordan Teze|RB|1999|NED|74|75
Vanderson|RB|2001|BRA|78|82
Caio Henrique|LB|1997|BRA|77|77
Wilfried Singo|CB|2000|CIV|77|79
Denis Zakaria|DM|1996|SUI|80|80
Lamine Camara|CM|2004|SEN|78|85
Mamadou Coulibaly|CM|2004|FRA|70|80
Paul Pogba|CM|1993|FRA|76|76
Aleksandr Golovin|AM|1996|RUS|78|78
Takumi Minamino|AM|1995|JPN|78|78
Maghnes Akliouche|RW|2002|FRA|80|86
Folarin Balogun|ST|2001|USA|78|82
Ansu Fati|LW|2002|ESP|76|80
Mika Biereth|ST|2003|DEN|77|82
George Ilenikhena|ST|2006|NGA|70|80`,
    },
    {
      id: 'f_nice',
      name: 'OGC Nice',
      short: 'NIC',
      city: 'Niza',
      stadium: 'Allianz Riviera',
      capacity: 36178,
      colors: ['#C8102E', '#000000'],
      reputation: 76,
      budget: 30,
      players: `Yehvann Diouf|GK|1999|FRA|75|78
Maxime Dupé|GK|1993|FRA|68|68
Teddy Boulhendi|GK|2001|FRA|64|70
Dante|CB|1983|BRA|71|71
Youssouf Ndayishimiye|CB|1998|BDI|75|76
Moïse Bombito|CB|2000|CAN|76|79
Mohamed Abdelmonem|CB|1999|EGY|74|76
Juma Bah|CB|2006|SLE|70|79
Antoine Mendy|RB|2004|FRA|71|78
Jonathan Clauss|RB|1992|FRA|76|76
Melvin Bard|LB|2000|FRA|75|77
Hicham Boudaoui|DM|1999|ALG|76|78
Charles Vanhoutte|CM|1999|BEL|74|75
Morgan Sanson|CM|1994|FRA|73|73
Tanguy Ndombele|CM|1996|FRA|72|72
Tom Louchet|CM|2003|FRA|70|76
Sofiane Diop|AM|2000|FRA|77|79
Mohamed-Ali Cho|LW|2004|FRA|73|80
Terem Moffi|ST|1999|NGA|76|77
Isak Jansson|LW|2002|SWE|70|74
Tiago Gouveia|RW|2001|POR|70|74
Badredine Bouanani|RW|2004|ALG|71|79`,
    },
    {
      id: 'f_losc',
      name: 'LOSC Lille',
      short: 'LOS',
      city: 'Lille',
      stadium: 'Stade Pierre-Mauroy',
      capacity: 50186,
      colors: ['#E01E13', '#1B2A4A'],
      reputation: 79,
      budget: 35,
      players: `Berke Özer|GK|2000|TUR|76|79
Arnaud Bodart|GK|1998|BEL|68|70
Vito Mannone|GK|1988|ITA|64|64
Alexsandro Ribeiro|CB|1999|BRA|79|82
Aïssa Mandi|CB|1991|ALG|75|75
Nathan Ngoy|CB|2003|BEL|72|78
Thomas Meunier|RB|1991|BEL|74|74
Tiago Santos|RB|2002|POR|75|79
Romain Perraud|LB|1997|FRA|74|74
Calvin Verdonk|LB|1997|NED|73|74
Benjamin André|DM|1990|FRA|77|77
Nabil Bentaleb|DM|1994|ALG|74|74
Ayyoub Bouaddi|CM|2007|FRA|72|87
André Gomes|CM|1993|POR|74|74
Ngal'ayel Mukau|CM|2004|BEL|70|78
Hákon Arnar Haraldsson|AM|2003|ISL|78|83
Olivier Giroud|ST|1986|FRA|74|74
Hamza Igamane|ST|2002|MAR|74|79
Félix Correia|LW|2001|POR|73|76
Matías Fernández-Pardo|RW|2005|BEL|74|82
Osame Sahraoui|LW|2001|NOR|74|77
Ethan Mbappé|AM|2006|FRA|68|77`,
    },
    {
      id: 'f_ol',
      name: 'Olympique Lyonnais',
      short: 'LYO',
      city: 'Lyon',
      stadium: 'Groupama Stadium',
      capacity: 59186,
      colors: ['#FFFFFF', '#1B3F8F'],
      reputation: 79,
      budget: 30,
      players: `Lucas Perri|GK|1997|BRA|79|81
Dominik Greif|GK|1997|SVK|71|72
Kayne Bonnevie|GK|2001|FRA|60|66
Clinton Mata|CB|1992|ANG|74|74
Moussa Niakhaté|CB|1996|SEN|77|77
Hans Hateboer|RB|1994|NED|70|70
Ainsley Maitland-Niles|RB|1997|ENG|73|73
Nicolás Tagliafico|LB|1992|ARG|76|76
Abner Vinícius|LB|2000|BRA|74|76
Ruben Kluivert|CB|2001|NED|72|75
Tanner Tessmann|DM|2001|USA|74|77
Corentin Tolisso|CM|1994|FRA|77|77
Orel Mangala|DM|1998|BEL|75|75
Tyler Morton|CM|2002|ENG|74|78
Khalis Merah|CM|2006|FRA|63|78
Pavel Šulc|AM|2000|CZE|76|78
Adam Karabec|AM|2003|CZE|72|77
Malick Fofana|LW|2005|BEL|79|86
Ernest Nuamah|RW|2003|GHA|74|79
Georges Mikautadze|ST|2000|GEO|77|79
Martín Satriano|ST|2001|URU|72|75
Afonso Moreira|LW|2005|POR|70|79`,
    },
    {
      id: 'f_rcsa',
      name: 'RC Strasbourg Alsace',
      short: 'RCS',
      city: 'Estrasburgo',
      stadium: 'Stade de la Meinau',
      capacity: 26109,
      colors: ['#009FE3', '#FFFFFF'],
      reputation: 75,
      budget: 35,
      players: `Mike Penders|GK|2005|BEL|72|83
Karl-Johan Johnsson|GK|1990|SWE|66|66
Alaa Bellaarouch|GK|2002|MAR|63|70
Andrew Omobamidele|CB|2002|IRL|74|78
Ismaël Doukouré|CB|2003|FRA|74|80
Mamadou Sarr|CB|2005|FRA|72|82
Abakar Sylla|CB|2002|CIV|72|76
Guéla Doué|RB|2002|CIV|75|78
Ben Chilwell|LB|1996|ENG|74|74
Lucas Høgsberg|CB|2006|DEN|68|80
Andrey Santos|CM|2004|BRA|78|85
Valentín Barco|CM|2004|ARG|75|82
Félix Lemaréchal|CM|2003|FRA|74|80
Mathis Amougou|DM|2006|FRA|67|80
Rabby Nzingoula|CM|2006|FRA|66|78
Julio Enciso|AM|2004|PAR|75|81
Emanuel Emegha|ST|2003|NED|76|80
Joaquín Panichelli|ST|2002|ARG|74|79
Sebastian Nanasi|RW|2002|SWE|74|78
Diego Moreira|LW|2004|BEL|74|80
Martial Godo|RW|2003|CIV|71|76
Samuel Amo-Ameyaw|RW|2006|ENG|66|78`,
    },
    {
      id: 'f_rcl',
      name: 'RC Lens',
      short: 'RCL',
      city: 'Lens',
      stadium: 'Stade Bollaert-Delelis',
      capacity: 38223,
      colors: ['#FFD100', '#E30613'],
      reputation: 76,
      budget: 25,
      players: `Robin Risser|GK|2004|FRA|74|82
Régis Gurtner|GK|1986|FRA|67|67
Yannick Pandor|GK|2001|COM|62|67
Jonathan Gradit|CB|1992|FRA|74|74
Malang Sarr|CB|1999|FRA|74|75
Ismaëlo Ganiou|CB|2005|FRA|72|79
Samson Baidoo|CB|2004|AUT|72|80
Ruben Aguilar|RB|1993|FRA|73|73
Saud Abdulhamid|RB|1999|KSA|71|72
Matthieu Udol|LB|1996|FRA|73|73
Deiver Machado|LB|1993|COL|73|73
Mamadou Sangaré|DM|2002|MLI|74|78
Amadou Haidara|CM|1998|MLI|75|75
Adrien Thomasson|CM|1993|FRA|75|75
Nampalys Mendy|DM|1992|SEN|71|71
Andrija Bulatović|CM|2006|MNE|65|77
Florian Thauvin|AM|1993|FRA|77|77
Odsonne Édouard|ST|1998|FRA|74|75
Wesley Saïd|ST|1995|FRA|72|72
Allan Saint-Maximin|LW|1997|FRA|76|76
Abdallah Sima|RW|2001|SEN|74|77
Morgan Guilavogui|ST|1998|FRA|73|74`,
    },
    {
      id: 'f_brest',
      name: 'Stade Brestois 29',
      short: 'SBR',
      city: 'Brest',
      stadium: 'Stade Francis-Le Blé',
      capacity: 15220,
      colors: ['#E30613', '#FFFFFF'],
      reputation: 70,
      budget: 15,
      players: `Grégoire Coudert|GK|1999|FRA|73|76
Radosław Majecki|GK|1999|POL|72|74
Noah Jauny|GK|2003|FRA|60|68
Brendan Chardonnet|CB|1994|FRA|73|73
Soumaïla Coulibaly|CB|2003|FRA|71|77
Julien Le Cardinal|CB|1997|FRA|70|71
Bradley Locko|LB|2002|FRA|72|76
Massadio Haïdara|LB|1992|FRA|70|70
Kenny Lala|RB|1991|FRA|72|72
Daouda Guindo|RB|2002|MLI|70|74
Hugo Magnetti|DM|1998|FRA|73|74
Kamory Doumbia|CM|2003|MLI|72|77
Edimilson Fernandes|CM|1996|SUI|71|71
Joris Chotard|DM|2001|FRA|72|74
Eric Junior Dina Ebimbe|CM|2000|FRA|72|74
Mathias Pereira Lage|AM|1996|FRA|72|72
Romain Del Castillo|RW|1996|FRA|75|75
Ludovic Ajorque|ST|1994|FRA|73|73
Mama Baldé|LW|1995|GNB|72|72
Rémy Labeau Lascary|ST|2003|FRA|70|75`,
    },
    {
      id: 'f_tfc',
      name: 'Toulouse FC',
      short: 'TFC',
      city: 'Toulouse',
      stadium: 'Stadium de Toulouse',
      capacity: 33150,
      colors: ['#5B2C83', '#FFFFFF'],
      reputation: 69,
      budget: 15,
      players: `Guillaume Restes|GK|2005|FRA|76|84
Kjetil Haug|GK|1998|NOR|67|69
Alex Dominguez|GK|1998|FRA|63|65
Charlie Cresswell|CB|2002|ENG|74|78
Rasmus Nicolaisen|CB|1997|DEN|73|73
Mark McKenzie|CB|1999|USA|73|74
Dayann Methalie|CB|2002|FRA|68|73
Djibril Sidibé|RB|1992|FRA|70|70
Warren Kamanzi|RB|2001|NOR|71|74
Gabriel Suazo|LB|1997|CHI|73|73
Cristian Cásseres Jr.|CM|2000|VEN|74|76
Vincent Sierro|DM|1995|SUI|72|72
Abu Francis|DM|2001|GHA|70|73
Niklas Schmidt|AM|1998|GER|71|71
Denis Genreau|CM|1999|AUS|69|70
Aron Dønnum|RW|1998|NOR|74|74
Yann Gboho|AM|2001|FRA|72|75
Frank Magri|ST|1999|CMR|72|74
Santiago Hidalgo|ST|2005|ARG|68|78
Emersonn|ST|2005|BRA|68|78`,
    },
    {
      id: 'f_aja',
      name: 'AJ Auxerre',
      short: 'AJA',
      city: 'Auxerre',
      stadium: "Stade de l'Abbé-Deschamps",
      capacity: 18541,
      colors: ['#FFFFFF', '#0055A4'],
      reputation: 65,
      budget: 8,
      players: `Donovan Léon|GK|1992|FRA|72|72
Théo De Percin|GK|2001|FRA|65|70
Ewen Jaouen|GK|2003|FRA|60|67
Jubal|CB|1993|BRA|72|72
Sinaly Diomandé|CB|2001|CIV|71|74
Gabriel Osho|CB|1998|NGA|72|73
Paul Joly|RB|2000|FRA|70|72
Marvin Senaya|RB|2001|FRA|69|72
Clément Akpa|LB|2001|CIV|70|73
Fredrik Oppegård|LB|2002|NOR|70|74
Elisha Owusu|DM|1997|GHA|73|73
Kévin Danois|CM|2004|FRA|70|77
Lasso Coulibaly|CM|2002|MLI|70|74
Han-Noah Massengo|CM|2001|FRA|70|73
Romain Faivre|AM|1998|FRA|72|73
Danny Namaso|AM|2000|ENG|68|71
Lassine Sinayoko|ST|1999|MLI|73|74
Ado Onaiwu|ST|1995|JPN|68|68
Josué Casimir|RW|2001|FRA|69|72
Florian Aye|ST|1997|FRA|67|67`,
    },
    {
      id: 'f_srfc',
      name: 'Stade Rennais FC',
      short: 'REN',
      city: 'Rennes',
      stadium: 'Roazhon Park',
      capacity: 29778,
      colors: ['#E30613', '#000000'],
      reputation: 76,
      budget: 30,
      players: `Brice Samba|GK|1994|FRA|79|79
Mathys Silistrie|GK|2003|FRA|62|70
Elias Damergy|GK|2002|TUN|60|67
Lilian Brassier|CB|1999|FRA|73|75
Jérémy Jacquet|CB|2005|FRA|72|82
Anthony Rouault|CB|2001|FRA|74|77
Abdelhamid Aït Boudlal|CB|2006|MAR|67|80
Przemysław Frankowski|RB|1995|POL|75|75
Alidu Seidu|RB|2000|GHA|73|75
Lorenz Assignon|RB|2000|FRA|72|74
Quentin Merlin|LB|2002|FRA|73|77
Djaoui Cissé|CM|2004|FRA|72|80
Seko Fofana|CM|1995|CIV|77|77
Mahdi Camara|DM|1998|FRA|74|75
Valentin Rongier|CM|1994|FRA|76|76
Ludovic Blas|AM|1997|FRA|74|74
Sebastian Szymański|AM|1999|POL|77|78
Jordan James|CM|2004|WAL|72|79
Esteban Lepaul|ST|2000|FRA|75|77
Breel Embolo|ST|1997|SUI|76|76
Mousa Al-Tamari|RW|1997|JOR|74|74
Mohamed Kader Meïté|ST|2007|FRA|66|80`,
    },
    {
      id: 'f_fcn',
      name: 'FC Nantes',
      short: 'FCN',
      city: 'Nantes',
      stadium: 'Stade de la Beaujoire',
      capacity: 35322,
      colors: ['#FFD800', '#008D3C'],
      reputation: 69,
      budget: 12,
      players: `Anthony Lopes|GK|1990|POR|76|76
Patrik Carlgren|GK|1992|SWE|67|67
Rémy Descamps|GK|1996|FRA|66|66
Nicolas Pallois|CB|1987|FRA|69|69
Jean-Charles Castelletto|CB|1995|CMR|72|72
Chidozie Awaziem|CB|1997|NGA|71|71
Uroš Radaković|CB|1994|SRB|70|70
Tylel Tati|CB|2005|FRA|67|78
Kelvin Amian|RB|1998|FRA|70|71
Fabien Centonze|RB|1996|FRA|72|72
Nicolas Cozza|LB|1999|FRA|71|72
Francis Coquelin|DM|1991|FRA|70|70
Johann Lepenant|DM|2002|FRA|71|75
Pedro Chirivella|CM|1997|ESP|71|71
Douglas Augusto|CM|1997|BRA|72|72
Louis Leroux|CM|2005|FRA|67|77
Dehmaine Tabibou|AM|2004|FRA|66|76
Matthis Abline|ST|2003|FRA|75|80
Mostafa Mohamed|ST|1997|EGY|73|73
Ignatius Ganago|ST|1999|CMR|70|71
Yassine Benhattab|LW|1999|FRA|70|72
Bahereba Guirassy|RW|2005|FRA|66|76`,
    },
    {
      id: 'f_sco',
      name: 'Angers SCO',
      short: 'SCO',
      city: 'Angers',
      stadium: 'Stade Raymond-Kopa',
      capacity: 19350,
      colors: ['#000000', '#FFFFFF'],
      reputation: 62,
      budget: 6,
      players: `Hervé Koffi|GK|1996|BFA|72|72
Melvin Zinga|GK|2001|FRA|62|67
Paul Bernardoni|GK|1997|FRA|66|67
Jordan Lefort|CB|1993|FRA|70|70
Emmanuel Biumla|CB|1998|FRA|69|70
Ousmane Camara|CB|2001|FRA|69|72
Marius Courcoul|CB|2003|FRA|66|72
Carlens Arcus|RB|1996|HAI|70|70
Lilian Raolisoa|RB|2000|FRA|67|69
Florent Hanin|LB|1990|FRA|67|67
Jacques Ekomié|LB|2003|GAB|68|73
Haris Belkebla|DM|1994|ALG|70|70
Zinédine Ould Khaled|CM|2000|FRA|68|70
Himad Abdelli|AM|1999|ALG|73|74
Pierrick Capelle|CM|1987|FRA|66|66
Jean-Eudes Aholou|DM|1994|CIV|68|68
Yassin Belkhdim|CM|2002|MAR|68|72
Sidiki Chérif|ST|2006|FRA|69|80
Prosper Peter|RW|2006|NGA|68|78
Bamba Dieng|ST|2000|SEN|70|71
Farid El Melali|LW|1997|ALG|70|70`,
    },
    {
      id: 'f_hac',
      name: 'Le Havre AC',
      short: 'HAC',
      city: 'Le Havre',
      stadium: 'Stade Océane',
      capacity: 25178,
      colors: ['#6CABDD', '#002F6C'],
      reputation: 62,
      budget: 6,
      players: `Arthur Desmas|GK|1994|FRA|71|71
Mathieu Gorgelin|GK|1990|FRA|67|67
Lionel Mpasi|GK|1994|COD|68|68
Gautier Lloris|CB|1995|FRA|70|70
Étienne Youte Kinkoue|CB|2002|FRA|69|73
Arouna Sangante|CB|2002|SEN|70|74
Ayumu Seko|CB|2000|JPN|70|72
Yoann Salmier|CB|1992|FRA|67|67
Loïc Nego|RB|1991|HUN|70|70
Timothée Pembélé|RB|2002|FRA|68|72
Christopher Operi|LB|1997|CIV|69|69
Abdoulaye Touré|DM|1994|GUI|72|72
Yassine Kechta|CM|2002|MAR|71|74
Daler Kuzyaev|CM|1993|RUS|70|70
Rassoul Ndiaye|CM|2001|SEN|69|72
Simon Ebonog|CM|2004|CMR|67|75
Oussama Targhalline|DM|2002|MAR|69|73
Issa Soumaré|LW|2000|SEN|70|72
Antoine Joujou|RW|2003|FRA|69|74
André Ayew|ST|1989|GHA|69|69
Samuel Grandsir|RW|1996|FRA|68|68
Steve Ngoura|ST|2005|FRA|64|75`,
    },
    {
      id: 'f_fcl',
      name: 'FC Lorient',
      short: 'FCL',
      city: 'Lorient',
      stadium: 'Stade du Moustoir',
      capacity: 18110,
      colors: ['#F58220', '#000000'],
      reputation: 62,
      budget: 8,
      players: `Yvon Mvogo|GK|1994|SUI|74|74
Benjamin Leroy|GK|1989|FRA|64|64
Teddy Bartouche|GK|1997|FRA|62|64
Montassar Talbi|CB|1998|TUN|73|74
Bamo Meïté|CB|2001|CIV|70|73
Nathaniel Adjei|CB|2002|GHA|69|74
Isaak Touré|CB|2003|FRA|66|72
Igor Silva|RB|1996|BRA|69|69
Darlin Yongwa|LB|2000|CMR|69|71
Formose Mendy|RB|2001|SEN|68|71
Laurent Abergel|DM|1993|FRA|71|71
Jean-Victor Makengo|CM|1998|FRA|70|71
Arthur Avom|CM|2004|CMR|69|77
Théo Le Bris|CM|2002|FRA|70|74
Panos Katseris|AM|2001|GRE|69|72
Pablo Pagis|AM|2003|FRA|70|75
Tosin Aiyegun|LW|2000|BEN|70|72
Mohamed Bamba|ST|2001|CIV|72|75
Sambou Soumano|ST|2001|SEN|68|71
Joel Mvuka|RW|2002|NOR|69|73`,
    },
    {
      id: 'f_pfc',
      name: 'Paris FC',
      short: 'PFC',
      city: 'París',
      stadium: 'Stade Jean-Bouin',
      capacity: 19904,
      colors: ['#1E2D5A', '#FFFFFF'],
      reputation: 65,
      budget: 40,
      players: `Kevin Trapp|GK|1990|GER|78|78
Obed Nkambadio|GK|2003|FRA|68|75
Rémy Riou|GK|1987|FRA|64|64
Otávio|CB|1994|BRA|74|74
Diego Coppola|CB|2003|ITA|72|78
Samir Chergui|CB|1998|FRA|68|69
Timothée Kolodziejczak|CB|1991|FRA|68|68
Moustapha Mbow|CB|2000|SEN|71|74
Nhoa Sangui|LB|2006|FRA|66|78
Thibault De Smet|LB|1998|BEL|69|69
Tuomas Ollila|RB|2000|FIN|68|71
Maxime Lopez|CM|1997|FRA|73|73
Pierre Lees-Melou|DM|1993|FRA|74|74
Vincent Marchetti|CM|1997|FRA|70|70
Lohann Doucet|CM|2002|FRA|70|73
Ilan Kebbal|AM|1998|ALG|74|75
Mathieu Cafaro|AM|1997|FRA|69|69
Jonathan Ikoné|RW|1998|FRA|73|73
Moses Simon|LW|1995|NGA|75|75
Jean-Philippe Krasso|ST|1997|CIV|72|72
Willem Geubbels|ST|2001|FRA|70|72
Alimami Gory|LW|1996|FRA|69|69`,
    },
    {
      id: 'f_fcm',
      name: 'FC Metz',
      short: 'FCM',
      city: 'Metz',
      stadium: 'Stade Saint-Symphorien',
      capacity: 30000,
      colors: ['#7A1E3C', '#FFFFFF'],
      reputation: 60,
      budget: 6,
      players: `Jonathan Fischer|GK|1998|DEN|68|70
Alexandre Oukidja|GK|1988|ALG|69|69
Pape Mamadou Sy|GK|2003|SEN|64|72
Sadibou Sané|CB|2004|SEN|66|75
Ismaël Traoré|CB|1986|CIV|65|65
Fali Candé|LB|1998|GNB|68|69
Terry Yegbe|CB|2001|CIV|67|71
Koffi Kouao|RB|1998|CIV|69|70
Maxime Colin|RB|1991|FRA|66|66
Kévin Van den Kerkhof|RB|1996|FRA|68|68
Boubacar Traoré|DM|2001|MLI|69|72
Benjamin Stambouli|DM|1990|FRA|68|68
Jessy Deminguet|CM|1998|FRA|69|70
Alpha Touré|CM|2003|FRA|66|72
Gauthier Hein|AM|1996|FRA|71|71
Morgan Bokele|CM|2004|FRA|64|74
Habib Diallo|ST|1995|SEN|71|71
Cheikh Sabaly|LW|1999|SEN|69|70
Papa Amadou Diallo|RW|2004|SEN|68|74
Ibou Sané|RW|2003|SEN|67|72
Joël Asoro|ST|1999|SWE|67|68`,
    },
  ],
  tier2: [
    { id: 'f_asse', name: 'AS Saint-Étienne', short: 'ASE', city: 'Saint-Étienne', stadium: 'Stade Geoffroy-Guichard', capacity: 41965, colors: ['#009639', '#FFFFFF'], reputation: 66 },
    { id: 'f_mhsc', name: 'Montpellier HSC', short: 'MTP', city: 'Montpellier', stadium: 'Stade de la Mosson', capacity: 32900, colors: ['#F58220', '#1E2D5A'], reputation: 64 },
    { id: 'f_sdr', name: 'Stade de Reims', short: 'SDR', city: 'Reims', stadium: 'Stade Auguste-Delaune', capacity: 21684, colors: ['#E30613', '#FFFFFF'], reputation: 64 },
    { id: 'f_estac', name: 'ESTAC Troyes', short: 'EST', city: 'Troyes', stadium: "Stade de l'Aube", capacity: 20400, colors: ['#1E4B9B', '#FFFFFF'], reputation: 60 },
    { id: 'f_cf63', name: 'Clermont Foot 63', short: 'CLE', city: 'Clermont-Ferrand', stadium: 'Stade Gabriel-Montpied', capacity: 11980, colors: ['#C8102E', '#1E2D5A'], reputation: 59 },
    { id: 'f_eag', name: 'En Avant Guingamp', short: 'EAG', city: 'Guingamp', stadium: 'Stade du Roudourou', capacity: 18378, colors: ['#E30613', '#000000'], reputation: 58 },
    { id: 'f_sceb', name: 'SC Bastia', short: 'SCB', city: 'Bastia', stadium: 'Stade Armand-Cesari', capacity: 16078, colors: ['#0055A4', '#FFFFFF'], reputation: 58 },
    { id: 'f_gf38', name: 'Grenoble Foot 38', short: 'GRE', city: 'Grenoble', stadium: 'Stade des Alpes', capacity: 20068, colors: ['#1E4B9B', '#FFFFFF'], reputation: 57 },
    { id: 'f_rsfc', name: 'Red Star FC', short: 'RED', city: 'Saint-Ouen', stadium: 'Stade Bauer', capacity: 10000, colors: ['#009639', '#FFFFFF'], reputation: 57 },
    { id: 'f_fca', name: 'FC Annecy', short: 'FCA', city: 'Annecy', stadium: 'Parc des Sports', capacity: 15660, colors: ['#E30613', '#FFFFFF'], reputation: 56 },
  ],
};
