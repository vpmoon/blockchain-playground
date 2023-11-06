const { withdrawEtn, withdrawUsdt } = require('./service');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.post('/withdraw/etn', async (req, res) => {
    await withdrawEtn();
    res.end();
});

app.post('/withdraw/usdt', async (req, res) => {
    await withdrawUsdt();
    res.end();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});