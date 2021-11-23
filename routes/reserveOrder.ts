"use strict";
import { Console } from 'console';
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const {ORDER_POOL_QUERIES, USER_QUERIES, PROC_POOL_QUERIES} = require('../Query/queries')
var SqlString = require('sqlstring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const router = express.Router();
const { sequelize } = require('../connection')
const { mailOptions_args, sendMail } = require('../services/mailservice')
const { v1: uuidv1,v4: uuidv4 } = require('uuid');

// SQL queries handler function
function parseSql(presql:string,parameters: any){

    var sql =  SqlString.format(presql,parameters)
    console.log('The Query ',sql)
    return sql

}

router.get('/proc_pool/vaccum',  (req:express.Request, res:express.Response, next) => {
    
    var parameters = [ new Date().getTime() ]
            sequelize.query(parseSql(PROC_POOL_QUERIES.CLEAN_PROC_POOL,parameters)).then((results: any,error:any) => {
                console.log(results[0].affectedRows)
                if (results[0].affectedRows > 0){

                    return res.send({ "status": true,  message: `${results[0].affectedRows} Reservations(s) deleted` });
                }
                else{

                    return res.send({ "status": false,  message: `No Expired reservation,No reservation was deleted` });
                }
                
                
            })

})

router.get('/order/reservations/list',  (req:express.Request, res:express.Response, next) => {
    
    let p = new Promise((resolve, reject) => {
        // if(
        //     !req.headers.authorization ||
        //     !req.headers.authorization.startsWith('Bearer') ||
        //     !req.headers.authorization.split(' ')[1]
        // ){
        //     return res.status(422).json({
        //         message: "Please provide the token",
        //     });
        // }
    
        // const theToken = req?.headers?.authorization?.split(' ')[1];
        // const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
        // const parameters = [ decoded.id ]
        console.log("Request ",req.query)
        var parameters = [ Number(req.query.limit) ]
                sequelize.query(parseSql(ORDER_POOL_QUERIES.GET_RESERVATIONS,parameters)).then((results: any,error:any) => {
                    
                    if (results[0][0]){
                        return res.send({ "status": true,  message: `${results[0].length} Reservations(s) fetched`, data:results[0] });
                    }
                    else{

                        return res.send({ "status": false,  message: `No reservation was found` });
                    }
                    
                    
                })
        })
})


router.post('/order/reserve',  (req:express.Request, res:express.Response, next) => {

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

                        const order_id:string = req.body.order_id
                        let data = {}
                        let p = new Promise((resolve, reject) => {
                                var parameters:string[] = [ order_id ]
                                sequelize.query(parseSql(ORDER_POOL_QUERIES.RESERVE_ORDER_DATA,parameters)).then((results: any,error:any) => {
                                var results = results[0][0]

                                resolve(results)
                                    // return res.send({ "status": true,  message: `Order ${order_id} successfully reserved` });
                                    
                                })
                            
                        })

                        p.then((order_data:any) => { 
                            return new Promise((resolve, reject) => {
                                if (order_data.order_publisher !==decoded.id){

                                    var parameters = [ decoded.id ]
                                    sequelize.query(parseSql(PROC_POOL_QUERIES.USER_HAS_UNCOMPLETED_TRANSACTION,parameters)).then((results: any,error:any) => {

                                        if (!results[0][0]){

                                            parameters = [ order_id]
                                            
                                            sequelize.query(parseSql(PROC_POOL_QUERIES.CHECK_ORDER_EXISTS,parameters)).then((results: any,error:any) => {
                                                
                                                if (!results[0][0]){
                                                    console.log("reserve results ",results)
                                                    const timestamp = new Date().getTime()
                                                    parameters = [order_id, order_data.order_publisher,decoded.id,order_data.commodity,order_data.quantity,order_data.price,order_data.timestamp,timestamp,"23/09/09","23/09/09","reserved" ]
                                                    sequelize.query(parseSql(PROC_POOL_QUERIES.RESERVE_ORDER,parameters)).then((results: any,error:any) => {
                                                        resolve(parameters)
                                                        })
                                                }
                                                else{return res.status(404).json({ "status": false,  message: `Order ${order_id} already reserved` })}
                                            })
                                        }
                                        else{return res.status(404).json({ "status": false,  message: `You have a pending transaction already` })}
                                    })
                                }
                                else{return res.send({ "status": false,  message: `You cannot reserve an order placed by yourself` })}
                            })
                        }).then((args:any) => {
                            return new Promise((resolve, reject) => {
                                let response = sendMail(mailOptions_args(args[0],args),"reserved.order.event")
                                resolve(response)
                                return res.send({ "status": true,  message: `Order ${order_id} successfully reserved` });
                            })
                        }).then((args:any) => { 

                            console.log("Email response ",args)
                        })
                    }
                }
                catch(err){
                    console.log(`Error ${err} occured`)
                }
        
        })

    })
   
});
 

module.exports = router;
