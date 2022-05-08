import express from "express";
import fs from "fs/promises";
import log from "@ajar/marker";

const router = express.Router();

router.use(express.json());

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
//Write all users into JSON file
async function writeUsersJsonFile(req, res) {
  try {
    await fs.writeFile("./data/allUsers.json", JSON.stringify(req.users));
    log.green("File written successfully!");
    return res.status(200).send(`User ${req.action} successfully!`);
  } catch (err) {
    log.red("Error writing the file: ", err.message);
    return res.status(200).send("Error writing the file");
  }
}
//Update user details function
async function updateUserDetails(req, res) {
  let i = 0;
  for (let user of req.users) {
    if (user.id === req.body.id) {
      req.body.first_name
        ? (req.users[i].first_name = req.body.first_name)
        : null;
      req.body.last_name ? (req.users[i].last_name = req.body.last_name) : null;
      req.body.email ? (req.users[i].email = req.body.email) : null;
      req.body.phone ? (req.users[i].phone = req.body.phone) : null;

      req.action = "updated";
      return writeUsersJsonFile(req, res);
    }
    i++;
  }
}
//Create a new user
router.post("/user/create", writeToLogFile, async (req, res) => {
  req.userToInsert = req.body;
  req.userToInsert.id = Math.random()
    .toString(36)
    .replace(/[^a-z]+/g, "")
    .substring(0, 5);
  req.action = "created";
  req.users.push(req.userToInsert);
  writeUsersJsonFile(req, res);
});

//get 1 user by ID
router.get("/user/:id", writeToLogFile, async (req, res) => {
  for (let user of req.users) {
    if (user.id === req.params.id) {
      return res.status(200).send(user);
    }
  }
  return res.status(200).send("User not found");
});

//get all users
router.get("/user", writeToLogFile, async (req, res) => {
  router.use(writeToLogFile);
  res.status(200).send(req.users);
});

//update (patch) user by ID
router.patch("/user/update", writeToLogFile, async (req, res) => {
  return updateUserDetails(req, res);
});

//update (put) user by ID
router.put("/user/update", writeToLogFile, async (req, res) => {
  return updateUserDetails(req, res);
});

//delete user by ID
router.delete("/user/delete", writeToLogFile, async (req, res) => {
  for (let i = 0; i < req.users.length; i++) {
    if (req.users[i].id === req.body.id) {
      req.users.splice(i, 1);
      req.action = "deleted";
      return writeUsersJsonFile(req, res);
    }
  }
});
export default router;
