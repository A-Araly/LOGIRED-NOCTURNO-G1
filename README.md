# LOGIRED-NOCTURNO-G1

Empresa: Logired
Jornada: nocturna
Grupo: 1

Descripción de la aplicación:

La aplicación es para gestionar las operaciones de la empresa Logired que es una empresa de logística y mensajería.
Permite administrar clientes, envíos, conductores y vehículos, facilitando el seguimiento de paquetes y la gestión de la flota. Cuenta con diferentes roles de usuario y una arquitectura que combinada microservicios, capas y es distribuida para organizar y gestionar la información de manera independiente.

Integrantes: nombre, usuario de GitHub y microservicio a cargo.

Araly Arroyo Garcés - A-Araly - ms-clientes
Katherin Vanessa Cardona Salamanca - katherincardona-peke - ms-envios
Jacobo Días Bueno - Eljeiko - ms-conductores
Valeria Garcia Pérez - var-12 -ms-vehiculos

Tabla de microservicios: carpeta, entidad, responsable, puerto, y de qué otros microservicios depende.

El nombre de la carpeta es ms-clientes - la entidad es cliente - la responsable es Araly Arroyo Garcés - su puerto es 3002 - no depende de ningún microservicio

El nombre de la carpeta es ms-envios - la entidad es envio - la responsable es Katherin Vanessa Cardona Salamanca - su puerto es 3003 - se relaciones con ms-clientes

El nombre de la carpeta es ms-conductores - la entidad es conductor - el responsable es Jacobo Días Bueno - su puerto es 3004 - no depende de ningún microservicio

El nombre de la carpeta es ms-vehiculos - la entidad es vehiculo - la responsable es Valeria Garcia Pérez - su puerto es 3005 - se relaciones con ms-conductores


Estructura del repositorio:

la estructura del repositorio es: esta dividido en ramas, cada rama tiene su microservicio, está la carpeta ms-usuarios, ms-clientes, ms-conductores, ms-vehiculos, cada carpeta tiene sus capas iniciando por el indes.js, después el app, la capa de routers, la controladores, la de servicios, el model y el repositorio, cada una de las capas adaptadas a su microcervicios, los nombres respectivos de cada uno, sus validaciones, atributos, etc...

También están las carpetas de frontend y deploy.

Cómo ejecutar un microservicio: 

Al principio se instala las dependencias requeridas con el comando npm install, después creamos el .env y por ultimo ponemos a correr el servisio con npm run dev

