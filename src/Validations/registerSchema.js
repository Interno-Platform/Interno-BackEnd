const { z } = require("zod/v4");

const preprocess = (message) =>
  z.preprocess((val) => val ?? "", z.string().min(1, message));

const baseSchema = z.object({
  role: z.enum(["trainee", "company"], { message: "role is required" }),
  password: preprocess("password is required"),
  name: preprocess("name is required"),
 email: z.preprocess(
  (val) => val ?? "",
  z.string().superRefine((val, ctx) => {
    if (!val || val.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "email is required" });
      return z.NEVER;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "email is invalid" });
    }
  })
),
});

const traineeSchema = baseSchema.extend({
  role: z.literal("trainee"),
});

const companySchema = baseSchema.extend({
  role: z.literal("company"),
  registration_number: preprocess("registration_number is required"),
});

const registerSchema = z.discriminatedUnion("role", [
  traineeSchema,
  companySchema,
]);

module.exports = registerSchema;
