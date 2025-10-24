const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');

let userSessions = new Map(); // Guarda el último acceso por usuario (uid)

exports.loginUser = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token no enviado' });

    // Verifica el token de Firebase
    const decoded = await admin.auth().verifyIdToken(token);
    const uid = decoded.uid;

    // Genera el JWT del backend
    const backendToken = jwt.sign(
      { uid, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '20m' }
    );

    // Registra hora de último acceso
    userSessions.set(uid, Date.now());

    res.json({ user: decoded, backendToken });
  } catch (error) {
    console.error('❌ Error en loginUser:', error);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

exports.registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await admin.auth().createUser({
      email,
      password,
    });

    res.json({ ok: true, user });
  } catch (error) {
    console.error('❌ Error en registerUser:', error);
    res.status(400).json({ error: error.message });
  }
};

// Middleware para proteger rutas
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Token no enviado' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const lastAccess = userSessions.get(decoded.uid);
    if (lastAccess && Date.now() - lastAccess > 20 * 60 * 1000) {
      // Más de 20 min sin actividad
      userSessions.delete(decoded.uid);
      return res.status(440).json({ error: 'Sesión expirada por inactividad' });
    }

    userSessions.set(decoded.uid, Date.now()); // Refresca el tiempo
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};


// Inicializa el SDK Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Función para listar todos los usuarios
exports.listarUsuarios=async()=> {
  try {
    const listUsersResult = await admin.auth().listUsers(1000); // hasta 1000 usuarios por lote
    listUsersResult.users.forEach((userRecord) => {
      console.log('Usuario:', userRecord.uid, userRecord.email);
    });

    if (listUsersResult.pageToken) {
      // Llamar recursivamente si hay más usuarios
      await listarUsuarios(listUsersResult.pageToken);
    }
  } catch (error) {
    console.error("Error al listar usuarios:", error);
  }
}

listarUsuarios();

