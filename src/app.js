import express from "express";
import dotenv from "dotenv";
import { exec } from "child_process";
import moment from "moment";
import schedule from "node-schedule";
import { sendDatabaseBackup } from './utils/emailUtil';

dotenv.config();

const app = express();

app.get("/", (req, res) =>
  res.status(201).json({
    status: "success",
    message: "Welcome to the API",
  })
);
app.use("*", (req, res) =>
  Response.errorMessage(
    res,
    "Oops, this route does not exist",
    HttpStatus.NOT_FOUND
  )
);

const backupDB = () => {
  // cron job to run every friday at 12:00 am
   const job = schedule.scheduleJob("0 0 0 * * 5", function () {
    console.log("-------Backup DB-----------");
    const { DB_USER, HOST, DB_NAME, FILE_NAME, DB_PASSWD, GMAIL_ACCOUNT_EMAIL, BACKUP_EMAIL } = process.env;

    if (DB_USER && HOST && DB_NAME && FILE_NAME && DB_PASSWD) {
      const date = moment().format("YYYYMMDDHHmmss");
      const dbBackUpFileName = `${FILE_NAME + "_" + date}.sql`;
      exec(
        `PGPASSWORD=${DB_PASSWD} pg_dump -U ${DB_USER} -h ${HOST} ${DB_NAME} >> ${dbBackUpFileName}`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(`error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          console.log(`DB Backup created successfully! ${moment().format()}`);
        }
      );
      
      let mailContent = {
        from: `Psql backup cron <${GMAIL_ACCOUNT_EMAIL}>`,
        to: `Backup receiver name <${BACKUP_EMAIL}>`,
        subject: `Your backup for database: ${DB_NAME} is available!`,
        text: `Hi, Kindly checkout the attached backup file: ${dbBackUpFileName} for this week backup! `,
        attachments: [
            {
                filename: `${dbBackUpFileName}`,
                path: process.cwd()+ `/${dbBackUpFileName}`
            }
        ]
    };
    sendDatabaseBackup(mailContent);
    } else {
      throw new Error(
        "Please set the environment variables USER, HOST, DB_NAME, FILE_NAME, and DB_PASSWD"
      );
    }
  });
};

backupDB();

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on PORT ${port}...`);
});

export default app;
