const mongoose = require('mongoose')

// stores every kafka event in mongodb
const eventLogSchema = new mongoose.Schema({
    eventType: String,
    data: Object,
    processedAt: { type: Date, default: Date.now }
})

// internship view schema
const internshipViewSchema = new mongoose.Schema({
    internshipId: String,
    userId: String,
    viewedAt: { type: Date, default: Date.now }
})

// application schema
const applicationEventSchema = new mongoose.Schema({
    traineeId: String,
    traineeName: String,
    internshipId: String,
    internshipTitle: String,
    companyEmail: String,
    appliedAt: { type: Date, default: Date.now }
})

// cv upload schema
const cvUploadSchema = new mongoose.Schema({
    traineeId: String,
    traineeEmail: String,
    fileName: String,
    uploadedAt: { type: Date, default: Date.now }
})

// registration schema
const registrationEventSchema = new mongoose.Schema({
    userId: String,
    email: String,
    role: String,
    registeredAt: { type: Date, default: Date.now }
})

const EventLog = mongoose.model('EventLog', eventLogSchema)
const InternshipView = mongoose.model('InternshipView', internshipViewSchema)
const ApplicationEvent = mongoose.model('ApplicationEvent', applicationEventSchema)
const CvUpload = mongoose.model('CvUpload', cvUploadSchema)
const RegistrationEvent = mongoose.model('RegistrationEvent', registrationEventSchema)

module.exports = {
    EventLog,
    InternshipView,
    ApplicationEvent,
    CvUpload,
    RegistrationEvent
}