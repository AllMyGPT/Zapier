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
      players: `Thibaut Courtois|GK|1992|BEL|89|89
Andriy Lunin|GK|1999|UKR|79|81
Fran González|GK|2005|ESP|62|78
Dani Carvajal|RB|1992|ESP|84|84
Trent Alexander-Arnold|RB|1998|ENG|86|87
Éder Militão|CB|1998|BRA|84|85
Antonio Rüdiger|CB|1993|GER|86|86
Dean Huijsen|CB|2005|ESP|81|89
David Alaba|CB|1992|AUT|80|80
Raúl Asencio|CB|2003|ESP|76|83
Álvaro Carreras|LB|2003|ESP|80|86
Ferland Mendy|LB|1995|FRA|80|80
Aurélien Tchouaméni|DM|2000|FRA|85|87
Federico Valverde|CM|1998|URU|88|88
Jude Bellingham|AM|2003|ENG|89|93
Eduardo Camavinga|CM|2002|FRA|83|88
Dani Ceballos|CM|1996|ESP|79|79
Arda Güler|AM|2005|TUR|82|90
Brahim Díaz|AM|1999|MAR|80|81
Franco Mastantuono|RW|2007|ARG|74|90
Kylian Mbappé|ST|1998|FRA|91|92
Vinícius Júnior|LW|2000|BRA|89|90
Rodrygo|RW|2001|BRA|84|86
Endrick|ST|2006|BRA|75|88`,
    },
    {
      id: 'fcb', name: 'FC Barcelona', short: 'FCB', city: 'Barcelona', stadium: 'Spotify Camp Nou', capacity: 99354,
      colors: ['#A50044', '#004D98'], reputation: 96, budget: 60,
      players: `Joan García|GK|2001|ESP|83|87
Marc-André ter Stegen|GK|1992|GER|85|85
Wojciech Szczęsny|GK|1990|POL|80|80
Jules Koundé|RB|1998|FRA|86|86
Pau Cubarsí|CB|2007|ESP|83|91
Ronald Araujo|CB|1999|URU|83|84
Andreas Christensen|CB|1996|DEN|80|80
Eric García|CB|2001|ESP|78|80
Alejandro Balde|LB|2003|ESP|82|87
Gerard Martín|LB|2002|ESP|74|78
Jofre Torrents|LB|2007|ESP|60|76
Pedri|CM|2002|ESP|89|91
Frenkie de Jong|CM|1997|NED|86|86
Gavi|CM|2004|ESP|82|87
Fermín López|AM|2003|ESP|81|86
Dani Olmo|AM|1998|ESP|84|84
Marc Casadó|DM|2003|ESP|77|83
Marc Bernal|DM|2007|ESP|68|84
Lamine Yamal|RW|2007|ESP|88|95
Raphinha|LW|1996|BRA|88|88
Robert Lewandowski|ST|1988|POL|86|86
Ferran Torres|ST|2000|ESP|80|81
Marcus Rashford|LW|1997|ENG|81|82
Roony Bardghji|RW|2005|SWE|70|82`,
    },
    {
      id: 'atm', name: 'Atlético de Madrid', short: 'ATM', city: 'Madrid', stadium: 'Riyadh Air Metropolitano', capacity: 70460,
      colors: ['#CB3524', '#FFFFFF'], reputation: 91, budget: 90,
      players: `Jan Oblak|GK|1993|SVN|87|87
Juan Musso|GK|1994|ARG|78|78
Salvi Esquivel|GK|2004|ESP|60|72
Robin Le Normand|CB|1996|ESP|82|82
José María Giménez|CB|1995|URU|82|82
Clément Lenglet|CB|1995|FRA|78|78
Dávid Hancko|CB|1997|SVK|82|83
Marc Pubill|RB|2003|ESP|75|82
Nahuel Molina|RB|1998|ARG|79|80
Matteo Ruggeri|LB|2002|ITA|77|81
Marcos Llorente|CM|1995|ESP|82|82
Koke|CM|1992|ESP|80|80
Pablo Barrios|CM|2003|ESP|81|87
Conor Gallagher|CM|2000|ENG|81|82
Johnny Cardoso|DM|2001|USA|79|82
Álex Baena|AM|2001|ESP|83|85
Thiago Almada|AM|2001|ARG|79|82
Giuliano Simeone|RW|2002|ARG|78|83
Nicolás González|LW|1998|ARG|80|80
Antoine Griezmann|ST|1991|FRA|84|84
Julián Álvarez|ST|2000|ARG|87|89
Alexander Sørloth|ST|1995|NOR|81|81
Giacomo Raspadori|ST|2000|ITA|78|79`,
    },
    {
      id: 'ath', name: 'Athletic Club', short: 'ATH', city: 'Bilbao', stadium: 'San Mamés', capacity: 53289,
      colors: ['#EE2523', '#FFFFFF'], reputation: 84, budget: 40,
      players: `Unai Simón|GK|1997|ESP|85|85
Álex Padilla|GK|2003|MEX|70|77
Mikel Santos|GK|2004|ESP|58|70
Dani Vivian|CB|1999|ESP|81|82
Yeray Álvarez|CB|1995|ESP|77|77
Aitor Paredes|CB|2000|ESP|77|79
Aymeric Laporte|CB|1994|ESP|80|80
Andoni Gorosabel|RB|1996|ESP|76|76
Jesús Areso|RB|1999|ESP|76|77
Yuri Berchiche|LB|1990|ESP|77|77
Adama Boiro|LB|2002|ESP|70|76
Mikel Vesga|DM|1993|ESP|75|75
Mikel Jauregizar|CM|2003|ESP|77|84
Iñigo Ruiz de Galarreta|CM|1993|ESP|77|77
Beñat Prados|CM|2001|ESP|74|79
Oihan Sancet|AM|2000|ESP|82|84
Unai Gómez|AM|2003|ESP|74|79
Alejandro Rego|CM|2003|ESP|70|78
Nico Williams|LW|2002|ESP|85|88
Iñaki Williams|RW|1994|GHA|81|81
Álex Berenguer|LW|1995|ESP|77|77
Robert Navarro|RW|2002|ESP|76|79
Gorka Guruzeta|ST|1996|ESP|78|78
Maroan Sannadi|ST|2001|MAR|72|77`,
    },
    {
      id: 'vil', name: 'Villarreal CF', short: 'VIL', city: 'Villarreal', stadium: 'Estadio de la Cerámica', capacity: 23500,
      colors: ['#FFE667', '#005187'], reputation: 82, budget: 45,
      players: `Luiz Júnior|GK|2001|BRA|78|82
Arnau Tenas|GK|2001|ESP|74|78
Diego Conde|GK|1998|ESP|73|74
Juan Foyth|RB|1998|ARG|80|80
Rafa Marín|CB|2002|ESP|77|83
Renato Veiga|CB|2003|POR|78|84
Logan Costa|CB|2001|CPV|77|80
Willy Kambwala|CB|2004|FRA|73|80
Sergi Cardona|LB|1999|ESP|76|77
Alfonso Pedraza|LB|1996|ESP|77|77
Santiago Mouriño|CB|2002|URU|74|79
Thomas Partey|DM|1993|GHA|80|80
Pape Gueye|CM|1999|SEN|78|79
Santi Comesaña|CM|1996|ESP|77|77
Dani Parejo|CM|1989|ESP|78|78
Pau Cabanes|AM|2005|ESP|62|76
Dani Budesca|CM|2004|ESP|62|74
Alberto Moleiro|AM|2003|ESP|79|85
Tajon Buchanan|RW|1999|CAN|75|77
Nicolas Pépé|RW|1995|CIV|78|78
Gerard Moreno|ST|1992|ESP|80|80
Ayoze Pérez|ST|1993|ESP|80|80
Georges Mikautadze|ST|2000|GEO|78|81
Tani Oluwaseyi|ST|2000|CAN|72|75`,
    },
    {
      id: 'bet', name: 'Real Betis Balompié', short: 'BET', city: 'Sevilla', stadium: 'Estadio Benito Villamarín', capacity: 60721,
      colors: ['#0BB363', '#FFFFFF'], reputation: 81, budget: 35,
      players: `Álvaro Valles|GK|1997|ESP|77|78
Pau López|GK|1994|ESP|76|76
Adrián San Miguel|GK|1987|ESP|70|70
Héctor Bellerín|RB|1995|ESP|76|76
Aitor Ruibal|RB|1996|ESP|75|75
Natan|CB|2001|BRA|77|81
Marc Bartra|CB|1991|ESP|75|75
Diego Llorente|CB|1993|ESP|77|77
Valentín Gómez|CB|2003|ARG|74|80
Junior Firpo|LB|1996|DOM|75|75
Ricardo Rodríguez|LB|1992|SUI|75|75
Marc Roca|DM|1996|ESP|78|78
Sofyan Amrabat|DM|1996|MAR|78|78
Sergi Altimira|CM|2001|ESP|75|79
Pablo Fornals|CM|1996|ESP|79|79
Isco|AM|1992|ESP|81|81
Giovani Lo Celso|AM|1996|ARG|80|80
Nelson Deossa|CM|2000|COL|73|77
Antony|RW|2000|BRA|80|81
Abde Ezzalzouli|LW|2001|MAR|79|81
Rodrigo Riquelme|LW|2000|ESP|76|78
Cucho Hernández|ST|1999|COL|79|80
Chimy Ávila|ST|1994|ARG|74|74
Cédric Bakambu|ST|1991|COD|73|73`,
    },
    {
      id: 'cel', name: 'RC Celta de Vigo', short: 'CEL', city: 'Vigo', stadium: 'Abanca-Balaídos', capacity: 24791,
      colors: ['#8AC3EE', '#FFFFFF'], reputation: 76, budget: 20,
      players: `Ionuț Radu|GK|1997|ROU|76|77
Iván Villar|GK|1997|ESP|72|73
Marc Vidal|GK|2000|ESP|65|70
Óscar Mingueza|RB|1999|ESP|78|79
Javi Rueda|RB|2002|ESP|71|76
Carl Starfelt|CB|1995|SWE|76|76
Javi Rodríguez|CB|2003|ESP|75|81
Marcos Alonso|CB|1990|ESP|76|76
Joseph Aidoo|CB|1995|GHA|73|73
Manu Fernández|CB|2001|ESP|70|75
Sergio Carreira|LB|2000|ESP|73|76
Fran Beltrán|CM|1999|ESP|77|78
Ilaix Moriba|CM|2003|GUI|76|81
Hugo Sotelo|CM|2003|ESP|73|79
Damián Rodríguez|CM|2003|ESP|71|77
Miguel Román|DM|2003|ESP|70|76
Fer López|AM|2004|ESP|70|79
Hugo Álvarez|LW|2003|ESP|74|80
Williot Swedberg|AM|2004|SWE|74|79
Bryan Zaragoza|LW|2001|ESP|76|79
Iago Aspas|ST|1987|ESP|79|79
Borja Iglesias|ST|1993|ESP|77|77
Ferran Jutglà|ST|1999|ESP|74|75
Jones El-Abdellaoui|ST|2006|NOR|62|76`,
    },
    {
      id: 'ray', name: 'Rayo Vallecano', short: 'RAY', city: 'Madrid', stadium: 'Estadio de Vallecas', capacity: 14708,
      colors: ['#FFFFFF', '#E53027'], reputation: 72, budget: 12,
      players: `Augusto Batalla|GK|1996|ARG|78|78
Dani Cárdenas|GK|1997|ESP|71|72
Adrián Molina|GK|2005|ESP|56|68
Andrei Rațiu|RB|1998|ROU|78|79
Iván Balliu|RB|1992|ALB|74|74
Florian Lejeune|CB|1991|FRA|77|77
Luiz Felipe|CB|1997|ITA|75|75
Abdul Mumin|CB|1998|GHA|74|75
Nobel Mendy|CB|2004|SEN|72|78
Pep Chavarría|LB|1998|ESP|76|77
Jozhua Vertrouwd|LB|2004|NED|68|76
Óscar Valentín|DM|1994|ESP|76|76
Pathé Ciss|DM|1994|SEN|76|76
Unai López|CM|1995|ESP|76|76
Pedro Díaz|CM|1998|ESP|74|75
Gerard Gumbau|CM|1994|ESP|73|73
Diego Méndez|CM|2005|ARG|64|76
Óscar Trejo|AM|1988|ARG|74|74
Isi Palazón|RW|1994|ESP|78|78
Jorge de Frutos|RW|1997|ESP|77|77
Álvaro García|LW|1992|ESP|76|76
Fran Pérez|RW|2002|ESP|72|77
Sergio Camello|ST|2001|ESP|74|76
Alemão|ST|1998|BRA|74|75`,
    },
    {
      id: 'osa', name: 'CA Osasuna', short: 'OSA', city: 'Pamplona', stadium: 'El Sadar', capacity: 23576,
      colors: ['#D91A21', '#0A346F'], reputation: 72, budget: 10,
      players: `Sergio Herrera|GK|1993|ESP|77|77
Aitor Fernández|GK|1991|ESP|73|73
Dimitrios Stamatakis|GK|2003|GRE|60|70
Valentin Rosier|RB|1996|FRA|74|74
Iker Benito|RB|2002|ESP|68|74
Alejandro Catena|CB|1994|ESP|78|78
Enzo Boyomo|CB|2001|CMR|76|80
Jorge Herrando|CB|2001|ESP|72|76
Juan Cruz|CB|1992|ESP|72|72
Flavien Boyomo|CB|2005|CMR|62|74
Abel Bretones|LB|2000|ESP|74|76
Javi Galán|LB|1994|ESP|75|75
Lucas Torró|DM|1994|ESP|77|77
Jon Moncayola|CM|1998|ESP|77|77
Iker Muñoz|CM|2002|ESP|72|77
Aimar Oroz|AM|2001|ESP|76|79
Asier Osambela|CM|2004|ESP|66|75
Rubén García|AM|1993|ESP|75|75
Moi Gómez|AM|1994|ESP|75|75
Kike Barja|LW|1997|ESP|71|71
Víctor Muñoz|LW|2003|ESP|74|80
Ante Budimir|ST|1991|CRO|79|79
Raúl García de Haro|ST|2000|ESP|72|75
Sheraldo Becker|RW|1995|SUR|72|72`,
    },
    {
      id: 'mll', name: 'RCD Mallorca', short: 'MLL', city: 'Palma', stadium: 'Estadi Mallorca Son Moix', capacity: 26020,
      colors: ['#E20613', '#000000'], reputation: 71, budget: 12,
      players: `Leo Román|GK|2000|ESP|75|78
Dominik Greif|GK|1997|SVK|74|74
Lucas Bergström|GK|2002|FIN|68|75
Pablo Maffeo|RB|1997|ARG|76|76
Mateu Morey|RB|2000|ESP|71|73
Martin Valjent|CB|1995|SVK|77|77
Antonio Raíllo|CB|1991|ESP|76|76
Marash Kumbulla|CB|2000|ALB|74|75
Johan Mojica|LB|1992|COL|74|74
Toni Lato|LB|1997|ESP|72|72
Samú Costa|DM|2000|POR|77|79
Omar Mascarell|DM|1993|ESP|73|73
Manu Morlanes|CM|1999|ESP|74|75
Sergi Darder|CM|1993|ESP|76|76
Antonio Sánchez|CM|1997|ESP|73|73
Pablo Torre|AM|2003|ESP|73|79
Dani Rodríguez|AM|1988|ESP|72|72
Takuma Asano|RW|1994|JPN|73|73
Jan Virgili|LW|2006|ESP|66|80
Vedat Muriqi|ST|1994|KOS|78|78
Abdón Prats|ST|1992|ESP|71|71
Mateo Joseph|ST|2003|ESP|71|77`,
    },
    {
      id: 'rso', name: 'Real Sociedad', short: 'RSO', city: 'San Sebastián', stadium: 'Reale Arena', capacity: 39313,
      colors: ['#0067B1', '#FFFFFF'], reputation: 81, budget: 35,
      players: `Álex Remiro|GK|1995|ESP|82|82
Unai Marrero|GK|2001|ESP|71|76
Aitor Fraga|GK|2003|ESP|60|70
Jon Aramburu|RB|2002|VEN|75|79
Álvaro Odriozola|RB|1995|ESP|74|74
Igor Zubeldia|CB|1997|ESP|79|79
Aritz Elustondo|CB|1994|ESP|75|75
Duje Ćaleta-Car|CB|1996|CRO|76|76
Jon Martín|CB|2006|ESP|68|82
Sergio Gómez|LB|2000|ESP|76|77
Aihen Muñoz|LB|1997|ESP|73|73
Beñat Turrientes|CM|2002|ESP|76|80
Jon Gorrotxategi|DM|2003|ESP|72|78
Luka Sučić|CM|2002|CRO|78|82
Brais Méndez|CM|1997|ESP|79|79
Carlos Soler|CM|1997|ESP|78|78
Arsen Zakharyan|AM|2003|RUS|75|80
Pablo Marín|CM|2003|ESP|72|77
Takefusa Kubo|RW|2001|JPN|82|84
Mikel Oyarzabal|ST|1997|ESP|83|83
Ander Barrenetxea|LW|2001|ESP|77|79
Gonçalo Guedes|LW|1996|POR|76|76
Orri Óskarsson|ST|2004|ISL|74|81
Umar Sadiq|ST|1997|NGA|73|73`,
    },
    {
      id: 'val', name: 'Valencia CF', short: 'VAL', city: 'Valencia', stadium: 'Mestalla', capacity: 49430,
      colors: ['#FFFFFF', '#000000'], reputation: 79, budget: 15,
      players: `Julen Agirrezabala|GK|2000|ESP|76|80
Stole Dimitrievski|GK|1993|MKD|75|75
Cristian Rivero|GK|1998|ESP|66|68
Dimitri Foulquier|RB|1993|FRA|73|73
Thierry Correia|RB|1999|POR|72|73
Luis Rioja|LW|1993|ESP|74|74
Mouctar Diakhaby|CB|1996|GUI|76|76
César Tárrega|CB|2002|ESP|76|81
José Copete|CB|1999|ESP|74|76
Eray Cömert|CB|1998|SUI|73|73
José Luis Gayà|LB|1995|ESP|78|78
Jesús Vázquez|LB|2003|ESP|72|77
Pepelu|DM|1998|ESP|77|77
Javi Guerra|CM|2003|ESP|77|83
Baptiste Santamaría|DM|1995|FRA|75|75
André Almeida|CM|2000|POR|74|76
Filip Ugrinić|CM|1999|SUI|73|74
David Otorbi|CM|2007|ESP|58|74
Diego López|AM|2002|ESP|76|80
Largie Ramazani|LW|2001|BEL|74|76
Arnaut Danjuma|LW|1997|NED|75|75
Hugo Duro|ST|1999|ESP|77|77
Lucas Beltrán|ST|2001|ARG|74|77
Dani Raba|ST|1995|ESP|71|71`,
    },
    {
      id: 'get', name: 'Getafe CF', short: 'GET', city: 'Getafe', stadium: 'Coliseum', capacity: 16800,
      colors: ['#005999', '#FFFFFF'], reputation: 70, budget: 8,
      players: `David Soria|GK|1993|ESP|78|78
Jiří Letáček|GK|1999|CZE|68|71
Jorge Benito|GK|2004|ESP|56|68
Juan Iglesias|RB|1998|ESP|74|74
Kiko Femenía|RB|1991|ESP|72|72
Djené|CB|1991|TOG|77|77
Domingos Duarte|CB|1995|POR|76|76
Abdel Abqar|CB|1999|MAR|73|75
Zaid Romero|CB|2001|ARG|71|74
Diego Rico|LB|1993|ESP|73|73
Davinchi|LB|2007|ESP|60|76
Mauro Arambarri|DM|1995|URU|78|78
Luis Milla|CM|1994|ESP|78|78
Mario Martín|CM|2004|ESP|71|78
Yvan Neyou|CM|1997|CMR|71|71
Javi Muñoz|AM|1995|ESP|71|71
Yellu Santiago|DM|2004|ESP|62|74
Ismael Bekhoucha|CM|2006|MAR|58|72
Coba da Costa|RW|2002|POR|68|74
Álex Sola|RW|1999|ESP|72|74
Adrián Liso|LW|2005|ESP|70|80
Juanmi|LW|1993|ESP|72|72
Borja Mayoral|ST|1997|ESP|76|76
Abu Kamara|ST|2003|ENG|68|74`,
    },
    {
      id: 'esy', name: 'RCD Espanyol', short: 'ESP', city: 'Barcelona', stadium: 'RCDE Stadium', capacity: 40000,
      colors: ['#007FC8', '#FFFFFF'], reputation: 70, budget: 10,
      players: `Marko Dmitrović|GK|1992|SRB|77|77
Ángel Fortuño|GK|2001|ESP|66|72
Lluís Llach|GK|2004|ESP|58|70
Omar El Hilali|RB|2003|MAR|74|79
Rubén Sánchez|RB|2001|ESP|71|74
Leandro Cabrera|CB|1991|URU|76|76
Fernando Calero|CB|1995|ESP|74|74
Miguel Rubio|CB|1998|ESP|72|74
Clemens Riedel|CB|2003|GER|70|77
Carlos Romero|LB|2001|ESP|75|78
José Salinas|LB|2000|ESP|70|72
Pol Lozano|DM|1999|ESP|74|76
Urko González|DM|2001|ESP|73|77
Charles Pickel|DM|1997|COD|72|72
Edu Expósito|CM|1996|ESP|75|75
Ramón Terrats|CM|2000|ESP|72|74
Pere Milla|AM|1992|ESP|73|73
Nico Melamed|AM|2001|ESP|70|72
Jofre Carreras|RW|2001|ESP|72|75
Tyrhys Dolan|LW|2001|ENG|73|76
Antoniu Roca|LW|2002|ESP|70|76
Javi Puado|ST|1998|ESP|77|77
Roberto Fernández|ST|2002|ESP|73|77
Kike García|ST|1989|ESP|73|73`,
    },
    {
      id: 'ala', name: 'Deportivo Alavés', short: 'ALA', city: 'Vitoria-Gasteiz', stadium: 'Mendizorrotza', capacity: 19840,
      colors: ['#0761AF', '#FFFFFF'], reputation: 68, budget: 8,
      players: `Antonio Sivera|GK|1996|ESP|77|77
Raúl Fernández|GK|1988|ESP|68|68
Jesús Owono|GK|2001|EQG|66|71
Nahuel Tenaglia|RB|1996|ARG|74|74
Jonny Otto|RB|1994|ESP|72|72
Facundo Garcés|CB|1999|ARG|73|75
Jon Pacheco|CB|2001|ESP|73|76
Víctor Parada|CB|2002|ESP|71|75
Moussa Diarra|CB|2000|MLI|72|74
Youssef Enríquez|LB|2006|ESP|62|76
Ville Koski|LB|2002|FIN|67|72
Antonio Blanco|DM|2000|ESP|76|78
Ander Guevara|DM|1997|ESP|73|73
Jon Guridi|CM|1995|ESP|74|74
Carles Aleñá|CM|1998|ESP|74|74
Pablo Ibáñez|CM|1998|ESP|72|73
Denis Suárez|AM|1994|ESP|73|73
Calebe|AM|2000|BRA|70|72
Carlos Vicente|RW|1999|ESP|75|76
Abde Rebbach|LW|1998|ALG|71|72
Ángel Pérez|LW|2005|ESP|62|74
Toni Martínez|ST|1997|ESP|75|75
Lucas Boyé|ST|1996|ARG|76|76
Mariano Díaz|ST|1993|DOM|71|71`,
    },
    {
      id: 'gir', name: 'Girona FC', short: 'GIR', city: 'Girona', stadium: 'Estadi Montilivi', capacity: 14624,
      colors: ['#CD2534', '#FFFFFF'], reputation: 75, budget: 20,
      players: `Paulo Gazzaniga|GK|1992|ARG|77|77
Dominik Livaković|GK|1995|CRO|79|79
Vladyslav Krapyvtsov|GK|2005|UKR|58|72
Arnau Martínez|RB|2003|ESP|77|81
Hugo Rincón|RB|2003|ESP|69|75
David López|CB|1989|ESP|74|74
Juanpe|CB|1991|ESP|73|73
Daley Blind|CB|1990|NED|76|76
Alejandro Francés|CB|2002|ESP|73|77
Vitor Reis|CB|2006|BRA|70|83
Àlex Moreno|LB|1993|ESP|75|75
Yangel Herrera|CM|1998|VEN|78|78
Axel Witsel|DM|1989|BEL|76|76
Jhon Solís|DM|2004|COL|72|78
Donny van de Beek|CM|1997|NED|75|75
Iván Martín|CM|1999|ESP|78|78
Thomas Lemar|AM|1995|FRA|75|75
Azzedine Ounahi|CM|2000|MAR|76|78
Viktor Tsygankov|RW|1997|UKR|79|79
Bryan Gil|LW|2001|ESP|75|77
Joel Roca|LW|2005|ESP|68|79
Vladyslav Vanat|ST|2002|UKR|76|80
Abel Ruiz|ST|2000|ESP|74|76
Cristhian Stuani|ST|1986|URU|72|72`,
    },
    {
      id: 'sev', name: 'Sevilla FC', short: 'SEV', city: 'Sevilla', stadium: 'Ramón Sánchez-Pizjuán', capacity: 43883,
      colors: ['#FFFFFF', '#D3001F'], reputation: 80, budget: 15,
      players: `Ørjan Nyland|GK|1990|NOR|76|76
Odysseas Vlachodimos|GK|1994|GRE|76|76
Alberto Flores|GK|2003|ESP|60|72
José Ángel Carmona|RB|2002|ESP|75|79
Juanlu Sánchez|RB|2003|ESP|74|79
César Azpilicueta|CB|1989|ESP|74|74
Kike Salas|CB|2002|ESP|74|78
Marcão|CB|1996|BRA|74|74
Tanguy Nianzou|CB|2002|FRA|73|76
Andrés Castrín|CB|2004|ESP|67|76
Gabriel Suazo|LB|1997|CHI|74|74
Lucien Agoumé|DM|2002|FRA|77|80
Nemanja Gudelj|DM|1991|SRB|75|75
Djibril Sow|CM|1997|SUI|75|75
Batista Mendy|CM|2000|FRA|72|75
Joan Jordán|CM|1994|ESP|72|72
Manu Bueno|CM|2004|ESP|68|76
Stanis Idumbo|AM|2005|BEL|62|76
Rubén Vargas|LW|1998|SUI|77|77
Peque Fernández|RW|2002|ESP|73|77
Chidera Ejuke|LW|1998|NGA|75|75
Isaac Romero|ST|2000|ESP|75|78
Akor Adams|ST|2000|NGA|75|78
Alexis Sánchez|ST|1988|CHI|73|73`,
    },
    {
      id: 'lev', name: 'Levante UD', short: 'LEV', city: 'Valencia', stadium: 'Ciutat de València', capacity: 26354,
      colors: ['#00428C', '#B5121B'], reputation: 64, budget: 6,
      players: `Mathew Ryan|GK|1992|AUS|74|74
Pablo Cuñat|GK|2002|ESP|65|72
Andrés Fernández|GK|1986|ESP|66|66
Jeremy Toljan|RB|1994|GER|71|71
Víctor García|RB|1997|ESP|68|69
Unai Elgezabal|CB|1993|ESP|72|72
Adrián de la Fuente|CB|2000|ESP|70|72
Matías Moreno|CB|2003|ARG|71|77
Alan Matturro|CB|2004|URU|68|76
Manu Sánchez|LB|2000|ESP|72|73
Diego Pampín|LB|2000|ESP|69|71
Oriol Rey|DM|1998|ESP|71|72
Kervin Arriaga|DM|1998|HON|71|72
Unai Vencedor|CM|2000|ESP|72|74
Pablo Martínez|CM|1998|ESP|71|72
Jon Ander Olasagasti|CM|2000|ESP|70|72
Carlos Álvarez|AM|2003|ESP|74|79
Iker Losada|AM|2001|ESP|69|72
Roger Brugué|RW|1996|ESP|71|71
José Luis Morales|LW|1987|ESP|70|70
Iván Romero|ST|2001|ESP|72|75
Karl Etta Eyong|ST|2003|CMR|72|79
Carlos Espí|ST|2005|ESP|66|77
Goduine Koyalipou|ST|2000|CTA|67|70`,
    },
    {
      id: 'elc', name: 'Elche CF', short: 'ELC', city: 'Elche', stadium: 'Estadio Martínez Valero', capacity: 31388,
      colors: ['#FFFFFF', '#05642C'], reputation: 63, budget: 6,
      players: `Matías Dituro|GK|1987|ARG|71|71
Iñaki Peña|GK|1999|ESP|74|76
Alejandro Iturbe|GK|2003|ESP|63|72
Álvaro Núñez|RB|2000|ESP|71|73
Héctor Fort|RB|2006|ESP|67|79
Pedro Bigas|CB|1990|ESP|71|71
David Affengruber|CB|2001|AUT|73|76
Víctor Chust|CB|2000|ESP|72|74
John Chetauya|CB|2004|ESP|62|72
Adrià Pedrosa|LB|1998|ESP|71|72
Léo Petrot|LB|1997|FRA|68|69
Marc Aguado|DM|2000|ESP|73|75
Aleix Febas|CM|1996|ESP|73|73
Martim Neto|CM|2003|POR|70|76
Rodrigo Mendoza|CM|2005|ESP|67|78
John Donald|CM|2000|ESP|67|69
Gonzalo Villar|CM|1998|ESP|71|71
Grady Diangana|AM|1998|COD|72|73
Germán Valera|LW|2002|ESP|70|75
Tete Morente|RW|1996|ESP|70|70
Yago Santiago|LW|2003|ESP|67|74
Rafa Mir|ST|1997|ESP|73|73
André Silva|ST|1995|POR|73|73
Álvaro Rodríguez|ST|2004|URU|70|77`,
    },
    {
      id: 'ovi', name: 'Real Oviedo', short: 'OVI', city: 'Oviedo', stadium: 'Estadio Carlos Tartiere', capacity: 30500,
      colors: ['#0055A4', '#FFFFFF'], reputation: 62, budget: 5,
      players: `Aarón Escandell|GK|1995|ESP|72|72
Horațiu Moldovan|GK|1998|ROU|71|73
Miguel Narváez|GK|2003|ESP|56|66
Nacho Vidal|RB|1995|ESP|71|71
Lucas Ahijado|RB|1995|ESP|68|68
David Costas|CB|1995|ESP|72|72
Dani Calvo|CB|1994|ESP|71|71
David Carmo|CB|1999|ANG|73|74
Eric Bailly|CB|1994|CIV|71|71
Oier Luengo|CB|1998|ESP|69|70
Rahim Alhassane|LB|2002|NIG|69|73
Javi López|LB|2002|ESP|69|73
Kwasi Sibo|DM|1998|GHA|70|72
Leander Dendoncker|DM|1995|BEL|73|73
Alberto Reina|CM|1990|ESP|70|70
Santiago Colombatto|CM|1997|ARG|72|72
Santi Cazorla|AM|1984|ESP|72|72
Luka Ilić|AM|1999|SRB|70|72
Ovie Ejaria|CM|1997|ENG|69|69
Ilyas Chaira|LW|2001|MAR|71|74
Haissem Hassan|RW|2002|FRA|70|74
Josip Brekalo|LW|1998|CRO|72|72
Salomón Rondón|ST|1989|VEN|72|72
Federico Viñas|ST|1998|URU|72|73`,
    },
  ],
  tier2: [
    { id: 'leg', name: 'CD Leganés', short: 'LEG', city: 'Leganés', stadium: 'Estadio Municipal de Butarque', capacity: 12450, colors: ['#FFFFFF', '#0047AB'], reputation: 64 },
    { id: 'lpa', name: 'UD Las Palmas', short: 'LPA', city: 'Las Palmas de Gran Canaria', stadium: 'Estadio de Gran Canaria', capacity: 32400, colors: ['#FFE400', '#0054A6'], reputation: 66 },
    { id: 'rvd', name: 'Real Valladolid', short: 'VLL', city: 'Valladolid', stadium: 'Estadio José Zorrilla', capacity: 27618, colors: ['#5B2C83', '#FFFFFF'], reputation: 64 },
    { id: 'dep', name: 'RC Deportivo de La Coruña', short: 'DEP', city: 'A Coruña', stadium: 'Estadio Abanca-Riazor', capacity: 32490, colors: ['#0E4C9A', '#FFFFFF'], reputation: 65 },
    { id: 'rac', name: 'Real Racing Club', short: 'RAC', city: 'Santander', stadium: 'El Sardinero', capacity: 22222, colors: ['#FFFFFF', '#0B7A3E'], reputation: 62 },
    { id: 'spo', name: 'Real Sporting de Gijón', short: 'SPO', city: 'Gijón', stadium: 'El Molinón', capacity: 29371, colors: ['#E30613', '#FFFFFF'], reputation: 63 },
    { id: 'zar', name: 'Real Zaragoza', short: 'ZAR', city: 'Zaragoza', stadium: 'Ibercaja Estadio', capacity: 20000, colors: ['#FFFFFF', '#0047AB'], reputation: 62 },
    { id: 'mal', name: 'Málaga CF', short: 'MAL', city: 'Málaga', stadium: 'La Rosaleda', capacity: 30044, colors: ['#87CEEB', '#FFFFFF'], reputation: 63 },
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
