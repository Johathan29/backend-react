
import {
  collection,
  doc,
  getDoc,
  updateDoc,
  addDoc,
  Timestamp
} from "firebase/firestore";
const admin = require('firebase-admin');
const db = admin.firestore();
export const createSale = async (req, res) => {
  try {
    const { cliente, productos, metodo_pago } = req.body;

    // Validar campos
    if (!productos || productos.length === 0) {
      return res.status(400).json({ error: "Debe incluir productos" });
    }

    // Verificar stock y actualizar
    for (const p of productos) {
      const prodRef = doc(db, "Products", p.id);
      const prodSnap = await getDoc(prodRef);

      if (!prodSnap.exists()) {
        return res.status(404).json({ error: `Producto ${p.id} no encontrado` });
      }

      const prodData = prodSnap.data();
      if (prodData.cantidad < p.cantidad) {
        return res.status(400).json({
          error: `Stock insuficiente para ${prodData.nombre}`
        });
      }

      // Descontar inventario
      await updateDoc(prodRef, {
        cantidad: prodData.cantidad - p.cantidad
      });

      // Registrar movimiento en inventory_logs
      await addDoc(collection(db, "inventory_logs"), {
        productoId: p.id,
        tipo: "salida",
        cantidad: p.cantidad,
        motivo: "Venta",
        fecha: Timestamp.now()
      });
    }

    // Registrar venta
    const saleRef = await addDoc(collection(db, "sales"), {
      cliente,
      productos,
      metodo_pago,
      fecha: Timestamp.now(),
      total: productos.reduce((acc, p) => acc + p.precio * p.cantidad, 0)
    });

    res.status(201).json({ message: "Venta registrada", id: saleRef.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar la venta" });
  }
};
