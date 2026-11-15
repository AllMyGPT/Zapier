import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: "ita",
  name: "Liga Italiana",
  country: "Italia",
  nat: "ITA",
  tier2Name: "Segunda Italiana",
  clubs: [
    {
      id: "i_int", name: "Inter", short: "INT", city: "Milano", stadium: "San Siro", capacity: 75817,
      colors: ["#0068A8", "#000000"], reputation: 92, budget: 80,
      players: `Josep Martínez|GK|1998|ESP|77|80|10|2029
Ivan Provedel|GK|1994|ITA|75|75|3|2029
Raffaele Di Gennaro|GK|1993|ITA|62|62|0.3|2027
Alessandro Bastoni|CB|1999|ITA|85|86|65|2028
Yann Bisseck|CB|2000|GER|81|84|50|2031
Manuel Akanji|CB|1995|SUI|83|83|17|2028
John Stones|CB|1994|ENG|81|81|12|2028
Benjamin Pavard|CB|1996|FRA|80|80|12|2028
Federico Dimarco|LB|1997|ITA|85|85|50|2028
Carlos Augusto|LB|1999|BRA|78|79|23|2028
Djed Spence|RB|2000|ENG|78|79|35|2031
Aleksandar Stanković|DM|2005|SRB|76|85|32|2031
Hakan Çalhanoğlu|DM|1994|TUR|84|84|16|2027
Nicolò Barella|CM|1997|ITA|86|86|50|2029
Petar Sučić|CM|2003|CRO|78|85|45|2030
Curtis Jones|CM|2001|ENG|79|81|35|2031
Andy Diouf|CM|2003|FRA|77|79|30|2030
Piotr Zieliński|CM|1994|POL|80|80|10|2028
Henrikh Mkhitaryan|CM|1989|ARM|81|81|3|2027
Luis Henrique|CM|2001|BRA|77|80|20|2030
Lautaro Martínez|ST|1997|ARG|87|87|85|2029
Marcus Thuram|ST|1997|FRA|85|85|50|2028
Pio Esposito|ST|2005|ITA|78|87|50|2032
Ange-Yoan Bonny|ST|2003|CIV|77|83|35|2030`,
    },
    {
      id: "i_mil", name: "AC Milan", short: "MIL", city: "Milano", stadium: "San Siro", capacity: 75817,
      colors: ["#FB090B", "#000000"], reputation: 88, budget: 70,
      players: `Mike Maignan|GK|1995|FRA|82|82|20|2031
Lorenzo Torriani|GK|2005|ITA|65|79|2|2030
Pietro Terracciano|GK|1990|ITA|73|73|0.9|2027
Strahinja Pavlović|CB|2001|SRB|79|82|40|2031
Mario Gila|CB|2000|ESP|80|83|30|2031
Koni De Winter|CB|2002|BEL|77|81|25|2030
Matteo Gabbia|CB|1999|ITA|79|80|17|2029
Fikayo Tomori|CB|1997|ENG|79|79|10|2027
Filippo Terracciano|CB|2003|ITA|69|75|4.5|2028
Sankhoun Diawara|CB|2006|FRA|65|76|2|2031
Valeri Vladimirov|CB|2008|BUL|61|76|0.8|2029
Davide Bartesaghi|LB|2005|ITA|74|87|22|2030
Pervis Estupiñán|LB|1998|ECU|78|78|12|2030
Ardon Jashari|DM|2002|SUI|77|82|22|2030
Adrien Rabiot|CM|1995|FRA|83|83|18|2028
Yunus Musah|CM|2002|USA|76|80|18|2028
Christian Comotto|CM|2008|ITA|71|86|10|2031
Ruben Loftus-Cheek|CM|1996|ENG|78|78|8.5|2027
Warren Bondo|CM|2003|FRA|70|76|4|2029
Luka Modrić|CM|1985|CRO|84|84|3.5|2027
Alexis Saelemaekers|CM|1999|BEL|79|80|18|2031
Diego Moreira|CM|2004|BEL|77|83|45|2031
Alphadjo Cisse|AM|2006|ITA|74|85|20|2030
Christian Pulisic|RW|1998|USA|83|83|35|2031
Omari Hutchinson|RW|2003|ENG|76|82|30|2027
Samuel Chukwueze|RW|1999|NGA|76|77|20|2028
Gonçalo Ramos|ST|2001|POR|80|83|50|2031
Francesco Camarda|ST|2008|ITA|73|91|15|2031`,
    },
    {
      id: "i_juv", name: "Juventus", short: "JUV", city: "Torino", stadium: "Allianz Stadium", capacity: 41507,
      colors: ["#000000", "#FFFFFF"], reputation: 89, budget: 75,
      players: `Kamil Grabara|GK|1999|POL|76|76|12|2027
Guglielmo Vicario|GK|1996|ITA|79|79|12|2027
Neto|GK|1989|BRA|74|74|0.9|2027
Carlo Pinsoglio|GK|1990|ITA|64|64|0.2|2027
Bremer|CB|1997|BRA|83|83|35|2029
Pierre Kalulu|CB|2000|FRA|80|82|32|2029
Lloyd Kelly|CB|1998|ENG|78|79|23|2029
Jhon Lucumí|CB|1998|COL|80|81|22|2030
Federico Gatti|CB|1998|ITA|78|79|10|2030
Daniele Rugani|CB|1994|ITA|73|73|2|2028
Andrea Cambiaso|LB|2000|ITA|80|82|15|2029
Juan Cabal|LB|2001|COL|74|78|7|2029
Zeki Çelik|RB|1997|TUR|77|77|14|2029
Manuel Locatelli|DM|1998|ITA|81|81|25|2030
Khéphren Thuram|CM|2001|FRA|80|83|35|2029
Weston McKennie|CM|1998|USA|79|79|30|2030
Pape Matar Sarr|CM|2002|SEN|78|81|30|2027
Douglas Luiz|CM|1998|BRA|78|78|18|2029
Teun Koopmeiners|CM|1998|NED|79|79|14|2029
Kenan Yıldız|LW|2005|TUR|82|88|75|2030
Kerim Alajbegovic|LW|2007|BIH|76|89|32|2031
Nico González|LW|1998|ARG|79|82|22|2030
Jérémie Boga|LW|1997|CIV|76|76|8|2029
Francisco Conceição|RW|2002|POR|80|84|30|2030
Edon Zhegrova|RW|1999|KVX|79|80|10|2030
Nick Woltemade|ST|2002|GER|80|85|50|2027
Randal Kolo Muani|ST|1998|FRA|80|80|30|2031
Jeff Ekhator|ST|2006|ITA|74|86|18|2031
Arkadiusz Milik|ST|1994|POL|72|72|1.5|2027`,
    },
    {
      id: "i_nap", name: "Napoli", short: "NAP", city: "Napoli", stadium: "Stadio Diego Armando Maradona", capacity: 54726,
      colors: ["#12A0D7", "#FFFFFF"], reputation: 87, budget: 70,
      players: `Vanja Milinković-Savić|GK|1997|SRB|78|79|15|2030
Alex Meret|GK|1997|ITA|76|76|8|2027
Nikita Contini|GK|1996|ITA|62|62|0.4|2031
Claudio Pugliese|GK|2008|ITA|53|68|0.1|2026
Alessandro Buongiorno|CB|1999|ITA|81|83|25|2029
Sam Beukema|CB|1998|NED|78|80|18|2030
Rafa Marín|CB|2002|ESP|75|75|16|2029
Benoît Badiashile|CB|2001|FRA|76|76|15|2027
Amir Rrahmani|CB|1994|KVX|81|81|10|2027
Luca Marianucci|CB|2004|ITA|70|74|7|2032
Mathías Olivera|LB|1997|URU|78|78|15|2030
Leonardo Spinazzola|LB|1993|ITA|76|76|3.5|2028
Costantino Favasuli|RB|2004|ITA|70|74|8|2027
Giovanni Di Lorenzo|RB|1993|ITA|81|81|7.5|2030
Billy Gilmour|DM|2001|SCO|78|80|20|2029
Stanislav Lobotka|DM|1994|SVK|82|82|10|2027
Scott McTominay|CM|1996|SCO|85|85|40|2028
Frank Anguissa|CM|1995|CMR|81|81|15|2027
Antonio Vergara|AM|2003|ITA|75|77|20|2031
Kevin De Bruyne|AM|1991|BEL|84|84|8|2027
Alisson Santos|LW|2002|BRA|77|77|28|2030
Noa Lang|LW|1999|NED|79|80|20|2030
David Neres|RW|1997|BRA|80|80|18|2028
Matteo Politano|RW|1993|ITA|79|79|5|2028
Rasmus Højlund|ST|2003|DEN|80|85|60|2030
Lorenzo Lucca|ST|2000|ITA|78|78|20|2030
Giovane|ST|2003|BRA|72|78|12|2030`,
    },
    {
      id: "i_ata", name: "Atalanta", short: "ATA", city: "Bergamo", stadium: "Gewiss Stadium", capacity: 24950,
      colors: ["#1E71B8", "#000000"], reputation: 83, budget: 50,
      players: `Marco Carnesecchi|GK|2000|ITA|79|79|30|2028
Marco Sportiello|GK|1992|ITA|70|70|0.8|2028
Thomas Pompei|GK|2006|ITA|56|67|0.25|2026
Giorgio Scalvini|CB|2003|ITA|77|84|38|2031
Isak Hien|CB|1999|SWE|80|81|22|2028
Thomas Kristensen|CB|2002|DEN|75|79|18|2027
Odilon Kossounou|CB|2001|CIV|77|79|15|2029
Sead Kolasinac|CB|1993|BIH|77|77|4|2027
Relja Obrić|CB|2006|SVN|64|75|1.5|2028
Lorenzo Bernasconi|LB|2003|ITA|75|77|20|2030
Raoul Bellanova|RB|2000|ITA|77|79|15|2029
Davide Zappacosta|RB|1992|ITA|77|77|3.5|2028
Gianluca Gaetano|DM|2000|ITA|74|76|12|2031
Éderson|CM|1999|BRA|82|83|40|2031
Franck Kessié|CM|1996|CIV|79|79|12|2029
Mario Pašalić|CM|1995|CRO|78|78|6|2028
Nicola Zalewski|CM|2002|POL|75|78|20|2029
Charles De Ketelaere|AM|2001|BEL|81|83|35|2028
Lazar Samardžić|AM|2002|SRB|76|79|16|2029
Eljif Elmas|AM|1999|MKD|76|77|13|2027
Jonathan Rowe|LW|2003|ENG|76|81|33|2027
Kamaldeen Sulemana|LW|2002|GHA|74|78|17|2029
Giacomo Raspadori|AM|2000|ITA|78|78|22|2030
Nikola Krstović|ST|2000|MNE|79|81|30|2030
Gianluca Scamacca|ST|1999|ITA|79|80|25|2028`,
    },
    {
      id: "i_rom", name: "AS Roma", short: "ROM", city: "Roma", stadium: "Stadio Olimpico", capacity: 70634,
      colors: ["#8E1F2F", "#F0BC42"], reputation: 84, budget: 45,
      players: `Mile Svilar|GK|1999|SRB|81|81|35|2030
Devis Vásquez|GK|1998|COL|67|70|0.8|2027
Pierluigi Gollini|GK|1995|ITA|69|69|0.8|2027
Giorgio De Marzi|GK|2007|USA|53|66|0.1|2027
Evan Ndicka|CB|1999|CIV|80|81|35|2028
Konstantinos Koulierakis|CB|2003|GRE|75|82|20|2031
Leonardo Balerdi|CB|1999|ARG|79|81|18|2027
Daniele Ghilardi|CB|2003|ITA|74|82|18|2030
Gianluca Mancini|CB|1996|ITA|80|80|15|2029
Mario Hermoso|CB|1995|ESP|78|78|7|2027
Wesley|RB|2003|BRA|77|83|40|2030
Nahuel Molina|RB|1998|ARG|78|78|15|2030
Devyne Rensch|RB|2003|NED|71|73|8.5|2029
Emanuele Lulli|RB|2007|ITA|70|83|8|2031
Bryan Cristante|DM|1995|ITA|77|77|7|2028
Marten de Roon|DM|1991|NED|79|79|3.2|2028
Manu Koné|CM|2001|FRA|81|84|60|2029
Niccolò Pisilli|CM|2004|ITA|76|84|30|2029
Rodrigo Mora|AM|2007|POR|77|90|38|2031
Lorenzo Pellegrini|AM|1996|ITA|78|78|8|2027
Matías Soulé|RW|2003|ARG|79|83|35|2029
Paulo Dybala|AM|1993|ARG|80|80|5|2027
Donyell Malen|ST|1999|NED|80|80|55|2030
Santiago Castro|ST|2004|ARG|77|84|32|2031
Antonio Arena|ST|2009|ITA|68|85|4|2028`,
    },
    {
      id: "i_laz", name: "Lazio", short: "LAZ", city: "Roma", stadium: "Stadio Olimpico", capacity: 70634,
      colors: ["#87D8F7", "#FFFFFF"], reputation: 80, budget: 5,
      players: `Christos Mandas|GK|2001|GRE|74|79|10|2029
Edoardo Motta|GK|2005|ITA|70|79|8|2030
Alessio Furlanetto|GK|2002|ITA|59|65|0.35|2028
Davide Renzetti|GK|2006|ITA|54|65|0.15|2027
Oliver Provstgaard|CB|2003|DEN|74|81|20|2031
Danilho Doekhi|CB|1998|NED|77|77|13|2029
Diogo Leite|CB|1999|POR|76|77|12|2028
Josip Sutalo|CB|2000|CRO|75|75|12|2027
Filipe Bordon|CB|2005|BRA|61|70|0.75|2028
Ricardo Bordon|CB|2006|BRA|56|67|0.2|2027
Nuno Tavares|LB|2000|POR|78|79|12|2029
Luca Pellegrini|LB|1999|ITA|71|72|3|2027
Alfonso Pedraza|LB|1996|ESP|72|72|2.5|2029
Mohamed Fares|LB|1996|ALG|65|65|0.5|2027
Romano Floriani Mussolini|RB|2003|ITA|68|72|5|2031
Adam Marusic|RB|1992|MNE|76|76|2.5|2028
Manuel Lazzari|RB|1993|ITA|75|75|2|2027
Nicolò Rovella|DM|2001|ITA|79|82|23|2028
Reda Belahyane|DM|2004|MAR|70|74|7.5|2029
Danilo Cataldi|DM|1994|ITA|75|75|3.5|2027
Bruno Galassi|DM|2007|ARG|53|66|0.1|2029
Kenneth Taylor|CM|2002|NED|77|77|25|2030
Davide Frattesi|CM|1999|ITA|80|81|22|2027
Fisayo Dele-Bashiru|CM|2001|NGA|72|76|6|2028
Valerio Farcomeni|CM|2006|ITA|53|64|0.1|2030
Adrian Przyborek|AM|2007|POL|69|82|6|2030
Tijjani Noslin|LW|1999|NED|75|75|8|2029
Mattia Zaccagni|LW|1995|ITA|79|79|7.5|2029
Gustav Isaksen|RW|2001|DEN|76|79|15|2028
Matteo Cancellieri|RW|2002|ITA|71|71|7|2027
Albert Gudmundsson|AM|1997|ISL|79|79|12|2027
Andrea Pinamonti|ST|1999|ITA|75|76|15|2031
Federico Serra|ST|2006|ITA|58|69|0.4|2026`,
    },
    {
      id: "i_fio", name: "Fiorentina", short: "FIO", city: "Firenze", stadium: "Stadio Artemio Franchi", capacity: 43147,
      colors: ["#482E92", "#FFFFFF"], reputation: 78, budget: 35,
      players: `David de Gea|GK|1990|ESP|79|79|3.5|2028
Oliver Christensen|GK|1999|DEN|67|67|1.4|2028
Luca Lezzerini|GK|1995|ITA|63|63|0.35|2028
Radu Drăgușin|CB|2002|ROU|76|80|16|2027
Víctor Valdepeñas|CB|2006|ESP|72|83|12|2031
Viery|CB|2005|BRA|72|81|12|2031
Marin Pongracic|CB|1997|CRO|76|76|6.5|2029
Luca Ranieri|CB|1999|ITA|76|77|6|2029
Fabiano Parisi|LB|2000|ITA|73|76|6|2029
Álex Jiménez|RB|2005|ESP|74|83|22|2027
Dodô|RB|1998|BRA|79|80|16|2027
João Mário|RB|2000|POR|74|76|8|2027
Christ Inao Oulaï|CM|2006|CIV|75|86|28|2031
Arthur Atta|CM|2003|FRA|75|82|25|2031
Cher Ndour|CM|2004|ITA|74|81|20|2029
Nicolò Fagioli|CM|2001|ITA|77|81|16|2028
Marco Brescianini|CM|2000|ITA|74|74|9|2030
Pedro Gonçalves|LW|1998|POR|80|80|25|2027
Alieu Njie|LW|2005|SWE|73|82|15|2027
Riccardo Sottil|LW|1999|ITA|67|67|1.5|2027
Franco Mastantuono|RW|2007|ARG|77|90|45|2027
Wilfried Gnonto|RW|2003|ITA|74|76|16|2027
Federico Croci|AM|2010|ITA|66|85|3|2029
Mateo Pellegrino|ST|2001|ARG|76|79|22|2031
Beto|ST|1998|GNB|76|76|18|2030`,
    },
    {
      id: "i_bol", name: "Bologna", short: "BOL", city: "Bologna", stadium: "Stadio Renato Dall'Ara", capacity: 36462,
      colors: ["#A21C26", "#1A2F48"], reputation: 78, budget: 35,
      players: `Massimo Pessina|GK|2007|ITA|68|84|4.5|2029
Lukasz Skorupski|GK|1991|POL|76|76|2|2027
Ukko Happonen|GK|2007|FIN|53|66|0.05|2026
Arthur Theate|CB|2000|BEL|78|79|15|2027
Torbjørn Heggem|CB|1999|NOR|75|77|15|2029
Martin Vitík|CB|2003|CZE|74|80|13|2029
Eivind Helland|CB|2005|NOR|70|79|8|2030
Nicolò Casale|CB|1998|ITA|73|73|3.8|2028
Juan Miranda|LB|2000|ESP|77|78|15|2028
Rahim Alhassane|LB|2002|NIG|68|68|3.5|2030
Emil Holm|RB|2000|SWE|76|77|10|2028
Nadir Zortea|RB|1999|ITA|74|75|7|2029
Matteo Darmian|RB|1989|ITA|76|76|1.4|2027
Lorenzo De Silvestri|RB|1988|ITA|73|73|0.6|2027
Nikola Moro|DM|1998|CRO|74|75|7|2027
Oussama El Azzouzi|DM|2001|MAR|66|66|1.8|2027
Lewis Ferguson|CM|1999|SCO|79|80|14|2028
Mikel Amondarain|CM|2005|ARG|71|80|8.5|2031
Tommaso Pobega|CM|1999|ITA|75|76|8|2028
Marco Libra|CM|2008|VEN|64|79|1.5|2026
Jens Odgaard|AM|1999|DEN|76|77|12|2029
Nicolò Cambiaghi|LW|2000|ITA|76|76|14|2029
Samuel Mbangula|LW|2004|BEL|71|77|8|2027
Riccardo Orsolini|RW|1997|ITA|80|80|15|2031
Federico Bernardeschi|RW|1994|ITA|76|76|3.5|2027
Roberto Piccoli|ST|2001|ITA|76|79|16|2027
Artem Dovbyk|ST|1997|UKR|80|80|15|2027
Jay Enem|ST|2003|NED|70|72|6|2030`,
    },
    {
      id: "i_com", name: "Como", short: "COM", city: "Como", stadium: "Stadio Giuseppe Sinigaglia", capacity: 13602,
      colors: ["#003DA5", "#FFFFFF"], reputation: 74, budget: 60,
      players: `Robert Sánchez|GK|1997|ESP|79|79|15|2027
Jean Butez|GK|1995|FRA|78|78|8|2030
Mauro Vigorito|GK|1990|ITA|65|65|0.15|2027
Jacobo Ramón|CB|2005|ESP|77|86|45|2030
Trevoh Chalobah|CB|1999|ENG|80|81|35|2031
Alberto Dossena|CB|1998|ITA|73|73|5|2028
Marc Oliver Kempf|CB|1995|GER|75|75|3.5|2029
Willy Kambwala|CB|2004|COD|66|70|3|2027
Edoardo Goldaniga|CB|1993|ITA|74|74|2|2028
Kaiki|LB|2003|BRA|73|75|14|2027
Álex Valle|LB|2004|ESP|73|79|12|2029
Yan Couto|RB|2002|BRA|76|81|17|2027
Ivan Smolcic|RB|2000|CRO|70|70|3.5|2031
Máximo Perrone|DM|2003|ARG|77|82|35|2029
Samuele Ricci|DM|2001|ITA|78|81|22|2027
Lucas Da Cunha|CM|2001|FRA|78|80|30|2031
Maxence Caqueret|CM|2000|FRA|77|79|13|2029
Adrian Lahdo|CM|2007|SWE|71|84|10|2031
Luis Milla|CM|1994|ESP|79|79|8|2029
Nico Paz|AM|2004|ARG|81|88|80|2028
Martin Baturina|AM|2003|CRO|78|85|55|2030
Mattia Liberali|AM|2007|ITA|71|84|10|2031
Assane Diao|LW|2005|SEN|76|85|35|2029
Jesús Rodríguez|LW|2005|ESP|76|85|30|2030
Jayden Addai|RW|2005|NED|74|86|20|2030
Moise Kean|ST|2000|ITA|81|82|32|2027
Anastasios Douvikas|ST|1999|GRE|80|80|25|2031`,
    },
    {
      id: "i_tor", name: "Torino", short: "TOR", city: "Torino", stadium: "Stadio Olimpico Grande Torino", capacity: 27958,
      colors: ["#8A1E03", "#FFFFFF"], reputation: 73, budget: 20,
      players: `Lucas Perri|GK|1997|BRA|77|77|10|2027
Franco Israel|GK|2000|URU|69|69|2.5|2028
Diego Mascardi|GK|2006|ITA|63|74|1.3|2031
Lapo Siviero|GK|2006|ITA|59|70|0.5|2029
Pietro Comuzzo|CB|2005|ITA|74|83|18|2027
Saúl Coco|CB|1999|EQG|75|76|7.5|2029
Ardian Ismajli|CB|1996|ALB|75|75|5|2027
Eray Cömert|CB|1998|SUI|70|70|2.5|2028
Niccolò Fortini|LB|2006|ITA|71|82|10|2027
Ricardo Rodríguez|LB|1992|SUI|73|73|1.4|2027
Cristiano Biraghi|LB|1992|ITA|71|71|0.9|2027
Rafik Belghali|RB|2002|ALG|71|77|8|2027
Nathan Patterson|RB|2001|SCO|71|73|5|2029
Rolando Mandragora|DM|1997|ITA|77|77|7.5|2030
Emirhan İlkhan|DM|2004|TUR|69|73|6|2027
Cesare Casadei|CM|2003|ITA|74|80|15|2029
Gvidas Gineitis|CM|2004|LTU|71|77|8|2029
Daniel Bragança|CM|1999|POR|74|74|7|2027
Kian Fitz-Jim|CM|2003|NED|67|69|3.5|2029
Andrea Luongo|CM|2008|ITA|62|77|1|2029
Alessio Cacciamani|CM|2007|ITA|72|85|12|2031
Nikola Vlašić|AM|1997|CRO|77|77|10|2027
Gaetano Oristanio|AM|2002|ITA|70|70|5|2027
Zakaria Aboukhlal|RW|2000|MAR|72|74|5|2029
Giovanni Simeone|ST|1995|ARG|77|77|7|2028
Ché Adams|ST|1996|SCO|75|75|5|2027
Sandro Kulenović|ST|1999|CRO|71|71|3.5|2029
Duván Zapata|ST|1991|COL|76|76|2.5|2028
Pietro Pellegri|ST|2001|ITA|61|61|0.5|2027`,
    },
    {
      id: "i_udi", name: "Udinese", short: "UDI", city: "Udine", stadium: "Bluenergy Stadium", capacity: 25144,
      colors: ["#000000", "#FFFFFF"], reputation: 70, budget: 15,
      players: `Maduka Okoye|GK|1999|NGA|76|76|10|2028
Bartosz Mrozek|GK|2000|POL|68|68|2|2030
Daniele Padelli|GK|1985|ITA|64|64|0.15|2027
Oumar Solet|CB|2000|CIV|78|80|20|2027
James Abankwah|CB|2004|IRL|70|74|8|2029
Matteo Palma|CB|2008|ITA|70|85|8|2031
Nicolò Bertola|CB|2003|ITA|70|72|7|2030
David Alaba|CB|1992|AUT|77|77|3|2027
Enzo Ebosse|CB|1999|CMR|70|70|2.8|2027
Christian Kabasele|CB|1991|BEL|72|72|0.75|2027
Hassane Kamara|LB|1994|CIV|73|73|3|2028
Alessandro Zanoli|RB|2000|ITA|72|74|4.5|2029
Mërgim Vojvoda|RB|1995|KVX|73|73|2.5|2028
Jesper Karlström|DM|1995|SWE|75|75|4|2028
Jurgen Ekkelenkamp|CM|2000|NED|75|77|13|2029
Lennon Miller|CM|2006|SCO|71|82|10|2030
Jakub Piotrowski|CM|1997|POL|74|74|4.5|2029
Sandi Lovrić|CM|1998|SVN|72|72|3.5|2027
Oier Zarraga|CM|1999|ESP|70|71|1.5|2027
Juan Arizala|CM|2005|COL|67|76|3.5|2030
Unai Gómez|AM|2003|ESP|69|71|5|2031
Giorgi Chakvetadze|AM|1999|GEO|71|71|3.5|2030
Lazar Jovanovic|RW|2006|SRB|69|80|6|2031
Nicolò Zaniolo|AM|1999|ITA|76|77|15|2029
Keinan Davis|ST|1998|ENG|76|76|10|2031
Idrissa Gueye|ST|2006|SEN|74|74|8|2030
Vakoun Bayo|ST|1997|CIV|71|71|2.5|2028
Giulio Vinciati|ST|2007|ITA|53|66|0.1|2029`,
    },
    {
      id: "i_gen", name: "Genoa", short: "GEN", city: "Genova", stadium: "Stadio Luigi Ferraris", capacity: 33205,
      colors: ["#A41E35", "#002855"], reputation: 70, budget: 15,
      players: `Justin Bijlow|GK|1998|NED|72|72|4|2029
Franz Stolz|GK|2001|AUT|61|61|0.6|2027
Daniele Sommariva|GK|1997|ITA|60|60|0.1|2023
Rendijs Mihelsons|GK|2008|LVA|53|68|0.1|2028
Johan Vásquez|CB|1998|MEX|77|78|14|2028
Alessandro Marcandalli|CB|2002|ITA|72|77|14|2029
Leo Østigård|CB|1999|NOR|75|76|13|2030
Sebastian Otoa|CB|2004|DEN|68|74|2.5|2028
Mamedi Doucouré|CB|2007|FRA|58|71|0.4|2026
Lukas Klišys|CB|2007|LTU|53|66|0.1|2027
Mario Mitaj|LB|2003|ALB|70|72|6|2027
David Puczka|LB|2005|AUT|67|76|3.5|2031
Marcelo Vaz|LB|2007|GNB|58|71|0.4|2029
Cody Drameh|RB|2001|ENG|70|70|4.5|2026
Kingsley Ehizibue|RB|1995|NED|72|72|1.5|2027
Stefano Sabelli|RB|1993|ITA|71|71|1.3|2028
Morten Frendrup|DM|2001|DEN|77|79|15|2028
Hamed Traoré|CM|2000|CIV|75|75|10|2027
Amorim|CM|2005|BRA|70|79|8|2030
Djibril Sow|CM|1997|SUI|76|76|7.5|2030
Mikael Egill Ellertsson|CM|2002|ISL|71|74|6|2029
Franz-Ethan Meichtry|CM|2005|SUI|68|77|5|2030
Samuel Wiafe|CM|2008|ITA|66|81|2.5|2030
Tommaso Baldanzi|AM|2003|ITA|71|73|8.5|2027
Stephan El Shaarawy|LW|1992|ITA|74|74|2|2027
Robinho Junior|RW|2007|BRA|68|81|5|2027
Lorenzo Venturino|RW|2006|ITA|68|79|5|2029
Junior Messias|RW|1991|BRA|73|73|1.1|2027
Lorenzo Colombo|ST|2002|ITA|73|76|10|2029
Vitinha|ST|2000|POR|82|84|8|2028
Milutin Osmajic|ST|1999|MNE|70|70|3|2029
Elias Havel|ST|2003|AUT|65|67|2.2|2030
Joi Nuredini|ST|2007|ALB|62|75|1|2029`,
    },
    {
      id: "i_cag", name: "Cagliari", short: "CAG", city: "Cagliari", stadium: "Unipol Domus", capacity: 16416,
      colors: ["#A6192E", "#002F6C"], reputation: 67, budget: 10,
      players: `Elia Caprile|GK|2001|ITA|75|75|12|2029
Alen Sherri|GK|1997|ALB|65|73|0.8|2028
Boris Radunović|GK|1996|SRB|65|65|0.5|2029
Juan Rodríguez|CB|2005|URU|73|81|14|2030
Raphael Kofler|CB|2005|ITA|69|78|5.5|2027
Zé Pedro|CB|1997|POR|72|72|3|2028
Yerry Mina|CB|1994|COL|74|74|2.5|2028
Adam Obert|LB|2002|SVK|71|75|9|2030
Riyad Idrissi|LB|2005|ITA|68|77|4|2030
Giuseppe Aurelio|LB|2000|ITA|64|64|0.8|2029
Nicola Grandu|LB|2006|ITA|57|68|0.3|2029
Yukinari Sugawara|RB|2000|JPN|73|74|5.5|2027
Alessandro Romano|DM|2006|ITA|73|84|15|2027
Harry Winks|DM|1996|ENG|72|72|2.5|2028
Michel Adopo|CM|2000|FRA|73|75|8.5|2029
Jacopo Fazzini|CM|2003|ITA|72|78|8.5|2027
Joseph Liteta|CM|2006|ZAM|67|78|3.5|2030
Alessandro Deiola|CM|1995|ITA|70|70|1.5|2029
Roberto Gagliardini|CM|1994|ITA|71|71|1.3|2027
Demi Akarakiri|CM|2007|ENG|59|72|0.45|2030
Ivan Sulev|CM|2006|BUL|56|67|0.2|2029
Daniel Maldini|AM|2001|ITA|73|73|9|2027
Yanis Massolin|AM|2002|FRA|69|69|4.5|2027
Alieu Fadera|LW|2001|GAM|71|74|4.5|2027
Mattia Felici|LW|2001|ITA|68|68|2.5|2027
Riccardo Ciervo|LW|2002|ITA|66|66|2|2027
Paul Mendy|ST|2007|SEN|72|85|12|2032
Kevin Carlos|ST|2001|ESP|69|69|3.5|2027
M'Bala Nzola|ST|1996|ANG|71|71|2.5|2027
Yael Trepy|ST|2006|FRA|65|76|2|2030`,
    },
    {
      id: "i_lec", name: "Lecce", short: "LEC", city: "Lecce", stadium: "Stadio Via del Mare", capacity: 31533,
      colors: ["#FFD700", "#C8102E"], reputation: 65, budget: 8,
      players: `Wladimiro Falcone|GK|1995|ITA|75|75|3.5|2029
Marco Bleve|GK|1995|ITA|64|64|0.3|2028
Alexandru Borbei|GK|2003|ROU|54|56|0.15|2028
Plamen Penev|GK|2008|BUL|54|69|0.15|2027
Tiago Gabriel|CB|2004|POR|73|81|15|2030
Jamil Siebert|CB|2002|GER|69|74|4.5|2028
Gaspar|CB|1997|ANG|72|72|3|2027
Gaby Jean|CB|2000|FRA|66|66|1.5|2027
Sebastian Esposito|CB|2005|AUS|60|69|0.6|2024
Elijah Scott|CB|2006|USA|58|69|0.4|2027
Antonino Gallo|LB|2000|ITA|71|73|3.5|2029
Corrie Ndaba|LB|1999|IRL|66|68|0.9|2028
Danilo Veiga|RB|2002|POR|68|74|2.5|2027
Ali Dembélé|RB|2004|FRA|63|67|1.3|2027
Marlon Ubani|RB|2005|GER|55|64|0.17|2029
Oumar Ngom|DM|2004|MTN|66|70|3|2029
Sadik Fofana|DM|2003|TOG|61|63|0.8|2029
Olaf Gorter|DM|2005|NED|61|70|0.8|2029
Niko Kovač|DM|2005|BIH|57|66|0.3|2029
Ivan Ilić|CM|2001|SRB|74|76|7|2027
Medon Berisha|CM|2003|ALB|70|76|5|2028
Mohamed Kaba|CM|2001|GUI|68|72|2.5|2027
Lassana Coulibaly|CM|1996|MLI|72|72|2.2|2027
Youssef Maleh|CM|1998|MAR|68|68|1.5|2027
Omri Gandelman|AM|2000|ISR|69|69|3|2029
Joël Monteiro|LW|1999|SUI|71|71|3.5|2029
Amar Fatah|LW|2004|SWE|61|65|0.8|2029
Santiago Pierotti|RW|2001|ARG|71|74|4|2027
Konan N’Dri|RW|2000|NIG|66|66|1.5|2027
Willem Geubbels|ST|2001|FRA|70|72|5|2030
Nikola Stulic|ST|2001|SRB|69|69|3.5|2029
Paco Esteban|ST|2006|ESP|59|70|0.5|2030`,
    },
    {
      id: "i_par", name: "Parma", short: "PAR", city: "Parma", stadium: "Stadio Ennio Tardini", capacity: 22352,
      colors: ["#FFFFFF", "#FFD200"], reputation: 68, budget: 20,
      players: `Giovanni Daffara|GK|2004|ITA|67|71|3.5|2031
Edoardo Corvi|GK|2001|ITA|66|70|3|2029
Simone Ghidotti|GK|2000|ITA|61|61|0.4|2026
Mariano Troilo|CB|2003|ARG|71|81|10|2030
Abdoulaye Ndiaye|CB|2002|SEN|70|75|6|2029
Diego Carlos|CB|1993|BRA|76|76|3|2027
Lautaro Valenti|CB|1999|ARG|71|72|2|2027
Dominik Drobnic|CB|2007|SVN|64|77|1.8|2030
Emanuele Valeri|LB|1998|ITA|72|72|3|2028
Franco Carboni|LB|2003|ARG|64|66|1.5|2030
Sascha Britschgi|RB|2006|SUI|71|82|10|2030
Enrico Delprato|RB|1999|ITA|74|75|6|2029
Mandela Keita|DM|2002|BEL|74|79|20|2029
Hans Nicolussi Caviglia|DM|2000|ITA|73|75|6|2030
Adrián Bernabé|CM|2001|ESP|76|80|15|2027
Christian Ordóñez|CM|2004|ARG|69|73|6.5|2030
Benja Cremaschi|CM|2005|USA|68|77|4|2031
Vincent Sierro|CM|1995|SUI|72|72|2.5|2027
Abdou-Salam Konate|CM|2006|SEN|64|75|1.5|2029
Giovanni Fabbian|AM|2003|ITA|73|79|10|2027
Ousmane Diallo|LW|2007|ESP|64|77|1.5|2031
Pontus Almqvist|RW|1999|SWE|70|71|1.8|2027
Simone Lontani|AM|2008|ITA|69|84|6|2030
El Bilal Touré|ST|2001|MLI|75|75|13|2027
David Romero|ST|2003|ARG|70|72|7|2031
Matija Frigan|ST|2003|CRO|70|72|7|2030
Nesta Elphege|ST|2001|FRA|70|70|4|2030
Thomás De Martis|ST|2008|ARG|54|69|0.13|2027`,
    },
    {
      id: "i_sas", name: "Sassuolo", short: "SAS", city: "Sassuolo", stadium: "Mapei Stadium – Città del Tricolore", capacity: 21525,
      colors: ["#00A752", "#000000"], reputation: 67, budget: 15,
      players: `Arijanet Murić|GK|1998|KVX|75|75|7.5|2026
Stefano Turati|GK|2001|ITA|69|73|3|2031
Giacomo Satalino|GK|1999|ITA|61|64|0.4|2027
Jay Idzes|CB|2000|IDN|74|76|14|2029
Fedde Leysen|CB|2003|BEL|70|72|7|2027
Fali Candé|CB|1998|GNB|69|70|3|2029
Duje Caleta-Car|CB|1996|CRO|73|73|2.8|2028
Cas Odenthal|CB|2000|NED|65|65|1.2|2027
Rafa Obrador|LB|2004|ESP|68|72|5|2027
Josh Doig|LB|2002|SCO|71|75|4.5|2028
Edoardo Pieragnolo|LB|2003|ITA|65|67|2|2029
Sebastian Walukiewicz|RB|2000|POL|71|72|5|2026
Ignace Van der Brempt|RB|2002|BEL|72|76|5|2027
Simone Cinquegrano|RB|2004|ITA|66|70|2.5|2032
Yeferson Paz|RB|2002|COL|59|59|0.4|2027
Luca Lipani|DM|2005|ITA|70|80|7.5|2031
Ibrahim Sulemana|DM|2003|GHA|70|72|6|2027
Daniel Boloca|DM|1998|ITA|71|72|4|2028
Nemanja Matić|DM|1988|SRB|76|76|1.6|2027
Andrea Ghion|DM|2000|ITA|64|64|0.8|2029
Ismaël Koné|CM|2002|CAN|74|78|25|2030
Darryl Bakola|CM|2007|FRA|73|86|15|2030
Kristian Thorstvedt|CM|1999|NOR|74|75|10|2027
Vasilije Adžić|AM|2006|MNE|73|87|15|2027
Armand Laurienté|LW|1998|FRA|78|79|19|2029
Benja Domínguez|LW|2003|ARG|71|73|9|2027
Cristian Volpato|RW|2003|AUS|71|77|10|2031
Domenico Berardi|RW|1994|ITA|79|79|7|2029
Nicholas Pierini|RW|1998|ITA|69|69|1.6|2027
Sebastiano Esposito|ST|2002|ITA|74|77|15|2027
Kieron Bowie|ST|2002|SCO|72|72|8|2027
Laurs Skjellerup|ST|2002|DEN|64|64|1.3|2029`,
    },
    {
      id: "i_ven", name: "Venezia", short: "VEN", city: "Venezia", stadium: "Stadio Pier Luigi Penzo", capacity: 11150,
      colors: ["#000000", "#F47920"], reputation: 69, budget: 10,
      players: `Filip Stanković|GK|2002|SRB|72|72|8|2030
Lorenzo Montipò|GK|1996|ITA|69|69|1.2|2028
Alessio Pozzi|GK|2000|ITA|61|61|0.4|2030
Matteo Grandi|GK|1992|ITA|62|62|0.05|2028
Armel Bella-Kotchap|CB|2001|GER|72|76|7|2030
Matías Moreno|CB|2003|ARG|70|72|6|2027
Joël Schingtienne|CB|2002|BEL|70|70|5|2031
Redouane Halhal|CB|2003|MAR|69|71|5|2030
Marin Šverko|CB|1998|CRO|68|68|1.5|2028
Ale Gomes|CB|2008|ESP|64|79|1.5|2031
Bartol Franjic|CB|2000|CRO|65|65|1|2026
Juan Jesus|CB|1991|BRA|72|72|1|2027
Rufai Mohammed|CB|2006|GHA|58|69|0.35|2027
Pasquale Mazzocchi|RB|1995|ITA|71|71|1.5|2027
Gianluca Busio|DM|2002|USA|72|72|8|2028
Simone Panada|DM|2002|ITA|62|62|0.8|2030
Simon Sohm|CM|2001|SUI|74|77|8|2027
Matteo Dagasso|CM|2004|ITA|67|71|3.5|2030
Toma Bašić|CM|1996|CRO|71|71|3|2029
Kike Pérez|CM|1997|ESP|71|71|2.5|2027
Thórir Jóhann Helgason|CM|2000|ISL|69|70|1.8|2029
Lamine Fanne|CM|2004|ESP|64|68|1.6|2030
Alfred Duncan|CM|1993|GHA|70|70|0.75|2027
Antoine Hainaut|CM|2002|FRA|69|69|4|2028
Thierry Correia|CM|1999|POR|70|70|2.5|2027
Richie Sagrado|CM|2004|BEL|64|68|1.5|2028
Lorenzo Berardi|CM|2006|ITA|61|72|0.8|2031
Ridgeciano Haps|CM|1993|SUR|69|69|0.7|2028
Toni Fernández|AM|2008|ESP|68|83|5|2027
Kornel Lisman|LW|2006|POL|64|75|1.8|2030
John Yeboah|AM|2000|ECU|72|72|5.5|2030
Akor Adams|ST|2000|NGA|76|76|15|2030
Albion Rrahmani|ST|2000|KVX|73|73|7|2029
Andrea Adorante|ST|2000|ITA|71|71|4.5|2028
Lion Lauberbach|ST|1998|GER|70|70|2.5|2029`,
    },
    {
      id: "i_fro", name: "Frosinone", short: "FRO", city: "Frosinone", stadium: "Stadio Benito Stirpe", capacity: 16227,
      colors: ["#FFD200", "#0050A0"], reputation: 64, budget: 10,
      players: `Lorenzo Palmisani|GK|2004|ITA|69|73|6|2031
Sebastiano Desplanches|GK|2003|ITA|62|64|1|2027
Matteo Pisseri|GK|1991|ITA|65|65|0.15|2025
Gabriele Calvani|CB|2004|ITA|69|73|6|2027
Ilario Monterisi|CB|2001|ITA|68|68|2.5|2027
Giorgio Cittadini|CB|2002|ITA|65|65|1.5|2027
Kevin Akpoguma|CB|1995|NGA|72|72|1.5|2028
Wisdom Amey|CB|2005|ITA|61|70|0.8|2027
Omar Fayed|CB|2003|EGY|60|62|0.6|2030
Gabriele Bracaglia|LB|2003|ITA|68|70|4|2029
Aleksa Terzić|LB|1999|SRB|70|70|2.5|2029
Anthony Oyono|RB|2001|GAB|67|67|2|2029
Enzo Tchato|RB|2002|CMR|65|65|1.5|2030
Matteo Cichella|DM|2005|ITA|68|77|5|2024
Giacomo Calò|DM|1997|ITA|71|71|2.5|2029
Florian Grillitsch|DM|1995|AUT|73|73|2.5|2027
Luis Hasa|CM|2004|ALB|68|72|4.5|2030
Patrizio Masini|CM|2001|ITA|71|74|4.5|2027
Anouar El Azzouzi|CM|2001|MAR|65|65|1.5|2029
Ben Lhassine Kone|CM|2000|CIV|62|62|0.5|2029
Francesco Gelli|CM|1996|ITA|65|65|0.5|2027
Romano Schmid|AM|2000|AUT|77|78|15|2030
Giorgi Kvernadze|LW|2003|GEO|71|73|8|2028
Alessio Zerbin|LW|1999|ITA|69|70|2|2029
Farès Ghedjemis|RW|2002|ALG|74|74|12|2030
Seydou Fini|RW|2006|ITA|67|78|3.5|2027
Tomas Bobcek|ST|2001|SVK|74|74|10|2031
Antonio Raimondo|ST|2004|ITA|70|74|7|2027
Daniel Bîrligea|ST|2000|ROU|71|71|4.5|2027`,
    },
    {
      id: "i_mon", name: "Monza", short: "MON", city: "Monza", stadium: "U-Power Stadium", capacity: 16917,
      colors: ["#E30613", "#FFFFFF"], reputation: 70, budget: 10,
      players: `Noel Törnqvist|GK|2002|SWE|66|66|2|2027
Demba Thiam|GK|1998|SEN|69|69|2|2028
Aljaz Strajnar|GK|2007|SVN|56|69|0.2|2029
Jan Ziolkowski|CB|2005|POL|72|81|12|2027
Eddy Kouadio|CB|2006|ITA|69|80|6|2027
Saba Goglichidze|CB|2004|GEO|69|77|3.5|2027
Lorenzo Lucchesi|CB|2003|ITA|67|69|3.3|2030
Andrea Carboni|CB|2001|ITA|69|69|3|2029
Yvan Maye|CB|2006|FRA|64|75|1.5|2027
Valentin Antov|CB|2000|BUL|66|66|1.5|2027
Ricardo Mangas|LB|1998|POR|69|69|2|2027
Samuele Birindelli|RB|1999|ITA|70|70|2.5|2028
Adam Bakoune|RB|2006|MAR|65|76|2|2027
Leonardo Colombo|DM|2005|ITA|68|77|4|2029
Ebenezer Akinsanmiro|CM|2004|NGA|70|74|7|2027
Matteo Pessina|CM|1997|ITA|74|74|5|2027
Michael Folorunsho|CM|1998|ITA|74|75|5|2027
Mathis Mout|CM|2007|ITA|65|78|2|2026
Foe Ondoa|CM|2005|FRA|64|73|1.5|2030
Idrissa Touré|CM|1998|GER|72|72|4|2028
Patrick Ciurria|CM|1995|ITA|69|69|1|2028
Andrea Colpani|AM|1999|ITA|72|72|4|2028
Jay Robinson|LW|2007|ENG|70|83|8|2027
Keita Baldé|LW|1995|SEN|68|68|0.8|2027
Cyril Ngonge|RW|2000|BEL|74|76|7|2027
Exequiel Zeballos|RW|2002|ARG|71|71|7|2030
Omari Forson|RW|2004|ENG|66|70|2.5|2028
Kevin Martins|RW|2005|ITA|58|67|0.4|2028
Gustavo Varela|ST|2005|POR|68|77|5|2030
Patrick Cutrone|ST|1998|ITA|72|72|4|2029
Dany Mota|ST|1998|POR|71|71|2.8|2027`,
    },
  ],
  tier2: [
    { id: "i_ver", name: "Hellas Verona", short: "VER", city: "Verona", stadium: "Stadio Marcantonio Bentegodi", capacity: 31045, colors: ["#002F6C", "#FFD200"], reputation: 62 },
    { id: "i_pis", name: "Pisa", short: "PIS", city: "Pisa", stadium: "Arena Garibaldi – Romeo Anconetani", capacity: 9862, colors: ["#1B3C8C", "#000000"], reputation: 60 },
    { id: "i_cre", name: "Cremonese", short: "CRE", city: "Cremona", stadium: "Stadio Giovanni Zini", capacity: 16003, colors: ["#BE1E2D", "#808080"], reputation: 60 },
    { id: "i_emp", name: "Empoli", short: "EMP", city: "Empoli", stadium: "Stadio Carlo Castellani", capacity: 16284, colors: ["#0057B8", "#FFFFFF"], reputation: 66 },
    { id: "i_pal", name: "Palermo", short: "PAL", city: "Palermo", stadium: "Stadio Renzo Barbera", capacity: 36365, colors: ["#F5A9C6", "#000000"], reputation: 65 },
    { id: "i_sam", name: "Sampdoria", short: "SAM", city: "Genova", stadium: "Stadio Luigi Ferraris", capacity: 33205, colors: ["#1B5DAA", "#FFFFFF"], reputation: 64 },
    { id: "i_spe", name: "Spezia", short: "SPE", city: "La Spezia", stadium: "Stadio Alberto Picco", capacity: 10336, colors: ["#FFFFFF", "#000000"], reputation: 62 },
    { id: "i_bar", name: "Bari", short: "BAR", city: "Bari", stadium: "Stadio San Nicola", capacity: 58270, colors: ["#FFFFFF", "#E30613"], reputation: 60 },
    { id: "i_mod", name: "Modena", short: "MOD", city: "Modena", stadium: "Stadio Alberto Braglia", capacity: 21151, colors: ["#FFD700", "#003DA5"], reputation: 60 },
    { id: "i_cat", name: "Catanzaro", short: "CTZ", city: "Catanzaro", stadium: "Stadio Nicola Ceravolo", capacity: 14650, colors: ["#FFD200", "#C8102E"], reputation: 58 },
  ],
};
