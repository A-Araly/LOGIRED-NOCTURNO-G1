// middlewares de seguridad (autenticación y autorización)
// verifica que el token JWT enviado en la cabecera Authorization sea válido y no haya expirado
//requiereRol: deja pasar solo a los usuarios con el rol especificado (o uno de los roles especificados)
//cada microservicio verifica el token con la clave jwt_secret del .env
// sin preguntarle nada a ms-usuarios
const jwt = require('jsonwebtoken');
const HttpError = require('../utils/http-error');


// lee "autorization: Bearer <token>" , lo verifica y guarda en req.usuario
// los datos que trae el token : {id,nombre,rol]}
function verificarToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    throw new HttpError(401, 'Falta el token de acceso (cabecera Authorization: Bearer <token>)');
  }
  try {
    req.usuario = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new HttpError(401, 'Token inválido o vencido');
  }
  next();
}


function requiereRol(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.usuario.rol)) {
      throw new HttpError(403, `El rol ${req.usuario.rol} no tiene permiso para esta operación`);
    }
    next();
  };
}

module.exports = { verificarToken, requiereRol };