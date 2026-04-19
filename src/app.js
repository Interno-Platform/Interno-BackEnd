const express = require("express");
const env = require("dotenv");
const helemt = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const verifyJwt = require("./middleware/verifyJwt");
const routesHandler = require("./routes/routesHandler");
const limiter = require("./utils/rateLimiter");
const app = express();
app.use(cors());
app.use(limiter)
env.config();
app.use(express.json());
app.use(helemt());

app.use(verifyJwt);

routesHandler(app)

const PORT = process.env.PORT;

app.use((req, res) => {
  res.status(404).json({ message: "Resource Not Found" });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
