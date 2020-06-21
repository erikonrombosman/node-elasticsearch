const express = require('express');
const app = express();
const routes = require('./routes');

let port = process.env.PORT || 3000;

app.use('/api/v1', routes);
app.listen(port, ()=>{
  console.log(`The server is listening on port ${port}`)
})
