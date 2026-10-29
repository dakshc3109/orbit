const path = require("node:path");
const express = require("express");

const app = express();
const port = Number(process.env.PORT) || 3000;
const publicDirectory = path.join(__dirname, "public");

app.disable("x-powered-by");
app.use(express.static(publicDirectory, { extensions: ["html"] }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.get("*", (_request, response) => {
  response.sendFile(path.join(publicDirectory, "index.html"));
});

app.listen(port, () => {
  console.log(`Orbit is running on http://localhost:${port}`);
});
