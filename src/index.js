const express = require('express')
const app = express();
const port = 5000;
const root = 'public';

console.log(__dirname);
app.use(express.static(`${__dirname}/public`));

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

