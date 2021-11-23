import express from 'express';
import db from './models';
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const Sequelize = require('sequelize');
const {USER_QUERIES} = require('./Query/queries')
var SqlString = require('sqlstring');
const { sequelize } = require('./connection')
const authentication = require('./routes/authentication')
const publishOrder = require('./routes/publishOrder')
const reserveOrder = require('./routes/reserveOrder')
const transaction = require('./routes/transaction')
// const webhooks = require('./routes/webhooks')
const bankdetails_verification = require('./routes/bankdetails_verification')

const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

app.use('/api', authentication);
app.use('/api',publishOrder);
app.use('/api',reserveOrder);
app.use('/api',transaction);
// app.use('/api',webhooks);
app.use('/api',bankdetails_verification)

const port = process.env.PORT || 3000;


db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`App listening on port ${port}`)

    });
});

