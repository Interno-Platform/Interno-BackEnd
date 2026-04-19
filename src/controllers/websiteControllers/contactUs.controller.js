const {
  contactUsService,
  getAllContactUsMessagesService,
} = require("../../Services/websiteServices/website.services");
const asyncHandler = require("express-async-handler");

const contactUsController = asyncHandler(async (req, res) => {
  const result = await contactUsService(req.body);
  res.status(200).json({
    success: true,
    message: "Message sent successfully wre will get back to you soon",
  });
});

const getAllContactUsMessages = asyncHandler(async (req, res) => {
  const result = await getAllContactUsMessagesService();
  res.status(200).json({
    success: true,
    data: result
  });
});

module.exports = {
  contactUsController,
  getAllContactUsMessages
};
