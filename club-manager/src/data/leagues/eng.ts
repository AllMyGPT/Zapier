import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: "eng",
  name: "Liga Inglesa",
  country: "Inglaterra",
  nat: "ENG",
  tier2Name: "Segunda Inglesa",
  clubs: [
    {
      id: "e_ars", name: "Arsenal", short: "ARS", city: "Londres", stadium: "Emirates Stadium", capacity: 60704,
      colors: ["#EF0107", "#FFFFFF"], reputation: 92, budget: 120,
      players: `David Raya|GK|1995|ESP|83|83|30|2028
Illan Meslier|GK|2000|FRA|70|72|6|2028
Kepa Arrizabalaga|GK|1994|ESP|78|78|5|2028
William Saliba|CB|2001|FRA|86|88|100|2030
Gabriel|CB|1997|BRA|85|85|75|2029
Piero Hincapié|CB|2002|ECU|79|83|50|2031
Ezri Konsa|CB|1997|ENG|82|82|50|2030
Cristhian Mosquera|CB|2004|ESP|77|85|40|2030
Riccardo Calafiori|LB|2002|ITA|80|84|65|2029
Jurriën Timber|RB|2001|NED|82|85|70|2028
Ben White|RB|1997|ENG|81|81|35|2028
Martín Zubimendi|DM|1999|ESP|85|86|65|2030
Myles Lewis-Skelly|DM|2006|ENG|79|90|65|2030
Declan Rice|CM|1999|ENG|87|88|120|2028
Bruno Guimarães|CM|1997|BRA|86|86|75|2030
Mikel Merino|CM|1996|ESP|82|82|25|2028
Martin Ødegaard|AM|1998|NOR|86|86|80|2028
Eberechi Eze|AM|1998|ENG|84|85|60|2029
Christos Tzolis|LW|2002|GRE|77|77|40|2031
Bukayo Saka|RW|2001|ENG|86|88|110|2030
Max Dowman|RW|2009|ENG|78|95|50|2025
Noni Madueke|RW|2002|ENG|79|83|45|2030
Kai Havertz|ST|1999|GER|83|83|60|2028
Viktor Gyökeres|ST|1998|SWE|85|85|55|2030`,
    },
    {
      id: "e_mci", name: "Manchester City", short: "MCI", city: "Mánchester", stadium: "Etihad Stadium", capacity: 53400,
      colors: ["#6CABDD", "#1C2C5B"], reputation: 94, budget: 150,
      players: `Gianluigi Donnarumma|GK|1999|ITA|81|81|45|2030
Gerónimo Rulli|GK|1992|ARG|78|78|5|2028
Marcus Bettinelli|GK|1992|ENG|66|66|0.3|2027
Marc Guéhi|CB|2000|ENG|83|84|75|2031
Rúben Dias|CB|1997|POR|85|85|50|2029
Abdukodir Khusanov|CB|2004|UZB|78|87|50|2031
Vitor Reis|CB|2006|BRA|76|87|30|2029
Josko Gvardiol|LB|2002|CRO|80|80|75|2031
Nico O'Reilly|LB|2005|ENG|79|90|70|2030
Rayan Aït-Nouri|LB|2001|ALG|80|82|35|2030
Matheus Nunes|RB|1998|POR|81|81|45|2028
Rico Lewis|RB|2004|ENG|75|82|25|2030
Elliot Anderson|DM|2002|ENG|81|86|120|2031
Ayyoub Bouaddi|DM|2007|MAR|80|95|90|2031
Enzo Fernández|CM|2001|ARG|84|86|120|2031
Mateo Kovacic|CM|1994|CRO|79|79|10|2027
Rayan Cherki|AM|2003|FRA|81|86|110|2030
Phil Foden|AM|2000|ENG|84|85|65|2030
Jérémy Doku|LW|2002|BEL|81|84|75|2031
Iliman Ndiaye|LW|2000|SEN|80|81|65|2031
Antoine Semenyo|RW|2000|GHA|82|83|80|2031
Allan|RW|2004|BRA|76|80|30|2031
Ryan McAidoo|RW|2008|ENG|70|85|8|2026
Erling Haaland|ST|2000|NOR|89|90|220|2034`,
    },
    {
      id: "e_liv", name: "Liverpool", short: "LIV", city: "Liverpool", stadium: "Anfield", capacity: 61276,
      colors: ["#C8102E", "#F6EB61"], reputation: 93, budget: 130,
      players: `Giorgi Mamardashvili|GK|2000|GEO|80|84|28|2031
Alisson|GK|1992|BRA|83|83|15|2027
Vítězslav Jaroš|GK|2001|CZE|69|69|5|2028
Freddie Woodman|GK|1997|ENG|67|67|3|2029
Harvey Davies|GK|2003|ENG|59|61|0.5|2027
Jérémy Jacquet|CB|2005|FRA|79|89|65|2031
Giovanni Leoni|CB|2006|ITA|75|89|25|2031
Ronald Araújo|CB|1999|URU|78|78|25|2027
Virgil van Dijk|CB|1991|NED|87|87|15|2027
Joe Gomez|CB|1997|ENG|77|77|11|2027
Milos Kerkez|LB|2003|HUN|79|83|35|2030
Konstantinos Tsimikas|LB|1996|GRE|74|74|4.5|2027
Luke Chambers|LB|2004|ENG|62|66|1|2027
Jeremie Frimpong|RB|2000|NED|80|81|30|2030
Conor Bradley|RB|2003|NIR|75|81|20|2029
Ryan Gravenberch|DM|2002|NED|83|86|75|2032
Wataru Endo|DM|1993|JPN|75|75|3|2027
Alexis Mac Allister|CM|1998|ARG|85|86|70|2028
Trey Nyoni|CM|2007|ENG|74|92|18|2030
James McConnell|CM|2004|ENG|64|68|1.5|2030
Dominik Szoboszlai|AM|2000|HUN|84|85|100|2031
Florian Wirtz|AM|2003|GER|84|88|85|2030
Bradley Barcola|LW|2002|FRA|82|86|100|2031
Cody Gakpo|LW|1999|NED|84|85|75|2030
Rio Ngumoha|LW|2008|ENG|78|95|50|2028
Víctor Muñoz|LW|2003|ESP|77|79|40|2032
Federico Chiesa|RW|1997|ITA|76|76|10|2028
Alexander Isak|ST|1999|SWE|86|87|90|2031
Hugo Ekitiké|ST|2002|FRA|80|80|80|2031
Lewis Koumas|ST|2005|WAL|70|79|8|2029
Jayden Danns|ST|2006|ENG|61|72|0.8|2026`,
    },
    {
      id: "e_che", name: "Chelsea", short: "CHE", city: "Londres", stadium: "Stamford Bridge", capacity: 40343,
      colors: ["#034694", "#FFFFFF"], reputation: 89, budget: 140,
      players: `Mike Penders|GK|2005|BEL|75|84|25|2032
Emiliano Martínez|GK|1992|ARG|81|81|10|2029
Gabriel Slonina|GK|2004|USA|66|78|3|2028
Teddy Sharman-Lowe|GK|2003|ENG|59|61|0.5|2028
Maxence Lacroix|CB|2000|FRA|80|81|60|2032
Levi Colwill|CB|2003|ENG|79|84|50|2029
Wesley Fofana|CB|2000|FRA|79|80|32|2029
Josh Acheampong|CB|2006|ENG|76|87|30|2029
Aarón Anselmino|CB|2005|ARG|71|80|10|2031
Jorrel Hato|LB|2006|NED|77|87|45|2032
Pep Chavarría|LB|1998|ESP|78|78|18|2031
Reece James|RB|1999|ENG|83|84|60|2032
Marco Palestra|RB|2005|ITA|77|87|45|2033
Malo Gusto|RB|2003|FRA|78|82|35|2030
Moisés Caicedo|DM|2001|ECU|85|86|100|2033
Roméo Lavia|DM|2004|BEL|75|82|25|2030
Valentín Barco|CM|2004|ARG|77|84|40|2033
Mahdi Nicoll-Jazuli|CM|2010|ENG|65|84|2|2028
Jordan Henderson|CM|1990|ENG|74|74|1.2|2028
Cole Palmer|AM|2002|ENG|85|88|110|2034
Morgan Rogers|LW|2002|ENG|82|86|120|2033
Jamie Gittens|LW|2004|ENG|76|83|25|2032
Estêvão|RW|2007|BRA|80|92|80|2033
Pedro Neto|RW|2000|POR|82|83|60|2032
Geovany Quenda|RW|2007|POR|77|90|42|2034
João Pedro|ST|2001|BRA|82|85|100|2034
Emmanuel Emegha|ST|2003|NED|74|76|20|2033
Danny Welbeck|ST|1990|ENG|77|77|3|2028`,
    },
    {
      id: "e_mun", name: "Manchester United", short: "MUN", city: "Mánchester", stadium: "Old Trafford", capacity: 74197,
      colors: ["#DA291C", "#FBE122"], reputation: 88, budget: 110,
      players: `Senne Lammens|GK|2002|BEL|77|77|35|2030
Karl Darlow|GK|1990|WAL|68|68|0.2|2028
Tom Heaton|GK|1986|ENG|65|65|0.1|2027
Dermot Mee|GK|2002|NIR|52|52|0|2028
Lisandro Martínez|CB|1998|ARG|82|82|45|2027
Leny Yoro|CB|2005|FRA|77|87|45|2029
Ayden Heaven|CB|2006|ENG|76|87|30|2029
Matthijs de Ligt|CB|1999|NED|80|81|25|2029
Harry Maguire|CB|1993|ENG|78|78|8|2027
Luke Shaw|LB|1995|ENG|77|77|8|2027
Harry Amass|LB|2007|ENG|68|81|5|2027
Diogo Dalot|RB|1999|POR|79|79|30|2028
Noussair Mazraoui|RB|1997|MAR|79|79|18|2028
Carlos Baleba|DM|2004|CMR|79|85|65|2031
Andrey Santos|DM|2004|BRA|77|84|45|2031
Manuel Ugarte|DM|2001|URU|77|80|20|2029
Kobbie Mainoo|CM|2005|ENG|79|87|75|2031
Youri Tielemans|CM|1997|BEL|82|82|40|2031
Tyler Fletcher|CM|2007|SCO|66|79|2.5|2027
Bruno Fernandes|AM|1994|POR|86|86|35|2027
Mason Mount|AM|1999|ENG|77|77|25|2028
Marcus Rashford|LW|1997|ENG|82|82|35|2028
Patrick Dorgu|LW|2004|DEN|76|83|35|2030
Bryan Mbeumo|RW|1999|CMR|84|84|75|2030
Amad Diallo|RW|2002|CIV|79|84|45|2030
Shea Lacey|RW|2007|ENG|72|85|12|2029
Matheus Cunha|ST|1999|BRA|83|84|75|2030
Benjamin Šeško|ST|2003|SVN|80|87|75|2030
Joshua Zirkzee|ST|2001|NED|76|79|20|2029`,
    },
    {
      id: "e_tot", name: "Tottenham Hotspur", short: "TOT", city: "Londres", stadium: "Tottenham Hotspur Stadium", capacity: 62850,
      colors: ["#FFFFFF", "#132257"], reputation: 85, budget: 100,
      players: `Antonín Kinský|GK|2003|CZE|74|83|18|2031
Martin Dúbravka|GK|1989|SVK|71|71|0.5|2027
Brandon Austin|GK|1999|ENG|62|64|0.5|2029
Jan Paul van Hecke|CB|2000|NED|80|82|60|2026
Micky van de Ven|CB|2001|NED|81|84|50|2031
Marcos Senesi|CB|1997|ARG|79|79|20|2030
Tosin Adarabioyo|CB|1997|ENG|77|77|13|2029
Ben Davies|CB|1993|WAL|74|74|3|2027
Destiny Udogie|LB|2002|ITA|77|81|25|2030
Andrew Robertson|LB|1994|SCO|80|80|7|2030
Pedro Porro|RB|1999|ESP|81|81|45|2031
Archie Gray|RB|2006|ENG|76|88|35|2030
Sandro Tonali|DM|2000|ITA|84|85|90|2032
Rodrigo Bentancur|DM|1997|URU|79|79|17|2029
Mateus Fernandes|CM|2004|POR|79|86|70|2031
Lucas Bergvall|CM|2006|SWE|77|88|40|2031
Conor Gallagher|CM|2000|ENG|78|78|32|2031
Xavi Simons|AM|2003|NED|80|84|40|2030
James Maddison|AM|1996|ENG|80|80|17|2028
Dejan Kulusevski|AM|2000|SWE|74|74|13|2028
Sávio|LW|2004|BRA|78|82|50|2031
Mathys Tel|LW|2005|FRA|74|84|22|2031
Wilson Odobert|LW|2004|FRA|74|78|18|2029
Mykhaylo Mudryk|LW|2001|UKR|74|74|15|2027
Mohammed Kudus|RW|2000|GHA|81|82|45|2031
Omar Marmoush|ST|1999|EGY|82|83|50|2027
Dominic Solanke|ST|1997|ENG|80|80|25|2030
Richarlison|ST|1997|BRA|78|78|15|2027`,
    },
    {
      id: "e_new", name: "Newcastle United", short: "NEW", city: "Newcastle", stadium: "St James' Park", capacity: 52305,
      colors: ["#241F20", "#FFFFFF"], reputation: 84, budget: 85,
      players: `Lukas Hornicek|GK|2002|CZE|75|75|27|2031
Ewen Jaouen|GK|2005|FRA|74|81|18|2030
Nick Pope|GK|1992|ENG|76|76|3|2027
Mark Gillespie|GK|1992|ENG|61|61|0.1|2027
Malick Thiaw|CB|2001|GER|79|82|50|2029
Sven Botman|CB|2000|NED|80|82|35|2030
Dan Burn|CB|1992|ENG|78|78|4|2027
Fabian Schär|CB|1991|SUI|79|79|3|2027
Lewis Hall|LB|2004|ENG|78|83|55|2031
Tino Livramento|RB|2002|ENG|78|83|45|2028
Amar Dedic|RB|2002|BIH|76|76|30|2031
Nico González|DM|2002|ESP|79|82|50|2031
Aladji Bamba|DM|2006|FRA|75|86|25|2031
Jacob Ramsey|CM|2001|ENG|77|80|35|2030
Lewis Miley|CM|2006|ENG|76|88|30|2032
Sean Steur|CM|2008|NED|74|89|22|2031
Joelinton|CM|1996|BRA|80|80|20|2028
Joe Willock|CM|1999|ENG|76|76|18|2027
Bazoumana Touré|LW|2006|CIV|78|89|50|2031
Harvey Barnes|LW|1997|ENG|79|79|35|2023
Anthony Elanga|RW|2002|SWE|78|81|35|2030
Jacob Murphy|RW|1995|ENG|77|77|10|2027
Matias Fernandez-Pardo|ST|2005|BEL|78|87|55|2031
William Osula|ST|2003|DEN|76|78|32|2029
Yoane Wissa|ST|1996|COD|80|80|25|2029`,
    },
    {
      id: "e_avl", name: "Aston Villa", short: "AVL", city: "Birmingham", stadium: "Villa Park", capacity: 42640,
      colors: ["#670E36", "#95BFE5"], reputation: 82, budget: 60,
      players: `Zion Suzuki|GK|2002|JPN|76|76|30|2031
Marco Bizot|GK|1991|NED|74|74|1.5|2027
James Wright|GK|2004|ENG|56|68|0.2|2026
Taylor Harwood-Bellis|CB|2002|ENG|75|75|25|2031
Pau Torres|CB|1997|ESP|80|80|20|2028
Modou Kéba Cissé|CB|2005|SEN|69|78|6|2029
Victor Lindelöf|CB|1994|SWE|76|76|5|2028
Tyrone Mings|CB|1993|ENG|76|76|3|2027
Ian Maatsen|LB|2002|NED|77|81|35|2032
Matteo Ruggeri|LB|2002|ITA|76|76|28|2031
Matty Cash|RB|1997|POL|79|79|22|2029
Aaron Wan-Bissaka|RB|1997|COD|78|78|15|2027
Boubacar Kamara|DM|1999|FRA|82|82|50|2030
Amadou Onana|DM|2001|BEL|80|82|40|2029
Lamare Bogarde|DM|2004|NED|74|78|18|2028
João Gomes|CM|2001|BRA|79|81|40|2031
Leon Goretzka|CM|1995|GER|80|80|10|2028
Ross Barkley|CM|1993|ENG|75|75|4|2027
John McGinn|CM|1994|SCO|80|80|13|2028
Johan Manzambi|AM|2005|SUI|79|89|65|2031
Emiliano Buendía|AM|1996|ARG|77|77|16|2027
Alejandro Garnacho|LW|2004|ARG|77|82|22|2027
George Hemmings|LW|2007|ENG|73|86|15|2026
Ibrahim Mbaye|RW|2008|SEN|78|95|50|2031
Alysson|RW|2006|BRA|73|84|15|2031
Nicolas Jackson|ST|2001|SEN|79|79|45|2031
Brian Madjo|ST|2009|ENG|74|91|22|2032
Tammy Abraham|ST|1997|ENG|79|79|18|2030`,
    },
    {
      id: "e_bha", name: "Brighton & Hove Albion", short: "BHA", city: "Brighton", stadium: "American Express Stadium", capacity: 31876,
      colors: ["#0057B8", "#FFFFFF"], reputation: 76, budget: 55,
      players: `Bart Verbruggen|GK|2002|NED|77|77|40|2028
Jason Steele|GK|1990|ENG|69|69|0.5|2027
Tom McGill|GK|2000|CAN|61|64|0.5|2027
Luka Vuskovic|CB|2007|CRO|79|92|65|2031
Pascal Struijk|CB|1999|NED|76|77|22|2031
Olivier Boscagli|CB|1997|FRA|77|77|20|2030
Michael Svoboda|CB|1998|AUT|72|72|5|2030
Lewis Dunk|CB|1991|ENG|78|78|3.5|2027
Ferdi Kadıoğlu|LB|1999|TUR|79|80|40|2028
Maxim De Cuyper|LB|2000|BEL|77|80|30|2030
Jaouen Hadjam|LB|2003|ALG|71|73|10|2031
Mats Wieffer|RB|1999|NED|77|78|25|2029
Costinha|RB|2000|POR|73|73|10|2031
Jack Hinshelwood|DM|2005|ENG|76|84|35|2029
Chema Andrés|DM|2005|ESP|75|85|24|2031
Yasin Ayari|CM|2003|SWE|77|82|45|2027
Diego Gómez|CM|2003|PAR|76|82|30|2031
Malick Yalcouyé|CM|2005|CIV|74|83|22|2029
Matt O'Riley|CM|2000|DEN|77|80|18|2029
Pascal Groß|CM|1991|GER|78|78|2.5|2027
Kaoru Mitoma|LW|1997|JPN|80|80|22|2027
Ibrahim Osman|LW|2004|GHA|72|76|12|2029
Yankuba Minteh|RW|2004|GAM|78|84|55|2029
Zadok Yohanna|RW|2007|NGA|75|88|25|2031
Femi Azeez|RW|2001|NGA|74|74|15|2030
Charalampos Kostoulas|ST|2007|GRE|77|93|40|2030
Georginio Rutter|ST|2002|FRA|77|80|30|2028
Promise David|ST|2001|CAN|75|75|20|2027
Stefanos Tzimas|ST|2006|GRE|74|84|18|2030
Evan Ferguson|ST|2004|IRL|73|79|15|2029`,
    },
    {
      id: "e_bou", name: "AFC Bournemouth", short: "BOU", city: "Bournemouth", stadium: "Vitality Stadium", capacity: 11307,
      colors: ["#DA291C", "#000000"], reputation: 73, budget: 50,
      players: `Djordje Petrović|GK|1999|SRB|79|79|28|2030
Michele Di Gregorio|GK|1997|ITA|75|75|8|2027
Fraser Forster|GK|1988|ENG|69|69|0.4|2027
James Hill|CB|2002|ENG|72|78|30|2029
António Silva|CB|2003|POR|76|78|30|2031
Bafodé Diakité|CB|2001|FRA|76|80|22|2030
Veljko Milosavljević|CB|2007|SRB|74|88|20|2030
Adrien Truffert|LB|2001|FRA|77|80|35|2030
Julio Soler|LB|2005|ARG|69|78|6|2029
Juanlu Sánchez|RB|2003|ESP|71|73|10|2031
Julián Araujo|RB|2001|MEX|70|70|6|2029
Max Aarons|RB|2000|ENG|67|67|2.5|2029
Adam Smith|RB|1991|ENG|70|70|0.3|2027
Tyler Adams|DM|1999|USA|78|78|30|2028
Alex Scott|CM|2003|ENG|79|85|70|2028
Alex Tóth|CM|2005|HUN|72|81|12|2031
Lewis Cook|CM|1997|ENG|76|76|11|2028
Ryan Christie|CM|1995|SCO|75|75|8|2029
Marcus Tavernier|AM|1999|ENG|78|78|30|2029
Justin Kluivert|AM|1999|NED|79|79|25|2028
Amine Adli|LW|2000|MAR|76|77|20|2030
Rayan|RW|2006|BRA|78|89|60|2031
Ben Gannon-Doak|RW|2005|SCO|73|83|15|2030
David Brooks|RW|1997|WAL|75|75|12|2029
Junior Kroupi|ST|2006|FRA|79|90|70|2030
Evanilson|ST|1999|BRA|79|80|35|2029
Álvaro Rodríguez|ST|2004|URU|74|78|20|2031
Daniel Jebbison|ST|2003|CAN|70|72|8|2028`,
    },
    {
      id: "e_bre", name: "Brentford", short: "BRE", city: "Londres", stadium: "Gtech Community Stadium", capacity: 17250,
      colors: ["#E30613", "#FFFFFF"], reputation: 72, budget: 45,
      players: `Caoimhín Kelleher|GK|1998|IRL|80|80|32|2030
Hákon Valdimarsson|GK|2001|ISL|68|74|2.5|2030
Ellery Balcombe|GK|1999|ENG|60|64|0.4|2029
Sepp van den Berg|CB|2001|NED|77|80|32|2029
Nathan Collins|CB|2001|IRL|78|80|30|2029
Kristoffer Ajer|CB|1998|NOR|77|77|25|2030
Jannik Schuster|CB|2006|AUT|74|85|22|2031
Ji-soo Kim|CB|2004|KOR|64|68|1.8|2027
Benjamin Fredrick|CB|2005|NGA|60|69|0.6|2030
El Hadji Malick Diouf|LB|2004|SEN|76|83|35|2031
Keane Lewis-Potter|LB|2001|ENG|76|78|30|2031
Rico Henry|LB|1997|JAM|74|74|10|2027
Michael Kayode|RB|2004|ITA|77|83|40|2032
Aaron Hickey|RB|2002|SCO|74|78|20|2028
Vitaly Janelt|DM|1998|GER|76|76|20|2030
Mamadou Sangaré|CM|2002|MLI|76|80|50|2031
Yegor Yarmolyuk|CM|2004|UKR|76|80|32|2031
Mathias Jensen|CM|1996|DEN|75|75|8|2027
Josh Dasilva|CM|1998|ENG|67|67|1.5|2027
Mikkel Damsgaard|AM|2000|DEN|78|79|30|2030
Antoni Milambo|AM|2005|NED|73|83|15|2030
Fábio Carvalho|AM|2002|POR|72|76|8|2029
Kevin Schade|LW|2001|GER|78|80|50|2028
Jaidon Anthony|LW|1999|ENG|75|76|20|2030
Gustavo Nunes|LW|2005|BRA|69|81|6|2030
Dango Ouattara|RW|2002|BFA|76|79|35|2030
Igor Thiago|ST|2001|BRA|79|82|65|2031
Kaye Furo|ST|2007|BEL|70|86|8|2031
Callum Wilson|ST|1992|ENG|75|75|4|2027`,
    },
    {
      id: "e_cry", name: "Crystal Palace", short: "CRY", city: "Londres", stadium: "Selhurst Park", capacity: 25486,
      colors: ["#1B458F", "#C4122E"], reputation: 75, budget: 45,
      players: `Dean Henderson|GK|1997|ENG|81|81|28|2030
Walter Benítez|GK|1993|ARG|75|75|4|2028
Remi Matthews|GK|1994|ENG|61|61|0.2|2027
Honest Ahanor|CB|2008|ITA|77|94|40|2027
Jaydee Canvot|CB|2006|FRA|76|88|35|2029
Chris Richards|CB|2000|USA|77|79|28|2027
Chadi Riad|CB|2003|MAR|73|80|15|2029
Axel Disasi|CB|1998|FRA|77|77|15|2027
Takehiro Tomiyasu|CB|1998|JPN|72|72|5|2026
Tyrick Mitchell|LB|1999|ENG|77|77|25|2027
Ben Chilwell|LB|1996|ENG|75|75|10|2026
Anan Khalaili|RB|2004|ISR|75|79|23|2031
Óscar Mingueza|RB|1999|ESP|76|76|15|2030
Adam Wharton|DM|2004|ENG|79|86|75|2029
Cheick Doucouré|DM|2000|MLI|73|75|7|2029
Jefferson Lerma|DM|1994|COL|77|77|6|2027
Quinten Timber|CM|2001|NED|76|76|25|2031
Daichi Kamada|CM|1996|JPN|77|77|10|2027
Will Hughes|CM|1995|ENG|75|75|5|2027
Yéremy Pino|LW|2002|ESP|77|80|30|2030
Dwight McNeil|LW|1999|ENG|77|77|22|2030
Ismaïla Sarr|RW|1998|SEN|80|80|45|2029
Darío Osorio|RW|2004|CHI|74|78|20|2027
Evann Guessand|RW|2001|CIV|75|79|20|2027
Zavier Gozo|RW|2007|USA|72|85|12|2031
Jørgen Strand Larsen|ST|2000|NOR|78|79|40|2030
Jean-Philippe Mateta|ST|1997|FRA|80|80|30|2027
Eddie Nketiah|ST|1999|ENG|74|74|13|2029`,
    },
    {
      id: "e_eve", name: "Everton", short: "EVE", city: "Liverpool", stadium: "Hill Dickinson Stadium", capacity: 52888,
      colors: ["#003399", "#FFFFFF"], reputation: 74, budget: 50,
      players: `Jordan Pickford|GK|1994|ENG|80|80|13|2029
Mark Travers|GK|1999|IRL|71|73|3|2029
Tom King|GK|1995|WAL|60|60|0.1|2027
Jarrad Branthwaite|CB|2002|ENG|78|83|45|2030
James Tarkowski|CB|1992|ENG|79|79|5|2028
Michael Keane|CB|1993|ENG|74|74|3|2027
Vitaliy Mykolenko|LB|1999|UKR|77|77|25|2029
Jake O'Brien|RB|2001|IRL|74|78|18|2028
Ainsley Maitland-Niles|RB|1997|ENG|74|74|10|2029
James Garner|DM|2001|ENG|78|80|50|2030
Hayden Hackney|DM|2002|ENG|76|76|32|2031
Christian Nørgaard|DM|1994|DEN|78|78|5|2028
Harrison Armstrong|CM|2007|ENG|76|92|30|2028
Merlin Röhl|CM|2002|GER|72|77|20|2029
Charly Alcaraz|CM|2002|ARG|73|73|15|2027
Kiernan Dewsbury-Hall|AM|1998|ENG|79|79|40|2030
Tyrique George|LW|2006|ENG|75|86|25|2030
Jack Grealish|LW|1995|ENG|80|80|20|2027
Brennan Johnson|RW|2001|WAL|77|78|25|2030
Tyler Dibling|RW|2006|ENG|73|85|17|2029
Thierno Barry|ST|2002|FRA|75|80|35|2029
Braiden Graham|ST|2007|NIR|61|74|0.7|2027`,
    },
    {
      id: "e_ful", name: "Fulham", short: "FUL", city: "Londres", stadium: "Craven Cottage", capacity: 29589,
      colors: ["#FFFFFF", "#000000"], reputation: 72, budget: 40,
      players: `Bernd Leno|GK|1992|GER|79|79|6|2027
Benjamin Lecomte|GK|1991|FRA|70|70|0.8|2028
Alex Borto|GK|2003|USA|53|55|0|2027
Calvin Bassey|CB|1999|NGA|78|79|28|2027
David Affengruber|CB|2001|AUT|75|75|20|2030
Joachim Andersen|CB|1996|DEN|79|79|16|2029
Jorge Cuenca|CB|1999|ESP|73|74|8|2028
Ryan Sessegnon|LB|2000|ENG|74|74|22|2027
Antonee Robinson|LB|1997|USA|80|80|22|2028
Timothy Castagne|RB|1995|BEL|76|76|8|2027
Kenny Tete|RB|1995|NED|75|75|6|2028
Sander Berge|DM|1998|NOR|78|78|25|2029
Shea Charles|DM|2003|NIR|75|77|25|2031
Alex Iwobi|DM|1996|NGA|79|79|20|2028
Hugo Larsson|CM|2004|SWE|76|83|23|2027
Manuel Ángel|CM|2004|ESP|68|72|5|2029
Harrison Reed|CM|1995|ENG|71|71|1.3|2027
Tom Cairney|CM|1991|SCO|70|70|0.5|2027
Josh King|AM|2007|ENG|77|93|40|2029
Emile Smith Rowe|AM|2000|ENG|76|77|17|2029
César Palacios|AM|2004|ESP|72|76|12|2031
Kevin|LW|2003|BRA|75|81|25|2030
Oscar Bobb|RW|2003|NOR|75|83|28|2031
Gonzalo García|ST|2004|ESP|76|80|35|2031
Rodrigo Muniz|ST|2001|BRA|76|78|20|2030
Jonah Kusi-Asare|ST|2007|SWE|68|81|5|2031`,
    },
    {
      id: "e_nfo", name: "Nottingham Forest", short: "NFO", city: "Nottingham", stadium: "City Ground", capacity: 30404,
      colors: ["#DD0000", "#FFFFFF"], reputation: 76, budget: 55,
      players: `John Victor|GK|1996|BRA|72|73|3.5|2028
Matz Sels|GK|1992|BEL|76|76|3.5|2028
Steven Benda|GK|1998|GER|65|67|1|2027
Murillo|CB|2002|BRA|80|84|50|2030
Ousmane Diomande|CB|2003|CIV|77|79|42|2030
Nikola Milenković|CB|1997|SRB|81|81|28|2029
Jair Cunha|CB|2005|BRA|75|86|25|2030
Neco Williams|LB|2001|WAL|77|78|32|2030
Luca Netz|LB|2003|GER|72|76|8|2030
Daniel Muñoz|RB|1996|COL|80|80|22|2029
Ola Aina|RB|1996|NGA|79|79|18|2028
Nicolò Savona|RB|2003|ITA|73|80|15|2030
Ibrahim Sangaré|DM|1997|CIV|77|77|20|2029
James McAtee|CM|2002|ENG|74|79|22|2030
Xaver Schlager|CM|1997|AUT|79|79|15|2028
Nicolás Domínguez|CM|1998|ARG|75|75|13|2028
Ryan Yates|CM|1997|ENG|74|74|7|2028
Morgan Gibbs-White|AM|2000|ENG|82|83|80|2028
Callum Hudson-Odoi|LW|2000|ENG|77|77|25|2028
Dan Ndoye|RW|2000|SUI|78|80|35|2030
Liam Delap|ST|2003|ENG|77|84|40|2031
Igor Jesus|ST|2001|BRA|76|79|25|2029
Arnaud Kalimuendo|ST|2002|FRA|75|78|20|2030
Chris Wood|ST|1991|NZL|79|79|4|2027`,
    },
    {
      id: "e_lee", name: "Leeds United", short: "LEE", city: "Leeds", stadium: "Elland Road", capacity: 37645,
      colors: ["#FFFFFF", "#1D428A"], reputation: 68, budget: 40,
      players: `James Trafford|GK|2002|ENG|77|83|35|2031
Michael Zetterer|GK|1995|GER|74|74|4|2029
Alex Cairns|GK|1993|ENG|60|60|0.05|2028
Tarik Muharemović|CB|2003|BIH|77|83|40|2031
Jaka Bijol|CB|1999|SVN|77|78|20|2030
Joe Rodon|CB|1997|WAL|77|77|18|2030
Nico Elvedi|CB|1996|SUI|77|77|12|2029
Gabriel Gudmundsson|LB|1999|SWE|76|77|25|2029
Melvin Bard|LB|2000|FRA|74|76|10|2027
Jayden Bogle|RB|2000|ENG|75|76|18|2030
James Justin|RB|1998|ENG|75|75|16|2029
Ethan Ampadu|DM|2000|WAL|77|78|35|2030
Anton Stach|DM|1998|GER|78|78|32|2029
Ilia Gruev|DM|2000|BUL|73|75|12|2027
Ao Tanaka|CM|1998|JPN|76|76|15|2028
Sean Longstaff|CM|1997|ENG|75|75|12|2029
Brenden Aaronson|AM|2000|USA|76|77|22|2029
Noah Okafor|LW|2000|SUI|76|77|32|2029
Jean-Mattéo Bahoya|LW|2005|FRA|75|84|25|2027
Harry Wilson|RW|1997|WAL|77|77|22|2030
Daniel James|RW|1997|WAL|75|75|10|2029
Dominic Calvert-Lewin|ST|1997|ENG|77|77|25|2028
Lukas Nmecha|ST|1998|GER|73|73|10|2027
Mateo Joseph|ST|2003|ESP|67|69|3.5|2028`,
    },
    {
      id: "e_sun", name: "Sunderland", short: "SUN", city: "Sunderland", stadium: "Stadium of Light", capacity: 49000,
      colors: ["#EB172B", "#FFFFFF"], reputation: 65, budget: 35,
      players: `Robin Roefs|GK|2003|NED|76|78|30|2031
Melker Ellborg|GK|2003|SWE|66|68|3|2030
Simon Moore|GK|1990|ENG|61|61|0.07|2027
Dan Ballard|CB|1999|NIR|78|78|25|2029
Kevin Danso|CB|1998|AUT|77|77|20|2027
Omar Alderete|CB|1996|PAR|76|76|10|2029
Luke O'Nien|CB|1994|ENG|67|67|0.7|2027
Aji Alese|CB|2001|ENG|60|60|0.7|2027
Dayann Méthalie|LB|2006|FRA|75|86|25|2031
Reinildo Mandava|LB|1994|MOZ|74|74|4|2027
Trai Hume|RB|2002|NIR|73|77|22|2030
Nordi Mukiele|RB|1997|FRA|77|77|18|2029
Thomas Meunier|RB|1991|BEL|74|74|1.5|2028
Granit Xhaka|DM|1992|SUI|81|81|8|2028
Jules Ahoka|DM|2006|COD|70|81|7|2031
Noah Sadiki|CM|2004|COD|77|84|40|2030
Habib Diarra|CM|2004|SEN|76|83|35|2030
Enzo Le Fée|CM|2000|FRA|76|78|30|2031
Alan Browne|CM|1995|IRL|69|69|1.3|2027
Chris Rigg|AM|2007|ENG|75|90|25|2030
Malick Fofana|LW|2005|BEL|77|84|30|2031
Nilson Angulo|LW|2003|ECU|74|76|20|2030
Romaine Mundle|LW|2003|ENG|68|70|5|2030
Timur Tuterov|LW|2005|UKR|57|66|0.3|2028
Chemsdine Talbi|RW|2005|MAR|75|84|25|2030
Jocelin Ta Bi|RW|2005|CIV|66|75|2.5|2030
Abdoullah Ba|RW|2003|MTN|64|66|1.5|2027
Brian Brobbey|ST|2002|NED|76|80|50|2031
Wilson Isidor|ST|2000|HAI|75|77|18|2030`,
    },
    {
      id: "e_ips", name: "Ipswich Town", short: "IPS", city: "Ipswich", stadium: "Portman Road", capacity: 29813,
      colors: ["#0044A9", "#FFFFFF"], reputation: 70, budget: 30,
      players: `Kjell Scherpen|GK|2000|NED|74|74|12|2030
Christian Walton|GK|1995|ENG|72|72|2.5|2029
Alex Palmer|GK|1996|ENG|67|67|1|2028
David Button|GK|1989|ENG|64|64|0.05|2027
Dara O'Shea|CB|1999|IRL|77|77|20|2030
Jacob Greaves|CB|2000|ENG|75|75|17|2029
Issa Diop|CB|1997|MAR|74|74|10|2030
Cédric Kipré|CB|1996|CIV|72|72|3|2028
Leif Davis|LB|1999|ENG|78|78|25|2029
Abdoul Ouattara|RB|2005|CIV|74|83|18|2031
Darnell Furlong|RB|1995|ENG|72|72|2.5|2028
Florentino|DM|1999|POR|76|76|16|2031
Azor Matusiwa|DM|1998|NED|76|76|12|2029
Exequiel Palacios|CM|1998|ARG|80|80|25|2030
Marcelino Núñez|CM|2000|CHI|74|74|14|2029
Saša Lukić|CM|1996|SRB|76|76|10|2030
Jack Taylor|CM|1998|IRL|68|68|2.2|2028
Julio Enciso|AM|2004|PAR|76|82|30|2031
Anis Mehmeti|AM|2001|ALB|73|73|13|2029
Jaden Philogene|LW|2002|ENG|74|74|20|2029
Jack Clarke|LW|2000|ENG|76|76|20|2029
Daizen Maeda|LW|1997|JPN|77|77|13|2029
Abdul Fatawu|RW|2004|GHA|75|79|23|2031
Sindre Walle Egeli|RW|2006|NOR|73|84|15|2030
Kasey McAteer|RW|2001|IRL|72|72|10|2029
Emersonn|ST|2004|BRA|75|85|25|2031
Zian Flemming|ST|1998|NED|74|74|18|2030
Chuba Akpom|ST|1995|ENG|73|73|3.5|2029`,
    },
    {
      id: "e_cov", name: "Coventry City", short: "COV", city: "Coventry", stadium: "Coventry Building Society Arena", capacity: 32609,
      colors: ["#87CEEB", "#FFFFFF"], reputation: 65, budget: 30,
      players: `Carl Rushworth|GK|2001|ENG|75|75|22|2026
Dan Bentley|GK|1993|ENG|67|67|0.8|2028
Ben Wilson|GK|1992|ENG|66|66|0.3|2027
Bobby Thomas|CB|2001|ENG|75|75|20|2029
Aurèle Amenda|CB|2003|SUI|73|81|15|2030
Ethan Pinnock|CB|1993|JAM|74|74|3|2026
Stephen Mfuni|CB|2008|ENG|66|81|3|2027
Joel Latibeaudiere|CB|2000|JAM|68|68|3|2027
Luke Woolfenden|CB|1998|ENG|67|67|1.5|2028
Jay Dasilva|LB|1998|WAL|76|76|12|2027
Jake Bidwell|LB|1993|ENG|68|68|0.6|2027
Milan van Ewijk|RB|2000|NED|76|76|22|2027
Kaine Kesler-Hayden|RB|2002|ENG|66|66|3|2029
Matt Grimes|DM|1995|ENG|75|75|5|2028
Caleb Yirenkyi|CM|2006|GHA|74|85|22|2026
Victor Torp|CM|1999|DEN|76|76|14|2024
Gustavo Hamer|CM|1997|NED|76|76|11|2026
Josh Eccles|CM|2000|ENG|73|73|9|2028
Frank Onyeka|CM|1998|NGA|74|74|8|2030
Jack Rudoni|AM|2001|ENG|75|75|20|2028
Ephron Mason-Clark|LW|1999|JAM|76|76|16|2028
Yann Gboho|LW|2001|CIV|73|76|15|2026
Loum Tchaouna|RW|2003|FRA|74|79|18|2031
Tatsuhiro Sakamoto|RW|1996|JPN|74|74|4.5|2027
Sidiki Chérif|ST|2006|FRA|74|85|22|2026
Haji Wright|ST|1998|USA|77|77|16|2027
Brandon Thomas-Asante|ST|1998|GHA|77|77|16|2028
Ellis Simms|ST|2001|ENG|73|73|12|2027
Taiwo Awoniyi|ST|1997|NGA|75|75|8|2026`,
    },
    {
      id: "e_hul", name: "Hull City", short: "HUL", city: "Hull", stadium: "MKM Stadium", capacity: 25586,
      colors: ["#F5A12D", "#000000"], reputation: 69, budget: 30,
      players: `Konstantinos Tzolakis|GK|2002|GRE|74|74|22|2031
Jack Butland|GK|1993|ENG|72|72|1.5|2028
Dillon Phillips|GK|1995|ENG|61|61|0.2|2028
Nobel Mendy|CB|2004|SEN|74|78|20|2031
Lucas Herrington|CB|2007|AUS|73|86|15|2031
Charlie Hughes|CB|2003|ENG|71|73|10|2029
John Egan|CB|1992|IRL|73|73|1.5|2028
Paddy McNair|CB|1995|NIR|70|70|1.5|2027
Semi Ajayi|CB|1993|NGA|70|70|1|2027
Ryan Giles|LB|2000|ENG|75|75|16|2027
Matt Targett|LB|1995|ENG|73|73|3|2028
Brooke Norton-Cuffy|RB|2004|ENG|73|79|15|2031
Lewie Coyle|RB|1995|ENG|72|72|2.5|2029
Regan Slater|DM|1999|ENG|74|74|10|2029
Lucas Gourna-Douath|DM|2003|FRA|70|72|8|2031
Óscar Zambrano|DM|2004|ECU|64|68|1.5|2030
Christos Mouzakitis|CM|2006|GRE|74|85|20|2031
Tim Iroegbunam|CM|2003|ENG|73|80|15|2031
Jens Hjertø-Dahl|CM|2005|NOR|71|80|10|2031
Hidemasa Morita|CM|1995|JPN|76|76|6|2028
Darko Gyabi|CM|2004|ENG|65|69|2|2028
Eliot Matazo|CM|2002|BEL|62|62|1.5|2028
Matt Crooks|CM|1994|ENG|69|69|1|2028
Kieran Dowell|AM|1997|ENG|64|64|0.6|2027
Sorba Thomas|LW|1999|WAL|76|76|14|2030
Elliot Stroud|LW|2002|SWE|70|70|8|2030
Mohamed Belloumi|RW|2002|ALG|74|74|18|2029
Mohamed-Ali Cho|RW|2004|FRA|73|80|15|2031
Abdülkadir Ömür|RW|1999|TUR|66|66|1.5|2027
Robinio Vaz|ST|2007|FRA|74|87|18|2027
Ilyas Ansah|ST|2004|GER|73|82|15|2031
Joe Gelhardt|ST|2002|ENG|72|72|14|2030
Oli McBurnie|ST|1996|SCO|75|75|7|2029`,
    },
  ],
  tier2: [
    { id: "e_whu", name: "West Ham United", short: "WHU", city: "Londres", stadium: "London Stadium", capacity: 62500, colors: ["#7A263A", "#1BB1E7"], reputation: 69 },
    { id: "e_wol", name: "Wolverhampton Wanderers", short: "WOL", city: "Wolverhampton", stadium: "Molineux Stadium", capacity: 31750, colors: ["#FDB913", "#231F20"], reputation: 66 },
    { id: "e_bur", name: "Burnley", short: "BUR", city: "Burnley", stadium: "Turf Moor", capacity: 21944, colors: ["#6C1D45", "#99D6EA"], reputation: 60 },
    { id: "e_lei", name: "Leicester City", short: "LEI", city: "Leicester", stadium: "King Power Stadium", capacity: 32262, colors: ["#003090", "#FDBE11"], reputation: 70 },
    { id: "e_sou", name: "Southampton", short: "SOU", city: "Southampton", stadium: "St Mary's Stadium", capacity: 32384, colors: ["#D71920", "#FFFFFF"], reputation: 68 },
    { id: "e_shu", name: "Sheffield United", short: "SHU", city: "Sheffield", stadium: "Bramall Lane", capacity: 32050, colors: ["#EE2737", "#FFFFFF"], reputation: 64 },
    { id: "e_mid", name: "Middlesbrough", short: "MID", city: "Middlesbrough", stadium: "Riverside Stadium", capacity: 34742, colors: ["#E11B22", "#FFFFFF"], reputation: 63 },
    { id: "e_wba", name: "West Bromwich Albion", short: "WBA", city: "West Bromwich", stadium: "The Hawthorns", capacity: 26688, colors: ["#122F67", "#FFFFFF"], reputation: 63 },
    { id: "e_nor", name: "Norwich City", short: "NOR", city: "Norwich", stadium: "Carrow Road", capacity: 27359, colors: ["#FFF200", "#00A650"], reputation: 61 },
    { id: "e_wat", name: "Watford", short: "WAT", city: "Watford", stadium: "Vicarage Road", capacity: 22200, colors: ["#FBEE23", "#ED2127"], reputation: 60 },
    { id: "e_sto", name: "Stoke City", short: "STO", city: "Stoke-on-Trent", stadium: "bet365 Stadium", capacity: 30089, colors: ["#E03A3E", "#FFFFFF"], reputation: 60 },
  ],
};
