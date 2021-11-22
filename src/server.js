const express = require('express');
// const cors = require('cors');
require('dotenv').config();

const PORT = process.env.PORT || 3333;

const productsRoute = require('./routes/productsRoute');
const ordersRoute = require('./routes/ordersRoute');

const app = express();

// app.use(cors());

app.use(express.json());

app.use('/api/products', productsRoute);
app.use('/api/orders', ordersRoute);

app.listen(PORT);
