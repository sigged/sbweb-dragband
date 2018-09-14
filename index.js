/**
 * @description Simple node.js server to help serve index.htm
 */

const express = require('express')
const app = express()

const path = require('path')
const fs = require('fs');

//serve everything as static
app.use(express.static(path.join(__dirname, 'build')));
app.listen(3000, () => console.log('app listening on port 3000!'))