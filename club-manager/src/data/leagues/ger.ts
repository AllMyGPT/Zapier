import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: 'ger',
  name: 'Liga Alemana',
  country: 'Alemania',
  nat: 'GER',
  tier2Name: 'Segunda Alemana',
  clubs: [
    {
      id: 'g_fcb', name: 'FC Bayern München', short: 'FCB', city: 'Múnich',
      stadium: 'Allianz Arena', capacity: 75024, colors: ['#DC052D', '#FFFFFF'],
      reputation: 94, budget: 120,
      players: `Manuel Neuer|GK|1986|GER|86|86
Jonas Urbig|GK|2003|GER|74|84
Sven Ulreich|GK|1988|GER|70|70
Dayot Upamecano|CB|1998|FRA|85|86
Jonathan Tah|CB|1996|GER|85|85
Kim Min-jae|CB|1996|KOR|84|84
Hiroki Ito|CB|1999|JPN|79|81
Alphonso Davies|LB|2000|CAN|84|86
Raphaël Guerreiro|LB|1993|POR|79|79
Josip Stanišić|RB|2000|CRO|79|82
Konrad Laimer|RB|1997|AUT|81|81
Joshua Kimmich|DM|1995|GER|88|88
Aleksandar Pavlović|DM|2004|GER|82|88
Leon Goretzka|CM|1995|GER|82|82
Tom Bischof|CM|2005|GER|76|85
Jamal Musiala|AM|2003|GER|87|92
Lennart Karl|AM|2008|GER|68|86
Michael Olise|RW|2001|FRA|88|91
Serge Gnabry|RW|1995|GER|81|81
Luis Díaz|LW|1997|COL|86|86
Harry Kane|ST|1993|ENG|90|90`,
    },
    {
      id: 'g_bvb', name: 'Borussia Dortmund', short: 'BVB', city: 'Dortmund',
      stadium: 'Signal Iduna Park', capacity: 81365, colors: ['#FDE100', '#000000'],
      reputation: 87, budget: 70,
      players: `Gregor Kobel|GK|1997|SUI|86|87
Alexander Meyer|GK|1991|GER|69|69
Silas Ostrzinski|GK|2003|GER|62|72
Nico Schlotterbeck|CB|1999|GER|84|86
Waldemar Anton|CB|1996|GER|80|80
Filippo Mané|CB|2005|ITA|66|79
Ramy Bensebaini|LB|1995|ALG|77|77
Daniel Svensson|LB|2002|SWE|76|81
Julian Ryerson|RB|1997|NOR|79|79
Yan Couto|RB|2002|BRA|77|82
Emre Can|DM|1994|GER|78|78
Felix Nmecha|CM|2000|GER|80|84
Pascal Groß|CM|1991|GER|80|80
Marcel Sabitzer|CM|1994|AUT|79|79
Jobe Bellingham|CM|2005|ENG|76|86
Julian Brandt|AM|1996|GER|81|81
Carney Chukwuemeka|AM|2003|ENG|74|81
Karim Adeyemi|LW|2002|GER|80|84
Maximilian Beier|ST|2002|GER|79|83
Serhou Guirassy|ST|1996|GUI|85|85
Fábio Silva|ST|2002|POR|75|80`,
    },
    {
      id: 'g_b04', name: 'Bayer 04 Leverkusen', short: 'B04', city: 'Leverkusen',
      stadium: 'BayArena', capacity: 30210, colors: ['#E32221', '#000000'],
      reputation: 85, budget: 60,
      players: `Mark Flekken|GK|1993|NED|80|80
Janis Blaswich|GK|1991|GER|74|74
Niklas Lomb|GK|1993|GER|64|64
Edmond Tapsoba|CB|1999|BFA|81|83
Jarell Quansah|CB|2003|ENG|78|84
Loïc Badé|CB|2000|FRA|79|81
Jeanuël Belocian|CB|2005|FRA|70|80
Alejandro Grimaldo|LB|1995|ESP|83|83
Arthur|RB|2003|BRA|72|78
Lucas Vázquez|RB|1991|ESP|77|77
Robert Andrich|DM|1994|GER|79|79
Aleix García|CM|1997|ESP|80|80
Exequiel Palacios|CM|1998|ARG|80|80
Ibrahim Maza|AM|2005|ALG|72|83
Malik Tillman|AM|2002|USA|79|83
Eliesse Ben Seghir|AM|2005|MAR|76|85
Claudio Echeverri|AM|2006|ARG|72|85
Ernest Poku|RW|2004|NED|75|82
Nathan Tella|RW|1999|NGA|75|76
Martin Terrier|LW|1997|FRA|77|77
Patrik Schick|ST|1996|CZE|80|80
Christian Kofane|ST|2006|CMR|68|82`,
    },
    {
      id: 'g_rbl', name: 'RB Leipzig', short: 'RBL', city: 'Leipzig',
      stadium: 'Red Bull Arena', capacity: 47069, colors: ['#FFFFFF', '#DD0741'],
      reputation: 83, budget: 55,
      players: `Péter Gulácsi|GK|1990|HUN|79|79
Maarten Vandevoordt|GK|2002|BEL|74|83
Leopold Zingerle|GK|1994|GER|63|63
Willi Orbán|CB|1992|HUN|81|81
Castello Lukeba|CB|2002|FRA|80|85
El Chadaille Bitshiabu|CB|2005|FRA|70|80
Lukas Klostermann|CB|1996|GER|76|76
David Raum|LB|1998|GER|80|80
Max Finkgräfe|LB|2004|GER|68|78
Ridle Baku|RB|1998|GER|77|77
Nicolas Seiwald|DM|2001|AUT|78|81
Xaver Schlager|CM|1997|AUT|80|80
Assan Ouédraogo|CM|2006|GER|72|86
Ezechiel Banzuzi|DM|2005|BEL|71|80
Christoph Baumgartner|AM|1999|AUT|79|79
Brajan Gruda|AM|2004|GER|73|81
Antonio Nusa|LW|2005|NOR|76|86
Yan Diomande|RW|2006|CIV|70|84
Johan Bakayoko|RW|2003|BEL|76|83
Conrad Harder|ST|2005|DEN|72|83`,
    },
    {
      id: 'g_sge', name: 'Eintracht Frankfurt', short: 'SGE', city: 'Fráncfort',
      stadium: 'Deutsche Bank Park', capacity: 58000, colors: ['#E1000F', '#000000'],
      reputation: 80, budget: 40,
      players: `Kauã Santos|GK|2003|BRA|75|83
Michael Zetterer|GK|1995|GER|74|74
Jens Grahl|GK|1988|GER|63|63
Robin Koch|CB|1996|GER|80|80
Arthur Theate|CB|2000|BEL|79|80
Aurèle Amenda|CB|2003|SUI|72|80
Nnamdi Collins|CB|2004|GER|72|81
Nathaniel Brown|LB|2003|GER|75|82
Rasmus Kristensen|RB|1997|DEN|76|76
Timothy Chandler|RB|1990|USA|63|63
Ellyes Skhiri|DM|1995|TUN|78|78
Hugo Larsson|CM|2004|SWE|78|85
Oscar Højlund|CM|2005|DEN|70|80
Mario Götze|AM|1992|GER|76|76
Can Uzun|AM|2005|TUR|76|86
Fares Chaïbi|AM|2002|ALG|75|79
Ritsu Doan|RW|1998|JPN|79|79
Ansgar Knauff|RW|2002|GER|75|77
Jean-Mattéo Bahoya|LW|2005|FRA|72|81
Jonathan Burkardt|ST|2000|GER|79|81
Elye Wahi|ST|2003|FRA|74|80
Michy Batshuayi|ST|1993|BEL|73|73`,
    },
    {
      id: 'g_vfb', name: 'VfB Stuttgart', short: 'VFB', city: 'Stuttgart',
      stadium: 'MHPArena', capacity: 60449, colors: ['#FFFFFF', '#E32219'],
      reputation: 79, budget: 35,
      players: `Alexander Nübel|GK|1996|GER|81|81
Fabian Bredlow|GK|1995|GER|69|69
Dennis Seimen|GK|2005|GER|62|74
Jeff Chabot|CB|1998|GER|78|79
Finn Jeltsch|CB|2006|GER|72|84
Dan-Axel Zagadou|CB|1999|FRA|76|76
Ramon Hendriks|CB|2001|NED|74|77
Maximilian Mittelstädt|LB|1997|GER|79|79
Josha Vagnoman|RB|2000|GER|74|76
Leonidas Stergiou|RB|2002|SUI|73|78
Lorenz Assignon|RB|2000|FRA|73|76
Atakan Karazor|DM|1996|GER|77|77
Angelo Stiller|CM|2001|GER|82|85
Chema Andrés|CM|2005|ESP|71|81
Nikolas Nartey|CM|2000|DEN|71|73
Bilal El Khannouss|AM|2004|MAR|77|84
Chris Führich|LW|1998|GER|78|78
Jamie Leweling|RW|2001|GER|78|81
Badredine Bouanani|AM|2004|ALG|71|79
Tiago Tomás|ST|2002|POR|73|77
Deniz Undav|ST|1996|GER|81|81
Ermedin Demirović|ST|1998|BIH|79|79`,
    },
    {
      id: 'g_scf', name: 'SC Freiburg', short: 'SCF', city: 'Friburgo',
      stadium: 'Europa-Park Stadion', capacity: 34700, colors: ['#000000', '#E2001A'],
      reputation: 75, budget: 20,
      players: `Noah Atubolu|GK|2002|GER|79|84
Florian Müller|GK|1997|GER|71|71
Jannik Huth|GK|1994|GER|63|63
Matthias Ginter|CB|1994|GER|79|79
Philipp Lienhart|CB|1996|AUT|78|78
Max Rosenfelder|CB|2003|GER|73|79
Christian Günter|LB|1993|GER|74|74
Jordy Makengo|LB|2001|FRA|71|74
Lukas Kübler|RB|1992|GER|74|74
Philipp Treu|RB|2001|GER|73|77
Maximilian Eggestein|CM|1996|GER|77|77
Patrick Osterhage|CM|2000|GER|74|76
Johan Manzambi|CM|2005|SUI|74|84
Nicolas Höfler|DM|1990|GER|70|70
Yuito Suzuki|AM|2001|JPN|75|78
Merlin Röhl|AM|2002|GER|71|76
Vincenzo Grifo|LW|1993|ITA|77|77
Jan-Niklas Beste|LW|1999|GER|75|76
Eren Dinkçi|RW|2001|GER|72|76
Lucas Höler|ST|1994|GER|74|74
Igor Matanović|ST|2003|CRO|73|78
Junior Adamu|ST|2001|AUT|72|75`,
    },
    {
      id: 'g_m05', name: '1. FSV Mainz 05', short: 'M05', city: 'Maguncia',
      stadium: 'MEWA Arena', capacity: 33305, colors: ['#C3141E', '#FFFFFF'],
      reputation: 73, budget: 15,
      players: `Robin Zentner|GK|1994|GER|77|77
Daniel Batz|GK|1991|GER|68|68
Lasse Rieß|GK|2001|GER|62|68
Stefan Bell|CB|1991|GER|73|73
Andreas Hanche-Olsen|CB|1997|NOR|74|74
Maxim Leitsch|CB|1998|GER|73|74
Dominik Kohr|CB|1994|GER|74|74
Danny da Costa|CB|1993|GER|73|73
Phillipp Mwene|LB|1994|AUT|71|71
Anthony Caci|LB|1997|FRA|75|75
Silvan Widmer|RB|1993|SUI|74|74
Kaishu Sano|DM|2000|JPN|78|80
Nadiem Amiri|CM|1996|GER|79|79
Sota Kawasaki|CM|2001|JPN|70|74
Lee Jae-sung|AM|1992|KOR|76|76
Paul Nebel|AM|2002|GER|75|79
Hong Hyun-seok|AM|1999|KOR|72|73
Arnaud Nordin|LW|1998|FRA|72|72
Armindo Sieb|RW|2003|GER|72|77
Benedict Hollerbach|ST|2001|GER|74|77
Phillip Tietz|ST|1997|GER|74|74
Nelson Weiper|ST|2005|GER|68|78`,
    },
    {
      id: 'g_wob', name: 'VfL Wolfsburg', short: 'WOB', city: 'Wolfsburgo',
      stadium: 'Volkswagen Arena', capacity: 28917, colors: ['#65B32E', '#FFFFFF'],
      reputation: 74, budget: 30,
      players: `Kamil Grabara|GK|1999|POL|78|80
Marius Müller|GK|1993|GER|68|68
Pavao Pervan|GK|1987|AUT|66|66
Denis Vavro|CB|1996|SVK|75|75
Konstantinos Koulierakis|CB|2003|GRE|75|82
Moritz Jenz|CB|1999|GER|72|74
Joakim Mæhle|LB|1997|DEN|76|76
Aaron Zehnter|LB|2004|GER|67|76
Kilian Fischer|RB|2000|GER|74|76
Sael Kumbedi|RB|2005|FRA|69|79
Vinicius Souza|DM|1999|BRA|76|78
Maximilian Arnold|CM|1994|GER|76|76
Christian Eriksen|CM|1992|DEN|78|78
Mattias Svanberg|CM|1999|SWE|75|76
Yannick Gerhardt|CM|1994|GER|71|71
Lovro Majer|AM|1998|CRO|77|77
Patrick Wimmer|RW|2001|AUT|76|78
Kevin Paredes|LW|2003|USA|71|77
Adam Daghim|RW|2005|DEN|69|79
Mohamed Amoura|ST|2000|ALG|80|82
Jonas Wind|ST|1999|DEN|77|77
Dženan Pejčinović|ST|2005|GER|67|78`,
    },
    {
      id: 'g_bmg', name: 'Borussia Mönchengladbach', short: 'BMG', city: 'Mönchengladbach',
      stadium: 'Borussia-Park', capacity: 54042, colors: ['#FFFFFF', '#000000'],
      reputation: 75, budget: 20,
      players: `Moritz Nicolas|GK|1997|GER|76|77
Jonas Omlin|GK|1994|SUI|75|75
Tiago Pereira Cardoso|GK|2006|LUX|60|74
Nico Elvedi|CB|1996|SUI|77|77
Kevin Diks|CB|1996|NED|76|76
Marvin Friedrich|CB|1995|GER|72|72
Fabio Chiarodia|CB|2005|ITA|68|78
Luca Netz|LB|2003|GER|74|78
Lukas Ullrich|LB|2004|GER|70|78
Joe Scally|RB|2002|USA|75|77
Julian Weigl|DM|1995|GER|76|76
Philipp Sander|DM|1998|GER|73|74
Rocco Reitz|CM|2002|GER|77|81
Yannik Engelhardt|CM|2001|GER|72|76
Jens Castrop|CM|2003|KOR|73|78
Florian Neuhaus|CM|1997|GER|74|74
Kevin Stöger|AM|1993|AUT|76|76
Franck Honorat|RW|1996|FRA|76|76
Robin Hack|LW|1998|GER|75|75
Tim Kleindienst|ST|1995|GER|77|77
Haris Tabaković|ST|1994|SUI|74|74
Shuto Machino|ST|1999|JPN|74|75`,
    },
    {
      id: 'g_fca', name: 'FC Augsburg', short: 'FCA', city: 'Augsburgo',
      stadium: 'WWK Arena', capacity: 30660, colors: ['#BA3733', '#46714D'],
      reputation: 70, budget: 12,
      players: `Finn Dahmen|GK|1998|GER|76|77
Nediljko Labrović|GK|1999|CRO|71|74
Daniel Klein|GK|2001|GER|62|67
Jeffrey Gouweleeuw|CB|1991|NED|73|73
Keven Schlotterbeck|CB|1997|GER|74|74
Cédric Zesiger|CB|1998|SUI|74|74
Chrislain Matsima|CB|2002|FRA|73|78
Noahkai Banks|CB|2006|USA|65|79
Dimitris Giannoulis|LB|1995|GRE|74|74
Mads Pedersen|RB|1996|DEN|73|73
Marius Wolf|RB|1995|GER|74|74
Kristijan Jakić|DM|1997|CRO|74|74
Elvis Rexhbeçaj|CM|1997|KVX|74|74
Han-Noah Massengo|CM|2001|FRA|72|75
Fabian Rieder|AM|2002|SUI|74|78
Mert Kömür|AM|2005|GER|70|80
Alexis Claude-Maurice|AM|1998|FRA|75|75
Yusuf Kabadayı|LW|2004|TUR|66|74
Ismaël Gharbi|RW|2004|ESP|68|76
Samuel Essende|ST|1998|COD|73|73
Steve Mounié|ST|1994|BEN|71|71`,
    },
    {
      id: 'g_fcu', name: '1. FC Union Berlin', short: 'FCU', city: 'Berlín',
      stadium: 'Stadion An der Alten Försterei', capacity: 22012, colors: ['#EB1923', '#FFFFFF'],
      reputation: 71, budget: 10,
      players: `Frederik Rønnow|GK|1992|DEN|78|78
Carl Klaus|GK|1994|GER|65|65
Alexander Schwolow|GK|1992|GER|68|68
Danilho Doekhi|CB|1998|NED|77|77
Diogo Leite|CB|1999|POR|76|77
Leopold Querfeld|CB|2003|AUT|74|80
Kevin Vogt|CB|1991|GER|71|71
Tom Rothe|LB|2004|GER|73|79
Derrick Köhn|LB|1999|GHA|72|73
Josip Juranović|RB|1995|CRO|75|75
Rani Khedira|DM|1994|GER|76|76
Aljoscha Kemlein|CM|2004|GER|71|78
Alex Král|CM|1998|CZE|72|72
Janik Haberer|CM|1994|GER|71|71
András Schäfer|AM|1999|HUN|73|73
Jeong Woo-yeong|AM|1999|KOR|72|72
Tim Skarke|RW|1996|GER|70|70
Livan Burcu|RW|2004|GER|67|75
Oliver Burke|ST|1997|SCO|72|72
Andrej Ilić|ST|2000|SRB|73|75
Ilyas Ansah|ST|2004|GER|70|79`,
    },
    {
      id: 'g_svw', name: 'SV Werder Bremen', short: 'SVW', city: 'Bremen',
      stadium: 'Weserstadion', capacity: 42100, colors: ['#1D9053', '#FFFFFF'],
      reputation: 73, budget: 15,
      players: `Mio Backhaus|GK|2004|GER|72|82
Karl Hein|GK|2002|EST|72|76
Markus Kolke|GK|1990|GER|63|63
Marco Friedl|CB|1998|AUT|76|76
Amos Pieper|CB|1998|GER|73|74
Niklas Stark|CB|1995|GER|73|73
Julián Malatini|CB|2001|ARG|71|74
Karim Coulibaly|CB|2007|GER|66|80
Olivier Deman|LB|2000|BEL|70|72
Mitchell Weiser|RB|1994|GER|76|76
Yukinari Sugawara|RB|2000|JPN|74|75
Senne Lynen|DM|1999|BEL|76|76
Jens Stage|CM|1996|DEN|77|77
Leonardo Bittencourt|CM|1993|GER|71|71
Isak Hansen-Aarøen|CM|2004|NOR|67|76
Romano Schmid|AM|2000|AUT|77|78
Cameron Puertas|AM|1998|SUI|72|73
Marco Grüll|LW|1998|AUT|72|72
Samuel Mbangula|LW|2004|BEL|72|78
Justin Njinmah|RW|2000|GER|71|74
Victor Boniface|ST|2000|NGA|79|80
Keke Topp|ST|2004|GER|68|77`,
    },
    {
      id: 'g_tsg', name: 'TSG 1899 Hoffenheim', short: 'TSG', city: 'Sinsheim',
      stadium: 'PreZero Arena', capacity: 30150, colors: ['#1C63B7', '#FFFFFF'],
      reputation: 72, budget: 20,
      players: `Oliver Baumann|GK|1990|GER|80|80
Luca Philipp|GK|2000|GER|64|68
Lúkas Petersson|GK|2004|ISL|62|74
Ozan Kabak|CB|2000|TUR|76|77
Robin Hranáč|CB|2000|CZE|74|76
Kevin Akpoguma|CB|1995|NGA|72|72
Albian Hajdari|CB|2003|SUI|72|78
Bernardo|LB|1995|BRA|72|72
Alexander Prass|LB|2001|AUT|73|76
Vladimír Coufal|RB|1992|CZE|74|74
Pavel Kadeřábek|RB|1992|CZE|71|71
Valentin Gendrey|RB|2000|FRA|71|73
Leon Avdullahu|DM|2004|KVX|72|80
Wouter Burger|DM|2001|NED|74|77
Grischa Prömel|CM|1995|GER|73|73
Umut Tohumcu|CM|2004|GER|68|76
Andrej Kramarić|AM|1991|CRO|78|78
Adam Hložek|AM|2002|CZE|74|78
Bazoumana Touré|LW|2006|CIV|71|82
Ihlas Bebou|RW|1994|TOG|71|71
Fisnik Asllani|ST|2002|KVX|74|79
Tim Lemperle|ST|2002|GER|73|78`,
    },
    {
      id: 'g_fch', name: '1. FC Heidenheim 1846', short: 'FCH', city: 'Heidenheim',
      stadium: 'Voith-Arena', capacity: 15000, colors: ['#E2001A', '#003D7C'],
      reputation: 66, budget: 6,
      players: `Diant Ramaj|GK|2001|GER|72|78
Kevin Müller|GK|1991|GER|72|72
Frank Feller|GK|2004|GER|63|72
Patrick Mainka|CB|1994|GER|73|73
Benedikt Gimber|CB|1997|GER|71|71
Tim Siersleben|CB|2000|GER|69|71
Hennes Behrens|CB|2005|GER|64|74
Jonas Föhrenbach|LB|1996|GER|69|69
Leart Paqarada|LB|1994|KVX|71|71
Omar Traoré|RB|1998|GER|72|73
Marnon Busch|RB|1994|GER|68|68
Niklas Dorsch|DM|1998|GER|72|72
Jan Schöppner|CM|1999|GER|71|72
Lennard Maloney|CM|1999|USA|71|71
Luca Kerber|CM|2002|GER|69|73
Adrian Beck|AM|1997|GER|70|70
Arijon Ibrahimović|AM|2005|GER|67|77
Mathias Honsak|LW|1996|AUT|71|71
Sirlord Conteh|RW|1996|GER|69|69
Budu Zivzivadze|ST|1994|GEO|70|70
Stefan Schimmer|ST|1994|GER|68|68
Marvin Pieringer|ST|1999|GER|71|72`,
    },
    {
      id: 'g_stp', name: 'FC St. Pauli', short: 'STP', city: 'Hamburgo',
      stadium: 'Millerntor-Stadion', capacity: 29546, colors: ['#5C3E2E', '#FFFFFF'],
      reputation: 65, budget: 6,
      players: `Nikola Vasilj|GK|1995|BIH|77|77
Ben Voll|GK|2001|GER|65|70
Sascha Burchert|GK|1989|GER|63|63
Hauke Wahl|CB|1994|GER|75|75
Eric Smith|CB|1997|SWE|75|75
Karol Mets|CB|1993|EST|71|71
Louis Oppie|LB|2002|GER|66|72
Lars Ritzka|LB|1998|GER|69|70
Manolis Saliakas|RB|1996|GRE|72|72
Arkadiusz Pyrka|RB|2002|POL|71|75
Jackson Irvine|DM|1993|AUS|74|74
James Sands|DM|2000|USA|72|74
Joel Chima Fujita|CM|2002|JPN|72|77
Carlo Boukhalfa|CM|1999|GER|68|70
Connor Metcalfe|CM|1999|AUS|70|71
Danel Sinani|AM|1997|LUX|71|71
Mathias Pereira Lage|LW|1996|FRA|71|71
Oladapo Afolayan|LW|1997|ENG|71|71
Andréas Hountondji|ST|2002|BEN|72|77
Martijn Kaars|ST|1999|NED|70|72
Ricky-Jade Jones|ST|2002|ENG|68|73`,
    },
    {
      id: 'g_hsv', name: 'Hamburger SV', short: 'HSV', city: 'Hamburgo',
      stadium: 'Volksparkstadion', capacity: 57000, colors: ['#FFFFFF', '#0A3F86'],
      reputation: 70, budget: 15,
      players: `Daniel Heuer Fernandes|GK|1992|POR|74|74
Daniel Peretz|GK|2000|ISR|71|75
Matheo Raab|GK|1999|GER|65|68
Luka Vušković|CB|2007|CRO|73|87
Daniel Elfadli|CB|1997|LBY|72|73
Jordan Torunarigha|CB|1997|NGA|72|72
Warmed Omari|CB|2000|FRA|71|74
Miro Muheim|LB|1998|SUI|73|73
William Mikelbrencis|RB|2004|FRA|69|76
Giorgi Gocholeishvili|RB|2001|GEO|71|74
Nicolás Capaldo|DM|1998|ARG|73|73
Albert Sambi Lokonga|CM|1999|BEL|74|76
Nicolai Remberg|CM|2000|GER|72|74
Jonas Meffert|DM|1994|GER|71|71
Fábio Vieira|AM|2000|POR|76|78
Alexander Røssing-Lelesiit|AM|2007|NOR|64|78
Jean-Luc Dompé|LW|1995|FRA|72|72
Rayan Philippe|RW|2000|FRA|71|74
Ransford Königsdörffer|ST|2001|GHA|73|75
Yussuf Poulsen|ST|1994|DEN|73|73
Robert Glatzel|ST|1993|GER|72|72`,
    },
    {
      id: 'g_koe', name: '1. FC Köln', short: 'KOE', city: 'Colonia',
      stadium: 'RheinEnergieStadion', capacity: 50000, colors: ['#FFFFFF', '#ED1C24'],
      reputation: 69, budget: 12,
      players: `Marvin Schwäbe|GK|1995|GER|75|75
Ron-Robert Zieler|GK|1989|GER|67|67
Jonas Nickisch|GK|2004|GER|60|70
Timo Hübers|CB|1996|GER|72|72
Rav van den Berg|CB|2004|NED|72|80
Cenk Özkacar|CB|2000|TUR|71|73
Joël Schmied|CB|1998|SUI|71|72
Kristoffer Lund|LB|2002|USA|71|75
Sebastian Sebulonsen|RB|2000|NOR|70|73
Jusuf Gazibegović|RB|2000|BIH|71|73
Eric Martel|DM|2002|GER|74|77
Tom Krauß|CM|2001|GER|72|74
Isak Bergmann Jóhannesson|CM|2003|ISL|73|78
Denis Huseinbašić|CM|2001|GER|70|73
Florian Kainz|AM|1992|AUT|72|72
Luca Waldschmidt|AM|1996|GER|71|71
Jan Thielmann|RW|2002|GER|71|74
Linton Maina|LW|1999|GER|71|72
Said El Mala|LW|2006|GER|72|85
Jakub Kamiński|LW|2002|POL|73|76
Marius Bülter|ST|1993|GER|72|72
Ragnar Ache|ST|1998|GER|72|73`,
    },
  ],
  tier2: [
    { id: 'g_s04', name: 'FC Schalke 04', short: 'S04', city: 'Gelsenkirchen', stadium: 'Veltins-Arena', capacity: 62271, colors: ['#004D9D', '#FFFFFF'], reputation: 68 },
    { id: 'g_bsc', name: 'Hertha BSC', short: 'BSC', city: 'Berlín', stadium: 'Olympiastadion', capacity: 74475, colors: ['#005CA9', '#FFFFFF'], reputation: 66 },
    { id: 'g_ksv', name: 'Holstein Kiel', short: 'KSV', city: 'Kiel', stadium: 'Holstein-Stadion', capacity: 15034, colors: ['#003D7C', '#FFFFFF'], reputation: 63 },
    { id: 'g_boc', name: 'VfL Bochum 1848', short: 'BOC', city: 'Bochum', stadium: 'Vonovia Ruhrstadion', capacity: 26000, colors: ['#005BA4', '#FFFFFF'], reputation: 63 },
    { id: 'g_f95', name: 'Fortuna Düsseldorf', short: 'F95', city: 'Düsseldorf', stadium: 'Merkur Spiel-Arena', capacity: 54600, colors: ['#E2001A', '#FFFFFF'], reputation: 62 },
    { id: 'g_h96', name: 'Hannover 96', short: 'H96', city: 'Hannover', stadium: 'Heinz von Heiden Arena', capacity: 49000, colors: ['#00863E', '#000000'], reputation: 62 },
    { id: 'g_fck', name: '1. FC Kaiserslautern', short: 'FCK', city: 'Kaiserslautern', stadium: 'Fritz-Walter-Stadion', capacity: 49850, colors: ['#D2232A', '#FFFFFF'], reputation: 61 },
    { id: 'g_fcn', name: '1. FC Nürnberg', short: 'FCN', city: 'Núremberg', stadium: 'Max-Morlock-Stadion', capacity: 50000, colors: ['#9E1B32', '#000000'], reputation: 60 },
    { id: 'g_ksc', name: 'Karlsruher SC', short: 'KSC', city: 'Karlsruhe', stadium: 'BBBank Wildpark', capacity: 34302, colors: ['#0055A4', '#FFFFFF'], reputation: 58 },
    { id: 'g_d98', name: 'SV Darmstadt 98', short: 'D98', city: 'Darmstadt', stadium: 'Merck-Stadion am Böllenfalltor', capacity: 17650, colors: ['#004E9E', '#FFFFFF'], reputation: 57 },
  ],
};
