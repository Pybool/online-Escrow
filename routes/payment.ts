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
let retry_count = 0;
// SQL queries handler function
function parseSql(presql:string,parameters: any){

    var sql =  SqlString.format(presql,parameters)
    console.log('The Query ',sql)
    return sql

}

async function verifyTransferAction(){


}

async function initiateTransfer(recipient_code:any,amount:any,res:any){

        let payment_promise = new Promise((resolve, reject) => {
            fetch(`https://api.paystack.co/transfer`, {
                method: 'POST',
                body: JSON.stringify({
                    "source": "balance",
                    "amount":amount,
                    "recipient": recipient_code,
                    "reason": "Reservation fulfillment"
                    
                  }),
                headers: {
                    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
                },
    
            })
            .then((response) => response.json())
            .then((Data) => {
                console.log("payment response: ",Data)
                if (!Data.status){
                    retry_count++
                    
                    if (retry_count < 5){
                        res.json({ "status": false, message: 'Your payment could not be queued,retrying' });
                        initiateTransfer(recipient_code,amount,res)
                    }
                    else{
                        res.json({ "status": false, message: 'Your payment could not be processed' });
                    }
                    
                }
                else{
                    res.json({ "status": true, message: 'Your payment has been queued' });
                }
             })

        })
        payment_promise.then(()=>{
            
        })


}

router.post('/transaction/confirm',  (req:express.Request, res:express.Response, next) => {

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
        // const order_id = req.query.order_id
        const seller_id = req.body.seller_id
        const sellerToken = req.body.sellerToken;
        const decoded_seller_token = jwt.verify(sellerToken, 'the-super-strong-secrect');
        console.log("Decoded seller token ",decoded_seller_token)
        const trnx_mode = req.query.transaction_mode
        
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

                        const order_id:string = decoded_seller_token.order_id
                        let data = {}
                        if (trnx_mode == "order.table"){
                            let p = new Promise((resolve, reject) => {
                                var verification_parameters:string[] = [ order_id] 
                                sequelize.query(parseSql(ORDER_POOL_QUERIES.GET_PARTIES,verification_parameters)).then((results: any,error:any) => {
                                    var results = results[0][0]
                                        console.log(results)
                                        
                                        if (results.order_publisher==decoded.id){
                                            let proc_parameters = [results.order_publisher]
                                            sequelize.query(parseSql(PROC_POOL_QUERIES.GET_PARTIES,proc_parameters)).then((results: any,error:any) => {
                                                var proc_results = results[0][0]
                                                console.log(proc_results)
                                                
                                                if (proc_results.order__publisher==decoded.id){
                                                    let payment_parameters = [proc_results.order__handler]
                                                    sequelize.query(parseSql(PAYMENT_POOL_QUERIES.GET_PARTIES,payment_parameters)).then((results: any,error:any) => {
                                                        var pay_results = results[0][0]
                                                        console.log(pay_results)
                                                        
                                                        if (pay_results.order_publisher==proc_results.order__publisher){
                                                            let bank_parameters = [proc_results.order__handler]
                                                            sequelize.query(parseSql(BANK_QUERIES.GET_RECIPIENT,bank_parameters)).then((results: any,error:any) => {
                                                                var bnk_results = results[0][0]
                                                                console.log(bnk_results)
                                                                
                                                                if (bnk_results.public_id==proc_results.order__handler){
                                                                    initiateTransfer(bnk_results.recipient_code,pay_results.amount,res).then(()=>{

                                                                    })
                                                                }
                                                                else{
                                                                    return res.status(401).json({
                                                                        status:false,
                                                                        message: "Unauthorised action cannot be performed",
                                                                    });
                                                                }
                                                            })
                                                            
                                                        }
                                                        else{
                                                            return res.status(401).json({
                                                                status:false,
                                                                message: "Unauthorised action, Non matching publisher for bank queries",
                                                            });
                                                        }
                                                    })

                                                }
                                                else{
                                                    return res.status(401).json({
                                                        status:false,
                                                        message: "Unauthorised action, Non matching publisher for payment pool",
                                                    });
                                                }
                                            })
                                            
                                        }
        
                                        else{
                                            return res.status(401).json({
                                                status:false,
                                                message: "Unauthorised action, Non matching publisher for processing pool",
                                            });
                                        }
                                })
                                
                            })
                            p.then((seller_token_payload:any) => { 
                                
                                console.log("damn ",seller_token_payload)
                                const decoded_seller_token = jwt.verify(seller_token_payload.seller_token, 'the-super-strong-secrect');
                                const verified_order_id:string = decoded_seller_token.order_id
                                var verification_parameters:string[] = [ "joined",verified_order_id] 
                                sequelize.query(parseSql(PROC_POOL_QUERIES.UPDATE_STATUS,verification_parameters)).then((results: any,error:any) => {
                                    if (results[0].affectedRows > 0){
                                        var params = [decoded_seller_token,decoded.id]
                                        
                                        let response = sendMail(mailOptions_args(decoded_seller_token.publisher_id,params),"seller.joined.event")
                                        resolve(response)
                                        return res.send({ "status": true,  message: `Seller successfully joined transaction` });
                                    }
                                    else{return res.send({ "status": false,  message: `An error occured, seller might have already joined transaction` });}
                                })
                                // let response = sendMail(mailOptions_args(seller_token_payload[2],seller_token_payload),"seller.tokensent.event")
                                // resolve(response)
                                // return res.send({ "status": true,  message: `Token ${seller_token_payload[3]} successfully sent to ${seller_token_payload[2]} ` });
                            
                            })
                        }

                        if (trnx_mode == "order.incognito"){

                            let p = new Promise((resolve, reject) => {
                                var verification_parameters:string[] = [ order_id]
                                sequelize.query(parseSql(PROC_POOL_QUERIES.INCOGNITO_VERIFY_TOKEN,verification_parameters)).then((results: any,error:any) => {
                                    if (results[0].affectedRows > 0){
                                        
                                        return res.send({ "status": true,  message: `Seller successfully transaction` });
                                    }
                                    else{return res.send({ "status": false,  message: `Seller could not join transaction` });}
                                })
                                
                            })
                            // p.then((seller_token_payload:any) => { 
                                
                            //     let response = sendMail(mailOptions_args(seller_token_payload[2],seller_token_payload),"seller.tokensent.event")
                            //     resolve(response)
                            //     return res.send({ "status": true,  message: `Token ${seller_token_payload[3]} successfully sent to ${seller_token_payload[2]} ` });
                            
                            // })
                        }
                    }
                }
                catch(err){
                    console.log(`Error ${err} occured`)
                }
        
        })

    })
   
});


module.exports = router;
