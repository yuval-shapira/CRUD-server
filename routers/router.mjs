import express from "express";
import fs from "fs/promises";
import log from "@ajar/marker";
import { time } from "console";

const router = express.Router();

//let allUsersData;
//-------- OK
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

async function readLogsFile(req, res, next) {
  try {
    let allLogsDataFile = await fs.readFile("./logs/http.log", "utf-8");
    //allLogsDataFile = JSON.parse(allLogsDataFile);
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
    log.blue(req.userToInsert);
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
    //let asd = req.body;
    // req.userToInsert.id
    let asd = {
      id: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substring(0, 5),
    };
    asd = req.body;
    req.userToInsert = asd;
    req.action = "created";
    log.red(req.body);

    //router.use(insertUserToFile);
  },
  insertUserToFile
);

//get 1 user by ID -----OK-----
router.get("/user/:id", writeToLogFile, (req, res) => {
  for (let user of req.users) {
    if (user.id === req.params.id) {
      return res.status(200).send(user);
    }
  }
});

//get all users -----OK-----
router.get("/user", writeToLogFile, (req, res) => {
  res.status(200).send(req.users);
});

//update (put & patch) user by ID
router.put("/user_update_combine", async (req, res) => {
  //const userData = req.body;

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
      router.use(insertUserToFile);

      req.method = "PUT";
      req.urlPath = `/user_update/${req.body.id} `;
      router.use(writeToLogFile);

      return res.status(200).send("File updated successfully!");
    }
  }
});

//update (put & patch) user by ID
router.put("/updateCombine", async (req, res) => {
  //const userData = req.body;
  const userToUpdate = req.query;

  for (let user of req.users) {
    if (user.id === userToUpdate.id) {
      if (!"first_name" in userToUpdate) {
        userToUpdate.first_name = user.first_name;
      }
      if (!"last_name" in userToUpdate) {
        userToUpdate.last_name = user.last_name;
      }
      if (!"email" in userToUpdate) {
        userToUpdate.email = user.email;
      }
      if (!"phone" in userToUpdate) {
        userToUpdate.phone = user.phone;
      }
      // !userToUpdate.first_name? userToUpdate.first_name = user.first_name : null;
      // !userToUpdate.last_name? userToUpdate.last_name = user.last_name : null;
      // !userToUpdate.email? userToUpdate.email = user.email : null;
      // !userToUpdate.phone? userToUpdate.phone = user.phone : null;
      req.action = "updated";
      router.use(insertUserToFile);

      req.method = "PUT";
      req.urlPath = `/api/updateCombine/${req.id}`;
      router.use(writeToLogFile);

      return res.status(200).send("File updated successfully!");
    }
  }
});
export default router;
