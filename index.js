const express = require('express')

const db = require('./db')

const app = express()
const port = process.env.PORT || 4000

app.listen(port, () => console.log(`\nListening on port ${port}\n`))