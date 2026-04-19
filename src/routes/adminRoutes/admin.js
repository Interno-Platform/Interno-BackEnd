const express = require("express");
const router = express.Router();
const {
  approveCompany,
  getAprrovedCompanies,
  changeCompanyStatus,
  getPendingCompanies,
  getTraineesForAdmin,
  changeinternshipstatus,
  getPendingInternshipsController
} = require("../../controllers/adminControllers/adminController");
const { getPendingInternships } = require("../../Services/adminServices/admin.services");
router.post("/approve-company/:company_id", approveCompany);
router.get("/approved-companies", getAprrovedCompanies);
router.get("/pending-companies", getPendingCompanies);
router.get("/trainees", getTraineesForAdmin);
router.post("/account-status/:company_id", changeCompanyStatus);
router.post("/internship-status", changeinternshipstatus);
router.get("/pending-internships", getPendingInternshipsController);

// router.Access_Role = ["admin"];
router.message = "only admin can access to this request";
module.exports = router;
