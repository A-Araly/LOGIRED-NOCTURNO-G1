SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS envios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_guia VARCHAR(20) NOT NULL UNIQUE,
  cliente_id INT NOT NULL,
  peso_kg DECIMAL(8,2) NOT NULL,
  ciudad_destino VARCHAR(80) NOT NULL,
  direccion_destino VARCHAR(150) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  fecha_registro DATE NOT NULL
);

INSERT INTO envios (numero_guia, cliente_id, peso_kg, ciudad_destino, direccion_destino, estado, fecha_registro) VALUES
  ('LR-2026-567890', 1, 5, 'Bogota', 'calle 456', 'registrado', '2024-06-01'),
  ('LR-2026-567891', 2, 2, 'Cali', 'carrera 56', 'en_transito', '2024-06-02'),
  ('LR-2026-567892', 3, 10, 'Medellin', 'calle 123', 'entregado', '2024-06-03');