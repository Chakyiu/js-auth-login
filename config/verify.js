const nodemailer = require('nodemailer');
var CryptoJS = require("crypto-js");

const logging = require('./logging');


exports.sendMailAndGenToken = (email) => {
    // Generate token
    const code = Math.random().toString(36).substring(2, 16);
    const hashed_code = hashCode(code);
    console.log("Token generated: " + code);

    logging.updateTokenLog(email, hashed_code);

    // Email configuration
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'foo@gmail.com',
            pass: 'App Password',
        },
    });

    // Email content
    var mailOptions = {
        from: 'foo@gmail.com',
        to: email,
        subject: 'COMP3334 Project',
        text: 'Verify Code: ' + code,
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Verify user input
exports.verify = (email, token) => {
    var target = logging.findToken(email);
    var decrypted = CryptoJS.SHA256(token).toString(CryptoJS.enc.Base64);

    if (target === decrypted) return true;
    return false;
}

// Encrypt token in SHA-256
function hashCode(token) {
    return CryptoJS.SHA256(token).toString(CryptoJS.enc.Base64);
}