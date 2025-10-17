const admin = require('firebase-admin');
const db = admin.firestore();

exports.getCarts = async (req, res) => {
  try {
    const snapshot = await db.collection('carts').get();
    const carts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(carts);
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    res.status(500).json({ message: 'Error al obtener los productos', error: error.message });
  }
};
exports.createCarts = async (req, res) => {
  try {
    const data = req.body;

    // Validación simple
    if (!data.name || !data.price) {
      return res.status(400).json({ message: 'El nombre y el precio son obligatorios' });
    }

    const newDoc = await db.collection('carts').add({
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
exports.updateCart = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const docRef = db.collection('carts').doc(id);
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
export const updateQuantity = async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Carrito no encontrado" });

    const item = cart.items.find((p) => p.id === productId);
    if (!item) return res.status(404).json({ message: "Producto no encontrado" });

    // Si la cantidad es <= 0, eliminar el producto
    if (quantity <= 0) {
      cart.items = cart.items.filter((p) => p.id !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    res.json({ message: "Cantidad actualizada", items: cart.items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error al actualizar cantidad" });
  }
};
// ✅ Eliminar un producto
exports.deleteCart = async (req, res) => {
  try {
    const id = req.params.id;

    const docRef = db.collection('carts').doc(id);
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
