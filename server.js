const express = require('express');

const app = express();

const PORT = process.env.PORT || 5000; //look for environment supported port or 5000

app.get('/', (req, res) => res.send('API Running'));

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});