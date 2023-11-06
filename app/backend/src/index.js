const { withdraw } = require('./service');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.post('/withdraw/:currency', async (req, res) => {
    const { currency } = req.params;

    await withdraw(currency);
    res.end();
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});