import express from "express";
import dotenv from "dotenv";
import { exec } from "child_process";
import moment from "moment";
import schedule from "node-schedule";

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

    const { DB_USER, HOST, DB_NAME, FILE_NAME, DB_PASSWD } = process.env;

    if (DB_USER && HOST && DB_NAME && FILE_NAME && DB_PASSWD) {
      const date = moment().format("YYYYMMDDHHmmss");
      exec(
        `PGPASSWORD=${DB_PASSWD} pg_dump -U ${DB_USER} -h ${HOST} ${DB_NAME} >> ${FILE_NAME + "_" + date}.sql `,
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
