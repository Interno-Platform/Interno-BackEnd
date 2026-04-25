const { kafka, ensureTopics } = require("./kafka");
const { sendNotificationEmail } = require("../utils/email");
const {
  InternshipView,
  ApplicationEvent,
  CvUpload,
  RegistrationEvent,
} = require("../models/EventLog");

const CONSUMER_TOPICS = [
  "internship-applications",
  "cv-uploads",
  "internship-views",
  "user-registrations",
];

const startConsumers = async () => {
  await ensureTopics(CONSUMER_TOPICS);

  // Consumer 1 — internship applications
  const applicationConsumer = kafka.consumer({ groupId: "application-group" });
  await applicationConsumer.connect();
  await applicationConsumer.subscribe({
    topic: "internship-applications",
    fromBeginning: false,
  });
  await applicationConsumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("New application received:", data);

      // sink to MongoDB
      await ApplicationEvent.create({
        traineeId: data.traineeId,
        traineeName: data.traineeName,
        internshipId: data.internshipId,
        internshipTitle: data.internshipTitle,
        companyEmail: data.companyEmail,
      });

      // send email notification to company
      await sendNotificationEmail(
        data.companyEmail,
        "New Internship Application",
        `${data.traineeName} has applied for your internship: ${data.internshipTitle}`,
      );
    },
  });

  // Consumer 2 — CV uploads
  const cvConsumer = kafka.consumer({ groupId: "cv-group" });
  await cvConsumer.connect();
  await cvConsumer.subscribe({ topic: "cv-uploads", fromBeginning: false });
  await cvConsumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("CV uploaded:", data);

      // sink to MongoDB
      await CvUpload.create({
        traineeId: data.traineeId,
        traineeEmail: data.traineeEmail,
        fileName: data.fileName,
      });

      // send confirmation email to trainee
      await sendNotificationEmail(
        data.traineeEmail,
        "CV Uploaded Successfully",
        "Your CV has been uploaded and processed successfully. We will review it shortly.",
      );
    },
  });

  // Consumer 3 — internship views tracking
  const viewConsumer = kafka.consumer({ groupId: "views-group" });
  await viewConsumer.connect();
  await viewConsumer.subscribe({
    topic: "internship-views",
    fromBeginning: false,
  });
  await viewConsumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("Internship viewed:", data);

      // sink to MongoDB
      await InternshipView.create({
        internshipId: data.internshipId,
        userId: data.userId,
      });
    },
  });

  // Consumer 4 — user/company registration ✅ NEW
  const registrationConsumer = kafka.consumer({
    groupId: "registration-group",
  });
  await registrationConsumer.connect();
  await registrationConsumer.subscribe({
    topic: "user-registrations",
    fromBeginning: false,
  });
  await registrationConsumer.run({
    eachMessage: async ({ message }) => {
      const data = JSON.parse(message.value.toString());
      console.log("New registration:", data);

      // sink to MongoDB
      await RegistrationEvent.create({
        userId: data.userId,
        email: data.email,
        role: data.role,
      });

      // send welcome email
      await sendNotificationEmail(
        data.email,
        "Welcome to Interno! 🎉",
        `Hi ${data.name}, welcome to Interno! Your account has been created successfully.`,
      );
    },
  });

  console.log("All Kafka consumers started ✅");
};

module.exports = { startConsumers };
