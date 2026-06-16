const express = require("express");
const router = express.Router();
const {
  approveCompany,
  rejectCompany,
  getAprrovedCompanies,
  changeCompanyStatus,
  getPendingCompanies,
  getRejectedCompaniesController,
  getTraineesForAdmin,
  changeinternshipstatus,
  getPendingInternshipsController,
} = require("../../controllers/adminControllers/adminController");
const {
  getPendingInternships,
} = require("../../Services/adminServices/admin.services");
const { getAllContactUsMessages } = require("../../controllers/websiteControllers/contactUs.controller");

// Company approval/rejection routes
router.post("/approve-company/:company_id", approveCompany);
router.post("/reject-company/:company_id", rejectCompany);
router.get("/approved-companies", getAprrovedCompanies);
router.get("/pending-companies", getPendingCompanies);
router.get("/rejected-companies", getRejectedCompaniesController);

// Other admin routes
router.get("/trainees", getTraineesForAdmin);
router.post("/account-status/:company_id", changeCompanyStatus);
router.post("/internship-status", changeinternshipstatus);
router.get("/pending-internships", getPendingInternshipsController);
router.get("/contact-us", getAllContactUsMessages);

router.Access_Role = ["admin"];
router.message = "only admin can access to this request";
module.exports = router;
