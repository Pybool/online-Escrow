"use strict";
import { Console } from 'console';
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const {ORDER_POOL_QUERIES, USER_QUERIES} = require('../Query/queries')
var SqlString = require('sqlstring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const router = express.Router();
const { sequelize } = require('../connection')
const { mailOptions_args, sendMail, decodeRegistrationToken, encodeRegistrationToken } = require('../services/mailservice')
const { v1: uuidv1,v4: uuidv4 } = require('uuid');

// SQL queries handler function
function parseSql(presql:string,parameters: any){

    var sql =  SqlString.format(presql,parameters)
    console.log('The Query ',sql)
    return sql

}

router.get('/orderpool/vaccum',  (req:express.Request, res:express.Response, next) => {

    var parameters = [ new Date().getTime() ]
            sequelize.query(parseSql(ORDER_POOL_QUERIES.CLEAN_ORDER_TABLE,parameters)).then((results: any,error:any) => {
                console.log(results[0].affectedRows)
                if (results[0].affectedRows > 0){

                    return res.send({ "status": true,  message: `${results[0].affectedRows} Order(s) deleted` });
                }
                else{

                    return res.send({ "status": false,  message: `No Expired order,No order was deleted` });
                }
            })
})


router.post('/order/publish',  (req:express.Request, res:express.Response, next) => {

    let p = new Promise((resolve, reject) => {
        if(
            !req.headers.authorization ||
            !req.headers.authorization.startsWith('Bearer') ||
            !req.headers.authorization.split(' ')[1]
        ){
            return res.status(422).json({
                message: "Please provide the token",
            });
        }
    
        const theToken = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
        const parameters = [ decoded.id ]
        
            sequelize.query(parseSql(USER_QUERIES.GET_USER,parameters)).then((results: any,error:any) => {
                // if (error) throw error;
                try
                    {

                        if (!results[0][0]){
                            console.log("Non-existent User");
                            res.json({ "status": false, message: 'Cannot process request from invalid user' });
                            throw "non.existent.user"
                        
                        }

                        else{

                            console.log("Debugging ",results[0][0].public_id)
                        
                            function getRndInteger(min:number, max:number) {
                                return Math.floor(Math.random() * (max - min + 1) ) + min;
                            }
                            const order_id = "OF-"+Math.round(new Date().getTime()/getRndInteger(2020,2070))
                            const order_publisher = decoded.id
                            const commodity = req.body.commodity
                            const quantity = req.body.quantity
                            const price = req.body.price
                            const timestamp = new Date().getTime()
                            
                            interface IPublishOrder{
                                order_id:string,
                                order_publisher:string,
                                commodity:string,
                                quantity:number,
                                price:number,
                                timestamp:number,
                        
                            }
                
                            const order_data:IPublishOrder = {  order_id:order_id,
                                                                order_publisher:order_publisher,
                                                                commodity:commodity,
                                                                quantity:quantity,
                                                                price:price,
                                                                timestamp:timestamp
                                                                }
                    
                            resolve(order_data)
                        }
                    }
                    catch(err){
                        console.log(`Error ${err} occured`)
                    }
            })
    })

    
    p.then((order_data:any) => {
            var parameters = [ order_data.order_id,order_data.order_publisher,order_data.commodity,order_data.quantity,order_data.price,order_data.timestamp,"23/09/09","23/09/09" ]
            sequelize.query(parseSql(ORDER_POOL_QUERIES.PUBLISH_ORDER,parameters)).then((results: any,error:any) => {

                if(!error){
                
                    return res.send({ "status": true,  message: `Order ${order_data.order_id} successfully published` });
                } 
            })
        })
});
 

module.exports = router;
