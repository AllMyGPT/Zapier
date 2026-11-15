import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: 'esp',
  name: 'Liga Española',
  country: 'España',
  nat: 'ESP',
  tier2Name: 'Segunda División',
  clubs: [
    {
      id: 'rma', name: 'Real Madrid', short: 'RMA', city: 'Madrid', stadium: 'Santiago Bernabéu', capacity: 83186,
      colors: ['#FFFFFF', '#FEBE10'], reputation: 97, budget: 150,
      players: `Thibaut Courtois|GK|1992|BEL|85|85|15|2027
Andriy Lunin|GK|1999|UKR|78|80|12|2030
Dean Huijsen|CB|2005|ESP|80|88|60|2030
Ibrahima Konaté|CB|1999|FRA|83|84|45|2030
Raúl Asencio|CB|2003|ESP|76|83|18|2031
Éder Militão|CB|1998|BRA|82|83|18|2028
Antonio Rüdiger|CB|1993|GER|84|84|6|2027
Marc Cucurella|LB|1998|ESP|84|84|60|2032
Álvaro Carreras|LB|2003|ESP|80|86|50|2031
Ferland Mendy|LB|1995|FRA|79|79|4|2028
Trent Alexander-Arnold|RB|1998|ENG|85|86|60|2031
Denzel Dumfries|RB|1996|NED|83|83|25|2030
Aurélien Tchouaméni|DM|2000|FRA|84|86|70|2028
Federico Valverde|CM|1998|URU|87|87|90|2029
Eduardo Camavinga|CM|2002|FRA|82|87|50|2029
Thiago Pitarch|CM|2007|ESP|74|87|20|2030
Jorge Cestero|CM|2006|ESP|70|81|7.5|2028
Jude Bellingham|AM|2003|ENG|87|91|160|2029
Arda Güler|AM|2005|TUR|81|89|100|2029
Bernardo Silva|AM|1994|POR|85|85|22|2028
Vinicius Junior|LW|2000|BRA|85|85|130|2032
Yan Diomande|RW|2006|CIV|81|95|120|2033
Rodrygo|RW|2001|BRA|83|85|45|2028
Brahim Díaz|RW|1999|MAR|81|82|35|2027
Kylian Mbappé|ST|1998|FRA|90|91|200|2029
Endrick|ST|2006|BRA|77|90|40|2030
Carlos Espí|ST|2005|ESP|77|88|40|2031`,
    },
    {
      id: 'fcb', name: 'FC Barcelona', short: 'FCB', city: 'Barcelona', stadium: 'Spotify Camp Nou', capacity: 99354,
      colors: ['#A50044', '#004D98'], reputation: 96, budget: 60,
      players: `Joan García|GK|2001|ESP|80|80|45|2031
Dominik Livakovic|GK|1995|CRO|77|77|4|2030
Wojciech Szczęsny|GK|1990|POL|78|78|0.8|2027
Pau Cubarsí|CB|2007|ESP|81|89|100|2029
Eric García|CB|2001|ESP|79|81|45|2031
Gerard Martín|CB|2002|ESP|76|80|40|2028
Andreas Christensen|CB|1996|DEN|80|80|8|2028
Alejandro Balde|LB|2003|ESP|80|85|40|2028
Jules Koundé|RB|1998|FRA|85|85|55|2030
Xavi Espart|RB|2007|ESP|75|88|25|2030
João Cancelo|RB|1994|POR|80|80|7|2029
Rodri|DM|1996|ESP|89|89|60|2030
Marc Bernal|DM|2007|ESP|77|93|40|2029
Pedri|CM|2002|ESP|87|89|150|2030
Gavi|CM|2004|ESP|79|84|25|2030
Frenkie de Jong|CM|1997|NED|84|84|25|2029
Brian Fariñas|CM|2006|ESP|68|79|5|2028
Fermín López|AM|2003|ESP|81|86|110|2031
Dani Olmo|AM|1998|ESP|84|84|60|2030
Anthony Gordon|LW|2001|ENG|82|84|80|2031
Jesse Bisiwu|LW|2008|BEL|70|85|8|2031
Lamine Yamal|RW|2007|ESP|85|92|220|2031
Karim Adeyemi|RW|2002|GER|80|84|40|2031
Roony Bardghji|RW|2005|SWE|70|82|8|2029
Raphinha|ST|1996|BRA|88|88|70|2030
Gabriel Jesus|ST|1997|BRA|81|81|17|2029
Hamza Abdelkarim|ST|2008|EGY|70|85|8|2030`,
    },
    {
      id: 'atm', name: 'Atlético de Madrid', short: 'ATM', city: 'Madrid', stadium: 'Riyadh Air Metropolitano', capacity: 70460,
      colors: ['#CB3524', '#FFFFFF'], reputation: 91, budget: 90,
      players: `Jan Oblak|GK|1993|SVN|84|84|15|2028
Juan Musso|GK|1994|ARG|78|78|3|2028
Salvi Esquivel|GK|2005|ESP|62|74|1|2029
Marc Pubill|CB|2003|ESP|78|85|50|2030
Cristian Romero|CB|1998|ARG|84|84|40|2031
Dávid Hancko|CB|1997|SVK|83|84|35|2030
Robin Le Normand|CB|1996|ESP|82|82|18|2029
Jorge Domínguez|CB|2009|ESP|70|87|8|2028
Alejandro Grimaldo|LB|1995|ESP|83|83|20|2030
Dani Martínez|LB|2004|ESP|67|71|2.5|2030
Marcos Llorente|RB|1995|ESP|82|82|20|2027
Morten Hjulmand|DM|1999|DEN|82|82|45|2031
Pablo Barrios|CM|2003|ESP|81|87|70|2030
Rodrigo Mendoza|CM|2005|ESP|74|85|20|2031
Johnny Cardoso|CM|2001|USA|78|81|20|2030
Obed Vargas|CM|2005|MEX|71|80|10|2030
Koke|CM|1992|ESP|80|80|5|2027
Kang-in Lee|AM|2001|KOR|79|79|35|2031
Álex Baena|LW|2001|ESP|82|84|45|2030
Ademola Lookman|LW|1997|NGA|84|84|40|2030
Arnau Ortiz|LW|2001|ESP|73|73|6|2028
Giuliano Simeone|RW|2002|ARG|78|83|40|2030
Julián Álvarez|ST|2000|ARG|86|88|110|2030
Jonathan David|ST|2000|CAN|81|82|30|2027
Alexander Sørloth|ST|1995|NOR|81|81|15|2028`,
    },
    {
      id: 'ath', name: 'Athletic Club', short: 'ATH', city: 'Bilbao', stadium: 'San Mamés', capacity: 53289,
      colors: ['#EE2523', '#FFFFFF'], reputation: 84, budget: 40,
      players: `Unai Simón|GK|1997|ESP|82|82|22|2029
Álex Padilla|GK|2003|MEX|69|76|3|2029
Dani Vivian|CB|1999|ESP|80|81|20|2032
Aymeric Laporte|CB|1994|ESP|80|80|8|2028
Aitor Paredes|CB|2000|ESP|76|78|7.5|2029
Yeray Álvarez|CB|1995|ESP|75|75|0.9|2028
Unai Egiluz|CB|2002|ESP|62|62|0.4|2028
Johaneko Louis-Jean|LB|2004|FRA|66|70|2|2028
Yuri Berchiche|LB|1990|ESP|77|77|1|2027
Jesús Areso|RB|1999|ESP|75|76|5|2031
Hugo Rincón|RB|2003|ESP|69|75|3.5|2028
Mikel Jauregizar|CM|2003|ESP|77|84|25|2031
Beñat Prados|CM|2001|ESP|75|80|12|2031
Alejandro Rego|CM|2003|ESP|70|78|5|2030
Beñat Gerenabarrena|CM|2003|ESP|70|72|5|2029
Iñigo Ruiz de Galarreta|CM|1993|ESP|77|77|2|2027
Oihan Sancet|AM|2000|ESP|81|83|25|2032
Peio Canales|AM|2005|ESP|71|80|10|2029
Nico Williams|LW|2002|ESP|83|86|40|2035
Álex Berenguer|LW|1995|ESP|77|77|4|2027
Álvaro Djaló|LW|1999|GNB|73|73|4|2029
Robert Navarro|RW|2002|ESP|75|78|7|2030
Nico Serrano|RW|2003|ESP|66|68|1.5|2028
Iñaki Williams|ST|1994|GHA|81|81|8|2028
Gorka Guruzeta|ST|1996|ESP|78|78|5|2028
Maroan Sannadi|ST|2001|MAR|71|76|3|2029`,
    },
    {
      id: 'vil', name: 'Villarreal CF', short: 'VIL', city: 'Villarreal', stadium: 'Estadio de la Cerámica', capacity: 23500,
      colors: ['#FFE667', '#005187'], reputation: 82, budget: 45,
      players: `Luiz Júnior|GK|2001|BRA|75|75|12|2030
Péter Gulácsi|GK|1990|HUN|77|77|1|2028
Rubén Gómez|GK|2002|ESP|62|62|0.4|2027
Renato Veiga|CB|2003|POR|78|84|30|2032
Logan Costa|CB|2001|CPV|77|80|15|2030
Pau Navarro|CB|2005|ESP|73|82|15|2031
Juan Foyth|CB|1998|ARG|79|79|8|2029
Carlos Romero|LB|2001|ESP|76|79|25|2031
Sergi Cardona|LB|1999|ESP|76|77|9|2027
Santiago Mouriño|RB|2002|URU|75|80|20|2030
Alex Freeman|RB|2004|USA|73|77|15|2032
Pape Gueye|CM|1999|SEN|80|81|40|2028
Carlos Macià|CM|2008|ESP|73|88|15|2031
Nathan Saliba|CM|2004|CAN|73|77|15|2031
Santi Comesaña|CM|1996|ESP|78|78|8|2028
Alassane Diatta|CM|2005|SEN|68|77|5|2030
Alberto Moleiro|LW|2003|ESP|79|85|50|2030
Nízar El Jmili|LW|2004|ESP|56|60|0.15|2030
Ilias Akhomach|RW|2004|MAR|72|76|12|2028
Tajon Buchanan|RW|1999|CAN|76|78|12|2030
Nicolas Pépé|RW|1995|CIV|78|78|6|2028
Georges Mikautadze|ST|2000|GEO|79|82|40|2031
Tani Oluwaseyi|ST|2000|CAN|73|76|7|2030
Ayoze Pérez|ST|1993|ESP|80|80|5|2028
Gerard Moreno|ST|1992|ESP|79|79|2.5|2027`,
    },
    {
      id: 'bet', name: 'Real Betis Balompié', short: 'BET', city: 'Sevilla', stadium: 'Estadio Benito Villamarín', capacity: 60721,
      colors: ['#0BB363', '#FFFFFF'], reputation: 81, budget: 35,
      players: `Álvaro Valles|GK|1997|ESP|79|79|10|2030
Diego Conde|GK|1998|ESP|73|74|3|2027
Natan|CB|2001|BRA|78|82|30|2030
Valentín Gómez|CB|2003|ARG|74|80|12|2030
Diego Llorente|CB|1993|ESP|77|77|2.5|2028
Marc Bartra|CB|1991|ESP|75|75|0.9|2027
Fran García|LB|1999|ESP|76|76|7.5|2030
Junior Firpo|LB|1996|DOM|75|75|3.5|2028
Ángel Ortiz|RB|2004|ESP|70|74|6|2029
Héctor Bellerín|RB|1995|ESP|76|76|2.4|2028
Facundo Bernal|DM|2003|URU|73|75|10|2031
Marc Roca|DM|1996|ESP|77|77|4|2029
Nelson Deossa|CM|2000|COL|74|78|9|2030
Pablo Fornals|CM|1996|ESP|79|79|8|2029
Dani Ceballos|CM|1996|ESP|78|78|6|2029
Álvaro Fidalgo|CM|1997|MEX|76|76|5|2030
Giovani Lo Celso|AM|1996|ARG|79|79|7|2028
Isco|AM|1992|ESP|80|80|3.5|2028
Iker Losada|AM|2001|ESP|69|72|1.8|2029
Abde Ezzalzouli|LW|2001|MAR|79|81|40|2029
Rodrigo Riquelme|LW|2000|ESP|74|76|4|2030
Antony|RW|2000|BRA|80|81|40|2030
Aitor Ruibal|RW|1996|ESP|75|75|4|2028
Troy Parrott|ST|2002|IRL|76|76|20|2031
Cucho Hernández|ST|1999|COL|79|80|18|2030`,
    },
    {
      id: 'cel', name: 'RC Celta de Vigo', short: 'CEL', city: 'Vigo', stadium: 'Abanca-Balaídos', capacity: 24791,
      colors: ['#8AC3EE', '#FFFFFF'], reputation: 76, budget: 20, academy: 6,
      players: `Ionuț Radu|GK|1997|ROU|79|79|10|2029
Altay Bayındır|GK|1998|TUR|73|74|3.8|2027
Iván Villar|GK|1997|ESP|71|72|0.9|2027
Javi Rodríguez|CB|2003|ESP|75|81|18|2030
Yoel Lago|CB|2004|ESP|71|75|7.5|2029
Carl Starfelt|CB|1995|SWE|77|77|4.5|2027
Abdoulaye Faye|CB|2004|SEN|69|73|4.5|2027
Sebastián Cáceres|CB|1999|URU|74|74|4.5|2030
Marcos Alonso|CB|1990|ESP|77|77|1.2|2028
Javi Galán|LB|1994|ESP|75|75|1.8|2028
Sergio Carreira|RB|2000|ESP|74|77|12|2029
Javi Rueda|RB|2002|ESP|71|76|6|2029
Álvaro Núñez|RB|2000|ESP|71|73|4|2030
Ilaix Moriba|CM|2003|GUI|75|80|15|2029
Miguel Román|CM|2002|ESP|72|78|15|2028
Aleix Febas|CM|1996|ESP|75|75|5|2029
Hugo Burcio|CM|2006|ESP|65|76|2|2028
Williot Swedberg|LW|2004|SWE|74|79|20|2029
Hugo Álvarez|LW|2003|ESP|73|79|8|2028
Couhaib Driouech|LW|2002|MAR|73|73|7.5|2030
Ferran Jutglà|RW|1999|ESP|75|76|10|2029
Jones El-Abdellaoui|RW|2006|MAR|70|84|8|2029
Hugo González|RW|2003|ESP|68|70|3|2028
Pablo Durán|ST|2001|ESP|71|71|4|2028
Borja Iglesias|ST|1993|ESP|77|77|2.5|2027
Iago Aspas|ST|1987|ESP|80|80|1.6|2027`,
    },
    {
      id: 'ray', name: 'Rayo Vallecano', short: 'RAY', city: 'Madrid', stadium: 'Estadio de Vallecas', capacity: 14708,
      colors: ['#FFFFFF', '#E53027'], reputation: 72, budget: 12,
      players: `Augusto Batalla|GK|1996|ARG|78|78|6|2030
Emil Audero|GK|1997|IDN|74|74|2.8|2027
Dani Cárdenas|GK|1997|ESP|71|72|1.8|2027
Mujaid Sadick|CB|2000|ESP|73|73|5|2027
Marash Kumbulla|CB|2000|ALB|73|74|3|2027
Luiz Felipe|CB|1997|ITA|74|74|2|2027
Jozhua Vertrouwd|CB|2004|NED|67|75|2|2030
Florian Lejeune|CB|1991|FRA|77|77|1.8|2028
Pelayo Fernández|CB|2003|ESP|61|63|0.5|2028
Adrià Pedrosa|LB|1998|ESP|72|73|2.8|2027
Andrei Rațiu|RB|1998|ROU|79|80|24|2030
Iván Balliu|RB|1992|ALB|74|74|1|2027
Pedro Díaz|CM|1998|ESP|74|75|3|2028
Unai López|CM|1995|ESP|76|76|2.5|2029
Óscar Valentín|CM|1994|ESP|76|76|2|2027
Pathé Ciss|CM|1994|SEN|76|76|1.8|2027
Gnangoro Bouare|CM|2004|ESP|63|67|1|2031
Isi Palazón|AM|1994|ESP|78|78|2.8|2028
Randy Nteka|AM|1997|ANG|70|70|1|2028
Rayane Belaid|AM|2005|ESP|60|69|0.6|2031
Álvaro García|LW|1992|ESP|76|76|1.5|2028
Jorge de Frutos|RW|1997|ESP|78|78|12|2028
Giorgi Tsitaishvili|RW|2000|GEO|71|71|3|2029
Fran Pérez|RW|2002|ESP|71|76|2.5|2029
Sergio Camello|ST|2001|ESP|74|76|10|2027
Alemão|ST|1998|BRA|74|75|4|2030
Raúl de Tomás|ST|1994|ESP|69|69|0.4|2027`,
    },
    {
      id: 'osa', name: 'CA Osasuna', short: 'OSA', city: 'Pamplona', stadium: 'El Sadar', capacity: 23576,
      colors: ['#D91A21', '#0A346F'], reputation: 72, budget: 10,
      players: `Sergio Herrera|GK|1993|ESP|78|78|2.8|2028
Aitor Fernández|GK|1991|ESP|73|73|0.4|2027
Enzo Boyomo|CB|2001|CMR|76|80|15|2029
Jorge Herrando|CB|2001|ESP|71|75|3.5|2030
Rockson Yeboah|CB|2004|GHA|67|71|3|2031
Alejandro Catena|CB|1994|ESP|77|77|2.6|2028
Unai Santos|CB|2005|ESP|61|70|0.8|2028
Abel Bretones|LB|2000|ESP|73|75|3.5|2029
Diego Rico|LB|1993|ESP|73|73|0.8|2027
Valentin Rosier|RB|1996|FRA|74|74|3|2028
Iñigo Arguibide|RB|2005|ESP|66|75|2.5|2030
Lucas Torró|DM|1994|ESP|77|77|2.5|2027
Iker Muñoz|DM|2002|ESP|70|75|2|2030
Jon Moncayola|CM|1998|ESP|77|77|7|2031
Asier Osambela|CM|2004|ESP|66|75|2|2029
Mauro Echegoyen|CM|2005|ESP|56|65|0.2|2028
Aimar Oroz|AM|2001|ESP|75|78|7.5|2029
Moi Gómez|AM|1994|ESP|75|75|1.5|2027
Raúl Moro|LW|2002|ESP|70|70|3.5|2031
Romain Del Castillo|RW|1996|FRA|76|76|5|2028
Jonathan Dubasin|RW|2000|ESP|72|72|4|2030
Rubén García|RW|1993|ESP|75|75|1.6|2027
Kike Barja|RW|1997|ESP|71|71|1.5|2028
Raúl García|ST|2000|ESP|71|71|3|2031
Ante Budimir|ST|1991|CRO|79|79|2.8|2027`,
    },
    {
      id: 'rso', name: 'Real Sociedad', short: 'RSO', city: 'San Sebastián', stadium: 'Reale Arena', capacity: 39313,
      colors: ['#0067B1', '#FFFFFF'], reputation: 81, budget: 35,
      players: `Álex Remiro|GK|1995|ESP|80|80|9|2027
Unai Marrero|GK|2001|ESP|69|74|1|2030
Jon Martín|CB|2006|ESP|75|89|25|2032
Mamadou Sarr|CB|2005|SEN|74|84|22|2027
Igor Zubeldia|CB|1997|ESP|78|78|6|2029
Jon Pacheco|CB|2001|ESP|73|76|5|2030
Luken Beitia|CB|2004|ESP|66|70|2|2030
Sergio Gómez|LB|2000|ESP|76|77|15|2030
Aihen Muñoz|LB|1997|ESP|73|73|2.5|2027
Jon Aramburu|RB|2002|VEN|75|79|15|2030
Héctor Fort|RB|2006|ESP|73|85|15|2031
Álvaro Odriozola|RB|1995|ESP|73|73|0.8|2029
Jon Gorrotxategi|DM|2002|ESP|74|80|25|2030
Beñat Turrientes|CM|2002|ESP|75|79|10|2030
Carlos Soler|CM|1997|ESP|78|78|7|2029
Yangel Herrera|CM|1998|VEN|77|77|6|2030
Luka Sucic|AM|2002|CRO|75|75|15|2029
Arsen Zakharyan|AM|2003|RUS|74|79|7.5|2029
Pablo Marín|AM|2003|ESP|72|77|7|2029
Ander Barrenetxea|LW|2001|ESP|77|79|18|2030
Gonçalo Guedes|LW|1996|POR|77|77|6|2028
Álex Marchal|LW|2007|ESP|66|79|3|2029
Takefusa Kubo|RW|2001|JPN|80|82|20|2029
Job Ochieng|RW|2003|KEN|69|71|4|2028
Mikel Oyarzabal|ST|1997|ESP|83|83|25|2028
Orri Óskarsson|ST|2004|ISL|74|81|20|2030`,
    },
    {
      id: 'val', name: 'Valencia CF', short: 'VAL', city: 'Valencia', stadium: 'Mestalla', capacity: 49430,
      colors: ['#FFFFFF', '#000000'], reputation: 79, budget: 15,
      players: `Kayne van Oevelen|GK|2003|NED|69|71|4|2027
Stole Dimitrievski|GK|1993|MKD|76|76|2|2028
Cristian Rivero|GK|1998|ESP|64|66|0.1|2027
César Tárrega|CB|2002|ESP|75|80|9|2030
Justin de Haas|CB|2000|NED|74|74|7|2030
José Copete|CB|1999|ESP|74|76|5|2029
Mouctar Diakhaby|CB|1996|GUI|75|75|1.5|2027
Iker Córdoba|CB|2005|ESP|62|71|1|2028
José Gayà|LB|1995|ESP|77|77|4|2027
Jesús Vázquez|LB|2003|ESP|71|76|4|2028
Arnau Martínez|RB|2003|ESP|75|79|10|2031
Pablo Maffeo|RB|1997|ARG|75|75|2.5|2027
Dimitri Foulquier|RB|1993|FRA|72|72|0.5|2027
Pepelu|DM|1998|ESP|77|77|8|2028
Guido Rodríguez|DM|1994|ARG|75|75|3.5|2028
Aliou Dieng|DM|1997|MLI|74|74|3|2028
Javi Guerra|CM|2003|ESP|77|83|25|2029
Filip Ugrinic|CM|1999|SUI|75|75|6|2029
Aarón Mayol|CM|2008|ESP|68|83|5|2029
Harvey Elliott|AM|2003|ENG|76|81|18|2027
Ryunosuke Sato|LW|2006|JPN|68|79|4|2031
Arnaut Danjuma|LW|1997|NED|75|75|3|2028
Sergi Canós|LW|1997|ESP|68|68|0.6|2027
Diego López|RW|2002|ESP|75|79|9|2029
David Otorbi|RW|2007|ESP|67|83|3.5|2031
Luis Rioja|RW|1993|ESP|75|75|1.8|2027
Dani Raba|AM|1995|ESP|71|71|1|2027
Hugo Duro|ST|1999|ESP|77|77|11|2028
Umar Sadiq|ST|1997|NGA|74|74|3.5|2028`,
    },
    {
      id: 'get', name: 'Getafe CF', short: 'GET', city: 'Getafe', stadium: 'Coliseum', capacity: 16800,
      colors: ['#005999', '#FFFFFF'], reputation: 70, budget: 8,
      players: `David Soria|GK|1993|ESP|78|78|2.8|2030
Jiri Letacek|GK|1999|CZE|71|71|2|2028
Zaid Romero|CB|1999|ARG|72|75|5|2030
Abdel Abqar|CB|1999|MAR|73|75|3.5|2028
Sebastián Boselli|CB|2003|URU|66|68|1.5|2030
Dakonam Djené|CB|1991|TOG|77|77|1.4|2027
Saba Sazonov|CB|2002|GEO|64|64|0.8|2027
Jean Ives Valou|CB|2005|CIV|60|69|0.6|2027
Davinchi|LB|2007|ESP|65|81|2|2028
Johan Mojica|LB|1992|COL|75|75|1.5|2027
Andrés García|RB|2003|ESP|71|79|7|2027
Daniel Carvajal|RB|1992|ESP|80|80|3.5|2027
Kiko Femenía|RB|1991|ESP|72|72|0.5|2027
Mario Martín|DM|2004|ESP|71|78|10|2030
Orel Mangala|DM|1998|BEL|76|76|9|2027
Nemanja Gudelj|DM|1991|SRB|76|76|2|2027
Ramón Terrats|CM|2000|ESP|72|74|3|2029
Francho Serrano|CM|2001|ESP|70|70|3|2029
Alberto Risco|AM|2005|ESP|61|70|0.8|2027
Juanmi|LW|1993|ESP|73|73|1|2027
Martín Satriano|ST|2001|URU|73|76|10|2030
Christantus Uche|ST|2003|NGA|72|78|9|2028
Iván Azón|ST|2002|ESP|73|73|7.5|2027
Enes Ünal|ST|1997|TUR|75|75|7|2029
Borja Mayoral|ST|1997|ESP|76|76|4.5|2027`,
    },
    {
      id: 'esy', name: 'RCD Espanyol', short: 'ESP', city: 'Barcelona', stadium: 'RCDE Stadium', capacity: 40000,
      colors: ['#007FC8', '#FFFFFF'], reputation: 70, budget: 10,
      players: `Marko Dmitrović|GK|1992|SRB|73|73|0.7|2028
Ángel Fortuño|GK|2001|ESP|64|70|0.3|2030
Vanja Drkusic|CB|1999|SVN|74|74|5|2027
Clemens Riedel|CB|2003|GER|70|77|4|2029
Unai Núñez|CB|1997|ESP|75|75|3.5|2027
Leandro Cabrera|CB|1991|URU|76|76|0.9|2027
Quilindschy Hartman|LB|2001|NED|73|77|12|2027
Roger Hinojo|LB|2005|ESP|66|75|3|2030
Omar El Hilali|RB|2003|MAR|74|79|15|2027
Andoni Gorosabel|RB|1996|ESP|76|76|3|2027
Urko González de Zárate|DM|2001|ESP|75|75|12|2030
Gabriel Moscardo|DM|2005|BRA|70|79|7|2027
Pol Lozano|CM|1999|ESP|74|76|6|2027
Edu Expósito|CM|1996|ESP|76|76|5|2027
Rafel Bauzà|CM|2005|ESP|63|72|1.2|2028
Javi Hernández|AM|2004|ESP|70|74|6|2028
Álex Calatrava|AM|2000|ESP|73|73|5|2031
Bryan Zaragoza|LW|2001|ESP|75|78|8|2027
Javi Puado|LW|1998|ESP|77|77|7.5|2030
Pere Milla|LW|1992|ESP|74|74|1|2027
Tyrhys Dolan|RW|2001|ENG|74|77|10|2028
Jofre Carreras|RW|2001|ESP|71|74|3|2029
Roberto Fernández|ST|2002|ESP|74|78|20|2031
Marcos Fernández|ST|2003|ESP|67|69|2|2028
Kike García|ST|1989|ESP|74|74|0.5|2027`,
    },
    {
      id: 'ala', name: 'Deportivo Alavés', short: 'ALA', city: 'Vitoria-Gasteiz', stadium: 'Mendizorrotza', capacity: 19840,
      colors: ['#0761AF', '#FFFFFF'], reputation: 68, budget: 8,
      players: `Antonio Sivera|GK|1996|ESP|78|78|6|2030
Adrián Rodríguez|GK|2000|ARG|61|61|0.2|2028
Ville Koski|CB|2002|FIN|68|73|4|2031
Nicolás Valentini|CB|2001|ARG|71|75|3|2029
Facundo Garcés|CB|1999|ARG|67|69|0|2028
Youssef Enríquez|LB|2005|MAR|68|82|5|2029
Nahuel Tenaglia|RB|1996|ARG|74|74|3|2029
Jonny Otto|RB|1994|ESP|74|74|2.2|2027
Hugo Novoa|RB|2003|ESP|63|65|0.8|2029
Antonio Blanco|DM|2000|ESP|76|78|10|2027
Carlos Protesoni|DM|1998|URU|69|69|1|2028
Pablo Ibáñez|CM|1998|ESP|73|74|4|2030
Ander Guevara|CM|1997|ESP|73|73|2.5|2027
Carles Aleñá|CM|1998|ESP|73|73|2.5|2029
Selu Diallo|CM|2003|GUI|64|66|0.9|2028
Mikel Rodriguez|CM|2002|ESP|64|64|0.7|2031
Denis Suárez|AM|1994|ESP|73|73|1|2027
Abde Rebbach|LW|1998|ALG|72|73|2.5|2028
Ángel Pérez|RW|2002|ESP|66|78|5|2030
Miguel Rodríguez|RW|2003|ESP|70|72|5|2031
Toni Martínez|ST|1997|ESP|76|76|7.5|2028
Lucas Boyé|ST|1996|ARG|76|76|5|2029
Aitor Mañas|ST|2003|ESP|62|64|0.6|2030
Mariano Díaz|ST|1993|DOM|71|71|0.5|2027`,
    },
    {
      id: 'sev', name: 'Sevilla FC', short: 'SEV', city: 'Sevilla', stadium: 'Ramón Sánchez-Pizjuán', capacity: 43883,
      colors: ['#FFFFFF', '#D3001F'], reputation: 80, budget: 15,
      players: `Odysseas Vlachodimos|GK|1994|GRE|76|76|3|2027
Fran González|GK|2005|ESP|66|82|3|2031
Kike Salas|CB|2002|ESP|74|78|14|2029
Andrés Castrín|CB|2003|ESP|70|79|8|2027
Arouna Sangante|CB|2002|SEN|71|75|8|2031
Marcão|CB|1996|BRA|74|74|2.5|2028
Fábio Cardoso|CB|1994|POR|74|74|1.5|2028
Gabriel Suazo|LB|1997|CHI|75|75|7|2028
Julio Díaz|LB|2005|ESP|65|74|2|2031
José Ángel Carmona|RB|2002|ESP|74|78|10|2028
Juan Iglesias|RB|1998|ESP|75|75|6|2030
Lucien Agoumé|DM|2002|FRA|77|80|18|2028
Youssouf Fofana|CM|1999|FRA|79|80|15|2027
Giorgi Kochorashvili|CM|1999|GEO|74|74|4.5|2030
Nico Guillén|CM|2008|ESP|65|80|2|2029
Jon Guridi|CM|1995|ESP|74|74|1.8|2028
Manu Bueno|CM|2004|ESP|67|75|1.5|2027
Rubén Vargas|LW|1998|SUI|78|78|15|2029
Félix Correia|LW|2001|POR|74|77|10|2027
Chidera Ejuke|LW|1998|NGA|75|75|4|2027
Alfon González|LW|1999|ESP|72|72|3|2028
Miguel Sierra|RW|2004|ESP|70|74|7|2029
Peque Fernández|AM|2002|ESP|71|75|3|2028
Lucas Stassin|ST|2004|BEL|73|77|15|2027
Robbie Ure|ST|2004|SCO|70|74|7|2031
Isaac Romero|ST|2000|ESP|74|77|5|2028`,
    },
    {
      id: 'lev', name: 'Levante UD', short: 'LEV', city: 'Valencia', stadium: 'Ciutat de València', capacity: 26354,
      colors: ['#00428C', '#B5121B'], reputation: 64, budget: 6,
      players: `Mathew Ryan|GK|1992|AUS|77|77|1.8|2027
Pablo Campos|GK|2002|ESP|67|67|1.5|2027
Axel Tape|CB|2007|FRA|70|83|8|2027
Adrián Dela|CB|1999|ESP|74|74|5|2027
Ifeanyi Ndukwe|CB|2008|AUT|66|81|3|2027
Aïssa Mandi|CB|1991|ALG|75|75|1|2028
Jorge Cabello|CB|2004|ESP|63|67|0.9|2028
Manu Sánchez|LB|2000|ESP|73|74|6|2027
Marc Santos|LB|2010|ESP|68|87|4|2029
Jeremy Toljan|RB|1994|GER|73|73|2|2027
Nacho Pérez|RB|2008|ESP|64|79|1.5|2028
Oriol Rey|DM|1998|ESP|71|72|1.8|2027
Enzo Bardeli|CM|2001|FRA|73|73|6|2029
Hugo Sotelo|CM|2003|ESP|72|78|5|2027
Jon Ander Olasagasti|CM|2000|ESP|70|72|2.5|2028
Dani Requena|CM|2004|ESP|65|69|1.5|2027
Thiago Fernández|LW|2004|ARG|69|73|4.5|2027
Roger Brugué|LW|1996|ESP|73|73|3|2028
Paco Cortés|LW|2007|ESP|65|78|2|2028
Víctor García|RW|1997|ESP|69|70|1.5|2027
Petar Ratkov|ST|2003|SRB|72|74|9|2027
Karl Etta Eyong|ST|2003|CMR|72|79|9|2029
Iván Romero|ST|2001|ESP|73|76|8|2028
Yanis Musuayi|ST|2007|BEL|66|79|3|2030`,
    },
    {
      id: 'elc', name: 'Elche CF', short: 'ELC', city: 'Elche', stadium: 'Estadio Martínez Valero', capacity: 31388,
      colors: ['#FFFFFF', '#05642C'], reputation: 63, budget: 6,
      players: `Alejandro Iturbe|GK|2003|ESP|64|73|1.4|2029
Matías Dituro|GK|1987|ARG|71|71|0.1|2027
Kevin Lomónaco|CB|2002|ARG|71|71|5|2030
Víctor Chust|CB|2000|ESP|71|73|2.5|2029
Matia Barzic|CB|2004|CRO|63|67|1|2030
Bambo Diaby|CB|1997|ESP|69|69|0.8|2027
Pedro Bigas|CB|1990|ESP|71|71|0.3|2027
Roy Revivo|LB|2003|ISR|70|72|4.5|2030
Buba Sangaré|RB|2007|ESP|68|81|5|2031
Rubén Sánchez|RB|2001|ESP|70|73|1.8|2029
Marc Aguado|DM|2000|ESP|72|74|3.5|2027
Federico Redondo|DM|2003|ARG|67|69|2.5|2030
Martim Neto|CM|2003|POR|70|76|4|2028
Javi Morcillo|CM|2006|ESP|65|76|2|2030
Gonzalo Villar|CM|1998|ESP|71|71|1.8|2029
Facundo Buonanotte|AM|2004|ARG|73|79|12|2027
Thomas Lemar|AM|1995|FRA|75|75|1.8|2027
Germán Valera|LW|2002|ESP|71|76|6|2027
Lucas Cepeda|LW|2002|CHI|68|68|2.5|2030
Tete Morente|LW|1996|ESP|71|71|1.8|2028
Yago Santiago|LW|2003|ESP|66|73|1|2027
Grady Diangana|RW|1998|COD|72|73|2|2027
Josan|RW|1989|ESP|69|69|0.1|2027
Adam Boayar|AM|2005|MAR|61|70|0.8|2027
Ali Houary|AM|2005|MAR|60|69|0.6|2028
Ezequiel Ponce|ST|1997|ARG|75|75|4|2027
Fer Niño|ST|2000|ESP|72|72|4|2030
Abiel Osorio|ST|2002|ARG|67|67|1.5|2029`,
    },
    {
      id: 'dep', name: 'RC Deportivo de La Coruña', short: 'DEP', city: 'A Coruña', stadium: 'Estadio Abanca-Riazor', capacity: 32490,
      colors: ['#0E4C9A', '#FFFFFF'], reputation: 68, budget: 12,
      players: `Leo Román|GK|2000|ESP|75|75|9|2031
Álvaro Ferllo|GK|1998|ESP|70|70|1.5|2027
Germán Parreño|GK|1993|ESP|68|68|0.2|2028
José María Giménez|CB|1995|URU|81|81|6|2027
Bright Ede|CB|2007|POL|69|82|6|2031
Lucas Noubi|CB|2005|BEL|66|75|3|2029
Dani Barcia|CB|2003|ESP|65|67|1.2|2028
Arnau Comas|CB|2000|ESP|64|64|0.5|2028
Giacomo Quagliata|LB|2000|ITA|72|72|4|2028
Angeliño|LB|1997|ESP|77|77|4|2027
Adrià Altimira|RB|2001|ESP|68|68|1.8|2029
Miguel Loureiro|RB|1996|ESP|72|72|1.2|2028
Ximo Navarro|RB|1990|ESP|68|68|0.1|2027
Marc Casadó|DM|2003|ESP|76|82|15|2027
Lorenzo Amatucci|DM|2004|ITA|72|76|10|2028
Riki Rodríguez|CM|1997|ESP|71|71|1.5|2029
Diego Villares|CM|1996|ESP|71|71|1|2028
Noé Carrillo|CM|2006|ESP|62|73|1|2029
Jonathan Asp Jensen|AM|2006|DEN|69|80|6|2031
Mario Soriano|AM|2002|ESP|72|72|6|2028
Yeremay Hernández|LW|2002|ESP|77|77|25|2030
David Mella|RW|2005|ESP|68|77|5|2029
Adama Traoré|RW|1996|ESP|75|75|4|2028
Luismi Cruz|RW|2001|ESP|69|69|2|2029
Bil Nsongo|ST|2004|CMR|69|73|5|2030
Pierre-Emerick Aubameyang|ST|1989|GAB|79|79|2.5|2028
Zakaria Eddahchouri|ST|2000|NED|70|70|2.5|2028`,
    },
    {
      id: 'rac', name: 'Real Racing Club', short: 'RAC', city: 'Santander', stadium: 'El Sardinero', capacity: 22222,
      colors: ['#FFFFFF', '#0B7A3E'], reputation: 65, budget: 8,
      players: `Julen Agirrezabala|GK|2000|ESP|74|74|6|2031
Simon Eriksson|GK|2006|SWE|65|76|2|2030
Jeanuël Belocian|CB|2005|FRA|72|82|12|2027
Facundo González|CB|2003|URU|68|70|3|2029
Pedro Felipe|CB|2004|BRA|65|69|1.5|2030
Manu Hernando|CB|1998|ESP|70|70|1.4|2028
Pablo Ramón|CB|2001|ESP|67|67|1.4|2029
Jorge Salinas|LB|2007|ESP|71|84|10|2029
Aarón Martín|LB|1997|ESP|75|75|5|2027
Álvaro Mantilla|RB|2000|ESP|68|68|1.2|2028
Matteo Prati|DM|2003|ITA|71|77|5.5|2027
Maguette Gueye|DM|2002|SEN|68|68|2.5|2029
Iván Martín|CM|1999|ESP|76|76|3|2030
Íñigo Sainz-Maza|CM|1998|ESP|69|69|1|2028
André Almeida|AM|2000|POR|74|76|5|2027
Sergio Canales|AM|1991|ESP|80|80|3|2028
Iñigo Vicente|LW|1998|ESP|76|76|7|2030
Giorgi Guliashvili|LW|2001|GEO|71|71|3.5|2029
Andrés Martín|RW|1999|ESP|76|76|8|2028
Pablo García|RW|2006|ESP|70|81|8|2030
Iker Luque|RW|2005|ESP|65|74|2|2030
Yassir Zabiri|ST|2005|MAR|74|83|20|2027
Asier Villalibre|ST|1997|ESP|71|71|1.5|2029
Juan Carlos Arana|ST|2000|ESP|67|67|1|2028`,
    },
    {
      id: 'mal', name: 'Málaga CF', short: 'MAL', city: 'Málaga', stadium: 'La Rosaleda', capacity: 30044,
      colors: ['#87CEEB', '#FFFFFF'], reputation: 66, budget: 8,
      players: `Alfonso Herrero|GK|1994|ESP|69|69|0.4|2028
Carlos López|GK|2004|ESP|55|58|0.1|2029
Fernando Calero|CB|1995|ESP|74|74|2|2027
Diego Murillo|CB|2001|ESP|68|68|1.5|2029
Juan Berrocal|CB|1999|ESP|69|69|1.5|2027
Ángel Recio|CB|2003|ESP|64|66|1|2029
Einar Galilea|CB|1994|ESP|69|69|0.35|2027
Álex Pastor|CB|1999|ESP|63|63|0.3|2028
Adam Aznou|LB|2006|MAR|69|82|6|2027
José Salinas|LB|2000|ESP|70|72|2|2027
Rafita Garrido|RB|2004|ESP|65|69|1.5|2029
Carlos Puga|RB|2000|ESP|67|67|1|2029
Jens Cajuste|DM|1999|SWE|75|75|7|2027
Izan Merino|CM|2006|ESP|68|79|5|2028
Pablo Martínez|CM|1998|ESP|72|73|3|2027
Carlos Dotor|CM|2001|ESP|67|67|1.2|2027
Ramón Enríquez|CM|2001|ESP|63|63|0.4|2027
Dani Lorenzo|AM|2003|ESP|67|69|2.5|2029
Rafa Rodríguez|AM|2003|ESP|64|66|1|2028
Aarón Ochoa|AM|2007|IRL|61|74|0.8|2029
Joaquín Muñoz|LW|1999|ESP|71|71|2|2027
Juan Cruz|LW|2000|ESP|71|71|1.8|2027
Julen Lobete|LW|2000|ESP|68|68|1.2|2027
David Larrubia|RW|2002|ESP|72|72|6|2028
Haitam Abaida|RW|2002|MAR|59|59|0.2|2027
Chupe|ST|2004|ESP|72|76|10|2029
Adrián Niño|ST|2004|ESP|66|70|2|2029
Eneko Jauregi|ST|1996|ESP|70|70|0.7|2027`,
    },
  ],
  tier2: [
    { id: 'mll', name: 'RCD Mallorca', short: 'MLL', city: 'Palma', stadium: 'Estadi Mallorca Son Moix', capacity: 26020, colors: ['#E20613', '#000000'], reputation: 67 },
    { id: 'gir', name: 'Girona FC', short: 'GIR', city: 'Girona', stadium: 'Estadi Montilivi', capacity: 14624, colors: ['#CD2534', '#FFFFFF'], reputation: 71 },
    { id: 'ovi', name: 'Real Oviedo', short: 'OVI', city: 'Oviedo', stadium: 'Estadio Carlos Tartiere', capacity: 30500, colors: ['#0055A4', '#FFFFFF'], reputation: 60 },
    { id: 'leg', name: 'CD Leganés', short: 'LEG', city: 'Leganés', stadium: 'Estadio Municipal de Butarque', capacity: 12450, colors: ['#FFFFFF', '#0047AB'], reputation: 64 },
    { id: 'lpa', name: 'UD Las Palmas', short: 'LPA', city: 'Las Palmas de Gran Canaria', stadium: 'Estadio de Gran Canaria', capacity: 32400, colors: ['#FFE400', '#0054A6'], reputation: 66 },
    { id: 'rvd', name: 'Real Valladolid', short: 'VLL', city: 'Valladolid', stadium: 'Estadio José Zorrilla', capacity: 27618, colors: ['#5B2C83', '#FFFFFF'], reputation: 64 },
    { id: 'spo', name: 'Real Sporting de Gijón', short: 'SPO', city: 'Gijón', stadium: 'El Molinón', capacity: 29371, colors: ['#E30613', '#FFFFFF'], reputation: 63 },
    { id: 'zar', name: 'Real Zaragoza', short: 'ZAR', city: 'Zaragoza', stadium: 'Ibercaja Estadio', capacity: 20000, colors: ['#FFFFFF', '#0047AB'], reputation: 62 },
    { id: 'alm', name: 'UD Almería', short: 'ALM', city: 'Almería', stadium: 'Estadio de los Juegos Mediterráneos', capacity: 20000, colors: ['#E30613', '#FFFFFF'], reputation: 64 },
    { id: 'gra', name: 'Granada CF', short: 'GRA', city: 'Granada', stadium: 'Nuevo Estadio de Los Cármenes', capacity: 19336, colors: ['#C8102E', '#FFFFFF'], reputation: 63 },
    { id: 'alb', name: 'Albacete Balompié', short: 'ALB', city: 'Albacete', stadium: 'Estadio Carlos Belmonte', capacity: 17524, colors: ['#FFFFFF', '#111111'], reputation: 60 },
    { id: 'and', name: 'FC Andorra', short: 'AND', city: 'Encamp', stadium: 'Nou Estadi Encamp', capacity: 5108, colors: ['#1D2B5E', '#E3B505'], reputation: 58 },
    { id: 'bur', name: 'Burgos CF', short: 'BUR', city: 'Burgos', stadium: 'Estadio El Plantío', capacity: 12194, colors: ['#FFFFFF', '#111111'], reputation: 59 },
    { id: 'cad', name: 'Cádiz CF', short: 'CAD', city: 'Cádiz', stadium: 'Estadio Nuevo Mirandilla', capacity: 20724, colors: ['#FFE600', '#0033A0'], reputation: 63 },
    { id: 'cas', name: 'CD Castellón', short: 'CAS', city: 'Castellón de la Plana', stadium: 'Estadio Castàlia', capacity: 15500, colors: ['#111111', '#FFFFFF'], reputation: 60 },
    { id: 'ceu', name: 'AD Ceuta FC', short: 'CEU', city: 'Ceuta', stadium: 'Estadio Alfonso Murube', capacity: 6500, colors: ['#FFFFFF', '#111111'], reputation: 55 },
    { id: 'cor', name: 'Córdoba CF', short: 'COR', city: 'Córdoba', stadium: 'Estadio Nuevo Arcángel', capacity: 20989, colors: ['#FFFFFF', '#00843D'], reputation: 60 },
    { id: 'cul', name: 'Cultural Leonesa', short: 'CUL', city: 'León', stadium: 'Estadio Reino de León', capacity: 13346, colors: ['#FFFFFF', '#003DA5'], reputation: 56 },
    { id: 'eib', name: 'SD Eibar', short: 'EIB', city: 'Eibar', stadium: 'Estadio Municipal de Ipurua', capacity: 8164, colors: ['#7A1F2B', '#1E3A8A'], reputation: 61 },
    { id: 'hue', name: 'SD Huesca', short: 'HUE', city: 'Huesca', stadium: 'Estadio El Alcoraz', capacity: 9100, colors: ['#00337F', '#C8102E'], reputation: 59 },
    { id: 'mir', name: 'CD Mirandés', short: 'MIR', city: 'Miranda de Ebro', stadium: 'Estadio Municipal de Anduva', capacity: 5759, colors: ['#E30613', '#111111'], reputation: 58 },
    { id: 'rsb', name: 'Real Sociedad B', short: 'RSB', city: 'San Sebastián', stadium: 'Estadio Zubieta', capacity: 4000, colors: ['#FFFFFF', '#0067B1'], reputation: 55, parent: 'rso' },
  ],
  tier3: {
    name: 'Primera Federación',
    groups: [
      { name: 'Grupo 1', clubs: [
        { id: 'e3_are', name: 'Arenas Club de Getxo', short: 'ARE', city: 'Getxo', stadium: 'Gobela', capacity: 2000, colors: ['#E30613', '#111111'], reputation: 46 },
        { id: 'e3_art', name: 'CD Arenteiro', short: 'ART', city: 'O Carballiño', stadium: 'Espiñedo', capacity: 4500, colors: ['#1E5BB8', '#FFFFFF'], reputation: 45 },
        { id: 'e3_avi', name: 'Real Avilés Industrial', short: 'AVI', city: 'Avilés', stadium: 'Román Suárez Puerta', capacity: 5400, colors: ['#FFFFFF', '#0047AB'], reputation: 47 },
        { id: 'e3_bar', name: 'Barakaldo CF', short: 'BAR', city: 'Barakaldo', stadium: 'Lasesarre', capacity: 7960, colors: ['#FFE600', '#111111'], reputation: 48 },
        { id: 'e3_bil', name: 'Bilbao Athletic', short: 'BIL', city: 'Bilbao', stadium: 'Lezama', capacity: 3250, colors: ['#E30613', '#FFFFFF'], reputation: 50, parent: 'ath' },
        { id: 'e3_cac', name: 'CP Cacereño', short: 'CAC', city: 'Cáceres', stadium: 'Príncipe Felipe', capacity: 7000, colors: ['#00843D', '#FFFFFF'], reputation: 46 },
        { id: 'e3_clf', name: 'RC Celta Fortuna', short: 'CLF', city: 'Vigo', stadium: 'Balaídos', capacity: 24870, colors: ['#8AC3EE', '#FFFFFF'], reputation: 49, parent: 'cel' },
        { id: 'e3_gua', name: 'CD Guadalajara', short: 'GUA', city: 'Guadalajara', stadium: 'Pedro Escartín', capacity: 8000, colors: ['#FFFFFF', '#003399'], reputation: 47 },
        { id: 'e3_lug', name: 'CD Lugo', short: 'LUG', city: 'Lugo', stadium: 'Anxo Carro', capacity: 7070, colors: ['#E30613', '#FFFFFF'], reputation: 52 },
        { id: 'e3_mer', name: 'Mérida AD', short: 'MER', city: 'Mérida', stadium: 'Estadio Romano', capacity: 14600, colors: ['#111111', '#FFFFFF'], reputation: 48 },
        { id: 'e3_osb', name: 'CA Osasuna B', short: 'OSB', city: 'Pamplona', stadium: 'Tajonar', capacity: 4500, colors: ['#D91A21', '#0A346F'], reputation: 47, parent: 'osa' },
        { id: 'e3_our', name: 'Ourense CF', short: 'OUR', city: 'Ourense', stadium: 'O Couto', capacity: 5659, colors: ['#FFFFFF', '#111111'], reputation: 45 },
        { id: 'e3_pon', name: 'SD Ponferradina', short: 'PON', city: 'Ponferrada', stadium: 'El Toralín', capacity: 8400, colors: ['#003DA5', '#FFFFFF'], reputation: 52 },
        { id: 'e3_ptv', name: 'Pontevedra CF', short: 'PTV', city: 'Pontevedra', stadium: 'Pasarón', capacity: 12000, colors: ['#E30613', '#FFFFFF'], reputation: 50 },
        { id: 'e3_fer', name: 'Racing de Ferrol', short: 'FER', city: 'Ferrol', stadium: 'A Malata', capacity: 12043, colors: ['#008542', '#FFFFFF'], reputation: 53 },
        { id: 'e3_rmc', name: 'Real Madrid Castilla', short: 'RMC', city: 'Madrid', stadium: 'Alfredo di Stéfano', capacity: 6000, colors: ['#FFFFFF', '#5B2C83'], reputation: 52, parent: 'rma' },
        { id: 'e3_tal', name: 'CF Talavera de la Reina', short: 'TAL', city: 'Talavera de la Reina', stadium: 'El Prado', capacity: 5000, colors: ['#002B7F', '#FFFFFF'], reputation: 45 },
        { id: 'e3_ten', name: 'CD Tenerife', short: 'TEN', city: 'Santa Cruz de Tenerife', stadium: 'Heliodoro Rodríguez López', capacity: 22824, colors: ['#FFFFFF', '#0047AB'], reputation: 56 },
        { id: 'e3_uni', name: 'Unionistas de Salamanca CF', short: 'UNI', city: 'Salamanca', stadium: 'Reina Sofía', capacity: 5000, colors: ['#111111', '#FFFFFF'], reputation: 47 },
        { id: 'e3_zam', name: 'Zamora CF', short: 'ZAM', city: 'Zamora', stadium: 'Ruta de la Plata', capacity: 7813, colors: ['#C8102E', '#FFFFFF'], reputation: 49 },
      ] },
      { name: 'Grupo 2', clubs: [
        { id: 'e3_alc', name: 'AD Alcorcón', short: 'ALC', city: 'Alcorcón', stadium: 'Santo Domingo', capacity: 5100, colors: ['#FFD100', '#0033A0'], reputation: 51 },
        { id: 'e3_alg', name: 'Algeciras CF', short: 'ALG', city: 'Algeciras', stadium: 'Nuevo Mirador', capacity: 7200, colors: ['#E30613', '#FFFFFF'], reputation: 50 },
        { id: 'e3_ant', name: 'Antequera CF', short: 'ANT', city: 'Antequera', stadium: 'El Maulí', capacity: 6000, colors: ['#009B3A', '#FFFFFF'], reputation: 48 },
        { id: 'e3_atm', name: 'Atlético Madrileño', short: 'ATM', city: 'Alcalá de Henares', stadium: 'Centro Deportivo Alcalá de Henares', capacity: 2685, colors: ['#CB3524', '#FFFFFF'], reputation: 50, parent: 'atm' },
        { id: 'e3_san', name: 'Atlético Sanluqueño CF', short: 'SAN', city: 'Sanlúcar de Barrameda', stadium: 'El Palmar', capacity: 5000, colors: ['#00843D', '#FFFFFF'], reputation: 46 },
        { id: 'e3_btd', name: 'Betis Deportivo', short: 'BTD', city: 'Sevilla', stadium: 'Luis del Sol', capacity: 1300, colors: ['#00954C', '#FFFFFF'], reputation: 47, parent: 'bet' },
        { id: 'e3_crt', name: 'FC Cartagena', short: 'CRT', city: 'Cartagena', stadium: 'Cartagonova', capacity: 15105, colors: ['#111111', '#FFFFFF'], reputation: 55 },
        { id: 'e3_eld', name: 'CD Eldense', short: 'ELD', city: 'Elda', stadium: 'Estadio Pepico Amat', capacity: 4036, colors: ['#E30613', '#003DA5'], reputation: 51 },
        { id: 'e3_eur', name: 'CE Europa', short: 'EUR', city: 'Barcelona', stadium: 'Nou Sardenya', capacity: 7000, colors: ['#E30613', '#FFFFFF'], reputation: 46 },
        { id: 'e3_gim', name: 'Gimnàstic de Tarragona', short: 'GIM', city: 'Tarragona', stadium: 'Nou Estadi', capacity: 14591, colors: ['#E30613', '#FFFFFF'], reputation: 52 },
        { id: 'e3_her', name: 'Hércules CF', short: 'HER', city: 'Alicante', stadium: 'José Rico Pérez', capacity: 30000, colors: ['#003DA5', '#FFFFFF'], reputation: 53 },
        { id: 'e3_ibi', name: 'UD Ibiza', short: 'IBI', city: 'Ibiza', stadium: 'Can Misses', capacity: 6000, colors: ['#00A3E0', '#FFFFFF'], reputation: 50 },
        { id: 'e3_jto', name: 'Juventud de Torremolinos CF', short: 'JTO', city: 'Torremolinos', stadium: 'El Pozuelo', capacity: 3000, colors: ['#FFFFFF', '#00843D'], reputation: 44 },
        { id: 'e3_mrb', name: 'Marbella FC', short: 'MRB', city: 'Marbella', stadium: 'Municipal de Marbella', capacity: 7300, colors: ['#0047AB', '#FFFFFF'], reputation: 47 },
        { id: 'e3_mur', name: 'Real Murcia', short: 'MUR', city: 'Murcia', stadium: 'Enrique Roca', capacity: 31179, colors: ['#C8102E', '#FFFFFF'], reputation: 53 },
        { id: 'e3_sab', name: 'CE Sabadell FC', short: 'SAB', city: 'Sabadell', stadium: 'Nova Creu Alta', capacity: 11908, colors: ['#0067B1', '#FFFFFF'], reputation: 50 },
        { id: 'e3_sva', name: 'Sevilla Atlético', short: 'SVA', city: 'Sevilla', stadium: 'Jesús Navas', capacity: 8000, colors: ['#FFFFFF', '#D81E05'], reputation: 49, parent: 'sev' },
        { id: 'e3_tar', name: 'SD Tarazona', short: 'TAR', city: 'Tarazona', stadium: 'Municipal de Tarazona', capacity: 5000, colors: ['#E30613', '#FFFFFF'], reputation: 44 },
        { id: 'e3_ter', name: 'CD Teruel', short: 'TER', city: 'Teruel', stadium: 'Pinilla', capacity: 4500, colors: ['#E30613', '#FFFFFF'], reputation: 45 },
        { id: 'e3_vlb', name: 'Villarreal CF B', short: 'VLB', city: 'Villarreal', stadium: 'Mini Estadi', capacity: 3500, colors: ['#FFE667', '#005187'], reputation: 50, parent: 'vil' },
      ] },
    ],
  },
};
