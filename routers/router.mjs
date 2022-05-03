import express from "express";
import fs from "fs/promises";
import log from "@ajar/marker";
import { time } from "console";

const router = express.Router();

//Get all Users
async function readUsersFile(req, res, next) {
  try {
    let allUsersData = await fs.readFile("./data/allUsers.json", "utf-8");
    allUsersData = JSON.parse(allUsersData);
    req.users = allUsersData;
  } catch {
    log.yellow("No Data");
  }
  next();
}
router.use(readUsersFile);

//Get log file
async function readLogsFile(req, res, next) {
  try {
    let allLogsDataFile = await fs.readFile("./logs/http.log", "utf-8");
    req.allLogsData = allLogsDataFile;
  } catch {
    log.yellow("No Data");
  }
  next();
}

router.use(readLogsFile);

// Add new log to log file
async function writeToLogFile(req, res, next) {
  const timeStamp = new Date().getTime();
  const currentLogData = `${req.method} /api${req.path} ${timeStamp}`;
  req.allLogsData = req.allLogsData + "\r\n" + currentLogData;
  try {
    await fs.writeFile("logs/http.log", req.allLogsData);
    log.green("Log written successfully!");
  } catch (err) {
    log.red("Error writing the log: ", err.message);
  }
  next();
}

async function insertUserToFile(req, res, next) {
  try {
    await fs.writeFile("data/allUsers.json", req.userToInsert);
    log.green("File written successfully!");
    res.status(200).send(`User ${req.action} successfully!`);
  } catch (err) {
    log.red("Error writing the file: ", err.message);
    res.status(200).send("Error writing the file");
  }
  next();
}

//Create a new user
router.post(
  "/user",
  writeToLogFile,
  (req, res) => {
    req.userToInsert = req.body;
    req.userToInsert.id = Math.random()
      .toString(36)
      .replace(/[^a-z]+/g, "")
      .substring(0, 5);
    req.action = "created";
    log.red(req.body);
  },
  insertUserToFile
);

//get 1 user by ID
router.get("/user/:id", writeToLogFile, (req, res) => {
  for (let user of req.users) {
    log.yellow(`user.id: ${user.id} && req.params.id: ${req.params.id}`);
    if (user.id === req.params.id) {
      log.yellow("Found the right user");
      return res.status(200).send(user);
    }
  }
  return res.status(200).send("user not found");
});

//get all users
router.get("/user", writeToLogFile, (req, res) => {
  res.status(200).send(req.users);
});

//update (put & patch) user by ID
router.put(
  "/user_update_combine",
  writeToLogFile,
  (req, res) => {
    for (let user of req.users) {
      if (user.id === req.body.id) {
        if ("first_name" in req.body) {
          req.users[user].first_name = req.body.first_name;
        }
        if ("last_name" in req.body) {
          req.users[user].last_name = req.body.last_name;
        }
        if ("email" in req.body) {
          req.users[user].email = req.body.email;
        }
        if ("phone" in req.body) {
          req.users[user].phone = req.body.phone;
        }
        req.action = "updated";

        return res.status(200).send("File updated successfully!");
      }
    }
  },
  insertUserToFile
);

export default router;
