"use strict";
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const {TEMP_USER_QUERIES, USER_QUERIES,BANK_QUERIES} = require('../Query/queries')
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

router.get('/verify_accountNo',  (req:express.Request, res:express.Response, next) => {

    const userID = req.query.public_id
    var parameters = [userID]
    console.log("pppp",parameters)
    try{
       
        sequelize.query(parseSql(BANK_QUERIES.GET_RECIPIENT,parameters)).then((results: any,error:any) => {
            console.log("pppp",results[0][0],error)
            if(results[0][0] !=undefined){
                if (results[0][0].publid_id==userID){
                
                    return res.send({ "status": true,  message: `Recipient retrieved`, data: results[0][0].recipient_code });
                }
                else{
                    return res.send({ "status": false,  message: `Verify your account number to perform this action` });
                }

            }
            else{
                return res.send({ "status": false,  message: `Verify your account number to perform this action` });
            }
            
        })

    }
    
    catch(error){
        console.log(1200000,error)
        return res.send({ "status": false,  message: `Verify your account number to perform this action` });
    }
    
    
    

})

router.get('/authentication/resend_mail',  (req:express.Request, res:express.Response, next) => {

    console.log("Email confirmed ",req.query)
    const userID = req.query.public_id
    var parameters = [userID]
    try{
        sequelize.query(parseSql(TEMP_USER_QUERIES.GET_USER_BY_ID,parameters)).then((results: any,error:any) => {
               
            if (results[0][0]){
                parameters = [results[0][0].email]
                sendMail(mailOptions_args(userID,parameters),"user.register.event")
                return res.send({ "status": true,  message: `Email verification link resent` });
            }
            else{
                return res.send({ "status": false,  message: `Email verification link could not be resent` });
            }
        })

    }
    
    catch(error){
        return res.send({ "status": false,  message: `Email verification link could not be resent` });
    }
    
   

})




router.get('/authentication/confirm_email',  (req:express.Request, res:express.Response, next) => {

    const userID = req.query.userID
    var public_id = [ decodeRegistrationToken(userID).userId ]
    public_id = public_id
    if (!public_id[0]){
        console.log("dddddddddddd",public_id[0],userID)
        return res.send(`<h1>Angular Online Escrow</h1><br><h3>Seems Your link has expired</h3>`)
    }
    try{

        let p = new Promise((resolve, reject) => {
                sequelize.query(parseSql(TEMP_USER_QUERIES.MIGRATE_USERS,public_id)).then((results: any,error:any) => {
                    console.log("Fetched results from Tempdb ",results[0][0])
                    results = results[0][0]
                    var result = [  
                                    public_id[0],results.firstname,results.middlename,results.lastname,results.username,
                                    results.email,results.telephone,results.password,results.createdAt,
                                    results.updatedAt
                                    ]

                    if (error) {
                        reject(new Error('Ooops, something broke!'));
                    } 
                    else {
                        resolve(result);
                    }
                });
        })

        p.then((parameters) => {
                console.log("params ",parameters)
                sequelize.query(parseSql(USER_QUERIES.INSERT_USERS,parameters)).then((results: any,error:any) => {
                    if (error) throw error;

                    else{
                        sequelize.query(parseSql(TEMP_USER_QUERIES.DELETE_USER,public_id[0])).then((results: any,error:any) => {
                            if (error) throw error;
                            console.log("User has been migrated to main Database")
                            return res.send({ "status": true,  message: 'Email confirmed.',event:"mail.confirmed" });
        
                        });
                    }

                });   
        })
    }
    catch(err){

        res.send(`<h1>Angular Online Escrow</h1><br><h3>Seems Your link has expired</h3>`)
    }

    return res.send({ "status": true,  message: 'Email confirmed.',userID:decodeRegistrationToken(userID) });
   
});

router.post('/authentication/register',  (req:express.Request, res:express.Response, next) => {

    const firstname = req.body.account.firstname
    const middlename = req.body.account.middlename
    const lastname = req.body.account.lastname
    const username = req.body.account.username
    const email = req.body.account.email
    const telephone = req.body.account.telephone
    const password = req.body.account.password

    interface IRegister{
        firstname:string, middlename:string,lastname:string,username:string,email:string,
        telephone:string,password:string,
    }

    const user_reg_data:IRegister = {
                                     firstname:firstname,middlename:middlename,lastname:lastname,username:username,
                                     email:email,telephone:telephone,password:password
                                    }

    console.log("da fuc ",req.body.account)
    let public_id:string = uuidv4()
    let p = new Promise((resolve, reject) => {
            var parameters = [ email ]
            sequelize.query(parseSql(TEMP_USER_QUERIES.CHECK_EMAIL_EXISTS,parameters)).then((results: any,error:any) => {
               
                if (results[0][0]){
                    return res.send({ "status": false,  message: `User with Email ${user_reg_data.email} already exists` });
                }
                
                else{
                    parameters= [ username ]
                    sequelize.query(parseSql(TEMP_USER_QUERIES.USERNAME_EXISTS,parameters)).then((results: any,error:any) => {
                        if (results[0][0]){
                            return res.send({ "status": false,  message: `User with Username ${user_reg_data.username} already exists` });
                        }
                        else{
                                        resolve(console.log("Registration data successfully validated"))
                                        
                                        //...
                                    }

                        // else{
                        //     parameters= [ acc_no ]
                        //     sequelize.query(parseSql(TEMP_USER_QUERIES.CHECK_ACC_NO_EXISTS,parameters)).then((results: any,error:any) => {
                        //         if (results[0][0]){
                        //             return res.send({ "status": false,  message: `User with Account number ${user_reg_data.acc_no} already exists` });
                        //         }
                        //         else{
                        //             resolve(console.log("Registration data successfully validated"))
                                    
                        //             //...
                        //         }
                        //     })
                        // }
                    })
                }
            })

    })

    p.then(() => {
            bcrypt.hash(user_reg_data.password, 10, (err: any, hash: any) => {
                if (err) {
                    return res.status(500).send({
                    status:false,
                    msg: err
                    });
                } 
                else {

                        var parameters = [  
                                            public_id,user_reg_data.firstname,user_reg_data.middlename,user_reg_data.lastname,
                                            user_reg_data.username,user_reg_data.email,user_reg_data.telephone,hash,"23/09/09","23/09/09"
                                        ]

                        sequelize.query(parseSql(TEMP_USER_QUERIES.INSERT_USERS,parameters)).then((results: any,error:any) => {
                            
                            if (!error){

                                sendMail(mailOptions_args(public_id,parameters),"user.register.event")
                                return res.send({ "status": true, data:[public_id,user_reg_data.email] ,message: `Details received, Email verification link sent to ${user_reg_data.email}` });
                            }
                            
                            else{
                                return res.send({ "status": false,  message: 'Registration failed, please enter valid details.' });

                            }
                        
                        })
                    }
                })

            })
});


router.post('/authentication/login',  (req:express.Request, res:express.Response, next) => {

    // console.log('New registration  ',JSON.parse(JSON.stringify(req.body)))
    const body = JSON.parse(JSON.stringify(req.body))
    const parameters:string[] = [ req.body.email ]
    sequelize.query(parseSql(USER_QUERIES.GET_EMAIL_PASS,parameters)).then((results: any,error:any) => { 
        // user does not exists
        console.log("Mad oo,",results)
        if (error) {
        //   throw error;
        return res.status(402).send({status:false,
            msg: error
          });
        }
        if (!results[0].length) {
          
          return res.status(401).send({
            msg: 'Email is incorrect!'
          });
        }

        bcrypt.compare(
          req.body.password,
          results[0][0].password,
          (bErr: any, bResult: any) => {
    
            if (bErr) {
          
            //   throw bErr;
            return res.status(401).send({status:false,
                msg: 'Email or password is incorrect!'
              });
            }
            if (bResult) {

                const token = jwt.sign({id:results[0][0].public_id},'the-super-strong-secrect',{ expiresIn: '200h' });
                    
                return res.status(200).send({
                    status:true,
                    msg: 'Logged in!',
                    token: token,
                    username:results[0][0].username,
                    user_id: results[0][0].public_id
                });
            }
           
            return res.status(401).send({status:false,
              msg: 'Password is incorrect!'
            });
          }
        );
   
        // return res.send({ "status": true,  message: 'Post Successful.' });
      })

});

module.exports = router;
