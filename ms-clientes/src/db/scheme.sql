SET NAMES utf8mb4;

CREATE TABLE clientes (
    id      INT AUTO_INCREMENT PRIMARY KEY,
    nombre  VARCHAR(100)    NOT NULL,
    documento   VARCHAR(100)    NOT NULL UNIQUE,
    telefono    VARCHAR(100)    NOT NULL,
    email   VARCHAR(120)    NOT NULL UNIQUE,
    ciudad  VARCHAR(100)    NOT NULL
);

INSERT INTO clientes (nombre, documento, telefono, email, ciudad) VALUES
    ('cliente1', '1111777999', '3115644230', 'cliente1@empresa.com', 'cali'),
    ( 'cliente2', '1111777888', '5778925985', 'cliente2@empresa.com', 'medellin'),
    ('cliente2', '1111777777', '6667742039', 'cliente3@empresa.com', 'bogota');