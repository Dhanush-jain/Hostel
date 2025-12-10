const express = require("express");
const router = express.Router();
const { confirmRoom } = require("../controllers/roomController");

router.post("/confirm", confirmRoom);

module.exports = router;