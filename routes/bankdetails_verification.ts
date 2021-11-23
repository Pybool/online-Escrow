"use strict";
import { Console } from 'console';
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const { ORDER_POOL_QUERIES, USER_QUERIES, PROC_POOL_QUERIES,BANK_QUERIES } = require('../Query/queries')
var SqlString = require('sqlstring');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
var events = require('events');
const router = express.Router();
const { sequelize } = require('../connection')
const { mailOptions_args, sendMail } = require('../services/mailservice')
const { v1: uuidv1,v4: uuidv4 } = require('uuid');
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
import fetch from 'cross-fetch';
var em = new events.EventEmitter();
let success = false;
let _event:any;

// SQL queries handler function
let p:any ;

function parseSql(presql:string,parameters: any){

    var sql =  SqlString.format(presql,parameters)
    console.log('The Query ',sql)
    return sql

}

async function parseSqlNoParam(presql:string){

    var sql =  SqlString.format(presql)
    console.log('The Query ',sql)
    return sql

} 
async function resolveAccountNumber(account_no:number,bank_code:number,res:any){

    p = new Promise((resolve, reject) => {
        fetch(`https://api.paystack.co/bank/resolve?account_number=${account_no}&bank_code=${bank_code}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            },

        })
        .then((response) => response.json())
        .then((data) => {
            console.log("the data", data)
            if (data.status){
                return res.send({
                    status:true,
                    message: data.message,
                });
            }
            else{

                return res.send({
                    status:false,
                    message: data.message,
                });

            }
            
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
}

async function createTransferRecipient(public_id:string,name:string,account_number:string,bank_code:number,res:any){
    
    let bodyload = JSON.stringify({
                                "type": "nuban",
                                "name":`${name}`,
                                "account_number": `${account_number}` ,
                                "bank_code": `${bank_code}`,
                                "currency": "NGN"
                            })
    console.log("The shogun ",bodyload)
    p = new Promise((resolve, reject) => {
        fetch(`https://api.paystack.co/transferrecipient`, {
            method: 'POST',
            body: bodyload,
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
            },

            

        })
        .then((response) => response.json())
        .then((Data) => {
            console.log(Data)
            resolve(Data)
            if (Data.status){
                console.log("the data", Data)
                const timestamp = new Date().getTime()
                const parameters = [ public_id,Data.data.details.bank_name,Data.data.details.bank_code,Data.data.details.account_number,Data.data.details.account_name,Data.data.recipient_code,timestamp,"23/09/09","23/09/09" ]
                sequelize.query(parseSql(BANK_QUERIES.CREATE_RECIPIENT,parameters)).then((results: any,error:any) => {
                    console.log(results)
                    if (results[1]==1){
                        em.on('recipient.created', function (data:any) {
                            success=true
                            console.log('Status: ' + data);
                          
                                console.log("Status" ,success)
                                return res.status(201).json ({
                                    status:true,
                                    message: "Account number verified",
                                });
            
                        });
                        let _event = new Promise((resolve, reject) => {
                            em.emit('recipient.created', 'Recipient has been successfully created');
                        });
            
                    }
                })
            }
        
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });

    }


router.post('/bank/resolve_account_number',  (req:express.Request, res:express.Response, next) => {

    // let p = new Promise((resolve, reject) => {

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
        console.log(theToken,req.headers,'---------------------')
        const decoded = jwt.verify(theToken, 'the-super-strong-secrect');
        async function resolveAccount(){
            const account_no = req.body.bankVerification.accountno
            const bank_code = req.body.bankVerification.bankcode
            const account_name = req.body.bankVerification.accountname;
            console.log(req.body,account_no,bank_code,account_name)
            await resolveAccountNumber((account_no),bank_code,res)
            p.then((data:any)=>{

                console.log("//////////",data)//Mock response to be removed 
                
                ////////////////////

                // createTransferRecipient(decoded.id,account_name,account_no,bank_code,res).then(()=>{
                    
                // })
                 
            })
           
        }
        resolveAccount()
        
    });


// router.get('/verify_accountNo',  (req:express.Request, res:express.Response, next) => {

//     const userID = req.query.public_id
//     var parameters = [userID]
//     console.log("pppp")
//     try{
//         sequelize.query(parseSql(BANK_QUERIES.GET_RECIPIENT,parameters))
//         .then((results: any,error:any) => {
//             console.log("pppp",error)
//             if(results){
//                 if (results[0][0].publid_id==userID){
                
//                     return res.send({ "status": true,  message: `Recipient retrieved`, data: results[0][0].recipient_code });
//                 }
//                 else{
//                     return res.send({ "status": false,  message: `Verify your account number to perform this action` });
//                 }

//             }
//             if(error){
//                 return res.send({ "status": false,  message: `Verify your account number to perform this action` });
//             }
            
//         })

//     }
    
//     catch(error){
//         return res.send({ "status": false,  message: `Verify your account number to perform this action` });
//     }
    
    
    

// })

module.exports = router;


// Admin 
// Admin_process
//3CNGaCU4@@K4WBp