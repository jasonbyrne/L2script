const express = require('express')
const app = express();
const port = 5000;
const root = 'public';

console.log(__dirname);
app.use(express.static(`${__dirname}/public`));

app.listen(port, () => {
    console.log(`L2script sample app running on port ${port}`);
    console.log(`http://localhost:${port}/`);
})

