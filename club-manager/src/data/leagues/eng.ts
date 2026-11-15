import type { RawLeague } from '../types';

export const LEAGUE: RawLeague = {
  id: 'eng',
  name: 'Liga Inglesa',
  country: 'Inglaterra',
  nat: 'ENG',
  tier2Name: 'Segunda Inglesa',
  clubs: [
    {
      id: 'e_ars', name: 'Arsenal', short: 'ARS', city: 'Londres', stadium: 'Emirates Stadium', capacity: 60704,
      colors: ['#EF0107', '#FFFFFF'], reputation: 92, budget: 120,
      players: `David Raya|GK|1995|ESP|87|87
Kepa Arrizabalaga|GK|1994|ESP|79|79
Tommy Setford|GK|2006|ENG|60|77
William Saliba|CB|2001|FRA|88|90
Gabriel Magalhães|CB|1997|BRA|87|87
Cristhian Mosquera|CB|2004|ESP|76|84
Piero Hincapié|CB|2002|ECU|80|84
Jurriën Timber|RB|2001|NED|83|86
Ben White|RB|1997|ENG|81|81
Riccardo Calafiori|LB|2002|ITA|80|84
Myles Lewis-Skelly|LB|2006|ENG|76|87
Declan Rice|CM|1999|ENG|88|89
Martín Zubimendi|DM|1999|ESP|86|87
Martin Ødegaard|AM|1998|NOR|87|87
Mikel Merino|CM|1996|ESP|83|83
Christian Nørgaard|DM|1994|DEN|79|79
Eberechi Eze|AM|1998|ENG|84|85
Ethan Nwaneri|AM|2007|ENG|76|88
Bukayo Saka|RW|2001|ENG|88|90
Noni Madueke|RW|2002|ENG|80|84
Gabriel Martinelli|LW|2001|BRA|82|83
Leandro Trossard|LW|1994|BEL|81|81
Viktor Gyökeres|ST|1998|SWE|86|86
Kai Havertz|ST|1999|GER|83|83`
    },
    {
      id: 'e_mci', name: 'Manchester City', short: 'MCI', city: 'Mánchester', stadium: 'Etihad Stadium', capacity: 53400,
      colors: ['#6CABDD', '#1C2C5B'], reputation: 94, budget: 150,
      players: `Gianluigi Donnarumma|GK|1999|ITA|89|89
James Trafford|GK|2002|ENG|77|83
Stefan Ortega|GK|1992|GER|78|78
Rúben Dias|CB|1997|POR|87|87
Joško Gvardiol|CB|2002|CRO|86|88
John Stones|CB|1994|ENG|81|81
Nathan Aké|CB|1995|NED|80|80
Abdukodir Khusanov|CB|2004|UZB|75|84
Rayan Aït-Nouri|LB|2001|ALG|81|83
Nico O'Reilly|LB|2005|ENG|74|85
Matheus Nunes|RB|1998|POR|80|80
Rico Lewis|CM|2004|ENG|77|84
Rodri|DM|1996|ESP|90|90
Tijjani Reijnders|CM|1998|NED|84|85
Bernardo Silva|CM|1994|POR|85|85
Mateo Kovačić|CM|1994|CRO|81|81
Nico González|DM|2002|ESP|79|82
Rayan Cherki|AM|2003|FRA|82|87
Phil Foden|AM|2000|ENG|85|86
Jérémy Doku|LW|2002|BEL|82|85
Savinho|RW|2004|BRA|79|86
Oscar Bobb|RW|2003|NOR|74|82
Erling Haaland|ST|2000|NOR|91|92
Omar Marmoush|ST|1999|EGY|83|84`
    },
    {
      id: 'e_liv', name: 'Liverpool', short: 'LIV', city: 'Liverpool', stadium: 'Anfield', capacity: 61276,
      colors: ['#C8102E', '#F6EB61'], reputation: 93, budget: 130,
      players: `Alisson Becker|GK|1992|BRA|88|88
Giorgi Mamardashvili|GK|2000|GEO|82|86
Freddie Woodman|GK|1997|ENG|65|65
Trey Nyoni|CM|2007|ENG|64|82
Virgil van Dijk|CB|1991|NED|89|89
Ibrahima Konaté|CB|1999|FRA|84|85
Joe Gomez|CB|1997|ENG|78|78
Giovanni Leoni|CB|2006|ITA|70|84
Jeremie Frimpong|RB|2000|NED|82|83
Conor Bradley|RB|2003|NIR|77|83
Milos Kerkez|LB|2003|HUN|81|85
Andrew Robertson|LB|1994|SCO|81|81
Ryan Gravenberch|DM|2002|NED|85|88
Alexis Mac Allister|CM|1998|ARG|86|87
Dominik Szoboszlai|CM|2000|HUN|84|85
Curtis Jones|CM|2001|ENG|79|81
Wataru Endo|DM|1993|JPN|75|75
Florian Wirtz|AM|2003|GER|87|91
Mohamed Salah|RW|1992|EGY|89|89
Federico Chiesa|RW|1997|ITA|76|76
Rio Ngumoha|LW|2008|ENG|64|85
Cody Gakpo|LW|1999|NED|84|85
Alexander Isak|ST|1999|SWE|87|88
Hugo Ekitike|ST|2002|FRA|83|87`
    },
    {
      id: 'e_che', name: 'Chelsea', short: 'CHE', city: 'Londres', stadium: 'Stamford Bridge', capacity: 40343,
      colors: ['#034694', '#FFFFFF'], reputation: 89, budget: 140,
      players: `Robert Sánchez|GK|1997|ESP|80|80
Filip Jörgensen|GK|2002|DEN|74|80
Gabriel Slonina|GK|2004|USA|64|76
Levi Colwill|CB|2003|ENG|81|86
Wesley Fofana|CB|2000|FRA|80|81
Trevoh Chalobah|CB|1999|ENG|80|81
Tosin Adarabioyo|CB|1997|ENG|77|77
Dário Essugo|DM|2005|POR|70|80
Marc Cucurella|LB|1998|ESP|83|83
Jorrel Hato|LB|2006|NED|76|86
Reece James|RB|1999|ENG|83|84
Malo Gusto|RB|2003|FRA|80|84
Moisés Caicedo|DM|2001|ECU|87|88
Enzo Fernández|CM|2001|ARG|85|87
Roméo Lavia|DM|2004|BEL|77|84
Andrey Santos|CM|2004|BRA|76|84
Carney Chukwuemeka|CM|2003|ENG|71|79
Cole Palmer|AM|2002|ENG|87|90
Pedro Neto|RW|2000|POR|82|83
Estêvão|RW|2007|BRA|78|90
Alejandro Garnacho|LW|2004|ARG|80|85
Jamie Gittens|LW|2004|ENG|78|85
João Pedro|ST|2001|BRA|82|85
Liam Delap|ST|2003|ENG|77|84`
    },
    {
      id: 'e_mun', name: 'Manchester United', short: 'MUN', city: 'Mánchester', stadium: 'Old Trafford', capacity: 74197,
      colors: ['#DA291C', '#FBE122'], reputation: 88, budget: 110,
      players: `Senne Lammens|GK|2002|BEL|77|84
Altay Bayındır|GK|1998|TUR|73|74
Tom Heaton|GK|1986|ENG|64|64
Matthijs de Ligt|CB|1999|NED|82|83
Harry Maguire|CB|1993|ENG|78|78
Lisandro Martínez|CB|1998|ARG|82|82
Leny Yoro|CB|2005|FRA|77|87
Jack Fletcher|CM|2007|ENG|62|79
Luke Shaw|LB|1995|ENG|77|77
Patrick Dorgu|LB|2004|DEN|76|83
Diogo Dalot|RB|1999|POR|79|79
Noussair Mazraoui|RB|1997|MAR|79|79
Casemiro|DM|1992|BRA|79|79
Manuel Ugarte|DM|2001|URU|78|81
Kobbie Mainoo|CM|2005|ENG|78|86
Mason Mount|AM|1999|ENG|77|77
Bruno Fernandes|AM|1994|POR|87|87
Toby Collyer|CM|2004|ENG|65|76
Bryan Mbeumo|RW|1999|CMR|84|84
Amad Diallo|RW|2002|CIV|80|85
Matheus Cunha|LW|1999|BRA|83|84
Benjamin Šeško|ST|2003|SVN|80|87
Joshua Zirkzee|ST|2001|NED|76|79`
    },
    {
      id: 'e_tot', name: 'Tottenham Hotspur', short: 'TOT', city: 'Londres', stadium: 'Tottenham Hotspur Stadium', capacity: 62850,
      colors: ['#FFFFFF', '#132257'], reputation: 85, budget: 100,
      players: `Guglielmo Vicario|GK|1996|ITA|83|83
Antonín Kinský|GK|2003|CZE|72|81
Brandon Austin|GK|1999|ENG|63|65
Cristian Romero|CB|1998|ARG|85|85
Micky van de Ven|CB|2001|NED|83|86
Kevin Danso|CB|1998|AUT|77|77
Radu Drăgușin|CB|2002|ROU|76|80
Pedro Porro|RB|1999|ESP|82|82
Djed Spence|RB|2000|ENG|76|77
Destiny Udogie|LB|2002|ITA|79|83
Ben Davies|LB|1993|WAL|73|73
Archie Gray|CM|2006|ENG|73|85
João Palhinha|DM|1995|POR|81|81
Rodrigo Bentancur|CM|1997|URU|79|79
Yves Bissouma|DM|1996|MLI|77|77
Pape Matar Sarr|CM|2002|SEN|79|82
Lucas Bergvall|CM|2006|SWE|75|86
James Maddison|AM|1996|ENG|81|81
Xavi Simons|AM|2003|NED|83|87
Mohammed Kudus|RW|2000|GHA|82|83
Brennan Johnson|RW|2001|WAL|78|79
Mathys Tel|LW|2005|FRA|75|85
Dominic Solanke|ST|1997|ENG|80|80
Randal Kolo Muani|ST|1998|FRA|79|79`
    },
    {
      id: 'e_new', name: 'Newcastle United', short: 'NEW', city: 'Newcastle', stadium: "St James' Park", capacity: 52305,
      colors: ['#241F20', '#FFFFFF'], reputation: 84, budget: 85,
      players: `Nick Pope|GK|1992|ENG|81|81
Aaron Ramsdale|GK|1998|ENG|77|77
John Ruddy|GK|1986|ENG|63|63
Joe White|CM|2002|ENG|64|70
Sven Botman|CB|2000|NED|81|83
Fabian Schär|CB|1991|SUI|80|80
Malick Thiaw|CB|2001|GER|79|82
Dan Burn|CB|1992|ENG|79|79
Jamaal Lascelles|CB|1993|ENG|71|71
Kieran Trippier|RB|1990|ENG|78|78
Tino Livramento|RB|2002|ENG|79|84
Lewis Hall|LB|2004|ENG|79|84
Bruno Guimarães|CM|1997|BRA|86|86
Sandro Tonali|DM|2000|ITA|84|85
Joelinton|CM|1996|BRA|80|80
Jacob Ramsey|CM|2001|ENG|76|79
Joe Willock|CM|1999|ENG|75|75
Lewis Miley|CM|2006|ENG|71|83
Anthony Gordon|LW|2001|ENG|82|84
Harvey Barnes|LW|1997|ENG|77|77
Anthony Elanga|RW|2002|SWE|79|82
Jacob Murphy|RW|1995|ENG|77|77
Nick Woltemade|ST|2002|GER|80|85
Yoane Wissa|ST|1996|COD|79|79`
    },
    {
      id: 'e_avl', name: 'Aston Villa', short: 'AVL', city: 'Birmingham', stadium: 'Villa Park', capacity: 42640,
      colors: ['#670E36', '#95BFE5'], reputation: 82, budget: 60,
      players: `Emiliano Martínez|GK|1992|ARG|85|85
Marco Bizot|GK|1991|NED|74|74
James Wright|GK|2004|ENG|58|70
Ezri Konsa|CB|1997|ENG|81|81
Pau Torres|CB|1997|ESP|81|81
Tyrone Mings|CB|1993|ENG|76|76
Victor Lindelöf|CB|1994|SWE|76|76
Matty Cash|RB|1997|POL|78|78
Andrés García|RB|2003|ESP|70|78
Lucas Digne|LB|1993|FRA|77|77
Ian Maatsen|LB|2002|NED|77|81
Youri Tielemans|CM|1997|BEL|82|82
Boubacar Kamara|DM|1999|FRA|82|82
Amadou Onana|DM|2001|BEL|81|83
John McGinn|CM|1994|SCO|80|80
Ross Barkley|CM|1993|ENG|74|74
Morgan Rogers|AM|2002|ENG|82|86
Emiliano Buendía|RW|1996|ARG|76|76
Harvey Elliott|AM|2003|ENG|76|81
Jadon Sancho|LW|2000|ENG|76|77
Evann Guessand|RW|2001|CIV|75|79
Donyell Malen|RW|1999|NED|78|78
Ollie Watkins|ST|1995|ENG|83|83`
    },
    {
      id: 'e_bha', name: 'Brighton & Hove Albion', short: 'BHA', city: 'Brighton', stadium: 'American Express Stadium', capacity: 31876,
      colors: ['#0057B8', '#FFFFFF'], reputation: 76, budget: 55,
      players: `Bart Verbruggen|GK|2002|NED|79|84
Jason Steele|GK|1990|ENG|69|69
Tom McGill|GK|2000|CAN|62|65
Lewis Dunk|CB|1991|ENG|79|79
Jan Paul van Hecke|CB|2000|NED|79|81
Olivier Boscagli|CB|1997|FRA|76|76
Diego Coppola|CB|2003|ITA|72|80
Ferdi Kadıoğlu|LB|1999|TUR|78|79
Maxim De Cuyper|LB|2000|BEL|76|79
Joël Veltman|RB|1992|NED|73|73
Mats Wieffer|RB|1999|NED|76|77
Carlos Baleba|DM|2004|CMR|80|86
Yasin Ayari|CM|2003|SWE|76|81
Diego Gómez|CM|2003|PAR|75|81
Jack Hinshelwood|CM|2005|ENG|73|81
James Milner|CM|1986|ENG|70|70
Brajan Gruda|AM|2004|GER|73|81
Georginio Rutter|AM|2002|FRA|78|81
Kaoru Mitoma|LW|1997|JPN|80|80
Solly March|RW|1994|ENG|74|74
Yankuba Minteh|RW|2004|GAM|77|83
Danny Welbeck|ST|1990|ENG|76|76
Stefanos Tzimas|ST|2005|GRE|71|81
Charalampos Kostoulas|ST|2007|GRE|67|83`
    },
    {
      id: 'e_bou', name: 'AFC Bournemouth', short: 'BOU', city: 'Bournemouth', stadium: 'Vitality Stadium', capacity: 11307,
      colors: ['#DA291C', '#000000'], reputation: 73, budget: 50,
      players: `Đorđe Petrović|GK|1999|SRB|78|81
Will Dennis|GK|2000|ENG|62|66
Fraser Forster|GK|1988|ENG|68|68
Marcos Senesi|CB|1997|ARG|79|79
Bafodé Diakité|CB|2001|FRA|76|80
Veljko Milosavljević|CB|2007|SRB|66|80
James Hill|CB|2002|ENG|70|76
Adrien Truffert|LB|2001|FRA|77|80
Julio Soler|LB|2005|ARG|70|79
Adam Smith|RB|1991|ENG|72|72
Álex Jiménez|RB|2005|ESP|72|81
Tyler Adams|DM|1999|USA|78|78
Lewis Cook|CM|1997|ENG|76|76
Alex Scott|CM|2003|ENG|75|81
Marcus Tavernier|AM|1999|ENG|77|77
Ryan Christie|CM|1995|SCO|74|74
Justin Kluivert|AM|1999|NED|79|79
David Brooks|AM|1997|WAL|73|73
Amine Adli|RW|2000|MAR|76|77
Antoine Semenyo|RW|2000|GHA|82|83
Ben Gannon-Doak|LW|2005|SCO|70|80
Evanilson|ST|1999|BRA|79|80
Eli Junior Kroupi|ST|2006|FRA|70|83
Enes Ünal|ST|1997|TUR|73|73`
    },
    {
      id: 'e_bre', name: 'Brentford', short: 'BRE', city: 'Londres', stadium: 'Gtech Community Stadium', capacity: 17250,
      colors: ['#E30613', '#FFFFFF'], reputation: 72, budget: 45,
      players: `Caoimhín Kelleher|GK|1998|IRL|80|81
Hákon Valdimarsson|GK|2001|ISL|70|76
Ellery Balcombe|GK|1999|ENG|60|64
Nathan Collins|CB|2001|IRL|79|81
Sepp van den Berg|CB|2001|NED|77|80
Kristoffer Ajer|CB|1998|NOR|75|75
Ethan Pinnock|CB|1993|JAM|74|74
Michael Kayode|RB|2004|ITA|74|80
Aaron Hickey|RB|2002|SCO|74|78
Rico Henry|LB|1997|ENG|72|72
Keane Lewis-Potter|LB|2001|ENG|75|77
Vitaly Janelt|DM|1998|GER|75|75
Mathias Jensen|CM|1996|DEN|75|75
Jordan Henderson|CM|1990|ENG|75|75
Yehor Yarmolyuk|CM|2004|UKR|72|79
Mikkel Damsgaard|AM|2000|DEN|78|79
Fábio Carvalho|AM|2002|POR|73|77
Antoni Milambo|AM|2005|NED|70|80
Kevin Schade|LW|2001|GER|78|80
Dango Ouattara|RW|2002|BFA|76|79
Reiss Nelson|LW|1999|ENG|73|73
Igor Thiago|ST|2001|BRA|78|81
Gustavo Nunes|RW|2005|BRA|66|78
Kaye Furo|ST|2007|BEL|62|78`
    },
    {
      id: 'e_cry', name: 'Crystal Palace', short: 'CRY', city: 'Londres', stadium: 'Selhurst Park', capacity: 25486,
      colors: ['#1B458F', '#C4122E'], reputation: 75, budget: 45,
      players: `Dean Henderson|GK|1997|ENG|81|81
Walter Benítez|GK|1993|ARG|74|74
Remi Matthews|GK|1994|ENG|60|60
Marc Guéhi|CB|2000|ENG|84|85
Maxence Lacroix|CB|2000|FRA|80|81
Chris Richards|CB|2000|USA|76|78
Jaydee Canvot|CB|2006|FRA|69|81
Chadi Riad|CB|2003|MAR|71|78
Daniel Muñoz|RB|1996|COL|80|80
Tyrick Mitchell|LB|1999|ENG|77|77
Borna Sosa|LB|1998|CRO|73|73
Adam Wharton|DM|2004|ENG|79|86
Jefferson Lerma|DM|1994|COL|77|77
Will Hughes|CM|1995|ENG|75|75
Daichi Kamada|CM|1996|JPN|77|77
Justin Devenny|CM|2003|NIR|67|74
Cheick Doucouré|DM|2000|MLI|74|76
Yéremy Pino|RW|2002|ESP|78|81
Ismaïla Sarr|RW|1998|SEN|79|79
Eddie Nketiah|ST|1999|ENG|73|73
Jean-Philippe Mateta|ST|1997|FRA|80|80
Romain Esse|LW|2005|ENG|66|78
Christantus Uche|AM|2003|NGA|72|78`
    },
    {
      id: 'e_eve', name: 'Everton', short: 'EVE', city: 'Liverpool', stadium: 'Hill Dickinson Stadium', capacity: 52888,
      colors: ['#003399', '#FFFFFF'], reputation: 74, budget: 50,
      players: `Jordan Pickford|GK|1994|ENG|83|83
Mark Travers|GK|1999|IRL|72|74
Tom King|GK|1995|WAL|62|62
Harrison Armstrong|CM|2007|ENG|63|79
James Tarkowski|CB|1992|ENG|79|79
Jarrad Branthwaite|CB|2002|ENG|79|84
Michael Keane|CB|1993|ENG|74|74
Jake O'Brien|CB|2001|IRL|74|78
Vitaliy Mykolenko|LB|1999|UKR|76|76
Adam Aznou|LB|2006|MAR|65|78
Nathan Patterson|RB|2001|SCO|72|74
Séamus Coleman|RB|1988|IRL|68|68
Idrissa Gueye|DM|1989|SEN|77|77
James Garner|CM|2001|ENG|77|79
Tim Iroegbunam|CM|2003|ENG|70|77
Kiernan Dewsbury-Hall|CM|1998|ENG|77|77
Carlos Alcaraz|CM|2002|ARG|72|76
Merlin Röhl|AM|2002|GER|69|75
Jack Grealish|LW|1995|ENG|80|80
Iliman Ndiaye|LW|2000|SEN|79|80
Dwight McNeil|LW|1999|ENG|76|76
Tyler Dibling|RW|2006|ENG|72|84
Beto|ST|1998|POR|74|74
Thierno Barry|ST|2002|FRA|74|79`
    },
    {
      id: 'e_ful', name: 'Fulham', short: 'FUL', city: 'Londres', stadium: 'Craven Cottage', capacity: 29589,
      colors: ['#FFFFFF', '#000000'], reputation: 72, budget: 40,
      players: `Bernd Leno|GK|1992|GER|80|80
Benjamin Lecomte|GK|1991|FRA|69|69
Steven Benda|GK|1998|GER|65|67
Joachim Andersen|CB|1996|DEN|79|79
Calvin Bassey|CB|1999|NGA|77|78
Issa Diop|CB|1997|FRA|73|73
Jorge Cuenca|CB|1999|ESP|73|74
Antonee Robinson|LB|1997|USA|80|80
Ryan Sessegnon|LB|2000|ENG|72|72
Kenny Tete|RB|1995|NED|74|74
Timothy Castagne|RB|1995|BEL|75|75
Saša Lukić|DM|1996|SRB|76|76
Sander Berge|DM|1998|NOR|77|77
Harrison Reed|CM|1995|ENG|73|73
Tom Cairney|CM|1991|SCO|71|71
Emile Smith Rowe|AM|2000|ENG|77|78
Alex Iwobi|AM|1996|NGA|79|79
Josh King|AM|2007|ENG|64|80
Adama Traoré|RW|1996|ESP|75|75
Samuel Chukwueze|RW|1999|NGA|75|76
Kevin|LW|2003|BRA|74|80
Harry Wilson|RW|1997|WAL|76|76
Raúl Jiménez|ST|1991|MEX|76|76
Rodrigo Muniz|ST|2001|BRA|76|78`
    },
    {
      id: 'e_nfo', name: 'Nottingham Forest', short: 'NFO', city: 'Nottingham', stadium: 'City Ground', capacity: 30404,
      colors: ['#DD0000', '#FFFFFF'], reputation: 76, budget: 55,
      players: `Matz Sels|GK|1992|BEL|81|81
John Victor|GK|1996|BRA|72|73
Angus Gunn|GK|1996|SCO|70|70
Murillo|CB|2002|BRA|81|85
Nikola Milenković|CB|1997|SRB|81|81
Morato|CB|2001|BRA|73|76
Jair Cunha|CB|2005|BRA|68|79
Neco Williams|LB|2001|WAL|77|78
Nicolò Savona|RB|2003|ITA|72|79
Ola Aina|RB|1996|NGA|78|78
Oleksandr Zinchenko|LB|1996|UKR|74|74
Elliot Anderson|CM|2002|ENG|81|86
Nicolás Domínguez|CM|1998|ARG|75|75
Ibrahim Sangaré|DM|1997|CIV|76|76
Douglas Luiz|CM|1998|BRA|77|77
Ryan Yates|CM|1997|ENG|73|73
Morgan Gibbs-White|AM|2000|ENG|82|83
James McAtee|AM|2002|ENG|74|79
Callum Hudson-Odoi|LW|2000|ENG|77|77
Dan Ndoye|RW|2000|SUI|78|80
Omari Hutchinson|RW|2003|ENG|75|81
Chris Wood|ST|1991|NZL|80|80
Igor Jesus|ST|2001|BRA|76|79
Arnaud Kalimuendo|ST|2002|FRA|76|79`
    },
    {
      id: 'e_whu', name: 'West Ham United', short: 'WHU', city: 'Londres', stadium: 'London Stadium', capacity: 62500,
      colors: ['#7A263A', '#1BB1E7'], reputation: 73, budget: 45,
      players: `Alphonse Areola|GK|1993|FRA|77|77
Mads Hermansen|GK|2000|DEN|74|78
Łukasz Fabiański|GK|1985|POL|69|69
Max Kilman|CB|1997|ENG|77|77
Jean-Clair Todibo|CB|1999|FRA|77|78
Konstantinos Mavropanos|CB|1997|GRE|75|75
Igor Julio|CB|1998|BRA|74|74
El Hadji Malick Diouf|LB|2004|SEN|74|81
Oliver Scarles|LB|2005|ENG|65|76
Aaron Wan-Bissaka|RB|1997|ENG|78|78
Kyle Walker-Peters|RB|1997|ENG|75|75
Tomáš Souček|CM|1995|CZE|77|77
James Ward-Prowse|CM|1994|ENG|76|76
Lucas Paquetá|AM|1997|BRA|81|81
Mateus Fernandes|CM|2004|POR|73|80
Soungoutou Magassa|DM|2003|FRA|71|78
Guido Rodríguez|DM|1994|ARG|74|74
Freddie Potts|CM|2003|ENG|66|73
Jarrod Bowen|RW|1996|ENG|82|82
Crysencio Summerville|LW|2001|NED|76|78
Luis Guilherme|RW|2006|BRA|65|78
Callum Wilson|ST|1992|ENG|73|73
Niclas Füllkrug|ST|1993|GER|74|74
George Earthy|AM|2004|ENG|64|74`
    },
    {
      id: 'e_wol', name: 'Wolverhampton Wanderers', short: 'WOL', city: 'Wolverhampton', stadium: 'Molineux Stadium', capacity: 31750,
      colors: ['#FDB913', '#231F20'], reputation: 70, budget: 35,
      players: `José Sá|GK|1993|POR|77|77
Sam Johnstone|GK|1993|ENG|73|73
Dan Bentley|GK|1993|ENG|65|65
Emmanuel Agbadou|CB|1997|CIV|76|77
Santiago Bueno|CB|1998|URU|74|75
Toti Gomes|CB|1999|POR|75|75
Yerson Mosquera|CB|2001|COL|74|77
Ladislav Krejčí|CB|2000|CZE|75|77
Matt Doherty|RB|1992|IRL|71|71
Jackson Tchatchoua|RB|2001|CMR|74|77
David Møller Wolfe|LB|2002|NOR|72|76
Boubacar Traoré|CM|2001|MLI|70|73
André|DM|2001|BRA|77|79
João Gomes|CM|2001|BRA|79|81
Marshall Munetsi|CM|1996|ZIM|74|74
Jean-Ricner Bellegarde|AM|1998|FRA|74|74
Tommy Doyle|CM|2001|ENG|69|71
Jhon Arias|RW|1997|COL|77|77
Hwang Hee-chan|LW|1996|KOR|73|73
Rodrigo Gomes|LW|2003|POR|71|77
Fer López|AM|2004|ESP|69|79
Jørgen Strand Larsen|ST|2000|NOR|77|78
Tolu Arokodare|ST|2000|NGA|72|74`
    },
    {
      id: 'e_lee', name: 'Leeds United', short: 'LEE', city: 'Leeds', stadium: 'Elland Road', capacity: 37645,
      colors: ['#FFFFFF', '#1D428A'], reputation: 68, budget: 40,
      players: `Lucas Perri|GK|1997|BRA|76|77
Karl Darlow|GK|1990|WAL|69|69
Illan Meslier|GK|2000|FRA|70|72
Joe Rodon|CB|1997|WAL|76|76
Pascal Struijk|CB|1999|NED|75|76
Jaka Bijol|CB|1999|SVN|77|78
Sebastiaan Bornauw|CB|1999|BEL|72|72
Gabriel Gudmundsson|LB|1999|SWE|74|75
Sam Byram|LB|1993|ENG|69|69
Jayden Bogle|RB|2000|ENG|75|76
James Justin|RB|1998|ENG|73|73
Ethan Ampadu|DM|2000|WAL|76|77
Anton Stach|CM|1998|GER|77|77
Sean Longstaff|CM|1997|ENG|74|74
Ilia Gruev|DM|2000|BUL|72|74
Ao Tanaka|CM|1998|JPN|75|75
Brenden Aaronson|AM|2000|USA|75|76
Willy Gnonto|LW|2003|ITA|73|78
Daniel James|RW|1997|WAL|74|74
Noah Okafor|LW|2000|SUI|75|76
Facundo Buonanotte|AM|2004|ARG|73|79
Dominic Calvert-Lewin|ST|1997|ENG|75|75
Lukas Nmecha|ST|1998|GER|72|72
Joël Piroe|ST|1999|NED|73|74`
    },
    {
      id: 'e_bur', name: 'Burnley', short: 'BUR', city: 'Burnley', stadium: 'Turf Moor', capacity: 21944,
      colors: ['#6C1D45', '#99D6EA'], reputation: 64, budget: 30,
      players: `Martin Dúbravka|GK|1989|SVK|74|74
Max Weiß|GK|2004|GER|67|77
Václav Hladký|GK|1990|CZE|64|64
Maxime Estève|CB|2002|FRA|74|79
Hjalmar Ekdal|CB|1998|SWE|71|72
Axel Tuanzebe|CB|1997|COD|71|71
Joe Worrall|CB|1997|ENG|70|70
Quilindschy Hartman|LB|2001|NED|72|76
Lucas Pires|LB|2001|BRA|71|74
Kyle Walker|RB|1990|ENG|77|77
Oliver Sonne|RB|2001|PER|69|73
Josh Cullen|DM|1996|IRL|73|73
Florentino Luís|DM|1999|POR|76|76
Lesley Ugochukwu|DM|2004|FRA|72|78
Josh Laurent|CM|1995|ENG|71|71
Hannibal Mejbri|AM|2003|TUN|71|75
Aaron Ramsey|AM|2003|ENG|68|74
Jaidon Anthony|LW|1999|ENG|73|74
Loum Tchaouna|RW|2003|FRA|72|77
Marcus Edwards|RW|1998|ENG|72|72
Mike Trésor|AM|1999|BEL|70|72
Zian Flemming|ST|1998|NED|72|72
Lyle Foster|ST|2000|RSA|71|73
Armando Broja|ST|2001|ALB|72|75`
    },
    {
      id: 'e_sun', name: 'Sunderland', short: 'SUN', city: 'Sunderland', stadium: 'Stadium of Light', capacity: 49000,
      colors: ['#EB172B', '#FFFFFF'], reputation: 65, budget: 35,
      players: `Robin Roefs|GK|2003|NED|75|82
Anthony Patterson|GK|2000|ENG|69|72
Simon Moore|GK|1990|ENG|60|60
Omar Alderete|CB|1996|PAR|75|75
Nordi Mukiele|CB|1997|FRA|76|76
Daniel Ballard|CB|1999|NIR|72|74
Chris Mepham|CB|1997|WAL|70|70
Reinildo Mandava|LB|1994|MOZ|74|74
Dennis Cirkin|LB|2002|ENG|70|73
Trai Hume|RB|2002|NIR|72|76
Lutsharel Geertruida|RB|2000|NED|75|77
Granit Xhaka|DM|1992|SUI|81|81
Noah Sadiki|CM|2004|COD|74|81
Habib Diarra|CM|2004|SEN|74|81
Enzo Le Fée|CM|2000|FRA|75|77
Dan Neil|CM|2001|ENG|69|73
Chris Rigg|AM|2007|ENG|68|83
Chemsdine Talbi|RW|2005|MAR|71|80
Simon Adingra|LW|2002|CIV|74|77
Bertrand Traoré|RW|1995|BFA|72|72
Milan Aleksić|CM|2005|SRB|66|76
Wilson Isidor|ST|2000|FRA|75|77
Brian Brobbey|ST|2002|NED|74|78
Eliezer Mayenda|ST|2005|ESP|69|78`
    },
  ],
  tier2: [
    { id: 'e_lei', name: 'Leicester City', short: 'LEI', city: 'Leicester', stadium: 'King Power Stadium', capacity: 32262, colors: ['#003090', '#FDBE11'], reputation: 70 },
    { id: 'e_ips', name: 'Ipswich Town', short: 'IPS', city: 'Ipswich', stadium: 'Portman Road', capacity: 29813, colors: ['#0044A9', '#FFFFFF'], reputation: 67 },
    { id: 'e_sou', name: 'Southampton', short: 'SOU', city: 'Southampton', stadium: "St Mary's Stadium", capacity: 32384, colors: ['#D71920', '#FFFFFF'], reputation: 68 },
    { id: 'e_shu', name: 'Sheffield United', short: 'SHU', city: 'Sheffield', stadium: 'Bramall Lane', capacity: 32050, colors: ['#EE2737', '#FFFFFF'], reputation: 64 },
    { id: 'e_mid', name: 'Middlesbrough', short: 'MID', city: 'Middlesbrough', stadium: 'Riverside Stadium', capacity: 34742, colors: ['#E11B22', '#FFFFFF'], reputation: 63 },
    { id: 'e_cov', name: 'Coventry City', short: 'COV', city: 'Coventry', stadium: 'Coventry Building Society Arena', capacity: 32609, colors: ['#87CEEB', '#FFFFFF'], reputation: 62 },
    { id: 'e_wba', name: 'West Bromwich Albion', short: 'WBA', city: 'West Bromwich', stadium: 'The Hawthorns', capacity: 26688, colors: ['#122F67', '#FFFFFF'], reputation: 63 },
    { id: 'e_nor', name: 'Norwich City', short: 'NOR', city: 'Norwich', stadium: 'Carrow Road', capacity: 27359, colors: ['#FFF200', '#00A650'], reputation: 61 },
    { id: 'e_wat', name: 'Watford', short: 'WAT', city: 'Watford', stadium: 'Vicarage Road', capacity: 22200, colors: ['#FBEE23', '#ED2127'], reputation: 60 },
    { id: 'e_sto', name: 'Stoke City', short: 'STO', city: 'Stoke-on-Trent', stadium: 'bet365 Stadium', capacity: 30089, colors: ['#E03A3E', '#FFFFFF'], reputation: 60 },
  ],
};
