const admin = require('firebase-admin')

exports.verifyAdmin = async (req, res, next) =>{
  try{
    const authHeader = req.headers.authorization
    if(!authHeader) return res.status(401).json({ error: 'no token' })
    const token = authHeader.replace('Bearer ', '')
    const decoded = await admin.auth().verifyIdToken(token)
    const uid = decoded.uid
    const userDoc = await admin.firestore().collection('users').doc(uid).get()
    if(!userDoc.exists) return res.status(403).json({ error: 'no user' })
    const role = userDoc.data().role
    if(role !== 'admin') return res.status(403).json({ error: 'not admin' })
    next()
  }catch(e){ res.status(401).json({ error: e.message }) }
}
