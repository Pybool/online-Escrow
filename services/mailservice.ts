import { send } from "process";

// export {};
const { encodeRegistrationToken, decodeRegistrationToken } = require("./auth.token")
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "9ecad1c5aa4175",
      pass: "b0dcb7fe86beee"
    }
  });
var mailOptions_register_user: {
    from: string; to: string; subject // export {};
        : string; text: string; html: string;
}
var mailOptions_order_reserved: { from: string; to: string; subject: string; text: string; html: string; };

var mailOptions_send_generated_token:{from: string; to: string; subject: string; text: string; html: string;}

var mailOptions_send_seller_joined_notification:{from: string; to: string; subject: string; text: string; html: string;}

// var mailOptions_resend_reg_mail: {from: string; to: string; subject: string; text: string; html: string;}

function mailOptions_args(public_id:string,data?:any){
    console.log('args', data)
        mailOptions_register_user = {
        from: 'uchihamadara@gedo.com"',
        to: 'ekoemmanuelgodcoder@gmail.com',
        subject: 'Sending Email using Node.js',
        text: 'That was easy!',
        html: `
        
        <html>
            <header>
                
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>


            </header>
            <body>
                <h1>Click the link below to confirm your email account</h1>
                <br>
                <div style="max-width:200px; color:green;">
                    <a type= "button" class = "btn btn-success" href="http://localhost:3000/api/authentication/confirm_email/?userID=${encodeRegistrationToken(public_id)}">Click to Confirm E-Mail<a>
                </div>
                <br>
                <p>This link expires in 1 hour..
            </body>
            
        </html>
            `
    };

        mailOptions_order_reserved = {
        from: 'uchihamadara@gedo.com"',
        to: 'ekoemmanuelgodcoder@gmail.com',
        subject: 'Your order was reserved',
        text: 'Your order was reserved',
        html: `
        
        <html>
            <header>
                
                <title>Order reserved</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>


            </header>
            <body>
                <h1>Order reservation</h1>
                <br>
                <p>Your order with details: <br>
                <ul class="list-group list-group-flush">
                    <li class="list-group-item">Order ID: ${data[0]}</li>
                    <li class="list-group-item">Order Handler: ${data[2]}</li>
                    <li class="list-group-item">Commodity: ${data[3]}</li>
                    <li class="list-group-item">Quantity: ${data[4]}</li>
                    <li class="list-group-item">Price: ${data[5]}</li>

                </ul >
                </p>
           
                <p>Has been reserved by ${data[2]}</p>
                <br>
               
            </body>
            
        </html>
            `
    };


    try{
        mailOptions_send_generated_token = {
            from: 'uchihamadara@gedo.com"',
            to: 'ekoemmanuelgodcoder@gmail.com',
            subject: 'Transaction token',
            text: '',
            html: `
            
            <html>
                <header>
                    
                    <title>Transaction Token</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                    
                </header>
                <body>
                    <h1>Transaction token</h1>
                    <br>
                    <p>Transaction token ${data.params[0]} was sent from ${public_id}: for reservation ${data.params[1]}</p>
                </body>
                
            </html>
                `
        };
    }
    catch{
        console.log("Caught error")
    }

    mailOptions_send_seller_joined_notification = {
        from: 'uchihamadara@gedo.com"',
        to: 'ekoemmanuelgodcoder@gmail.com',
        subject: 'Seller Joined Your Transaction',
        text: '',
        html: `
        
        <html>
            <header>
                
                <title>Seller Joined Your Transaction</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                
            </header>
            <body>
                <h1>Seller Joined Your Transaction</h1>
                <br>
                <p>Seller ${data[1]} Joined Your Transaction ${data[0].order_id} </p>
            </body>
            
        </html>
            `
    };
    // return mailOptions_order_reserved

    // mailOptions_resend_reg_mail = {
    //     from: 'uchihamadara@gedo.com"',
    //     to: 'ekoemmanuelgodcoder@gmail.com',
    //     subject: 'Seller Joined Your Transaction',
    //     text: '',
    //     html: `
        
    //     <html>
    //         <header>
                
    //             <title>Seller Joined Your Transaction</title>
    //             <meta charset="utf-8">
    //             <meta name="viewport" content="width=device-width, initial-scale=1">
    //             <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
    //             <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    //             <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
    //             <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
                
    //         </header>
    //         <body>
    //             <h1>Seller Joined Your Transaction</h1>
    //             <br>
    //             <p>Seller ${data[1]} Joined Your Transaction ${data[0].order_id} </p>
    //         </body>
            
    //     </html>
    //         `
    // };

    return mailOptions_order_reserved
}

// sendMail(mailOptions_args(decoded_seller_token.publisher_id,seller_token_payload),"seller.joined.event")

async function sendMail(mailOption:any,event:string){
        if (event=="reserved.order.event"){
            mailOption = mailOptions_order_reserved
        }
        if (event=="user.register.event"){
            mailOption = mailOptions_register_user
        }
        if (event=="generate.token.event"){
            mailOption = mailOptions_send_generated_token
        }
        if (event=="seller.joined.event"){
            mailOption = mailOptions_send_seller_joined_notification
        }
        // if (event=="resend.mail.event"){
        //     mailOption = mailOptions_resend_reg_mail
        // }
        await transporter.sendMail(mailOption, function (error: any, info: { response: string; }) {
            if (error) {
                console.log(error);
            }
            else {
                console.log('Email sent: ' + info.response);
                return info.response
            }
        });
}

module.exports = { mailOptions_args, sendMail, decodeRegistrationToken, encodeRegistrationToken }