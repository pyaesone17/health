const nodemailer = require("nodemailer");

function sendMail(to, subject, html) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: "vevelay286@gmail.com", // generated ethereal user
            pass: "" // generated ethereal password
        }
    });
    
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Health" <vevelay286@gmail.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("Message sent: %s", info.messageId);
    });
}

module.exports = sendMail

// sendMail("promise286@gmail.com", "Hello ✔", "<b>Hello world?</b>")