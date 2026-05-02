const { z } = require("zod/v4");

const preprocess = (message) =>
  z.preprocess((val) => val ?? "", z.string().min(1, message));

const parseJsonInput = (value) => {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    if (!trimmedValue) return value;

    try {
      return JSON.parse(trimmedValue);
    } catch (_) {
      return value;
    }
  }

  return value ?? "";
};

const socialMediaLinksSchema = z.preprocess(
  parseJsonInput,
  z
    .array(z.any(), {
      message: "social_media_links must be an array",
    })
    .min(1, "social_media_links must contain at least one link"),
);

const baseSchema = z.object({
  role: z.enum(["trainee", "company"], { message: "role is required" }),
  password: preprocess("password is required"),
  name: preprocess("name is required"),
  email: z.preprocess(
    (val) => val ?? "",
    z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "email is required",
        });
        return z.NEVER;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "email is invalid",
        });
      }
    }),
  ),
});

const traineeSchema = baseSchema.extend({
  role: z.literal("trainee"),
  gender: z.enum(["male", "female"], {
    message: "gender must be either male or female",
  }),
});

const companySchema = baseSchema.extend({
  role: z.literal("company"),
  registration_number: preprocess("registration_number is required"),
  social_media_links: socialMediaLinksSchema,
});

const registerSchema = z.discriminatedUnion("role", [
  traineeSchema,
  companySchema,
]);

module.exports = registerSchema;
