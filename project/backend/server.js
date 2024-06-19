const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;
const windowSize = 10;
const numbersAPI = {
    p: 'http://20.244.56.144/test/primes',
    f: 'http://20.244.56.144/test/fibo',
    e: 'http://20.244.56.144/test/even',
    r: 'http://20.244.56.144/test/rand'
};

let numbersWindow = [];

const fetchNumbers = async (type) => {
    try {
        const response = await axios.get(numbersAPI[type], { timeout: 500 });
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error);
        return [];
    }
};

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;
    if (!numbersAPI[numberId]) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }

    const windowPrevState = [...numbersWindow];
    const newNumbers = await fetchNumbers(numberId);

    newNumbers.forEach((num) => {
        if (!numbersWindow.includes(num)) {
            if (numbersWindow.length >= windowSize) {
                numbersWindow.shift();
            }
            numbersWindow.push(num);
        }
    });

    const avg = numbersWindow.length > 0 
                ? (numbersWindow.reduce((acc, num) => acc + num, 0) / numbersWindow.length).toFixed(2) 
                : 0;

    const windowCurrState = [...numbersWindow];

    res.json({
        windowPrevState,
        windowCurrState,
        numbers: newNumbers,
        avg: parseFloat(avg)
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
