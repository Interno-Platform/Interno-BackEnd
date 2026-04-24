const { Kafka } = require('kafkajs')

const kafka = new Kafka({
    clientId: 'interno-backend',
    brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
})

const producer = kafka.producer()
const admin = kafka.admin()

const connectProducer = async () => {
    await producer.connect()
    console.log('Kafka producer connected')
}

const sendEvent = async (topic, message) => {
    await producer.send({
        topic,
        messages: [{
            value: JSON.stringify(message),
            timestamp: Date.now().toString()
        }]
    })
}

module.exports = { kafka, producer, admin, connectProducer, sendEvent }