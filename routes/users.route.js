const express = require("express");
const router = express.Router();
const controller = require("../controllers/users.controller.js"); // Adjust the path based on your folder structure

// Route using the trialFun function
router.post("/addcontact", controller.addContact);

module.exports = router;

