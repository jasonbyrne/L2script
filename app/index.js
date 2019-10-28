const express = require('express');
const path = require('path')
const app = express();
const port = 5000;

console.log(__dirname);
app.use(express.static(path.resolve(__dirname, 'public')));

app.listen(port, () => {
    console.log(`L2script sample app running on port ${port}`);
    console.log(`http://localhost:${port}/`);
})

