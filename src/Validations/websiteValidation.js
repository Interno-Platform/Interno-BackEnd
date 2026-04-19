const z = require("zod");

const contactUsSchema = z.object({
    name: z.string(" name is required").min(1, "Name is required").max(255, "Name must be less than 255 characters"),
    email: z.string( "email is required").email("Invalid email address"),
    subject: z.string("subject is required").min(1, "Subject is required").max(255, "Subject must be less than 255 characters"),
    message: z.string("message is required").min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

module.exports = {
    contactUsSchema,
};