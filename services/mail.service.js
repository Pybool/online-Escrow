"use strict";
exports.__esModule = true;
// export {};
var _a = require("./auth.token"), encodeRegistrationToken = _a.encodeRegistrationToken, decodeRegistrationToken = _a.decodeRegistrationToken;
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "9ecad1c5aa4175",
        pass: "b0dcb7fe86beee"
    }
});
// PORT = 587
// SMTP_SERVER = "smtp.ionos.co.uk"
// LOGIN = "info@mymeko.co.uk" 
// PASSWORD = "Mymeko,./1234" 
// SENDER = "info@mymeko.co.uk"
var mailOptions = {
    from: 'info@mymeko.co.uk"',
    to: 'ekoemmanuelgodcoder@gmail.com',
    subject: 'Sending Email using Node.js',
    text: 'That was easy!',
    html: "\n    \n    <html>\n        <header>\n            \n            <title>Bootstrap Example</title>\n            <meta charset=\"utf-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n            <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css\">\n            <script src=\"https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js\"></script>\n            <script src=\"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js\"></script>\n            <script src=\"https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js\"></script>\n\n\n        </header>\n        <body>\n            <h1>Click the link below to confirm your email account</h1>\n            <br>\n            <div style=\"max-width:200px; color:green;\">\n                <a type= \"button\" class = \"btn btn-success\" href=\"http://localhost:3000/api/authentication/confirm_email/?userID=" + encodeRegistrationToken('userid') + "\">Click to Confirm E-Mail<a>\n            </div>\n            <br>\n            <p>This link expires in 1 hour..\n        </body>\n        \n    </html>\n         "
};
function sendMail() {
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = { sendMail: sendMail };
