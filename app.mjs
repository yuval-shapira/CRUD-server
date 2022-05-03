import express from "express";
import log from "@ajar/marker";
import router from "./routers/router.mjs";

const { PORT, HOST } = process.env;

const app = express();

app.use("/api", router);

app.use((req, res, next) => {
  res.status(404).send(` - 404 - url was not found`);
});

app.listen(PORT, HOST, () => {
  log.magenta(`🌎  listening on`, `http://${HOST}:${PORT}`);
});
