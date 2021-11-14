"use strict";
import { Console } from 'console';
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const {ORDER_POOL_QUERIES, USER_QUERIES, PROC_POOL_QUERIES,INCOGNITO_POOL_QUERIES} = require('../Query/queries')
var SqlString = require('sqlstring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const router = express.Router();
const { sequelize } = require('../connection')
const { mailOptions_args, sendMail } = require('../services/mailservice')
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

var secret = process.env.SECRET_KEY;
// Using Express
router.post("/api/escrow_payments/webhook/url", function(req: { body: any; headers: { [x: string]: any; }; }, res: { send: (arg0: number) => void; }) {
    //validate event
    var hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(req.body)).digest('hex');
    if (hash == req.headers['x-paystack-signature']) {
    // Retrieve the request's body
    var event = req.body;
    // Do something with event  
    }
    res.send(200);
});