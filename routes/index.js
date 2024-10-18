const express = require("express");
const { route } = require("./users.route");
const router = express.Router();

router.use("/users", require("./users.route"));
router.use("/admin", require("./upload.route"));


module.exports = router;


// const express = require("express");
// const router = express.Router();

// // Example route
// router.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// module.exports = router;
