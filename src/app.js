const express = require("express");
const env = require("dotenv");
const helemt = require("helmet");
const cors = require("cors");
const errorHandler = require("./middleware/errorHandler");
const verifyJwt = require("./middleware/verifyJwt");
const routesHandler = require("./routes/routesHandler");
const limiter = require("./utils/rateLimiter");
const app = express();
const { connectProducer } = require("./config/kafka");
const { startConsumers } = require("./config/kafkaConsumer");
const { connectMongoDB } = require("./config/mongodb");

app.use(cors());
app.use(limiter);
env.config();
app.use(express.json());
app.use(helemt());

app.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server running",
  });
});

app.use(verifyJwt);

routesHandler(app);

const PORT = process.env.PORT;

app.use((req, res) => {
  res.status(404).json({ message: "Resource Not Found" });
});

app.use(errorHandler);

// Add this before app.listen
const startKafka = async () => {
  await connectMongoDB(); // ← add this line first

  await connectProducer();

  // ⏳ wait for Kafka to be ready
  setTimeout(async () => {
    await startConsumers();
    console.log("Kafka consumers started");
  }, 5000);
};

startKafka().catch(console.error);
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
