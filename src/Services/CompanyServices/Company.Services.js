const createError = require("../../utils/createError");
const {
  internshipWithExamSchema,
} = require("../../Validations/internshipsSchema");
const db = require("../../config/database");

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
    parsed?.data.title,
    parsed?.data.description,
    parsed?.data.location_type,
    parsed?.data.duration_weeks,
    parsed?.data.seats,
    parsed?.data.deadline,
    parsed?.data?.required_skills,
  ];

  const [result] = await db.execute(query, values);

  const [insetredInternship] = await db.query(
    `SELECT *  FROM internships WHERE id = ?`,
    [result.insertId],
  );

  await addTechnicalExam(company_id, parsed);

  return insetredInternship;
};

const addTechnicalExam = async (company_id, parsed) => {
  const [internshipData] = await db.execute(
    `SELECT * FROM internships WHERE company_id = ?`,
    [company_id],
  );
  console.log(parsed);

  // 5. Insert into DB
  const [result] = await db.query(
    `INSERT INTO internship_exams 
    (internship_id, exam_title, exam_description, requirements, 
     expected_input, expected_output, programmingLanguage) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      internshipData[0]?.id,
      parsed?.data?.exam_title,
      parsed?.data?.exam_description,
      JSON.stringify(parsed?.data?.requirements),
      parsed?.data?.expected_input,
      parsed?.data?.expected_output,
      parsed?.data?.programmingLanguage,
    ],
  );

  if (result.affectedRows == 0) {
    throw createError("error adding technical exam for this internship", 500);
  }
};

const getInternships = async (company_id, user_id) => {
  console.log(user_id);
  
  if (company_id) {
    const [findCompany] = await db.query(
      `SELECT * FROM companies WHERE id = ?`,
      [company_id],
    );

    if (findCompany.length === 0) {
      throw createError(`company(id) is invalid`, 404);
    }

    const [result] = await db.query(
      `SELECT  companies.company_name , internships.*
   FROM internships
   JOIN companies ON internships.company_id = companies.id
   WHERE internships.company_id = ? AND internships.status = ?`,
      [company_id, "active"],
    );

    if (result.length === 0) {
      throw createError(`no internships for this company`, 404);
    }
    return { data: result };
  } else {
    let [result] = await db.query(
    `SELECT 
    companies.company_name, 
    internships.*,
    CASE WHEN internship_applications.trainee_id IS NOT NULL THEN TRUE ELSE FALSE END AS has_apply
    FROM internships
    JOIN companies ON internships.company_id = companies.id 
    JOIN trainees ON trainees.user_id = ?
    LEFT JOIN internship_applications 
    ON internships.id = internship_applications.internship_id 
    AND internship_applications.trainee_id = trainees.id
    WHERE internships.status = ?`,
      [user_id, "active"],
    );

    if (result.length === 0) {
      throw createError(`no internships found`, 404);
    }

    result = result.map((internship) => {
      return {
        ...internship,
        has_apply: internship.has_apply === 1, 
      };
    });

    return {
      data: result,
    };
  }
};

module.exports = { postInternship, getInternships, addTechnicalExam };
