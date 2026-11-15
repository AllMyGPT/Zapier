import { Rng } from './rng';

const N: Record<string, [string[], string[]]> = {
  ESP: [
    ['Álvaro', 'Pablo', 'Hugo', 'Mario', 'Adrián', 'Sergio', 'Iker', 'Javier', 'Daniel', 'Marcos', 'Unai', 'Rubén', 'Diego', 'Carlos', 'Raúl', 'Óscar', 'Aitor', 'Jon', 'Gonzalo', 'Iván', 'Víctor', 'Nico', 'Álex', 'Jorge', 'Miguel', 'Asier', 'Borja', 'Manu', 'Fran', 'Dani', 'Pol', 'Marc', 'Arnau', 'Eneko', 'Lucas', 'Martín', 'Bruno', 'Samuel', 'Izan', 'Gorka'],
    ['García', 'Fernández', 'López', 'Martínez', 'Sánchez', 'Pérez', 'Gómez', 'Martín', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Moreno', 'Muñoz', 'Álvarez', 'Romero', 'Navarro', 'Torres', 'Domínguez', 'Gil', 'Vázquez', 'Serrano', 'Ramos', 'Blanco', 'Molina', 'Castro', 'Ortega', 'Rubio', 'Marín', 'Sanz', 'Iglesias', 'Medina', 'Garrido', 'Cortés', 'Castillo', 'Santos', 'Lozano', 'Guerrero', 'Cano', 'Prieto', 'Méndez', 'Cruz', 'Calvo', 'Gallego', 'Vidal', 'León', 'Herrera', 'Márquez', 'Peña', 'Flores', 'Cabrera', 'Campos', 'Vega', 'Fuentes', 'Carrasco', 'Diez', 'Aguirre', 'Etxeberria', 'Zubizarreta', 'Arrieta'],
  ],
  ENG: [
    ['Harry', 'Jack', 'Oliver', 'Charlie', 'George', 'James', 'Thomas', 'Jacob', 'Alfie', 'Joe', 'Ben', 'Sam', 'Lewis', 'Callum', 'Ryan', 'Kieran', 'Luke', 'Max', 'Josh', 'Dan', 'Tom', 'Will', 'Archie', 'Freddie', 'Reece', 'Tyler', 'Jordan', 'Mason', 'Kai', 'Ethan', 'Leo', 'Rhys', 'Liam', 'Connor', 'Jamie', 'Owen'],
    ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Green', 'Hall', 'Wood', 'Jackson', 'Clarke', 'Hughes', 'Edwards', 'Turner', 'Hill', 'Moore', 'Cooper', 'Ward', 'Morris', 'King', 'Watson', 'Harrison', 'Morgan', 'Baker', 'Young', 'Allen', 'Mitchell', 'Bennett', 'Carter', 'Parker', 'Barnes', 'Fletcher', 'Palmer', 'Holmes', 'Lloyd', 'Shaw', 'Webb', 'Knight', 'Cole', 'Mills', 'Grant'],
  ],
  ITA: [
    ['Lorenzo', 'Matteo', 'Alessandro', 'Andrea', 'Francesco', 'Leonardo', 'Riccardo', 'Gabriele', 'Marco', 'Luca', 'Davide', 'Federico', 'Simone', 'Giuseppe', 'Antonio', 'Nicolò', 'Tommaso', 'Pietro', 'Daniele', 'Stefano', 'Filippo', 'Giacomo', 'Edoardo', 'Michele', 'Samuele', 'Emanuele', 'Christian', 'Mattia', 'Salvatore', 'Fabio'],
    ['Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Bruno', 'Gallo', 'Conti', 'De Luca', 'Mancini', 'Costa', 'Giordano', 'Rizzo', 'Lombardi', 'Moretti', 'Barbieri', 'Fontana', 'Santoro', 'Mariani', 'Rinaldi', 'Caruso', 'Ferrara', 'Galli', 'Martini', 'Leone', 'Longo', 'Gentile', 'Martinelli', 'Vitale', 'Lombardo', 'Serra', 'Coppola', 'De Santis', "D'Angelo", 'Marchetti', 'Parisi', 'Villa', 'Conte', 'Ferraro', 'Ferri', 'Fabbri', 'Bianco', 'Marini', 'Grasso', 'Valentini'],
  ],
  GER: [
    ['Lukas', 'Leon', 'Jonas', 'Finn', 'Paul', 'Felix', 'Maximilian', 'Luca', 'Tim', 'Jan', 'Niklas', 'Julian', 'Moritz', 'Elias', 'Ben', 'Noah', 'Tom', 'Florian', 'Jannik', 'Kevin', 'Marvin', 'Philipp', 'Dennis', 'Tobias', 'Fabian', 'Robin', 'Nico', 'Lars', 'Malte', 'Henrik'],
    ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf', 'Schröder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krüger', 'Hofmann', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Schmid', 'Schulze', 'Maier', 'Köhler', 'Herrmann', 'König', 'Walter', 'Mayer', 'Huber', 'Kaiser', 'Fuchs', 'Peters', 'Lang', 'Scholz', 'Möller', 'Weiß', 'Jung', 'Hahn', 'Vogel'],
  ],
  FRA: [
    ['Lucas', 'Hugo', 'Théo', 'Nathan', 'Mathis', 'Enzo', 'Louis', 'Gabriel', 'Raphaël', 'Arthur', 'Jules', 'Tom', 'Maxime', 'Antoine', 'Clément', 'Baptiste', 'Kylian', 'Yanis', 'Rayan', 'Adam', 'Mohamed', 'Ibrahima', 'Moussa', 'Mamadou', 'Kévin', 'Romain', 'Florian', 'Alexis', 'Quentin', 'Bastien', 'Malo', 'Noah', 'Sacha', 'Axel', 'Ilyes'],
    ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Nicolas', 'Perrin', 'Diallo', 'Traoré', 'Koné', 'Camara', 'Cissé', 'Sylla', 'Diop', 'Ndiaye', 'Fofana', 'Bamba'],
  ],
};

export function genName(nat: string, rng: Rng) {
  const [f, l] = N[nat] ?? N.ESP;
  return `${rng.pick(f)} ${rng.pick(l)}`;
}

export const FOREIGN_NATS = ['BRA', 'ARG', 'POR', 'NED', 'BEL', 'URU', 'COL', 'SEN', 'MAR', 'CIV', 'CRO', 'SRB', 'DEN', 'NOR', 'USA', 'JPN'];

export const SPONSORS = ['Altavía Energía', 'NovaBank', 'Teleplus', 'Viajes Horizonte', 'AeroLínea Sur', 'Grupo Ébano', 'Kraftwerk Motors', 'BetaSeguros', 'Lumina Tech', 'Cervezas del Norte', 'Océano Telecom', 'Vértice Inversiones', 'Mistral Air', 'Polaris Software', 'Solaria', 'Cumbre Logística'];
