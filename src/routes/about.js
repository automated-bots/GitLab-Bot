var express = require('express');
var router = express.Router();

app.get('/', (req, res) => {
    res.json({ version: '1.0', name: 'GitLab Bot', devs: [{ name: 'Melroy van den Berg', email: 'melroy@melroy.org' }] })
})

module.exports = router;
