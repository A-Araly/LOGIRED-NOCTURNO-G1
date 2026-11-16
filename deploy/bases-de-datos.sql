-- =====================================================================
-- LogiRed - Creacion de bases de datos y usuarios (servidor1, serverErp)
-- Responsable: Vanessa Cardona (integradora de datos)
-- Se ejecuta en servidor1 con: sudo mysql
-- Cada usuario solo puede conectarse desde servidor2 (172.18.0.187).
-- Las contrasenas NO se guardan en el repositorio: reemplace <clave>
-- por la clave real (solo letras y numeros) al ejecutarlo.
-- =====================================================================

-- ms-usuarios
CREATE DATABASE IF NOT EXISTS usuarios_db;
CREATE USER 'usuarios_user'@'172.18.0.187' IDENTIFIED BY '<clave>';
GRANT ALL PRIVILEGES ON usuarios_db.* TO 'usuarios_user'@'172.18.0.187';

-- ms-envios (Vanessa)
CREATE DATABASE IF NOT EXISTS envios_db;
CREATE USER 'envios_user'@'172.18.0.187' IDENTIFIED BY '<clave>';
GRANT ALL PRIVILEGES ON envios_db.* TO 'envios_user'@'172.18.0.187';

-- ms-clientes (Araly)
CREATE DATABASE IF NOT EXISTS clientes_db;
CREATE USER 'clientes_user'@'172.18.0.187' IDENTIFIED BY '<clave>';
GRANT ALL PRIVILEGES ON clientes_db.* TO 'clientes_user'@'172.18.0.187';

-- ms-conductores (Jacobo)
CREATE DATABASE IF NOT EXISTS conductores_db;
CREATE USER 'conductores_user'@'172.18.0.187' IDENTIFIED BY '<clave>';
GRANT ALL PRIVILEGES ON conductores_db.* TO 'conductores_user'@'172.18.0.187';

-- ms-vehiculos (Valeria)
CREATE DATABASE IF NOT EXISTS vehiculos_db;
CREATE USER 'vehiculos_user'@'172.18.0.187' IDENTIFIED BY '<clave>';
GRANT ALL PRIVILEGES ON vehiculos_db.* TO 'vehiculos_user'@'172.18.0.187';

FLUSH PRIVILEGES;

-- Comprobacion
SELECT user, host FROM mysql.user WHERE user LIKE '%\_user';
SHOW DATABASES;
