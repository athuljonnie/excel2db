const express = require("express");
const { uploadFile } = require("../controllers/upload.controller");

const router = express.Router();

// Define the route for file upload
router.post('/upload', uploadFile);

module.exports = router;
