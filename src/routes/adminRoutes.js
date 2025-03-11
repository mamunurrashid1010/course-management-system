const express = require('express');
const router = express.Router();

router.get('/queues', (req, res) => {
    res.json({ message: 'Get request queues' });
});

router.post('/resolve', (req, res) => {
    res.json({ message: 'Resolve request' });
});

module.exports = router;