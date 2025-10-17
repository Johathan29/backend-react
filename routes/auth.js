const express = require('express');
const router = express.Router();
const { loginUser, registerUser, verifyToken } = require('../controllers/authController');

// Registro
router.post('/register', registerUser);

// Login (recibe token de Firebase)
router.post('/login', loginUser);

// Ruta protegida de ejemplo
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: 'Bienvenido', user: req.user });
});

module.exports = router;
