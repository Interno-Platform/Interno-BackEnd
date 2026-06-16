const express = require("express");
const router = express.Router();
const { contactUsController, getAllContactUsMessages } = require("../../controllers/websiteControllers/contactUs.controller");

router.post("/contact-us", contactUsController);

module.exports = router;