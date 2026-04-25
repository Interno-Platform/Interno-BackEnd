const redis = require("redis");

const redisConfig =
  process.env.NODE_ENV === "development"
    ? {
        socket: {
          host: "127.0.0.1",
          port: 6379,
        },
      }
    : {
        url: process.env.REDIS_URL,
      };

const redisClient = redis.createClient(redisConfig);

redisClient.on("error", (err) => console.log("Redis Client Error", err));

(async () => {
  await redisClient.connect();
  console.log("Connected to Upstash Redis ✅");
})();

module.exports = redisClient;