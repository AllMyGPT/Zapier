import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: "fra",
  name: "Liga Francesa",
  country: "Francia",
  nat: "FRA",
  tier2Name: "Segunda Francesa",
  clubs: [
    {
      id: "f_psg", name: "Paris Saint-Germain", short: "PSG", city: "París", stadium: "Parc des Princes", capacity: 47929,
      colors: ["#004170", "#DA291C"], reputation: 93, budget: 150,
      players: `Matvey Safonov|GK|1999|RUS|78|81|30|2029
Lucas Chevalier|GK|2001|FRA|76|76|22|2030
Alessandro Longoni|GK|2008|ITA|57|72|0.3|2031
Willian Pacho|CB|2001|ECU|83|87|80|2031
Ilya Zabarnyi|CB|2002|UKR|77|77|40|2030
Marquinhos|CB|1994|BRA|84|84|28|2028
Lucas Beraldo|CB|2003|BRA|76|83|22|2031
Nuno Mendes|LB|2002|POR|84|87|80|2029
Lucas Hernández|LB|1996|FRA|80|80|18|2028
Lucas Digne|LB|1993|FRA|77|77|6|2029
Achraf Hakimi|RB|1998|MAR|86|86|80|2029
David Boly|RB|2009|FRA|57|74|0.3|2027
Vitinha|DM|2000|POR|86|88|140|2029
João Neves|CM|2004|POR|84|89|140|2031
Warren Zaïre-Emery|CM|2006|FRA|80|89|80|2029
Senny Mayulu|CM|2006|FRA|77|89|40|2031
Fabián Ruiz|CM|1996|ESP|83|83|30|2028
Dro Fernández|AM|2008|ESP|73|88|15|2030
Khvicha Kvaratskhelia|LW|2001|GEO|85|87|140|2029
Mika Godts|LW|2005|BEL|77|86|40|2031
Quentin Ndjantou|LW|2007|FRA|69|82|6|2028
Désiré Doué|RW|2005|FRA|82|89|120|2029
Maghnes Akliouche|RW|2002|FRA|79|85|50|2031
Ousmane Dembélé|ST|1997|FRA|88|88|100|2028
Ferran Torres|ST|2000|ESP|80|80|55|2031`,
    },
    {
      id: "f_om", name: "Olympique de Marseille", short: "OMA", city: "Marsella", stadium: "Orange Vélodrome", capacity: 67394,
      colors: ["#FFFFFF", "#2FAEE0"], reputation: 83, budget: 50,
      players: `Jeffrey de Lange|GK|1998|NED|69|71|2.5|2027
Théo Vermot|GK|1997|FRA|63|63|0.3|2027
Jelle Van Neck|GK|2004|BEL|53|57|0|2027
Nayef Aguerd|CB|1996|MAR|79|79|15|2030
CJ Egan-Riley|CB|2003|ENG|72|79|9|2029
Bamo Meïté|CB|2001|CIV|71|74|7|2028
Derek Cornelius|CB|1997|CAN|71|71|2.5|2028
Emerson|LB|1994|ITA|78|78|9|2027
Ulisses Garcia|LB|1996|SUI|72|72|3|2028
Alexi Koum|LB|2006|CMR|58|69|0.35|2029
Timothy Weah|RB|2000|USA|76|78|20|2030
Kelyann Bezahaf|RB|2006|ALG|62|73|1|2028
Pierre-Emile Højbjerg|DM|1995|DEN|80|80|15|2028
Tochukwu Nnadi|DM|2003|NGA|68|70|4.5|2030
Geoffrey Kondogbia|DM|1993|CTA|74|74|2.5|2027
Nouhoum Kamissoko|DM|2004|MLI|56|60|0.2|2029
Angel Gomes|AM|2000|ENG|76|79|10|2028
Himad Abdelli|AM|1999|ALG|73|74|5|2030
Igor Paixão|LW|2000|BRA|78|81|35|2030
Tadjidine Mmadi|LW|2007|FRA|62|75|1|2029
Keyliane Abdallah|RW|2006|FRA|68|79|5|2028
Amine Harit|RW|1997|MAR|73|73|5|2027
Amine Gouiri|ST|2000|ALG|79|81|30|2029
Neal Maupay|ST|1996|FRA|72|72|4|2028
Faris Moumbagna|ST|2000|CMR|70|70|3.5|2028`,
    },
    {
      id: "f_asm", name: "AS Monaco", short: "ASM", city: "Mónaco", stadium: "Stade Louis II", capacity: 16360,
      colors: ["#E30613", "#FFFFFF"], reputation: 81, budget: 45,
      players: `Philipp Köhn|GK|1998|SUI|71|71|3|2028
Lukas Hradecky|GK|1989|FIN|75|75|1.5|2027
Jules Stawiecki|GK|2007|FRA|54|67|0.15|2029
Christian Mawissa|CB|2005|FRA|73|83|15|2029
Sadibou Sané|CB|2004|SEN|72|81|12|2031
Mohammed Salisu|CB|1999|GHA|76|78|10|2028
Eric Dier|CB|1994|ENG|75|75|4|2028
Samuel Nibombe|CB|2007|BEL|62|75|1|2027
Nazinho|LB|2003|POR|71|73|10|2030
Vanderson|RB|2001|BRA|77|81|18|2028
Jordan Teze|RB|1999|NED|75|76|15|2029
Denis Zakaria|DM|1996|SUI|80|80|25|2028
Lamine Camara|CM|2004|SEN|78|85|55|2029
Mamadou Coulibaly|CM|2004|FRA|74|84|20|2028
Pape Cabral|CM|2007|FRA|68|81|5|2031
Edan Diop|CM|2004|FRA|66|70|3|2028
Anis Soubeir|CM|2007|MAR|65|78|2|2028
Aleksandr Golovin|AM|1996|RUS|78|78|18|2029
Stanis Idumbo|AM|2005|COD|71|80|10|2030
Mathys Detourbet|LW|2007|FRA|74|87|20|2027
Ansu Fati|LW|2002|ESP|75|79|15|2030
Takumi Minamino|LW|1995|JPN|78|78|10|2027
Folarin Balogun|ST|2001|USA|78|82|50|2028
Matthis Abline|ST|2003|FRA|75|80|25|2031
Mika Biereth|ST|2003|DEN|75|80|15|2030
Paris Brunner|ST|2006|GER|73|84|15|2028`,
    },
    {
      id: "f_nice", name: "OGC Nice", short: "NIC", city: "Niza", stadium: "Allianz Riviera", capacity: 36178,
      colors: ["#C8102E", "#000000"], reputation: 76, budget: 30,
      players: `Yehvann Diouf|GK|1999|SEN|73|73|7|2030
Teddy Boulhendi|GK|2001|ALG|62|68|0.3|2027
Martin Ponsot|GK|2009|FRA|53|70|0|2026
Antoine Mendy|CB|2004|SEN|71|78|10|2028
Youssouf Ndayishimiye|CB|1998|BDI|75|76|7|2027
Moïse Bombito|CB|2000|CAN|75|78|7|2028
Alidu Seidu|CB|2000|GHA|72|74|5|2027
Mohamed Abdelmonem|CB|1999|EGY|72|74|2.5|2028
Niels Nkounkou|LB|2000|FRA|71|73|2.6|2027
Ali Abdi|LB|1993|TUN|73|73|2|2027
Jonathan Clauss|RB|1992|FRA|76|76|4|2028
Hamza Koutoune|RB|2006|MAR|57|68|0.3|2028
Xavier Mandza|DM|2009|FRA|68|85|5|2029
Salis Abdul Samed|DM|2000|GHA|70|70|4|2028
Everton|DM|2007|FRA|65|78|2|2029
Laurent Abergel|DM|1993|FRA|72|72|1.8|2029
Axel Witsel|DM|1989|BEL|74|74|1.2|2027
Nassim Laarej|CM|2009|MAR|53|70|0|2026
Hicham Boudaoui|CM|1999|ALG|76|78|12|2027
Djibril Coulibaly|CM|2008|FRA|70|85|8|2028
Morgan Sanson|CM|1994|FRA|73|73|3|2027
Issiaga Camara|CM|2005|GUI|56|65|0.25|2027
Mohamed Amoura|LW|2000|ALG|79|81|20|2027
Sofiane Diop|LW|2000|MAR|76|78|15|2027
Isak Jansson|LW|2002|SWE|69|73|3|2025
Gauthier Hein|RW|1996|FRA|72|72|5|2029
Nathan Ngoumou|RW|2000|CMR|70|70|3.5|2026
Elye Wahi|ST|2003|CIV|74|80|18|2027
Zoumana Diallo|ST|2005|MLI|61|70|0.8|2026`,
    },
    {
      id: "f_losc", name: "LOSC Lille", short: "LOS", city: "Lille", stadium: "Stade Pierre-Mauroy", capacity: 50186,
      colors: ["#E01E13", "#1B2A4A"], reputation: 79, budget: 35,
      players: `Berke Özer|GK|2000|TUR|74|74|12|2029
Orlando Gill|GK|2000|PAR|73|73|7.5|2031
Nathan Ngoy|CB|2003|BEL|75|81|25|2029
Alexsandro|CB|1999|BRA|76|76|15|2028
Isaac Cossier|CB|2006|FRA|66|77|2.5|2030
Tanguy Nianzou|CB|2002|FRA|64|64|1.2|2029
Romain Perraud|LB|1997|FRA|74|74|7|2028
Calvin Verdonk|LB|1997|IDN|72|73|2.5|2028
Tiago Santos|RB|2002|POR|74|78|10|2029
Loun Srdanovic|RB|2006|SUI|66|77|3|2030
Maxima Goffi|RB|2008|FRA|62|77|1|2028
Ngal'ayel Mukau|DM|2004|COD|73|81|15|2028
Nabil Bentaleb|DM|1994|ALG|74|74|4.5|2028
Benjamin André|DM|1990|FRA|77|77|3|2028
Maurits Kjærgaard|CM|2003|DEN|71|73|8|2031
Hákon Arnar Haraldsson|AM|2003|ISL|77|82|30|2030
Başar Önal|LW|2004|TUR|71|75|10|2030
Osame Sahraoui|LW|2001|MAR|73|76|7|2029
Soriba Diaoune|LW|2007|FRA|68|81|4|2028
Tiago Morais|LW|2003|POR|63|65|1.2|2028
Dilane Bakwa|RW|2002|FRA|76|76|28|2027
Ethan Mbappé|RW|2006|FRA|72|81|12|2027
Gaëtan Perrin|RW|1996|FRA|74|74|5|2028
Ayase Ueda|ST|1998|JPN|78|78|20|2030
Hamza Igamane|ST|2002|MAR|74|79|18|2031
Olivier Giroud|ST|1986|FRA|74|74|0.9|2027`,
    },
    {
      id: "f_ol", name: "Olympique Lyonnais", short: "LYO", city: "Lyon", stadium: "Groupama Stadium", capacity: 59186,
      colors: ["#FFFFFF", "#1B3F8F"], reputation: 79, budget: 30,
      players: `Dominik Greif|GK|1997|SVK|73|74|9|2029
Rémy Descamps|GK|1996|FRA|67|67|1.5|2029
Justin Bengui|GK|2005|FRA|56|65|0.25|2028
Lassine Diarra|GK|2002|MLI|55|55|0|2028
Moussa Niakhaté|CB|1996|SEN|77|77|15|2028
Ruben Kluivert|CB|2001|NED|72|75|8|2030
Felix Bacher|CB|2000|AUT|72|72|6|2031
Noham Kamara|CB|2007|FRA|66|79|3|2030
Clinton Mata|CB|1992|ANG|74|74|2.5|2028
Abner|LB|2000|BRA|74|74|10|2029
Nicolás Tagliafico|LB|1992|ARG|76|76|4|2027
Mohamed Ouédraogo|LB|2003|BFA|65|67|2|2031
Zachary Athekame|RB|2004|SUI|73|80|15|2027
Steeve Kango|RB|2006|FRA|62|73|1|2029
Tyler Morton|DM|2002|ENG|75|79|30|2030
Tanner Tessmann|DM|2001|USA|74|77|10|2029
Paul Akouokou|DM|1997|CIV|64|64|0.4|2027
Mads Bidstrup|CM|2001|DEN|74|74|15|2031
Khalis Merah|CM|2007|FRA|73|88|15|2029
Noah Nartey|CM|2005|DEN|73|82|15|2030
Corentin Tolisso|CM|1994|FRA|77|77|10|2029
Pavel Sulc|AM|2000|CZE|76|76|20|2029
Keito Nakamura|LW|2000|JPN|74|74|12|2030
Rémi Himbert|LW|2008|FRA|70|85|8|2028
Julien Duranville|LW|2006|BEL|69|80|6|2031
Ernest Nuamah|RW|2003|GHA|73|78|12|2028
Kaïl Boudache|RW|2006|ALG|70|81|8|2031
Loïs Openda|ST|2000|BEL|79|81|25|2027
Alejandro Gomes Rodríguez|ST|2008|ENG|61|76|0.8|2028`,
    },
    {
      id: "f_rcsa", name: "RC Strasbourg Alsace", short: "RCS", city: "Estrasburgo", stadium: "Stade de la Meinau", capacity: 26109,
      colors: ["#009FE3", "#FFFFFF"], reputation: 75, budget: 35,
      players: `Filip Jørgensen|GK|2002|DEN|74|74|15|2027
Milosz Piekutowski|GK|2006|POL|60|71|0.6|2031
Karim Coulibaly|CB|2007|GER|75|89|28|2031
Ismaël Doukouré|CB|2003|FRA|74|80|20|2028
Lucas Høgsberg|CB|2006|DEN|74|86|18|2030
Jeyland Mitchell|CB|2004|CRC|70|74|8|2031
Hermann Malonga|CB|2008|FRA|53|68|0|2031
Oso|LB|2003|ESP|71|73|10|2031
Mateo Del Blanco|LB|2003|ARG|69|71|5|2031
Genesis Antwi|RB|2007|SWE|66|79|3|2027
Dário Essugo|DM|2005|POR|73|83|15|2027
Diogo Sousa|DM|2006|POR|71|82|10|2031
Maxi Oyedele|DM|2004|POL|68|72|5|2030
Samir El Mourabet|CM|2005|MAR|74|83|22|2031
Pape Demba Diop|CM|2003|SEN|71|73|9|2030
Tyrese Noubissie|CM|2009|ENG|62|79|1|2028
Giovanni Reyna|AM|2002|USA|71|71|7|2031
Omari Kellyman|AM|2005|ENG|68|77|4|2031
Benjamin Brantlind|AM|2008|SWE|65|80|2|2031
Martial Godo|LW|2003|CIV|74|79|22|2030
Sebastian Nanasi|LW|2002|SWE|74|78|15|2029
Fábio Baldé|LW|2005|POR|68|77|5|2031
Gessime Yassine|RW|2005|MAR|74|83|20|2030
Samuel Amo-Ameyaw|RW|2006|ENG|70|82|8|2029
Yaya Diémé|RW|2007|SEN|57|70|0.3|2030
Joaquín Panichelli|ST|2002|ARG|75|80|35|2030
Conrad Harder|ST|2005|DEN|73|84|17|2027
Jacobo Ortega|ST|2006|ESP|70|81|7|2031
Deivid Washington|ST|2005|BRA|68|77|5|2031
Sékou Mara|ST|2002|FRA|69|69|4|2029`,
    },
    {
      id: "f_rcl", name: "RC Lens", short: "RCL", city: "Lens", stadium: "Stade Bollaert-Delelis", capacity: 38223,
      colors: ["#FFD100", "#E30613"], reputation: 76, budget: 25,
      players: `Robin Risser|GK|2004|FRA|76|80|30|2030
Mathieu Gorgelin|GK|1990|FRA|67|67|0.2|2027
Régis Gurtner|GK|1986|FRA|67|67|0.1|2027
Ilan Jourdren|GK|2008|FRA|53|68|0|2029
Ismaëlo Ganiou|CB|2005|FRA|76|83|30|2030
Samson Baidoo|CB|2004|AUT|75|83|25|2030
Jean-Clair Todibo|CB|1999|FRA|77|78|22|2027
Kyllian Antonio|CB|2008|FRA|71|86|10|2028
Nidal Celik|CB|2006|BIH|70|81|7|2029
Souleymane Sagnan|CB|2005|MLI|66|75|3|2030
Maik Nawrocki|CB|2001|POL|68|68|2.5|2030
Jonathan Gradit|CB|1992|FRA|74|74|2.5|2028
Matthieu Udol|LB|1996|FRA|74|74|8|2028
Jhoanner Chávez|LB|2002|ECU|66|66|2|2028
Saud Abdulhamid|RB|1999|KSA|72|73|9|2029
Ruben Aguilar|RB|1993|FRA|73|73|2.5|2028
Yacine Titraoui|CM|2003|ALG|71|73|9|2031
Andrija Bulatovic|CM|2006|MNE|70|81|8|2030
Michaël Cuisance|CM|1999|FRA|72|72|6|2030
Amadou Haidara|CM|1998|MLI|74|74|5|2029
Mezian Mesloub|AM|2009|POR|70|87|8|2030
Thorgan Hazard|AM|1993|BEL|73|73|2|2028
Abdallah Sima|LW|2001|SEN|73|76|7|2029
Michał Skóraś|LW|2000|POL|72|72|6|2031
Junior Kadile|LW|2002|COD|70|70|5|2027
Florian Thauvin|RW|1993|FRA|77|77|5|2028
Franjo Ivanović|ST|2003|CRO|73|75|15|2027
Odsonne Édouard|ST|1998|FRA|75|76|12|2028
Florian Sotoca|ST|1990|FRA|73|73|1.2|2027`,
    },
    {
      id: "f_brest", name: "Stade Brestois 29", short: "SBR", city: "Brest", stadium: "Stade Francis-Le Blé", capacity: 15220,
      colors: ["#E30613", "#FFFFFF"], reputation: 70, budget: 15,
      players: `Egil Selvik|GK|1997|NOR|69|69|1.5|2027
Mathieu Patouillet|GK|2004|FRA|60|64|0.6|2029
Romain Cagnon|GK|1997|FRA|58|58|0|2027
Noé Poillion|GK|2007|FRA|53|66|0|2029
Raphaël Le Guen|CB|2006|FRA|73|84|15|2029
Brendan Chardonnet|CB|1994|FRA|74|74|4|2027
Gautier Lloris|CB|1995|FRA|71|71|3|2028
Bradley Locko|LB|2002|FRA|71|75|6|2028
Justin Bourgault|LB|2005|FRA|62|71|1|2029
Kenny Lala|RB|1991|FRA|73|73|1.5|2027
Luck Zogbé|RB|2005|CIV|63|72|1.2|2029
Joris Chotard|DM|2001|FRA|72|74|7|2029
Mamady Diambou|DM|2002|MLI|65|65|1.5|2028
Hugo Magnetti|CM|1998|FRA|73|74|6|2029
Joseph Nonge|CM|2005|BEL|65|74|2|2029
Lucas Tousart|CM|1997|FRA|70|70|2|2027
Kamory Doumbia|AM|2003|MLI|72|77|12|2029
Pathé Mboup|LW|2003|SEN|66|68|2.5|2030
Giovani Versini|RW|2004|FRA|68|72|5|2030
Noah Edjouma|RW|2005|FRA|68|77|5|2027
Djylian N'Guessan|ST|2008|FRA|68|83|5|2026
Mama Baldé|ST|1995|GNB|72|72|3|2027
Ludovic Ajorque|ST|1994|FRA|73|73|3|2027
Mathis Lainé|ST|2007|FRA|53|66|0.1|2029`,
    },
    {
      id: "f_tfc", name: "Toulouse FC", short: "TFC", city: "Toulouse", stadium: "Stadium de Toulouse", capacity: 33150,
      colors: ["#5B2C83", "#FFFFFF"], reputation: 69, budget: 15,
      players: `Guillaume Restes|GK|2005|FRA|74|83|18|2028
Mathys Niflore|GK|2007|FRA|66|79|2.5|2029
Mark McKenzie|CB|1999|USA|73|74|7|2027
Rasmus Nicolaisen|CB|1997|DEN|73|73|5|2029
Seny Koumbassa|CB|2007|FRA|68|81|5|2030
David Odogu|CB|2006|GER|68|79|5|2027
Christ Tapé|LB|2006|CIV|67|78|3.5|2030
Rafik Messali|RB|2003|ALG|64|66|1.5|2028
Ismaïl Diallo|RB|2003|FRA|62|64|0.9|2030
Niko Sigur|DM|2003|CAN|68|70|4|2026
Alexis Vossah|CM|2008|FRA|73|88|15|2030
Cristian Cásseres Jr.|CM|2000|VEN|74|76|12|2028
Mathis Amougou|CM|2006|FRA|71|84|9|2027
Thomas Jørgensen|CM|2005|DEN|70|79|7.5|2030
Abu Francis|CM|2001|GHA|69|72|2|2029
Niklas Schmidt|CM|1998|GER|70|70|1.5|2027
Aymen Amaaouch|CM|2009|FRA|53|70|0|2029
Aron Dønnum|CM|1998|NOR|73|73|5|2027
Sion Oppong|LW|2007|SWE|67|80|3.5|2030
Ilyas Azizi|LW|2008|FRA|65|80|2|2029
Santiago Hidalgo|ST|2005|ARG|69|79|6|2029
Casper Tengstedt|ST|2000|DEN|70|70|3.5|2029
Jacen Russell-Rowe|ST|2002|CAN|68|68|3|2029
Julián Vignolo|ST|2006|ARG|64|75|1.5|2029`,
    },
    {
      id: "f_aja", name: "AJ Auxerre", short: "AJA", city: "Auxerre", stadium: "Stade de l'Abbé-Deschamps", capacity: 18541,
      colors: ["#FFFFFF", "#0055A4"], reputation: 65, budget: 8,
      players: `Mamadou Diop|GK|2000|MTN|68|68|2|2030
Paul Nardi|GK|1994|FRA|70|70|1.2|2028
Louis Mezerette|GK|2006|FRA|53|64|0|2028
Clément Akpa|CB|2001|CIV|71|74|9|2028
Sinaly Diomandé|CB|2001|CIV|71|74|6|2027
Axel Tuanzebe|CB|1997|COD|72|72|5|2027
Bryan Okoh|CB|2003|SUI|68|70|4|2029
Christ Makosso|CB|2004|CGO|65|69|2|2030
Elikya Legros|CB|2008|FRA|65|80|2|2030
Telli Siwe|CB|2004|FRA|62|66|1|2029
Alvin Petit Dol|CB|2006|FRA|53|64|0|2027
Mohamed Coulibaly|CB|2008|FRA|53|68|0|2029
Fredrik Oppegård|LB|2002|NOR|68|72|1.5|2028
Sékou Fofana|LB|2003|FRA|63|65|1.2|2030
Ackah-Tidiane Zoukrou|LB|2008|FRA|53|68|0|2029
Marvin Senaya|RB|2001|GHA|69|72|3|2029
Lamine Sy|RB|2002|SEN|67|67|2.5|2030
Arthur Piedfort|DM|2005|BEL|68|77|5|2030
Pierre Ekwah|DM|2002|FRA|66|66|2|2027
Assane Dioussé|DM|1997|SEN|65|65|0.5|2027
Lamfia Dioubaté|DM|2007|FRA|57|70|0.3|2029
Yvan Zaddy|DM|2006|CIV|53|64|0|2029
Kévin Danois|CM|2004|FRA|74|81|20|2029
Naouirou Ahamada|CM|2002|FRA|68|68|3|2027
Tidiane Devernois|CM|2007|FRA|57|70|0.3|2030
Romain Faivre|AM|1998|FRA|72|73|4|2027
Danny Namaso|LW|2000|CMR|69|72|6|2029
Aristide Zossou|LW|2005|CIV|66|75|2.5|2030
Rayan Mandengue|LW|2006|CMR|58|69|0.4|2028
Mamoudou Cissokho|RW|2007|FRA|56|69|0.2|2029
Cameron Archer|ST|2001|ENG|72|72|7|2027
Rémy Labeau Lascary|ST|2003|FRA|69|74|4|2027
Ryan Rodin|ST|2006|FRA|57|68|0.3|2028
Xiangxin Wei|ST|2008|CHN|57|72|0.3|2031`,
    },
    {
      id: "f_srfc", name: "Stade Rennais FC", short: "REN", city: "Rennes", stadium: "Roazhon Park", capacity: 29778,
      colors: ["#E30613", "#000000"], reputation: 76, budget: 30,
      players: `Brice Samba|GK|1994|FRA|77|77|7|2029
Nicolas Lemaître|GK|1997|FRA|65|65|0.5|2028
Kilian Belazzoug|GK|2006|ALG|53|64|0|2028
Charlie Cresswell|CB|2002|ENG|75|79|25|2027
Abdelhamid Ait Boudlal|CB|2006|MAR|74|85|20|2028
Anthony Rouault|CB|2001|FRA|74|77|12|2029
Gonçalo Oliveira|CB|2006|POR|66|77|3|2031
Quentin Merlin|LB|2002|FRA|73|77|15|2029
Mahamadou Nagida|LB|2005|CMR|71|80|10|2029
Przemyslaw Frankowski|RB|1995|POL|76|76|6|2027
Bryan Reynolds|RB|2001|USA|69|69|4|2030
Valentin Rongier|DM|1994|FRA|77|77|8|2028
Mahdi Camara|CM|1998|FRA|75|76|12|2029
Djaoui Cissé|CM|2004|FRA|71|79|10|2030
Adrien Thomasson|CM|1993|FRA|75|75|4|2029
Ludovic Blas|CM|1997|FRA|75|75|10|2027
Sebastian Szymański|AM|1999|POL|77|78|15|2029
Ayanda Sishuba|AM|2005|BEL|60|69|0.6|2029
Henrick Do Marcolino|AM|2006|GAB|57|68|0.3|2029
Issa Soumaré|LW|2000|SEN|71|73|8|2030
Mousa Al-Tamari|RW|1997|JOR|75|75|10|2028
Arnaud Nordin|RW|1998|FRA|72|72|4|2029
Elías Legendre Quiñónez|RW|2008|ECU|62|77|1|2029
Estéban Lepaul|ST|2000|FRA|79|79|45|2030
Eliezer Mayenda|ST|2005|ESP|74|83|18|2031
Boulaye Dia|ST|1996|SEN|76|76|5|2027`,
    },
    {
      id: "f_sco", name: "Angers SCO", short: "SCO", city: "Angers", stadium: "Stade Raymond-Kopa", capacity: 19350,
      colors: ["#000000", "#FFFFFF"], reputation: 62, budget: 6,
      players: `Anthony Lopes|GK|1990|POR|72|72|0.9|2028
Melvin Zinga|GK|2002|CGO|61|66|0.3|2027
Oumar Pona|GK|2006|MLI|56|67|0.2|2027
Ousmane Camara|CB|2003|MLI|70|73|8|2029
Emmanuel Biumla|CB|2005|FRA|67|68|2.5|2028
Jordan Lefort|CB|1993|MTN|70|70|1|2029
Maël Gernigon|CB|2009|FRA|57|74|0.3|2028
Joseph Kalulu|LB|2004|FRA|65|69|2|2030
Lilian Raolisoa|RB|2000|FRA|68|70|4|2028
Marius Louër|RB|2007|FRA|65|78|2|2028
Carlens Arcus|RB|1996|HAI|70|70|1.8|2027
Yassin Belkhdim|CM|2002|MAR|69|73|7|2028
Branco van den Boomen|CM|1995|NED|72|72|2.5|2029
Haris Belkebla|CM|1994|ALG|71|71|1.8|2028
Louis Mouton|AM|2002|FRA|69|69|4|2028
Bané Diatta|AM|2008|FRA|61|76|0.8|2030
Amine Sbaï|LW|2000|MAR|72|72|6|2027
Anthony Bermont|LW|2005|FRA|66|75|3|2027
Harouna Djibirin|RW|2006|CMR|64|75|1.5|2028
Jim Allevinah|RW|1995|GAB|69|69|1|2027
Prosper Peter|ST|2007|FRA|72|82|12|2028
Amine El Ouazzani|ST|2001|MAR|68|68|2.5|2027
Usman Simbakoli|ST|2001|CTA|63|63|0.7|2029`,
    },
    {
      id: "f_hac", name: "Le Havre AC", short: "HAC", city: "Le Havre", stadium: "Stade Océane", capacity: 25178,
      colors: ["#6CABDD", "#002F6C"], reputation: 62, budget: 6,
      players: `Arnaud Bodart|GK|1998|BEL|68|70|1.5|2027
Lionel Mpasi-Nzau|GK|1994|COD|68|68|0.7|2027
Gauthier Gallon|GK|1993|FRA|68|68|0.6|2027
Ayumu Seko|CB|2000|JPN|70|72|5|2028
Stephan Zagadou|CB|2008|FRA|68|83|4|2025
Ahmed Touba|CB|1998|ALG|70|70|2.5|2027
Lamine N'Diaye|CB|2005|SEN|59|68|0.5|2026
Vincent Sasso|CB|1991|FRA|65|65|0.15|2026
Enzo Koffi|LB|2006|FRA|64|75|1.8|2026
Elias Jelert|RB|2003|DEN|69|71|5|2027
Timothée Pembélé|RB|2002|FRA|67|71|1.8|2029
Djibril Ouziad|RB|2009|FRA|59|76|0.5|2030
Junior Mwanga|DM|2003|FRA|69|71|6|2030
Mathéo Bodmer|DM|2004|FRA|57|61|0.3|2027
Daren Mosengo|DM|2006|FRA|57|68|0.3|2027
Rassoul Ndiaye|CM|2001|SEN|70|73|8|2028
Simon Ebonog|CM|2004|FRA|68|76|4.5|2029
Amir Richardson|CM|2002|MAR|69|69|4|2027
Guy-Noël Zohouri|CM|2007|CIV|53|66|0.1|2027
Kaito Mizuta|AM|2000|JPN|63|63|0.6|2029
Ismaïl Bouneb|AM|2006|FRA|58|69|0.4|2028
Felix Mambimbi|LW|2001|SUI|62|62|0.5|2027
Rayan Fofana|ST|2006|CIV|70|81|8|2027
Josh Maja|ST|1998|NGA|72|72|4.5|2027
Sota Nakamura|ST|2002|JPN|63|63|0.9|2027
Mbwana Samatta|ST|1992|TAN|70|70|0.7|2027
Elysée Logbo|ST|2004|FRA|56|60|0.2|2027
Joan Tincrès|ST|2006|FRA|53|64|0.1|2030`,
    },
    {
      id: "f_fcl", name: "FC Lorient", short: "FCL", city: "Lorient", stadium: "Stade du Moustoir", capacity: 18110,
      colors: ["#F58220", "#000000"], reputation: 62, budget: 8,
      players: `Yvon Mvogo|GK|1994|SUI|73|73|2.5|2027
Bingourou Kamara|GK|1996|SEN|66|66|0.6|2027
Benjamin Leroy|GK|1989|FRA|64|64|0.1|2027
Montassar Talbi|CB|1998|TUN|74|75|8|2027
Formose Mendy|CB|2001|SEN|67|70|1.5|2028
Nathaniel Adjei|CB|2002|GHA|67|72|1.5|2028
Nosa Edward Obaretin|CB|2003|ITA|64|66|1.5|2027
Isaak Touré|CB|2003|FRA|65|71|1.2|2028
Arsène Kouassi|LB|2004|BFA|73|77|15|2029
Srdjan Kuzmic|LB|2004|SVN|66|70|3|2030
Alec Georgen|RB|1998|FRA|68|68|1.5|2029
Dembo Sylla|RB|2002|GUI|65|65|1.5|2028
Arthur Avom|CM|2004|CMR|74|82|20|2027
Noah Cadiou|CM|1998|FRA|74|74|7|2029
Noah Mbamba|CM|2005|COD|65|74|2|2027
Théo Le Bris|CM|2002|FRA|70|74|5|2029
Panos Katseris|CM|2001|GRE|69|72|3|2028
Jean-Victor Makengo|AM|1998|FRA|71|72|6|2027
Gabin Bernardeau|AM|2006|FRA|63|74|1.2|2030
Bandiougou Fadiga|AM|2001|FRA|57|57|0.15|2028
Isak Jensen|LW|2003|DEN|69|71|5|2027
Souleymane Faye|RW|2003|SEN|67|69|3|2027
Ibrahima Baldé|ST|2003|FRA|67|69|3|2027
Mohamed Bamba|ST|2001|CIV|70|73|2|2028
Mamadou Koné|ST|2006|CIV|65|76|2|2030
Aiyegun Tosin|ST|1998|BEN|69|69|1.8|2027`,
    },
    {
      id: "f_pfc", name: "Paris FC", short: "PFC", city: "París", stadium: "Stade Jean-Bouin", capacity: 19904,
      colors: ["#1E2D5A", "#FFFFFF"], reputation: 65, budget: 40,
      players: `Obed Nkambadio|GK|2003|FRA|68|75|5|2027
Kevin Trapp|GK|1990|GER|75|75|1.8|2028
Diego Coppola|CB|2003|ITA|74|80|20|2031
Moustapha Mbow|CB|2000|SEN|72|75|10|2028
Otávio|CB|2002|BRA|73|73|10|2030
Samir Chergui|CB|1999|ALG|69|70|4|2027
Yoan Koré|CB|2004|FRA|60|64|0.6|2027
Nhoa Sangui|LB|2006|FRA|71|83|10|2030
Emmanuel Mbemba|LB|2008|FRA|65|80|2|2030
Thibault De Smet|LB|1998|BEL|68|68|1.2|2027
Adama Camara|RB|1996|MLI|73|73|4|2028
Hamari Traoré|RB|1992|MLI|73|73|1.5|2027
Maxime Lopez|DM|1997|FRA|73|73|5|2027
Pierre Lees-Melou|DM|1993|FRA|75|75|4.5|2027
Patrick Zabi|CM|2006|CIV|74|85|20|2026
Rudy Matondo|CM|2008|FRA|74|89|20|2030
Vincent Marchetti|CM|1997|FRA|69|69|1.5|2027
Pablo Pagis|AM|2002|FRA|72|77|20|2031
Luca Koleosho|LW|2004|ITA|71|75|10|2031
Moses Simon|LW|1995|NGA|75|75|7|2028
Ilan Kebbal|RW|1998|ALG|75|76|12|2028
Jonathan Ikoné|RW|1998|FRA|72|72|4|2027
Lassine Sinayoko|ST|1999|MLI|74|75|15|2029
Jean-Philippe Krasso|ST|1997|CIV|72|72|3.5|2028
Omar Sissoko|ST|2006|FRA|62|73|1|2027`,
    },
    {
      id: "f_estac", name: "ESTAC Troyes", short: "EST", city: "Troyes", stadium: "Stade de l'Aube", capacity: 20400,
      colors: ["#1E4B9B", "#FFFFFF"], reputation: 63, budget: 6,
      players: `Patrick Beach|GK|2003|AUS|65|67|2|2031
Hillel Konaté|GK|1994|BFA|66|66|0.4|2028
Zacharie Boucher|GK|1992|FRA|62|62|0.1|2027
Junior Diaz|CB|2003|CIV|69|71|6|2029
Paolo Gozzi|CB|2001|ITA|65|65|1.2|2027
Adrien Monfray|CB|1990|FRA|66|66|0.2|2027
Ismaël Boura|LB|2000|COM|70|70|4|2027
Anis Ouzenadji|LB|2006|ALG|66|77|2.5|2025
Yvann Titi|RB|2006|FRA|66|77|2.5|2029
Lucas Maronnier|RB|2000|FRA|64|64|0.8|2027
Noah Donkor|RB|2006|FRA|57|68|0.3|2029
Alexandre Phliponeau|DM|2000|FRA|61|61|0.35|2028
Roman Murcy|DM|2006|FRA|53|64|0.05|2029
Mouhamed Diop|CM|2000|SEN|70|70|4|2028
Antoine Mille|CM|1997|FRA|71|71|2.5|2028
Iron Gomis|CM|1999|FRA|67|67|1.4|2028
Hugo Picard|CM|2003|FRA|67|69|3|2027
Dermane Karim|AM|2003|TOG|66|68|2.5|2029
Idrissa Soukouna|AM|2008|FRA|53|68|0.1|2029
Kandet Diawara|LW|2000|GUI|66|66|1.2|2027
Merwan Ifnaoui|RW|1998|FRA|70|70|2.5|2027
Amadou Diakité|RW|2005|FRA|53|62|0.05|2025
Jérémy Le Douaron|ST|1998|FRA|71|71|3|2027
Timothé Nkada|ST|1999|FRA|68|68|2|2027
Christ Batola|ST|2009|FRA|62|79|1|2029
Renaud Ripart|ST|1993|FRA|66|66|0.35|2027
Yacouba Koné|ST|2007|CIV|57|70|0.3|2029
Ibrahim Traoré|ST|2006|FRA|53|64|0.05|2025`,
    },
    {
      id: "f_lmfc", name: "Le Mans FC", short: "LMF", city: "Le Mans", stadium: "MMArena", capacity: 25064,
      colors: ["#E30613", "#FFD100"], reputation: 63, budget: 6,
      players: `Nicolas Kocik|GK|1998|FRA|68|68|1.5|2027
Ewan Hatfout|GK|2000|FRA|60|60|0.3|2029
Augustin Delbecque|GK|2002|FRA|55|55|0|2027
Noa Boissé|CB|2006|FRA|66|77|3|2029
Raúl Torrente|CB|2001|ESP|68|68|2.5|2027
Théo Eyoum|CB|2002|FRA|64|64|1.2|2028
Harold Voyer|CB|1997|FRA|67|67|0.9|2028
Samuel Yohou|CB|1991|FRA|66|66|0.2|2028
Lucas Calodat|LB|2002|FRA|68|68|3|2028
Yasser Larouci|LB|2001|ALG|66|66|1.5|2029
João Almeida|LB|2006|BRA|58|69|0.4|2027
Lucas Buades|RB|1997|FRA|69|69|1.5|2028
Rayan Bamba|RB|2004|FRA|64|68|1.5|2027
Djibril Sidibé|RB|1992|FRA|70|70|1|2028
Lucas Bretelle|DM|2002|FRA|64|64|1.2|2029
Alexandre Lauray|DM|1997|FRA|66|66|0.8|2027
Adil Bourabaa|CM|2005|ALG|67|76|3.5|2029
Jean Vercruysse|CM|2000|FRA|64|64|0.7|2028
Edwin Quarshie|CM|1995|CTA|66|66|0.5|2027
Daouda Traoré|CM|2006|FRA|58|69|0.4|2027
Martin Rossignol|CM|2003|FRA|59|61|0.4|2022
Erwan Colas|LW|1997|FRA|65|65|0.6|2029
Billal Brahimi|RW|2000|ALG|65|65|1|2028
Habib Diallo|ST|1995|SEN|72|72|3|2029
Louis Mafouta|ST|1994|CTA|69|69|1|2028
Dame Gueye|ST|1995|SEN|68|68|0.8|2027
Antoine Rabillard|ST|1995|FRA|67|67|0.7|2027
William Harhouz|ST|1999|FRA|62|62|0.4|2028
Enzo Vagner|ST|2006|BRA|53|64|0|2027`,
    },
  ],
  tier2: [
    { id: "f_fcn", name: "FC Nantes", short: "FCN", city: "Nantes", stadium: "Stade de la Beaujoire", capacity: 35322, colors: ["#FFD800", "#008D3C"], reputation: 65 },
    { id: "f_fcm", name: "FC Metz", short: "FCM", city: "Metz", stadium: "Stade Saint-Symphorien", capacity: 30000, colors: ["#7A1E3C", "#FFFFFF"], reputation: 60 },
    { id: "f_asse", name: "AS Saint-Étienne", short: "ASE", city: "Saint-Étienne", stadium: "Stade Geoffroy-Guichard", capacity: 41965, colors: ["#009639", "#FFFFFF"], reputation: 66 },
    { id: "f_mhsc", name: "Montpellier HSC", short: "MTP", city: "Montpellier", stadium: "Stade de la Mosson", capacity: 32900, colors: ["#F58220", "#1E2D5A"], reputation: 64 },
    { id: "f_sdr", name: "Stade de Reims", short: "SDR", city: "Reims", stadium: "Stade Auguste-Delaune", capacity: 21684, colors: ["#E30613", "#FFFFFF"], reputation: 64 },
    { id: "f_cf63", name: "Clermont Foot 63", short: "CLE", city: "Clermont-Ferrand", stadium: "Stade Gabriel-Montpied", capacity: 11980, colors: ["#C8102E", "#1E2D5A"], reputation: 59 },
    { id: "f_eag", name: "En Avant Guingamp", short: "EAG", city: "Guingamp", stadium: "Stade du Roudourou", capacity: 18378, colors: ["#E30613", "#000000"], reputation: 58 },
    { id: "f_sceb", name: "SC Bastia", short: "SCB", city: "Bastia", stadium: "Stade Armand-Cesari", capacity: 16078, colors: ["#0055A4", "#FFFFFF"], reputation: 58 },
    { id: "f_gf38", name: "Grenoble Foot 38", short: "GRE", city: "Grenoble", stadium: "Stade des Alpes", capacity: 20068, colors: ["#1E4B9B", "#FFFFFF"], reputation: 57 },
    { id: "f_rsfc", name: "Red Star FC", short: "RED", city: "Saint-Ouen", stadium: "Stade Bauer", capacity: 10000, colors: ["#009639", "#FFFFFF"], reputation: 57 },
    { id: "f_fca", name: "FC Annecy", short: "FCA", city: "Annecy", stadium: "Parc des Sports", capacity: 15660, colors: ["#E30613", "#FFFFFF"], reputation: 56 },
  ],
};
