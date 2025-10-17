const admin = require('firebase-admin');
const db = admin.firestore();

// ✅ Obtener todos los productos
exports.getProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('Products').get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(products);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};

// ✅ Obtener un producto por ID
exports.getProductById = async (req, res) => {
  try {
    const id = req.params.id;
    const docRef = db.collection('Products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// ✅ Crear un nuevo producto
exports.createProduct = async (req, res) => {
  try {
    const data = req.body;

    // Validación simple
    if (!data.name || !data.price) {
      return res.status(400).json({ message: 'El nombre y el precio son obligatorios' });
    }

    const newDoc = await db.collection('Products').add({
      ...data,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ id: newDoc.id, message: 'Producto creado exitosamente' });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// ✅ Actualizar un producto existente
exports.updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const docRef = db.collection('Products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await docRef.update({
      ...data,
      updatedAt: new Date().toISOString(),
    });

    res.json({ id, message: 'Producto actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// ✅ Eliminar un producto
exports.deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const docRef = db.collection('Products').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    await docRef.delete();

    res.json({ id, message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};
