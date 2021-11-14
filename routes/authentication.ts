"use strict";
import express from 'express';
import { UUIDV4 } from 'sequelize/types';
const {TEMP_USER_QUERIES, USER_QUERIES} = require('../Query/queries')
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

router.get('/authentication/resend_mail',  (req:express.Request, res:express.Response, next) => {

    console.log("Email confirmed ",req.query)
    const userID = req.query.userID
    sendMail(mailOptions_args(userID))
    return res.send({ "status": true,  message: `Email verification link resent` });

})
router.get('/authentication/confirm_email',  (req:express.Request, res:express.Response, next) => {

    console.log("Email confirmed ",req.query)
    const userID = req.query.userID
    var public_id = [ decodeRegistrationToken(userID).userId ]
    public_id = public_id
    if (!public_id[0]){
    
        return res.send(`<h1>Angular Online Escrow</h1><br><h3>Seems Your link has expired, request another here<br><a href='http://localhost:3000/api/authentication/resend_mail/?userID=${encodeRegistrationToken(userID)}'>Resend mail</a></h3>`)
    }
    try{

        let p = new Promise((resolve, reject) => {
                sequelize.query(parseSql(TEMP_USER_QUERIES.MIGRATE_USERS,public_id)).then((results: any,error:any) => {
                    console.log("Fetched results from Tempdb ",results[0][0])
                    results = results[0][0]
                    var result = [  
                                    public_id[0],results.firstname,results.middlename,results.lastname,
                                    results.email,results.telephone,results.bankname,results.bvn,results.acc_no,
                                    results.password,results.createdAt,results.updatedAt
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

                });

                sequelize.query(parseSql(TEMP_USER_QUERIES.DELETE_USER,public_id[0])).then((results: any,error:any) => {
                    if (error) throw error;
                    console.log("User has been migrated to main Database")

                });
        })
    }
    catch(err){

        res.send(`<h1>Angular Online Escrow</h1><br><h3>Seems Your link has expired, request another here<br><a href='http://localhost:3000/api/authentication/confirm_email/?userID=${encodeRegistrationToken(public_id[0])}'>Resend mail</a></h3>`)
    }

    return res.send({ "status": true,  message: 'Email confirmed.',userID:decodeRegistrationToken(userID) });
   
});

router.post('/authentication/register',  (req:express.Request, res:express.Response, next) => {

    const firstname = req.body.firstname
    const middlename = req.body.middlename
    const lastname = req.body.lastname
    const username = req.body.username
    const email = req.body.email
    const telephone = req.body.telephone
    const bankname = req.body.bankname
    const bvn:number = req.body.bvn
    const acc_no = req.body.acc_no
    const password = req.body.password

    interface IRegister{
        firstname:string, middlename:string,lastname:string,username:string,email:string,
        telephone:string,bankname:string,bvn:number,acc_no:number,password:string,
    }

    console.log(typeof bvn)
    const user_reg_data:IRegister = {
                                     firstname:firstname,middlename:middlename,lastname:lastname,username:username,
                                     email:email,telephone:telephone,bankname:bankname,bvn:bvn,acc_no:acc_no,password:password
                                    }

    console.log(user_reg_data)
    let public_id:string = uuidv4()
    let p = new Promise((resolve, reject) => {
            var parameters = [ email ]
            sequelize.query(parseSql(TEMP_USER_QUERIES.CHECK_EMAIL_EXISTS,parameters)).then((results: any,error:any) => {
               
                if (results[0][0]){
                    return res.send({ "status": true,  message: `User with Email ${user_reg_data.email} already exists` });
                }
                
                else{
                    parameters= [ bvn ]
                    sequelize.query(parseSql(TEMP_USER_QUERIES.CHECK_BVN_EXISTS,parameters)).then((results: any,error:any) => {
                        if (results[0][0]){
                            return res.send({ "status": true,  message: `User with BVN ${user_reg_data.bvn} already exists` });
                        }

                        else{
                            parameters= [ acc_no ]
                            sequelize.query(parseSql(TEMP_USER_QUERIES.CHECK_ACC_NO_EXISTS,parameters)).then((results: any,error:any) => {
                                if (results[0][0]){
                                    return res.send({ "status": true,  message: `User with Account number ${user_reg_data.acc_no} already exists` });
                                }
                                else{
                                    resolve(console.log("Registration data successfully validated"))
                                    
                                    //...
                                }
                            })
                        }
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
                                            user_reg_data.email,user_reg_data.telephone,user_reg_data.bankname,user_reg_data.bvn,
                                            user_reg_data.acc_no,hash,"23/09/09","23/09/09"
                                        ]

                        sequelize.query(parseSql(TEMP_USER_QUERIES.INSERT_USERS,parameters)).then((results: any,error:any) => {
                            
                            if (!error){

                                sendMail(mailOptions_args(public_id),"user.register.event")
                                return res.send({ "status": true,  message: `Registration successful, Email verification link sent to ${user_reg_data.email}` });
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
        if (error) {
        //   throw error;
          return res.status(400).send({
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
              return res.status(401).send({
                msg: 'Email or password is incorrect!'
              });
            }
            if (bResult) {
    
            const token = jwt.sign({id:results[0][0].public_id},'the-super-strong-secrect',{ expiresIn: '200h' });
 
              return res.status(200).send({
                status:true,
                msg: 'Logged in!',
                token: token,
                user_id: results[0][0].public_id
              });
            }
           
            return res.status(401).send({
              msg: 'Password is incorrect!'
            });
          }
        );
   
        // return res.send({ "status": true,  message: 'Post Successful.' });
      })

});

module.exports = router;
