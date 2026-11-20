import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: "ger",
  name: "Liga Alemana",
  country: "Alemania",
  nat: "GER",
  tier2Name: "Segunda Alemana",
  clubs: [
    {
      id: "g_fcb", name: "FC Bayern München", short: "FCB", city: "Múnich", stadium: "Allianz Arena", capacity: 75024,
      colors: ["#DC052D", "#FFFFFF"], reputation: 94, budget: 120,
      players: `Jonas Urbig|GK|2003|GER|74|84|18|2029
Manuel Neuer|GK|1986|GER|83|83|4|2027
Sven Ulreich|GK|1988|GER|71|71|0.5|2027
Dayot Upamecano|CB|1998|FRA|84|85|75|2030
Jonathan Tah|CB|1996|GER|84|84|28|2029
Min-jae Kim|CB|1996|KOR|80|80|20|2028
Hiroki Ito|CB|1999|JPN|78|80|18|2028
Nathaniel Brown|LB|2003|GER|78|85|50|2031
Alphonso Davies|LB|2000|CAN|82|84|45|2030
Josip Stanisic|RB|2000|CRO|80|80|40|2029
Konrad Laimer|RB|1997|AUT|81|81|32|2029
Sacha Boey|RB|2000|FRA|73|73|7|2028
Aleksandar Pavlovic|DM|2004|GER|80|84|90|2029
Joshua Kimmich|DM|1995|GER|86|86|35|2029
David Santos Daiber|DM|2007|POR|66|79|3|2030
Tom Bischof|CM|2005|GER|77|86|45|2029
Bara Sapoko Ndiaye|CM|2007|SEN|70|83|8|2031
Jamal Musiala|AM|2003|GER|84|89|80|2030
Lennart Karl|AM|2008|GER|78|95|60|2029
Ismael Saibari|AM|2001|MAR|80|80|55|2031
Luis Díaz|LW|1997|COL|85|85|70|2029
Michael Olise|RW|2001|FRA|87|90|180|2029
Tim Binder|RW|2007|GER|64|77|1.5|2030
Serge Gnabry|AM|1995|GER|81|81|18|2028
Harry Kane|ST|1993|ENG|89|89|60|2029`,
    },
    {
      id: "g_bvb", name: "Borussia Dortmund", short: "BVB", city: "Dortmund", stadium: "Signal Iduna Park", capacity: 81365,
      colors: ["#FDE100", "#000000"], reputation: 87, budget: 70,
      players: `Gregor Kobel|GK|1997|SUI|82|82|40|2028
Alexander Meyer|GK|1991|GER|70|70|0.5|2027
Patrick Drewes|GK|1993|GER|67|67|0.3|2027
Silas Ostrzinski|GK|2003|GER|60|70|0.2|2027
Nico Schlotterbeck|CB|1999|GER|83|85|55|2031
Joane Gadou|CB|2007|FRA|75|88|28|2031
Waldemar Anton|CB|1996|GER|80|80|18|2028
Luca Reggiani|CB|2008|ITA|71|86|10|2029
Ramy Bensebaini|CB|1995|ALG|77|77|7|2027
Filippo Mané|CB|2005|ITA|68|81|5|2028
Emre Can|CB|1994|GER|77|77|3|2027
Daniel Svensson|LB|2002|SWE|76|81|22|2029
Kauã Prates|LB|2008|BRA|71|86|10|2031
Julian Ryerson|RB|1997|NOR|80|80|25|2028
Mussa Kaba|DM|2008|GER|56|71|0.2|2031
Felix Nmecha|CM|2000|GER|81|85|65|2030
Jobe Bellingham|CM|2005|ENG|77|87|40|2030
Joey Veerman|CM|1998|NED|80|80|25|2031
Carney Chukwuemeka|CM|2003|AUT|74|81|17|2030
Marcel Sabitzer|CM|1994|AUT|78|78|6|2027
Enzo dos Santos|CM|2009|LUX|64|81|1.5|2029
Ethan Nwaneri|AM|2007|ENG|76|88|35|2027
Konstantinos Karetsas|AM|2007|GRE|76|89|35|2031
Giannis Konstantelias|AM|2003|GRE|75|77|22|2031
Justin Lerma|AM|2008|ECU|67|82|3.2|2031
Mathis Albert|LW|2009|USA|68|85|5|2027
Samuele Inácio|AM|2008|ITA|74|89|20|2029
Maximilian Beier|ST|2002|GER|78|82|35|2029
Serhou Guirassy|ST|1996|GUI|84|84|32|2028
Fábio Silva|ST|2002|POR|75|80|22|2030`,
    },
    {
      id: "g_b04", name: "Bayer 04 Leverkusen", short: "B04", city: "Leverkusen", stadium: "BayArena", capacity: 30210,
      colors: ["#E32221", "#000000"], reputation: 85, budget: 60,
      players: `Mark Flekken|GK|1993|NED|78|78|6|2028
Janis Blaswich|GK|1991|GER|73|73|0.7|2027
Niklas Lomb|GK|1993|GER|65|65|0.25|2027
Jarell Quansah|CB|2003|ENG|78|84|50|2030
Edmond Tapsoba|CB|1999|BFA|81|83|35|2031
Facundo Medina|CB|1999|ARG|77|79|22|2031
Loïc Badé|CB|2000|FRA|78|80|20|2030
Tim Oermann|CB|2003|GER|68|70|4|2029
Miguel Gutiérrez|LB|2001|ESP|77|80|27|2031
Guéla Doué|RB|2002|CIV|76|79|30|2031
Lucas Vázquez|RB|1991|ESP|76|76|1.5|2027
Equi Fernández|DM|2002|ARG|75|75|20|2030
Kennet Eichhorn|DM|2009|GER|74|91|20|2031
Robert Andrich|DM|1994|GER|78|78|5|2028
Aleix García|CM|1997|ESP|80|80|20|2029
Ibrahim Maza|AM|2005|ALG|78|89|50|2030
Malik Tillman|AM|2002|USA|78|82|30|2030
Jonas Hofmann|AM|1992|GER|74|74|1.5|2027
Afonso Moreira|LW|2005|POR|76|85|30|2031
Eliesse Ben Seghir|LW|2005|MAR|75|84|20|2030
Martin Terrier|LW|1997|FRA|77|77|8|2029
Moussa Diaby|RW|1999|FRA|79|79|25|2031
Nathan Tella|RW|1999|NGA|76|77|15|2031
Montrell Culbreath|RW|2007|GER|73|86|15|2031
Christian Kofane|ST|2006|CMR|77|91|40|2029
Patrik Schick|ST|1996|CZE|80|80|18|2030
Victor Boniface|ST|2000|NGA|76|77|5|2028
Ndjicoura Bomba|ST|2008|MLI|64|79|1.5|2030`,
    },
    {
      id: "g_rbl", name: "RB Leipzig", short: "RBL", city: "Leipzig", stadium: "Red Bull Arena", capacity: 47069,
      colors: ["#FFFFFF", "#DD0741"], reputation: 83, budget: 55,
      players: `Maarten Vandevoordt|GK|2002|BEL|74|83|15|2030
Ørjan Nyland|GK|1990|NOR|73|73|0.8|2028
Leopold Zingerle|GK|1994|GER|64|64|0.3|2028
Castello Lukeba|CB|2002|FRA|79|84|50|2029
Maxime Estève|CB|2002|FRA|75|80|28|2031
Abdoul Koné|CB|2005|FRA|73|82|15|2031
Willi Orbán|CB|1992|HUN|80|80|5|2027
Lukas Klostermann|CB|1996|GER|75|75|3.5|2028
David Raum|LB|1998|GER|80|80|25|2027
Max Finkgräfe|LB|2004|GER|68|78|5|2030
Ridle Baku|RB|1998|GER|77|77|12|2027
Benjamin Henrichs|RB|1997|GER|76|76|7|2028
Nicolas Seiwald|DM|2001|AUT|78|81|25|2028
Benno Kaltefleiter|DM|2008|GER|53|68|0|2029
Neil El Aynaoui|CM|2001|MAR|77|81|30|2027
Ezechiel Banzuzi|CM|2005|COD|74|83|22|2030
Assan Ouédraogo|CM|2006|GER|74|88|22|2029
Rocco Reitz|CM|2002|GER|76|80|20|2031
Christoph Baumgartner|AM|1999|AUT|80|80|40|2028
Brajan Gruda|AM|2004|GER|75|83|28|2027
Andrija Maksimovic|AM|2007|SRB|71|84|9|2030
Viggo Gebel|AM|2007|GER|58|71|0.35|2028
Antonio Nusa|LW|2005|NOR|77|87|45|2029
Tidiam Gomis|LW|2006|FRA|73|84|15|2029
Johan Bakayoko|RW|2003|BEL|75|82|20|2030
Rômulo|ST|2002|BRA|77|77|30|2030
Christopher Nkunku|ST|1997|FRA|81|81|25|2027
Marc Guiu|ST|2006|ESP|72|83|12|2031
Samba Konaté|ST|2009|FRA|68|85|5|2028`,
    },
    {
      id: "g_sge", name: "Eintracht Frankfurt", short: "SGE", city: "Fráncfort", stadium: "Deutsche Bank Park", capacity: 58000,
      colors: ["#E1000F", "#000000"], reputation: 80, budget: 40,
      players: `Noah Atubolu|GK|2002|GER|75|75|18|2027
Kauã Santos|GK|2003|BRA|67|69|3|2030
Amil Siljevic|GK|2007|BIH|58|71|0.4|2029
Jens Grahl|GK|1988|GER|66|66|0.2|2027
Nnamdi Collins|CB|2004|GER|74|83|20|2030
Lilian Brassier|CB|1999|TOG|74|76|10|2031
Robin Koch|CB|1996|GER|79|79|10|2030
Otávio|CB|2005|BRA|71|71|3|2031
Jeremiaha Maluze|CB|2004|GER|66|70|2.5|2031
Keita Kosugi|LB|2006|JPN|70|81|7|2031
Elias Baum|RB|2005|GER|70|79|7|2028
Timothy Chandler|RB|1990|USA|66|66|0.35|2027
Raphael Onyedika|DM|2001|NGA|76|76|17|2031
Noël Aséko|DM|2005|GER|72|81|12|2031
Oscar Højlund|CM|2005|DEN|73|83|15|2029
Can Uzun|AM|2005|TUR|77|87|45|2029
Farès Chaïbi|AM|2002|ALG|74|74|15|2028
Niko Ilicevic|AM|2010|GER|68|87|5|2029
Love Arrhov|AM|2008|SWE|68|83|5|2028
Mario Götze|AM|1992|GER|76|76|3|2028
Ritsu Doan|RW|1998|JPN|79|79|17|2030
Ansgar Knauff|RW|2002|GER|75|77|15|2028
Ayoube Amaimouni-Echghouyab|RW|2004|MAR|71|75|10|2031
Jonathan Burkardt|ST|2000|GER|79|81|30|2030
Younes Ebnoutalib|ST|2003|GER|74|76|18|2031
Malik Pimpong|ST|2008|DEN|68|83|4|2031
Jessic Ngankam|ST|2000|GER|64|64|0.7|2028`,
    },
    {
      id: "g_vfb", name: "VfB Stuttgart", short: "VFB", city: "Stuttgart", stadium: "MHPArena", capacity: 60449,
      colors: ["#FFFFFF", "#E32219"], reputation: 79, budget: 35,
      players: `Dennis Seimen|GK|2005|GER|71|83|10|2029
Fabian Bredlow|GK|1995|GER|69|69|1|2027
Marius Funk|GK|1996|GER|65|65|0.3|2028
Stefan Drljaca|GK|1999|GER|62|62|0.3|2027
Finn Jeltsch|CB|2006|GER|76|88|35|2030
Ramon Hendriks|CB|2001|NED|75|78|25|2028
Jeff Chabot|CB|1998|GER|78|79|15|2028
Luca Jaquez|CB|2003|SUI|72|74|10|2029
Ameen Al-Dakhil|CB|2002|BEL|68|68|3|2028
Dan-Axel Zagadou|CB|1999|FRA|73|73|2|2027
Maximilian Mittelstädt|LB|1997|GER|79|79|18|2028
Josha Vagnoman|RB|2000|GER|74|76|12|2028
Lorenz Assignon|RB|2000|FRA|73|76|9|2029
Leonidas Stergiou|RB|2002|SUI|70|75|2|2028
Angelo Stiller|DM|2001|GER|81|84|45|2028
Atakan Karazor|DM|1996|TUR|76|76|5|2028
Nikolas Nartey|CM|2000|DEN|72|74|10|2028
Yanik Spalt|CM|2007|AUT|68|81|4|2028
Grischa Prömel|CM|1995|GER|74|74|3.5|2029
Ertugrul Yigit|CM|2009|GER|61|78|0.75|2029
Bilal El Khannouss|AM|2004|MAR|76|83|35|2030
Jarzinho Malanga|AM|2006|GER|63|74|1.4|2028
Leo Sauer|LW|2005|SVK|73|82|15|2031
Chris Führich|LW|1998|GER|77|77|12|2028
Justin Diehl|LW|2004|GER|63|67|1.2|2029
Jamie Leweling|RW|2001|GER|78|81|40|2029
Tiago Tomás|RW|2002|POR|73|77|15|2029
Dzenan Pejcinovic|ST|2005|GER|75|84|25|2031
Ermedin Demirovic|ST|1998|BIH|79|79|22|2028
Deniz Undav|ST|1996|GER|81|81|22|2029`,
    },
    {
      id: "g_scf", name: "SC Freiburg", short: "SCF", city: "Friburgo", stadium: "Europa-Park Stadion", capacity: 34700,
      colors: ["#000000", "#E2001A"], reputation: 75, budget: 20,
      players: `Mio Backhaus|GK|2004|GER|73|77|15|2026
Florian Müller|GK|1997|GER|70|70|1.2|2023
Jannik Huth|GK|1994|GER|65|65|0.4|2024
Bruno Ogbus|CB|2005|SUI|72|81|12|2024
Philipp Lienhart|CB|1996|AUT|78|78|10|2018
Max Rosenfelder|CB|2003|GER|72|78|8|2023
Matthias Ginter|CB|1994|GER|78|78|5|2022
Anthony Jung|CB|1991|GER|71|71|0.6|2027
Jordy Makengo|LB|2001|COD|72|75|10|2028
Berkay Yılmaz|LB|2005|TUR|70|79|7|2024
Christian Günter|LB|1993|GER|74|74|2|2012
Philipp Treu|RB|2000|GER|74|78|18|2025
Lukas Kübler|RB|1992|GER|74|74|1.5|2015
Yannik Engelhardt|DM|2001|GER|73|77|12|2026
Patrick Osterhage|DM|2000|GER|74|76|10|2024
Rihito Yamamoto|DM|2001|JPN|72|72|7|2028
Maximilian Eggestein|CM|1996|GER|77|77|10|2021
Rouven Tarnutzer|CM|2007|SUI|59|72|0.5|2026
Derry Scherhant|LW|2002|GER|75|75|20|2025
Vincenzo Grifo|LW|1993|ITA|77|77|4|2019
Florent Muslija|LW|1998|KVX|67|67|1|2028
Niklas Beste|RW|1999|GER|75|75|10|2030
Cyriaque Irié|RW|2005|BFA|70|79|8|2025
Yuito Suzuki|AM|2001|JPN|76|79|28|2025
Igor Matanovic|ST|2003|CRO|76|78|30|2025
Keisuke Goto|ST|2005|JPN|71|80|10|2026
Lucas Höler|ST|1994|GER|74|74|3|2018`,
    },
    {
      id: "g_m05", name: "1. FSV Mainz 05", short: "M05", city: "Maguncia", stadium: "MEWA Arena", capacity: 33305,
      colors: ["#C3141E", "#FFFFFF"], reputation: 73, budget: 15,
      players: `Robin Zentner|GK|1994|GER|74|74|2.5|2028
Alexander Schwolow|GK|1992|GER|69|69|0.45|2026
Maximilian Kinzig|GK|2003|GER|56|58|0.15|2026
Kacper Potulski|CB|2007|POL|74|87|18|2028
Stefan Posch|CB|1997|AUT|75|75|6|2026
Fabio Gruber|CB|2002|PER|70|70|5|2030
Dominik Kohr|CB|1994|GER|74|74|2|2028
Danny da Costa|CB|1993|GER|73|73|1.2|2027
Stefan Bell|CB|1991|GER|72|72|0.6|2027
Phillipp Mwene|LB|1994|AUT|72|72|1.5|2023
Rael Nakuzola|LB|2007|GER|59|72|0.5|2026
Anthony Caci|RB|1997|FRA|75|75|7|2028
Silvan Widmer|RB|1993|SUI|73|73|0.8|2021
Kaishu Sano|DM|2000|JPN|79|81|40|2028
Eric Martel|DM|2002|GER|73|76|8|2026
Lennard Maloney|DM|1999|USA|71|71|2.5|2028
Sota Kawasaki|DM|2001|JPN|69|73|2|2026
Paul Nebel|AM|2002|GER|75|79|18|2020
Nadiem Amiri|AM|1996|GER|79|79|17|2028
Jae-sung Lee|AM|1992|KOR|75|75|2|2021
Otto Ruoppi|AM|2006|FIN|65|76|2|2030
Sheraldo Becker|LW|1995|SUR|73|73|2|2026
Silas|RW|1998|COD|70|70|2|2026
Benedict Hollerbach|ST|2001|GER|73|76|8|2029
Phillip Tietz|ST|1997|GER|74|74|5|2028
Ransford Königsdörffer|ST|2001|GHA|72|74|5|2026
Alynho Haidara|ST|2008|CIV|59|74|0.5|2027`,
    },
    {
      id: "g_bmg", name: "Borussia Mönchengladbach", short: "BMG", city: "Mönchengladbach", stadium: "Borussia-Park", capacity: 54042,
      colors: ["#FFFFFF", "#000000"], reputation: 75, budget: 20,
      players: `Moritz Nicolas|GK|1997|GER|76|76|8|2029
Jan Olschowsky|GK|2001|GER|62|62|0.45|2027
Daniel Batz|GK|1991|GER|69|69|0.35|2029
Tobias Sippel|GK|1988|GER|71|71|0.3|2027
Kevin Diks|CB|1996|IDN|76|76|5|2030
Ko Itakura|CB|1997|JPN|73|73|4|2030
Fabio Chiarodia|CB|2005|ITA|67|77|3|2028
Jan Leszczyński|CB|2007|POL|66|79|3|2030
Lukas Ullrich|LB|2004|GER|70|78|6|2029
David Herold|LB|2003|GER|68|70|4|2030
Yukhym Konoplya|RB|1999|UKR|73|73|5|2029
Joe Scally|RB|2002|USA|73|75|5|2027
Daiki Hashioka|RB|1999|JPN|68|68|1.5|2027
Philipp Sander|DM|1998|GER|73|74|4|2028
Zento Uno|DM|2003|JPN|63|65|1|2030
Jens Castrop|CM|2003|KOR|73|78|10|2029
Enzo Leopold|CM|2000|GER|71|71|4|2030
Mathieu Nguefack|CM|2008|GER|66|81|3|2029
Florian Neuhaus|CM|1997|GER|73|73|2.5|2027
Wael Mohya|AM|2008|GER|73|88|17|2028
Kevin Stöger|AM|1993|AUT|75|75|1.8|2027
Fritz Fleck|AM|2007|GER|57|70|0.3|2028
Hugo Bolin|LW|2003|SWE|71|73|7.5|2030
Robin Hack|LW|1998|GER|74|74|5|2029
Nicolas Kühn|RW|2000|GER|76|78|10|2027
Franck Honorat|RW|1996|FRA|76|76|7|2029
Tim Kleindienst|ST|1995|GER|77|77|8|2029
Isac Lidberg|ST|1998|SWE|73|73|5|2030
Shuto Machino|ST|1999|JPN|73|74|3|2029
Iaia Manco Danfa|ST|2007|GNB|56|69|0.25|2028`,
    },
    {
      id: "g_fca", name: "FC Augsburg", short: "FCA", city: "Augsburgo", stadium: "WWK Arena", capacity: 30660,
      colors: ["#BA3733", "#46714D"], reputation: 70, budget: 12,
      players: `Finn Dahmen|GK|1998|GER|77|77|12|2027
Nediljko Labrovic|GK|1999|CRO|69|69|2|2029
Tom Wisbereit|GK|2007|GER|56|69|0.2|2030
Chrislain Matsima|CB|2002|FRA|74|79|25|2030
Noahkai Banks|CB|2006|GER|75|89|25|2029
Juma Bah|CB|2006|SLE|71|80|10|2027
Calvin Brackelmann|CB|1999|GER|72|72|4|2030
Jeffrey Gouweleeuw|CB|1991|NED|73|73|1|2027
Hennes Behrens|LB|2005|GER|70|80|8|2031
Young-woo Seol|RB|1998|KOR|74|74|6.5|2030
Marius Wolf|RB|1995|GER|74|74|2.5|2027
Yannik Keitel|DM|2000|GER|68|68|2|2027
Tim Breithaupt|DM|2002|GER|63|63|0.8|2028
Tim Schnitzer|DM|2008|GER|59|74|0.5|2029
Fabian Rieder|CM|2002|SUI|74|78|15|2030
Han-Noah Massengo|CM|2001|FRA|73|76|10|2030
Sima Suso|CM|2005|GER|66|75|2.8|2031
Robin Fellhauer|CM|1998|GER|73|73|4|2029
Anton Kade|AM|2004|GER|73|77|15|2029
Mert Kömür|AM|2005|GER|72|82|12|2029
Alexis Claude-Maurice|AM|1998|FRA|76|76|12|2027
Arijon Ibrahimovic|AM|2005|GER|71|80|10|2027
Faik Sakar|LW|2008|GER|56|71|0.2|2030
Rodrigo Ribeiro|ST|2005|POR|68|77|5|2031
Uchenna Ogundu|ST|2006|NGA|68|79|4|2031
Michael Gregoritsch|ST|1994|AUT|72|72|1.5|2027
Steve Mounié|ST|1994|BEN|71|71|1|2027`,
    },
    {
      id: "g_fcu", name: "1. FC Union Berlin", short: "FCU", city: "Berlín", stadium: "Stadion An der Alten Försterei", capacity: 22012,
      colors: ["#EB1923", "#FFFFFF"], reputation: 71, budget: 10,
      players: `Frederik Rönnow|GK|1992|DEN|75|75|2|2021
Matheo Raab|GK|1998|GER|66|69|0.8|2025
Carl Klaus|GK|1994|GER|66|66|0.35|2024
Leopold Querfeld|CB|2003|AUT|74|80|17|2027
Zeno Van Den Bosch|CB|2003|BEL|70|72|6|2026
Felix Uduokhai|CB|1997|GER|72|72|2.5|2026
Stanley Nsoki|CB|1999|FRA|69|69|2|2026
Marvin Friedrich|CB|1995|GER|72|72|1.8|2026
Tom Rothe|LB|2004|GER|72|78|10|2024
Derrick Köhn|LB|1999|GHA|72|73|4|2029
Andrik Markgraf|LB|2006|GER|57|68|0.3|2025
Josip Juranovic|RB|1995|CRO|73|73|2|2023
Christopher Trimmel|RB|1987|AUT|75|75|0.6|2027
Aljoscha Kemlein|DM|2004|GER|72|79|12|2029
Rani Khedira|DM|1994|TUN|75|75|2|2027
András Schäfer|CM|1999|HUN|73|73|4.5|2027
Michel Aebischer|CM|1997|SUI|73|73|4|2026
Janik Haberer|CM|1994|GER|72|72|2|2027
Kastriot Imeri|CM|2000|SUI|68|68|2|2026
Robert Skov|CM|1996|DEN|71|71|1.5|2024
Woo-yeong Jeong|AM|1999|KOR|71|71|3.5|2025
Livan Burcu|LW|2004|TUR|68|76|4|2024
Linus Güther|LW|2010|GER|62|81|1|2028
Julien Friedrich|LW|2006|GER|54|65|0.13|2024
Emmanuel Latte Lath|ST|1999|CIV|75|75|10|2027
Andrej Ilic|ST|2000|SRB|74|74|9|2025
Oliver Burke|ST|1997|SCO|72|72|3|2029
Marin Ljubicic|ST|2002|CRO|67|67|2|2025
Tim Skarke|ST|1996|GER|70|70|1.5|2022
Mekhi Gray|ST|2007|JAM|59|72|0.5|2026`,
    },
    {
      id: "g_svw", name: "SV Werder Bremen", short: "SVW", city: "Bremen", stadium: "Weserstadion", capacity: 42100,
      colors: ["#1D9053", "#FFFFFF"], reputation: 73, budget: 15,
      players: `Karl Hein|GK|2002|EST|71|75|4|2030
Alexander Schlager|GK|1996|AUT|71|71|1.5|2029
Markus Kolke|GK|1990|GER|66|66|0.3|2024
Stefan Smarkalev|GK|2007|BUL|54|67|0.15|2027
Marco Friedl|CB|1998|AUT|76|76|10|2028
Oskar Wójcik|CB|2003|POL|69|71|5|2031
Amos Pieper|CB|1998|GER|73|74|4|2022
Mick Schmetgens|CB|2007|GER|66|79|3|2029
Niklas Stark|CB|1995|GER|73|73|2|2022
Olivier Deman|LB|2000|BEL|71|73|5|2028
Moussa Ndiaye|LB|2002|SEN|69|69|4|2027
Felix Agu|LB|1999|NGA|71|71|3.5|2027
Arthur|RB|2003|BRA|72|78|8|2027
Senne Lynen|DM|1999|BEL|75|75|8|2030
Youri Regeer|DM|2003|NED|69|71|5|2027
Dariusz Stalmach|DM|2005|POL|66|75|2.5|2026
Skelly Alvero|DM|2002|FRA|64|64|1|2028
Jens Stage|CM|1996|DEN|77|77|10|2028
Ludovit Reis|CM|2000|SVK|70|70|3|2029
Mitchell Weiser|CM|1994|GER|76|76|3|2027
Chuki|AM|2004|ESP|71|75|10|2030
Darwin Soylu|AM|2007|TUR|59|72|0.5|2026
Marco Grüll|LW|1998|AUT|73|73|5|2024
Eren Dinkçi|RW|2001|TUR|72|76|6|2027
Justin Njinmah|RW|2000|GER|71|74|5|2028
Paul Erevbenagie|RW|2007|GER|64|77|1.5|2026
Niclas Füllkrug|ST|1993|GER|75|75|3.5|2027
Keke Topp|ST|2004|GER|67|76|3|2028
Kenny Quetant|ST|2006|HAI|66|77|3|2030
Salim Musah|ST|2006|GER|65|76|2|2028
Cedric Itten|ST|1996|SUI|71|71|1.8|2029`,
    },
    {
      id: "g_tsg", name: "TSG 1899 Hoffenheim", short: "TSG", city: "Sinsheim", stadium: "PreZero Arena", capacity: 30150,
      colors: ["#1C63B7", "#FFFFFF"], reputation: 72, budget: 20,
      players: `Oliver Baumann|GK|1990|GER|78|78|2.5|2028
Luca Philipp|GK|2000|GER|64|68|0.75|2020
Lúkas Petersson|GK|2004|ISL|61|73|0.6|2024
Albian Hajdari|CB|2003|KVX|75|81|25|2031
Ozan Kabak|CB|2000|TUR|76|77|15|2030
Robin Hranac|CB|2000|CZE|74|74|10|2028
Koki Machida|CB|1997|JPN|75|75|6|2029
Sean Dulic|CB|2005|GER|63|72|1.2|2030
Mats Rots|LB|2006|NED|73|84|16|2031
Bernardo|LB|1995|BRA|73|73|4|2027
Valentin Gendrey|RB|2000|FRA|72|74|6|2028
Vladimír Coufal|RB|1992|CZE|75|75|2.5|2028
Natnael Abraha|RB|2008|GER|62|77|1|2026
Leon Avdullahu|DM|2004|KVX|76|84|30|2031
Wouter Burger|DM|2001|NED|75|78|20|2025
Cajetan Lenz|DM|2006|GER|71|82|10|2031
Luis Engelns|DM|2007|GER|66|79|2.5|2026
Nathan De Cat|CM|2008|BEL|75|90|27|2031
Alexander Prass|CM|2001|AUT|73|76|9|2028
Bambasé Conté|AM|2003|GER|70|72|7|2023
Adam Daghim|RW|2005|DEN|72|82|13|2031
Patrick Wimmer|RW|2001|AUT|75|77|12|2031
Andrej Kramaric|AM|1991|CRO|77|77|2.5|2028
Fisnik Asllani|ST|2002|KVX|75|80|30|2029
Tim Lemperle|ST|2002|GER|74|79|17|2031
Adam Hlozek|ST|2002|CZE|73|73|10|2029
Max Moerstedt|ST|2006|GER|70|81|7|2030`,
    },
    {
      id: "g_hsv", name: "Hamburger SV", short: "HSV", city: "Hamburgo", stadium: "Volksparkstadion", capacity: 57000,
      colors: ["#FFFFFF", "#0A3F86"], reputation: 70, budget: 15,
      players: `Sander Tangvik|GK|2002|NOR|67|67|2.5|2030
Daniel Heuer Fernandes|GK|1992|POR|73|73|1.2|2028
Fernando Dickes|GK|2007|GER|57|70|0.3|2028
Elias Lahti|GK|2009|FIN|53|70|0|2028
Nicolás Capaldo|CB|1998|ARG|74|74|8|2028
Sebastiaan Bornauw|CB|1999|BEL|73|73|6|2027
Warmed Omari|CB|2000|COM|71|74|4|2030
Jordan Torunarigha|CB|1997|NGA|73|73|4|2028
Shafiq Nandja|CB|2007|GER|64|77|1.5|2030
Mario Vuskovic|CB|2001|CRO|62|62|0.5|2027
Jason Bissi-Mouelle|CB|2008|GER|57|72|0.3|2028
David Møller Wolfe|LB|2002|NOR|73|77|12|2027
Louis Lemke|LB|2009|GER|68|85|5|2028
Miro Muheim|LB|1998|SUI|73|73|4|2027
Zakaria El Ouahdi|RB|2001|MAR|74|74|12|2031
Nicolai Remberg|DM|2000|GER|73|75|9|2028
Kofi Amoako|DM|2005|GER|68|77|4|2030
Albert Sambi Lokonga|CM|1999|BEL|75|77|12|2028
Bilal Nadir|CM|2003|MAR|71|73|8|2029
Bakery Jatta|CM|1998|GAM|67|67|1|2029
Fábio Vieira|AM|2000|POR|76|78|15|2030
Martin Adeline|AM|2003|FRA|71|73|8|2030
Albert Grønbaek|AM|2001|DEN|72|72|7|2030
Immanuel Pherai|AM|2001|SUR|66|66|1.2|2027
Alexander Røssing-Lelesiit|LW|2007|NOR|68|82|5|2030
Terem Moffi|ST|1999|NGA|75|76|5|2029
Otto Stange|ST|2007|GER|68|81|5|2028
Patson Daka|ST|1998|ZAM|72|72|3|2027
Yussuf Poulsen|ST|1994|DEN|72|72|1|2027`,
    },
    {
      id: "g_koe", name: "1. FC Köln", short: "KOE", city: "Colonia", stadium: "RheinEnergieStadion", capacity: 50000,
      colors: ["#FFFFFF", "#ED1C24"], reputation: 69, budget: 12,
      players: `Marvin Schwäbe|GK|1995|GER|74|74|3|2027
Ron-Robert Zieler|GK|1989|GER|69|69|0.5|2027
Martin James|GK|2008|FRA|58|73|0.4|2029
Matthias Köbbing|GK|1997|GER|60|60|0.1|2027
Jahmai Simpson-Pusey|CB|2005|ENG|71|80|9|2030
Rav van den Berg|CB|2004|NED|71|79|5|2030
Luka Lochoshvili|CB|1998|GEO|73|73|4.5|2029
Joël Schmied|CB|1998|SUI|71|72|2.5|2029
Timo Hübers|CB|1996|GER|71|71|1.5|2027
Gideon Mensah|LB|1998|GHA|73|73|4|2028
Borna Sosa|LB|1998|CRO|72|72|3|2027
Sebastian Sebulonsen|RB|2000|NOR|71|74|5.5|2028
Alessio Castro-Montes|RB|1997|BEL|72|72|2.5|2028
Tom Krauß|DM|2001|GER|71|73|4.5|2029
Ellyes Skhiri|DM|1995|TUN|76|76|2.5|2028
Paul Okon-Engstler|DM|2005|AUS|65|74|2|2030
Isak Jóhannesson|CM|2003|ISL|71|73|8|2030
Gil Neves|CM|2008|POR|58|73|0.4|2029
Said El Mala|LW|2006|GER|78|91|50|2031
Reigan Heskey|LW|2008|ENG|65|80|2|2031
Marius Bülter|LW|1993|GER|73|73|1.8|2027
Mikey Moore|RW|2007|ENG|74|87|18|2027
Jan Thielmann|RW|2002|GER|70|73|3|2028
Linton Maina|RW|1999|GER|71|72|3|2022
Ragnar Ache|ST|1998|GER|73|74|9|2029
Thijs Dallinga|ST|2000|NED|75|77|9|2027
Luca Waldschmidt|ST|1996|GER|71|71|2|2027
Imad Rondic|ST|1999|BIH|65|65|0.75|2029
Malek El Mala|ST|2005|GER|56|65|0.25|2031`,
    },
    {
      id: "g_s04", name: "FC Schalke 04", short: "S04", city: "Gelsenkirchen", stadium: "Veltins-Arena", capacity: 62271,
      colors: ["#004D9D", "#FFFFFF"], reputation: 71, budget: 10,
      players: `Loris Karius|GK|1993|GER|72|72|1.2|2028
Kevin Müller|GK|1991|GER|71|71|0.3|2026
Johannes Siebeking|GK|2006|GER|54|65|0.13|2029
Mertcan Ayhan|CB|2006|TUR|70|81|8|2030
Maximilian Wöber|CB|1998|AUT|72|72|3|2027
Hasan Kuruçay|CB|1997|TUR|72|72|2.5|2027
Nikola Katic|CB|1996|BIH|72|72|2|2028
Timo Becker|CB|1997|GER|70|70|1.5|2029
Robin Gosens|LB|1994|GER|77|77|4|2027
Vitalie Becker|LB|2005|GER|66|75|3|2030
Adrian Gantenbein|RB|2001|SUI|64|64|0.9|2028
Satoshi Tanaka|DM|2002|JPN|69|69|4|2030
Dejan Ljubicic|DM|1997|AUT|72|72|3|2028
Ron Schallenberg|DM|1998|GER|70|70|2|2027
Luca Vozar|DM|2007|GER|61|74|0.8|2029
Soufiane El-Faouzi|CM|2002|MAR|73|73|12|2030
Finn Porath|CM|1997|GER|67|67|0.8|2027
Janik Bachmann|CM|1996|GER|66|66|0.5|2027
Junior Dina Ebimbe|CM|2000|CMR|71|71|4|2028
Adil Aouchiche|AM|2002|ALG|71|71|7|2030
Kenan Karaman|AM|1994|TUR|73|73|1.8|2028
Moussa Sylla|ST|1999|MLI|73|73|5|2028
Hee-chan Hwang|ST|1996|KOR|73|73|3|2027
Junior Adamu|ST|2001|AUT|70|73|2|2029
Edin Dzeko|ST|1986|BIH|78|78|1|2027
Bryan Lasme|ST|1998|FRA|65|65|0.6|2027
Emil Højlund|ST|2005|DEN|59|68|0.5|2028`,
    },
    {
      id: "g_sve", name: "SV 07 Elversberg", short: "SVE", city: "Spiesen-Elversberg", stadium: "Ursapharm-Arena an der Kaiserlinde", capacity: 10000,
      colors: ["#000000", "#FFFFFF"], reputation: 63, budget: 10,
      players: `Nicolas Kristof|GK|1999|AUT|70|70|2.5|2029
Tim Boss|GK|1993|GER|66|66|0.2|2027
Frank Lehmann|GK|1989|GER|66|66|0.1|2027
Elias Etringer|GK|2007|GER|53|66|0|2029
Lukas Pinckert|CB|2000|GER|69|69|2.5|2028
Luca Sirch|CB|1999|GER|70|70|2.2|2029
Maximilian Rohr|CB|1995|GER|70|70|1|2028
Florian Le Joncour|CB|1995|FRA|67|67|0.5|2027
Luis Seifert|CB|2004|GER|56|60|0.2|2028
Lasse Günther|LB|2003|GER|68|70|4|2030
Nicholas Mickelson|LB|1999|THA|67|67|1|2027
Jan Gyamerah|RB|1995|GHA|70|70|0.9|2027
Felix Keidel|DM|2003|GER|69|71|5|2028
Łukasz Poręba|DM|2000|POL|71|71|4|2029
Amara Condé|DM|1997|GER|68|68|0.9|2028
Frederik Schmahl|CM|2002|GER|63|63|0.75|2027
Francis Onyeka|AM|2007|GER|72|85|12|2027
Noah Darvich|AM|2006|GER|68|79|5|2027
Maurice Krattenmacher|LW|2005|GER|68|77|5|2030
Tom Zimmerschied|LW|1998|GER|69|69|1.5|2029
Cole Campbell|RW|2006|USA|69|80|6|2030
Lukas Petkov|RW|2000|BUL|71|71|4.5|2027
Raif Adam|RW|2005|GER|59|68|0.5|2029
David Mokwa|ST|2004|FRA|70|74|7|2029
Noel Futkeu|ST|2002|GER|71|71|6|2027
Luca Pfeiffer|ST|1996|GER|66|66|0.5|2028
Luca Schnellbacher|ST|1994|GER|68|68|0.5|2028`,
    },
    {
      id: "g_scp", name: "SC Paderborn 07", short: "SCP", city: "Paderborn", stadium: "Home Deluxe Arena", capacity: 15000,
      colors: ["#005CA9", "#000000"], reputation: 65, budget: 10,
      players: `Nahuel Noll|GK|2003|GER|67|69|2.5|2027
Markus Schubert|GK|1998|GER|65|65|0.5|2028
Florian Pruhs|GK|2006|GER|54|65|0.15|2023
Mattes Hansen|CB|2004|GER|66|70|2.5|2023
Tjark Scheller|CB|2002|GER|67|67|2.5|2024
Felix Götze|CB|1998|GER|70|70|2|2024
Jano ter Horst|CB|2002|GER|66|66|1.8|2026
Marcel Hoffmeier|CB|1999|GER|66|66|0.8|2028
Jonah Sticker|CB|2004|GER|61|65|0.75|2025
Nyamekye Awortwie-Grant|CB|2000|GER|62|62|0.4|2026
Tristan Zobel|CB|2003|GER|58|60|0.23|2028
Santiago Castañeda|DM|2004|USA|69|73|6|2024
Tom Baack|DM|1999|GER|65|65|0.6|2026
Laurin Ulrich|CM|2005|GER|68|77|4|2027
Sebastian Klaas|CM|1998|GER|67|67|0.9|2022
Luka Duric|CM|2003|BIH|62|64|0.8|2026
Timur Gayret|CM|1998|GER|64|64|0.45|2029
Laurin Curda|CM|2001|GER|71|71|5|2023
Ruben Müller|CM|2005|GER|62|71|1|2025
Clemens Lippmann|CM|2006|GER|62|73|1|2026
Raphael Obermair|CM|1996|PHI|70|70|1.2|2027
Niklas Mohr|CM|2004|GER|60|64|0.5|2030
Deniz Zeitler|LW|2006|GER|68|79|4|2027
Gabriel Vidovic|LW|2003|CRO|67|69|3|2026
Oliver Batista Meier|LW|2001|GER|66|66|1.5|2026
Albert Millgramm|LW|2004|GER|55|59|0.15|2026
Rayan Philippe|RW|2000|FRA|71|74|4|2027
Sven Michel|RW|1990|GER|70|70|0.3|2027
Marvin Pieringer|ST|1999|GER|71|72|3|2026
Stefano Marino|ST|2004|GER|64|68|1.5|2025
Steffen Tigges|ST|1998|GER|66|66|0.7|2027
Lasse Eickel|ST|2008|GER|54|69|0.15|2031`,
    },
  ],
  tier2: [
    { id: "g_wob", name: "VfL Wolfsburg", short: "WOB", city: "Wolfsburgo", stadium: "Volkswagen Arena", capacity: 28917, colors: ["#65B32E", "#FFFFFF"], reputation: 70 },
    { id: "g_fch", name: "1. FC Heidenheim 1846", short: "FCH", city: "Heidenheim", stadium: "Voith-Arena", capacity: 15000, colors: ["#E2001A", "#003D7C"], reputation: 62 },
    { id: "g_stp", name: "FC St. Pauli", short: "STP", city: "Hamburgo", stadium: "Millerntor-Stadion", capacity: 29546, colors: ["#5C3E2E", "#FFFFFF"], reputation: 61 },
    { id: "g_bsc", name: "Hertha BSC", short: "BSC", city: "Berlín", stadium: "Olympiastadion", capacity: 74475, colors: ["#005CA9", "#FFFFFF"], reputation: 66 },
    { id: "g_ksv", name: "Holstein Kiel", short: "KSV", city: "Kiel", stadium: "Holstein-Stadion", capacity: 15034, colors: ["#003D7C", "#FFFFFF"], reputation: 63 },
    { id: "g_boc", name: "VfL Bochum 1848", short: "BOC", city: "Bochum", stadium: "Vonovia Ruhrstadion", capacity: 26000, colors: ["#005BA4", "#FFFFFF"], reputation: 63 },
    { id: "g_f95", name: "Fortuna Düsseldorf", short: "F95", city: "Düsseldorf", stadium: "Merkur Spiel-Arena", capacity: 54600, colors: ["#E2001A", "#FFFFFF"], reputation: 62 },
    { id: "g_h96", name: "Hannover 96", short: "H96", city: "Hannover", stadium: "Heinz von Heiden Arena", capacity: 49000, colors: ["#00863E", "#000000"], reputation: 62 },
    { id: "g_fck", name: "1. FC Kaiserslautern", short: "FCK", city: "Kaiserslautern", stadium: "Fritz-Walter-Stadion", capacity: 49850, colors: ["#D2232A", "#FFFFFF"], reputation: 61 },
    { id: "g_fcn", name: "1. FC Nürnberg", short: "FCN", city: "Núremberg", stadium: "Max-Morlock-Stadion", capacity: 50000, colors: ["#9E1B32", "#000000"], reputation: 60 },
    { id: "g_ksc", name: "Karlsruher SC", short: "KSC", city: "Karlsruhe", stadium: "BBBank Wildpark", capacity: 34302, colors: ["#0055A4", "#FFFFFF"], reputation: 58 },
    { id: "g_d98", name: "SV Darmstadt 98", short: "D98", city: "Darmstadt", stadium: "Merck-Stadion am Böllenfalltor", capacity: 17650, colors: ["#004E9E", "#FFFFFF"], reputation: 57 },
  ],
};
