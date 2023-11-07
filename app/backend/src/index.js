const { withdraw, balance } = require('./service');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const ethers = require('ethers');

app.post('/withdraw/:currency', async (req, res) => {
    const { currency } = req.params;

    await withdraw(currency);
    res.end();
});

app.get('/balance/:address/:currency', async (req, res) => {
    const { address, currency } = req.params;

    const result = await balance(address, currency);
    res.json({
        balance: ethers.formatEther(result),
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});