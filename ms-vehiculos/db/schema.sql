db/schema.sql
SET NAMES utf8mb4; //tildes y ñ se guarden bien

CREATE TABLE vehiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    tipo VARCHAR(30) NOT NULL,
    capacidad_kg INT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'disponible',
    conductor_id INT NULL,
);

INSERT INTO vehiculos (placa, tipo, capacidad_kg, estado, conductor_id) VALUES
  ('ABC123', 'camioneta', 1000, 'disponible', NULL),
  ('XYZ723', 'camion',    5000, 'en_ruta',    2),
  ('KLM456', 'furgon',    3000, 'mantenimiento', NULL);