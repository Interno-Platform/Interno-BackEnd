const fs = require("fs");
const path = require("path");
const { Kafka } = require("kafkajs");
require("dotenv").config();

const resolvePemPath = (pemPath) => path.resolve(pemPath);
const shouldUseCustomCa = process.env.KAFKA_USE_CUSTOM_CA === "true";

const sslConfig = {
  cert: fs.readFileSync(resolvePemPath(process.env.KAFKA_CERT_PATH), "utf-8"),
  key: fs.readFileSync(resolvePemPath(process.env.KAFKA_KEY_PATH), "utf-8"),
  rejectUnauthorized: process.env.KAFKA_REJECT_UNAUTHORIZED !== "false",
};

if (shouldUseCustomCa) {
  sslConfig.ca = [
    fs.readFileSync(resolvePemPath(process.env.KAFKA_CA_PATH), "utf-8"),
  ];
}

const kafka = new Kafka({
  clientId: "interno-backend",
  brokers: [process.env.KAFKA_BROKER],

  ssl: sslConfig,
});

const producer = kafka.producer();

let isConnected = false;

const TOPIC = "interno";
const TOPICS = [
  TOPIC,
  "internship-applications",
  "cv-uploads",
  "internship-views",
  "user-registrations",
];

const withAdmin = async (action) => {
  const admin = kafka.admin();
  await admin.connect();
  try {
    return await action(admin);
  } finally {
    await admin.disconnect();
  }
};

/**
 * 🔍 Debug: check topics in cluster
 */
const checkTopics = async () => {
  const topics = await withAdmin((admin) => admin.listTopics());
  console.log("📌 Topics in cluster:", topics);

  return topics;
};

/**
 * 🧱 Create topics if not exists
 */
const ensureTopics = async (topicsToEnsure = TOPICS) => {
  const uniqueTopics = [...new Set(topicsToEnsure)].filter(Boolean);

  await withAdmin(async (admin) => {
    const existingTopics = await admin.listTopics();
    const missingTopics = uniqueTopics.filter(
      (topicName) => !existingTopics.includes(topicName),
    );

    if (missingTopics.length === 0) {
      console.log("✅ Topic already exists");
      return;
    }

    await admin.createTopics({
      topics: missingTopics.map((topicName) => ({
        topic: topicName,
        numPartitions: 1,
        replicationFactor: 1,
      })),
      waitForLeaders: true,
    });

    console.log("✅ Topics created:", missingTopics);
  });
};

/**
 * 🔌 Connect producer safely
 */
const connectProducer = async () => {
  try {
    await checkTopics();
    await ensureTopics();

    await producer.connect();
    isConnected = true;

    console.log("✅ Kafka producer connected");
  } catch (err) {
    console.error("❌ Kafka connection error:", err);
    isConnected = false;
  }
};

/**
 * 📤 Send event safely
 */
const sendEvent = async (topicOrData, maybeData) => {
  try {
    const hasTopicParam =
      typeof topicOrData === "string" && typeof maybeData !== "undefined";
    const topicName = hasTopicParam ? topicOrData : TOPIC;
    const payload = hasTopicParam ? maybeData : topicOrData;

    if (!isConnected) {
      console.log("⏳ Reconnecting producer...");
      await connectProducer();
    }

    await ensureTopics([topicName]);

    await producer.send({
      topic: topicName,
      messages: [
        {
          value: JSON.stringify(payload),
        },
      ],
    });

    console.log("📨 Event sent");
  } catch (err) {
    console.error("❌ Send error:", err);
  }
};

/**
 * 🔌 Disconnect
 */
const disconnectProducer = async () => {
  try {
    await producer.disconnect();
    isConnected = false;
    console.log("🔌 Disconnected");
  } catch (err) {
    console.error(err);
  }
};

module.exports = {
  kafka,
  producer,
  TOPICS,
  ensureTopics,
  connectProducer,
  sendEvent,
  disconnectProducer,
};
