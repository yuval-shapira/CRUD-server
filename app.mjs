import express from "express";
import log from "@ajar/marker";

import router from "./routers/router.mjs";

const { PORT, HOST } = process.env;

const app = express();

// const middlewareFunc = (req, res, next) => {
//   log.cyan("I was here!");
//   next();
// };

// app.use(middlewareFunc);
log.green("I was here!");
app.use("/user", router);
// app.use("/create", router);
// app.use("/read", router);
// app.use("/read/:id", router);
// app.use("/update", router);
// app.use("/delete/:id", router);

app.use((req, res, next) => {
  res.status(404).send(` - 404 - url was not found`);
});

app.listen(PORT, HOST, () => {
  log.magenta(`🌎  listening on`, `http://${HOST}:${PORT}`);
});

//http://localhost:3050/create?first_name=Bobbi&last_name=Brown&email=bob@brown.com&phone=054-220-453
