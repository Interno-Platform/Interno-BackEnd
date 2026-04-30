const createError = require("../../utils/createError");
const {
  internshipWithExamSchema,
} = require("../../Validations/internshipsSchema");
const db = require("../../config/database");
const { addSkillsFromCompany } = require("../skillsServices/skills.services");

const parseSkillsValue = (skills) => {
  if (Array.isArray(skills)) {
    return skills;
  }

  if (typeof skills === "string") {
    try {
      const parsedSkills = JSON.parse(skills);
      if (Array.isArray(parsedSkills)) {
        return parsedSkills;
      }
    } catch (_) {
      return null;
    }
  }

  return null;
};

const postInternship = async (body, company_id) => {
  // check if company already exist
  const [findCompany] = await db.query(`SELECT * FROM companies WHERE id = ?`, [
    company_id,
  ]);

  if (findCompany.length === 0) {
    throw createError(`company(id) is invalid or company does not exist`, 404);
  }

  const parsed = internshipWithExamSchema.safeParse(body);

  if (!parsed.success) {
    throw createError(
      "invalid inputs",
      404,
      parsed.error.flatten().fieldErrors,
    );
  }

  const internshipData = parsed.data;

  const query = `
    INSERT INTO internships 
      (company_id, title, description, location_type, duration_weeks, seats, deadline,required_skills)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
      title = VALUES(title),
      description = VALUES(description),
      location_type = VALUES(location_type),
      duration_weeks = VALUES(duration_weeks),
      seats = VALUES(seats),
      deadline = VALUES(deadline),
      required_skills = VALUES(required_skills)
  `;

  const values = [
    company_id,
    internshipData.title,
    internshipData.description,
    internshipData.location_type,
    internshipData.duration_weeks,
    internshipData.seats,
    internshipData.deadline,
    JSON.stringify(internshipData.required_skills),
  ];

  const [result] = await db.execute(query, values);

  const dataForTechExam = {
    internship_id: result.insertId,
    ...internshipData,
  };

  await addTechnicalExam(dataForTechExam);

  return {
    message: "internship created successfully",
    internship_id: result.insertId,
  };
};

const addTechnicalExam = async (dataForTechExam) => {
  // 5. Insert into DB
  const [result] = await db.query(
    `INSERT INTO internship_exams 
    (internship_id, exam_title, exam_description, requirements, 
     expected_input, expected_output, programmingLanguage) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      dataForTechExam?.internship_id,
      dataForTechExam?.exam_title,
      dataForTechExam?.exam_description,
      JSON.stringify(dataForTechExam?.requirements),
      dataForTechExam?.expected_input,
      dataForTechExam?.expected_output,
      dataForTechExam?.programmingLanguage,
    ],
  );

  if (result.affectedRows == 0) {
    throw createError("error adding technical exam for this internship", 500);
  }
};

const getInternships = async (user_id) => {
  // نحدد هل اليوزر شركة ولا لا
  let companyFilter = "";
  let params = [user_id || null, "active"];

  if (user_id) {
    const [company] = await db.query(
      `SELECT id FROM companies WHERE user_id = ?`,
      [user_id]
    );

    // لو شركة → فلترة
    if (company.length > 0) {
      companyFilter = "AND companies.user_id = ?";
      params.push(user_id);
    }
  }

  let [result] = await db.query(
    `SELECT 
      companies.company_name, 
      internships.*,

      CASE WHEN trainee_ctx.id IS NOT NULL AND EXISTS (
        SELECT 1 FROM internship_applications ia
        WHERE ia.internship_id = internships.id
        AND ia.trainee_id = trainee_ctx.id
      ) THEN TRUE ELSE FALSE END AS has_apply,

      CASE WHEN trainee_ctx.id IS NOT NULL AND EXISTS (
        SELECT 1 FROM internship_exams ie
        JOIN exam_submissions es ON es.exam_id = ie.id
        WHERE ie.internship_id = internships.id
        AND es.trainee_id = trainee_ctx.id
        AND COALESCE(es.quiz_completed, FALSE) = TRUE
      ) THEN TRUE ELSE FALSE END AS quiz_completed,

      CASE WHEN trainee_ctx.id IS NOT NULL AND EXISTS (
        SELECT 1 FROM internship_exams ie
        JOIN exam_submissions es ON es.exam_id = ie.id
        WHERE ie.internship_id = internships.id
        AND es.trainee_id = trainee_ctx.id
        AND es.code_solution IS NOT NULL
        AND TRIM(es.code_solution) <> ''
      ) THEN TRUE ELSE FALSE END AS tech_completed

    FROM internships
    JOIN companies ON internships.company_id = companies.id 

    LEFT JOIN (
      SELECT MIN(id) AS id
      FROM trainees
      WHERE user_id = ?
    ) AS trainee_ctx ON 1 = 1

    WHERE internships.status = ?
    ${companyFilter}
    `,
    params
  );

  if (result.length === 0) {
    throw createError(`no internships found`, 404);
  }

  return {
    data: result.map((i) => ({
      ...i,
      has_apply: !!i.has_apply,
      quiz_completed: !!i.quiz_completed,
      tech_completed: !!i.tech_completed,
    })),
  };
};

const postCompanySkills = async (companyId, skills) => {
  const [findCompany] = await db.query(`SELECT * FROM companies WHERE id = ?`, [
    companyId,
  ]);

  if (findCompany.length === 0) {
    throw createError(`company(id) is invalid or company does not exist`, 404);
  }

  const parsedSkills = parseSkillsValue(skills);

  if (!parsedSkills || parsedSkills.length === 0) {
    throw createError("skills must be a non-empty array", 400);
  }

  await addSkillsFromCompany(parsedSkills);

  return {
    message: "skills has inserted successfully",
  };
};

module.exports = {
  postInternship,
  getInternships,
  addTechnicalExam,
  postCompanySkills,
};
