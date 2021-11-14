"use strict";
import { Console } from 'console';
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const {ORDER_POOL_QUERIES, USER_QUERIES, PROC_POOL_QUERIES,INCOGNITO_POOL_QUERIES,PAYMENT_POOL_QUERIES} = require('../Query/queries')
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

router.get('/transaction/generate_sellertoken',  (req:express.Request, res:express.Response, next) => {

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
        var order_id:any;
        var price:any;
        const trnx_mode = req.query.transaction_mode
        if (trnx_mode == "order.table"){ order_id = req.query.order_id}
        if (trnx_mode == "order.incognito"){ price = req.query.price;}

        let parameters:any[] = [ decoded.id ]

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
                        if (trnx_mode == "order.table"){
                            parameters = [ order_id ]
                            sequelize.query(parseSql(ORDER_POOL_QUERIES.RESERVE_ORDER_DATA,parameters)).then((results: any,error:any) => {

                                if (!results[0][0]){
                    
                                    return res.send({ "status": false,  message: `Cannot generate seller token for non-existent order` });
                                }
                                else{
                                    if (decoded.id==results[0][0].order_publisher){
                    
                                        const transaction_token = jwt.sign({
                                            order_id:order_id,
                                            publisher_id:results[0][0].order_publisher,
                                            commodity:results[0][0].commodity,
                                            qty:results[0][0].quantity,
                                            price:results[0][0].price,
                                            timestamp:results[0][0].timestamp},
                                            'the-super-strong-secrect',
                                            { expiresIn: '200h' });
                                            //Tie token to current transaction
                                            parameters = [ transaction_token,order_id ]
                                            sequelize.query(parseSql(PROC_POOL_QUERIES.INSERT_SELLER_TOKEN,parameters)).then((results: any,error:any) => { 

                                                if (results[0].affectedRows > 0){
                                                    sequelize.query(parseSql(PROC_POOL_QUERIES.GET_HANDLER_ID,[ parameters[1] ])).then((results:any[],error:any) =>{
                                                        console.log("Order AHndlerrrrrrr",results[0])
                                                        if (!results[0][0]){ return res.send({ "status": false,  message: `Could not send seller details` })}
                                                        else{sendMail(mailOptions_args(decoded.id,{params:parameters,handler:results[0][0].order__handler}),"generate.token.event")}
                                                        
                                                    })  
                                                    return res.send({ "status": true,  message: `Seller token successfully generated and mail sent`,"seller_token":`${transaction_token}` });
                                                }
                                                else{return res.send({ "status": false,  message: `The seller token could not be added to proccessing pool` });}
                                            })
                                    }
                                    else{ return res.send({ "status": false,  message: `You are not the publisher of this Order` });}  
                            } 
                        })
                    }
                        if (trnx_mode == "order.incognito"){
    
                            if (decoded.id){
            
                                const transaction_token = jwt.sign({
                                    publisher_id:decoded.id,
                                    price:price,
                                    },
                                    'the-super-strong-secrect',
                                    { expiresIn: '200h' });
                                    //Tie token to current transaction
                                    function getRndInteger(min:number, max:number) {
                                        return Math.floor(Math.random() * (max - min + 1) ) + min;
                                    }
                                    const order_id = "GHOST-OF-"+Math.round(new Date().getTime()/getRndInteger(2020,2070))
                             
                                    parameters = [order_id,decoded.id,price ,transaction_token]
                                    sequelize.query(parseSql(INCOGNITO_POOL_QUERIES.INSERT_SELLER_TOKEN,parameters)).then((results: any,error:any) => { 

                                        if (results[0].affectedRows > 0){
                                            sequelize.query(parseSql(INCOGNITO_POOL_QUERIES.GET_HANDLER_ID,[ parameters[1] ])).then((results:any[],error:any) =>{
                                                
                                                if (!results[0][0]){ return res.send({ "status": false,  message: `Could not send seller details` })}
                                                else{sendMail(mailOptions_args(decoded.id,{params:parameters,handler:results[0][0].order__handler}),"generate.token.event")}
                                                
                                            })  
                                            return res.send({ "status": true,  message: `Seller token successfully generated and mail sent`,"seller_token":`${transaction_token}` });
                                        }
                                        else{return res.send({ "status": false,  message: `The seller token could not be added to proccessing pool` });}
                                    })
                            }
                            else{ return res.send({ "status": false,  message: `You are not the publisher of this Order` });}  

                        }

                  }
                }

                catch(err){console.log(`Error ${err} occured`) }
            })

})


// router.post('/transaction/send_sellertoken',  (req:express.Request, res:express.Response, next) => {

//     let p = new Promise((resolve, reject) => {
//         if(
//             !req.headers.authorization ||
//             !req.headers.authorization.startsWith('Bearer') ||
//             !req.headers.authorization.split(' ')[1]
//         ){
//             return res.status(422).json({
//                 message: "Please provide the token",
//             });
//         }
    
//         const theToken = req.headers.authorization.split(' ')[1];
//         const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
//         const parameters = [ decoded.id ]
//         const order_id = req.query.order_id
//         const seller_id = req.body.seller_id
//         const seller_token = req.body.seller_token
//         const trnx_mode = req.body.transaction_mode
        
//         sequelize.query(parseSql(USER_QUERIES.GET_USER,parameters)).then((results: any,error:any) => {
//             // if (error) throw error;
//             try
//                 {

//                     if (!results[0][0]){
//                         console.log("Non-existent User");
//                         res.json({ "status": false, message: 'Cannot process request from invalid user' });
//                         throw "non.existent.user"
                    
//                     }              

//                     else{//check if Seller, token generated, and the order publisher are all in the same bundle

//                         if (trnx_mode == "order.table"){
//                             const order_id:string = req.body.order_id
//                             let data = {}
//                             let p = new Promise((resolve, reject) => {
//                                 var verification_parameters:string[] = [ order_id]
//                                 sequelize.query(parseSql(PROC_POOL_QUERIES.VERIFY_TOKEN_RECIPIENT,verification_parameters)).then((results: any,error:any) => {
//                                     var results = results[0][0]
                                
//                                     if ((results.token==seller_token) && (results.order__publisher==decoded.id) && (results.order__handler==seller_id)){
//                                         resolve(results) 
//                                     }

//                                     else{
//                                         return res.send({ "status": false,  message: `Seller token does not match seller you are sending token to` });

//                                     }
                                
//                                 })
                                
//                             })

//                             p.then((seller_token_payload:any) => { 
                                
//                                 let response = sendMail(mailOptions_args(seller_token_payload[2],seller_token_payload),"seller.tokensent.event")
//                                 resolve(response)
//                                 return res.send({ "status": true,  message: `Token ${seller_token_payload[3]} successfully sent to ${seller_token_payload[2]} ` });
                            
//                             }).then((args:any) => { 

//                                 console.log("Email response ",args)
//                             })

//                       }

//                       if (trnx_mode == "order.incognito"){

//                             const order_id:string = req.body.order_id
//                             let data = {}
//                             let p = new Promise((resolve, reject) => {
//                                 var verification_parameters:string[] = [ order_id]
//                                 sequelize.query(parseSql(INCOGNITO_POOL_QUERIES.VERIFY_TOKEN_RECIPIENT,verification_parameters)).then((results: any,error:any) => {
//                                     var results = results[0][0]
                                
//                                     if ((results.token==seller_token) && (results.order__publisher==decoded.id) && (results.order__handler==seller_id)){
//                                         resolve(results) 
//                                     }

//                                     else{
//                                         return res.send({ "status": false,  message: `Seller token does not match seller you are sending token to` });

//                                     }
                                
//                                 })
                                
//                             })

//                             p.then((seller_token_payload:any) => { 
                                
//                                 let response = sendMail(mailOptions_args(seller_token_payload[2],seller_token_payload),"seller.tokensent.event")
//                                 resolve(response)
//                                 return res.send({ "status": true,  message: `Token ${seller_token_payload[3]} successfully sent to ${seller_token_payload[2]} ` });
                            
//                             }).then((args:any) => { 

//                                 console.log("Email response ",args)
//                             })

//                       }
//                     }
//                 }
//                 catch(err){
//                     console.log(`Error ${err} occured`)
//                 }
        
//         })

//     })
   
// });
 
router.post('/transaction/seller_join',  (req:express.Request, res:express.Response, next) => {

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

                    else{//Join the seller to the transaction

                        const order_id:string = decoded_seller_token.order_id
                        let data = {}
                        if (trnx_mode == "order.table"){
                            let p = new Promise((resolve, reject) => {
                                var verification_parameters:string[] = [ order_id] 
                                sequelize.query(parseSql(PROC_POOL_QUERIES.ORDER_TABLE_VERIFY_TOKEN,verification_parameters)).then((results: any,error:any) => {
                                    var results = results[0][0]
                                        console.log(results)
                                        // console.log(results.seller_token,sellerToken)
                                        if (results.seller_token==sellerToken){
                                            
                                            resolve(results) 
                                        }
        
                                        else{
                                            return res.send({ "status": false,  message: `Your token does not match the order you reserved` });
        
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
                                        
                                        sequelize.query(parseSql(PAYMENT_POOL_QUERIES.INSERT_BENEFICIARY,verification_parameters)).then((results: any,error:any) => {
                                            resolve(results[0][0])
                                        }).then((result:any)=>{
                                            const timestamp = new Date().getTime()
                                            let payment_parameters =[seller_id,result.order_id,result.order_publisher,result.price,timestamp,"23/09/09","23/09/09"]
                                            sequelize.query(parseSql(PAYMENT_POOL_QUERIES.INSERT_BENEFICIARY,payment_parameters)).then((results: any,error:any) => {

                                            })
                                        })
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
