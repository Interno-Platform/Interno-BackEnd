const { z } = require("zod/v4");

const preprocess = (message) =>
  z.preprocess((val) => val ?? "", z.string().min(1, message));

const preprocessNumber = (message) =>
  z.preprocess(
    (val) => (val !== undefined && val !== null ? Number(val) : undefined),
    z.number({ error: message }).positive(message),
  );

// ========== internships ==========
const internshipSchema = z.object({
  title: preprocess("title is required").pipe(
    z
      .string()
      .min(3, "title must be at least 3 characters")
      .max(255, "title is too long"),
  ),
  description: preprocess("description is required").pipe(
    z.string().min(10, "description must be at least 10 characters"),
  ),
  location_type: z.enum(["REMOTE", "ONSITE", "HYBRID"], {
    message: "location_type must be REMOTE, ONSITE or HYBRID",
  }),
  duration_weeks: preprocessNumber("duration_weeks is required"),
  seats: preprocessNumber("seats is required"),
  deadline: z.preprocess(
    (val) => val ?? "",
    z.string().superRefine((val, ctx) => {
      if (!val || val.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "deadline is required",
        });
        return z.NEVER;
      }
      if (isNaN(new Date(val).getTime())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "deadline is invalid",
        });
      }
    }),
  ),
  required_skills: z.preprocess(
    (val) => val ?? [],
    z
      .array(z.number().min(1, "required_skills must be a positive integer"), {
        message: "required_skills must be an array",
      })
      .min(1, "at least one skill is required"),
  ),
});

// ========== internship_exams ==========
const internshipExamSchema = z.object({
  internship_id: preprocessNumber("internship_id is required"),
  exam_description: preprocess("exam_description is required").pipe(
    z.string().min(10, "exam_description must be at least 10 characters"),
  ),
  exam_title: preprocess("exam_title is required").pipe(
    z
      .string()
      .min(3, "exam_title must be at least 3 characters")
      .max(255, "exam_title is too long"),
  ),

  requirements: z.preprocess(
    (val) => {
      if (typeof val === "string") return [val];
      if (Array.isArray(val)) return val;
      return val;
    },
    z.array(z.string()).min(1, "at least one requirement is required"),
  ),
  expected_input: preprocess("expected_input is required").pipe(
    z.string().min(10, "expected_input must be at least 10 characters"),
  ),
  expected_output: preprocess("expected_output is required").pipe(
    z.string().max(50, "expected_output must be at most 50 characters"),
  ),
  programmingLanguage: preprocess("programmingLanguage is required").pipe(
    z.string().max(50, "programmingLanguage is too long"),
  ),
  exam_passing_score: z
    .preprocess(
      (val) => (val !== undefined && val !== null ? Number(val) : undefined),
      z
        .number({ error: "exam_passing_score must be a number" })
        .min(0, "exam_passing_score must be at least 0")
        .max(100, "exam_passing_score must not exceed 100"),
    )
    .optional(),
});

const internshipWithExamSchema = internshipSchema.merge(
  internshipExamSchema.omit({ internship_id: true }),
);
// ========== exam_submissions ==========
const examSubmissionSchema = z.object({
  exam_id: preprocessNumber("exam_id is required"),
  student_id: preprocessNumber("student_id is required"),
  code_solution: preprocess("code_solution is required"),
  language: preprocess("language must be a string")
    .pipe(z.string().max(50, "language is too long"))
    .optional(),
});

// ========== exam_review ==========
const examReviewSchema = z.object({
  score: z.preprocess(
    (val) => (val !== undefined && val !== null ? Number(val) : undefined),
    z
      .number({ error: "score must be a number" })
      .min(0, "score must be at least 0")
      .max(100, "score must not exceed 100"),
  ),
  passed: z.boolean({ error: "passed is required" }),
  reviewed_by: preprocessNumber("reviewed_by is required"),
  notes: preprocess("notes must be a string").optional(),
});

module.exports = {
  internshipWithExamSchema,
  examSubmissionSchema,
  examReviewSchema,
};
