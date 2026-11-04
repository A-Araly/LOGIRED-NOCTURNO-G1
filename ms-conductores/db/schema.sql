-- db/schema.sql 
SET NAMES utf8mb4;            -- para que las tildes y la ñ se guarden bien 
  
CREATE TABLE conductores ( 
  id      INT AUTO_INCREMENT PRIMARY KEY, 
  nombre  VARCHAR(100) NOT NULL, 
  cedula  VARCHAR(20) NOT NULL UNIQUE, 
  categoria VARCHAR(10) NOT NULL, 
  sede    VARCHAR(100) NOT NULL
); 
  
INSERT INTO conductores (nombre, cedula, categoria, sede) VALUES 
  ('Juan Pérez', '123456789', 'A', 'Cali'), 
  ('Laura Gómez', '987654321', 'B', 'Medellin'), 
  ('Andrés Castillo', '456789123', 'C', 'Bogota');