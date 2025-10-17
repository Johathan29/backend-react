const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();

/**
 * 🛒 GET /api/cart/:userId
 * Obtiene el carrito de un usuario
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const ref = db.collection("carts").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) {
      await ref.set({ items: [], updatedAt: new Date() });
      return res.json([]);
    }

    res.json(snap.data().items || []);
  } catch (err) {
    console.error("Error al obtener carrito:", err);
    res.status(500).json({ error: "Error al obtener carrito" });
  }
});

/**
 * ➕ POST /api/cart
 * Agrega o actualiza productos en el carrito
 */
router.post("/", async (req, res) => {
  try {
    const { userId, product } = req.body;
    const ref = db.collection("carts").doc(userId);
    const snap = await ref.get();

    let items = snap.exists ? snap.data().items || [] : [];

    const existing = items.find((i) => i.id === product.id);
    if (existing) {
      existing.quantity += product.quantity;
    } else {
      items.push(product);
    }

    items = items.filter((i) => i.quantity > 0);

    await ref.set({ items, updatedAt: new Date() });
    res.json({ success: true, items });
  } catch (err) {
    console.error("Error al actualizar carrito:", err);
    res.status(500).json({ error: "Error al actualizar carrito" });
  }
});

/**
 * 🗑 DELETE /api/cart/:userId/:productId
 * Elimina un producto del carrito
 */
router.delete("/:userId/:productId", async (req, res) => {
  try {
    const { userId, productId } = req.params;
    const ref = db.collection("carts").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) return res.json({ success: false });

    const newItems = (snap.data().items || []).filter(
      (i) => i.id !== productId
    );

    await ref.update({ items: newItems, updatedAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    console.error("Error al eliminar producto:", err);
    res.status(500).json({ error: "Error al eliminar producto" });
  }
});

/**
 * 🔄 DELETE /api/cart/:userId
 * Vacía el carrito completo
 */
router.delete("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const ref = db.collection("carts").doc(userId);
    await ref.set({ items: [], updatedAt: new Date() });
    res.json({ success: true });
  } catch (err) {
    console.error("Error al vaciar carrito:", err);
    res.status(500).json({ error: "Error al vaciar carrito" });
  }
});

module.exports = router;
