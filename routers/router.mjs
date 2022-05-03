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
  log.yellow("line 18");
  next();
}
router.use(readUsersFile);
log.yellow("line 21");

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

//get 1 user by ID -----OK-----
router.get("/user/:id", async (req, res) => {
  req.method = "GET";
  req.path = `/api/user/${req.params.id}`;
  //router.use(writeToLogFile);

  for (let user of req.users) {
    if (user.id === req.params.id) {
      return res.status(200).send(user);
    }
  }
});

//get all users -----OK-----
router.get("/user", async (req, res) => {
  req.method = "GET";
  req.path = "/api/user";
  //router.use(writeToLogFile);

  return res.status(200).send(req.users);
});

export default router;
