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
  if (process.env.NODE_ENV === "development") {
    console.log("Connected to Redis at 127.0.0.1:6379");
  }else {
    console.log(`Connected to Redis at ${process.env.REDIS_URL}`);
  }

})();

module.exports = redisClient;