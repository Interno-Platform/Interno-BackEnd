const db = require("../../config/database");

const insertTraineeOrCompany = async (body) => {
  console.log(body);

  if (body.role === "trainee") {
    const traineeQuery = `INSERT INTO trainees (
      user_id,
      name,
      email,
      gender,
      city,
      university,
      major,
      graduation_year,
      phone,
      profile_picture,
      cv_file
    ) VALUES (?, ?, ?, ?, ?, ?,?,?,?,?,?)`;

    const [users] = await db.execute(traineeQuery, [
      body.id,
      body.name,
      body.email,
      body.gender || null,
      body.city || null,
      body.university || null,
      body.major || null,
      body.graduation_year || null,
      body.phone || null,
      body.profile_picture || null,
      body.cv_file || null,
    ]);
    if (!users || users.affectedRows === 0) {
      throw createError("Trainee registration failed", 400);
    }
    return { success: true };
  } else if (body.role === "company") {
    const companiesQuery = `INSERT INTO companies (
      user_id,
      company_name,
      registration_number,
      email,
      social_media_links,
      phone,
      website,
      address,
      city,
      country,
      industry,
      employee_count,
      annual_revenue,
      founded_date,
      logo_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    let socialMediaLinks = body.social_media_links;

    if (typeof socialMediaLinks === "string") {
      try {
        socialMediaLinks = JSON.parse(socialMediaLinks);
      } catch (_) {}
    }

    const socialMediaLinksJson = socialMediaLinks
      ? JSON.stringify(socialMediaLinks)
      : null;
    console.log(socialMediaLinksJson);

    const [users] = await db.execute(companiesQuery, [
      body.id,
      body.name || null,
      body.registration_number || null,
      body.email,
      socialMediaLinksJson,
      body.phone || null,
      body.website || null,
      body.address || null,
      body.city || null,
      body.country || null,
      body.industry || null,
      body.employee_count || null,
      body.annual_revenue || null,
      body.founded_date || null,
      body.logo_url || null,
    ]);
    if (!users || users.affectedRows === 0) {
      throw createError("Company registration failed", 400);
    }
    return { success: true };
  }
};
module.exports = insertTraineeOrCompany;
