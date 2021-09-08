import  nodemailer  from 'nodemailer';
import dotenv from "dotenv";

dotenv.config();

const { GMAIL_ACCOUNT_EMAIL, GMAIL_ACCOUNT_PASSWORD } = process.env;

export const sendDatabaseBackup = (mailContent) => {
  let transporter = nodemailer.createTransport({
     service: 'gmail',
     auth:{
        user: GMAIL_ACCOUNT_EMAIL,
        pass: GMAIL_ACCOUNT_PASSWORD
      }
    });
    transporter.sendMail(mailContent, function(error, data){
        if(error){
            console.log('ERROR SENDING EMAIL:', error);
            console.log('Unable to send mail');
        }else{
            console.log('Email send successfully');
        }
    });
};

