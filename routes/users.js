const express = require('express')
const router = express.Router()
router.get('/', (req,res)=> res.json({ ok: true, msg: 'users route placeholder' }))
module.exports = router
