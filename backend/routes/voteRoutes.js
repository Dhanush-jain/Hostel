const express = require("express");
const router = express.Router();
const { submitVote, getResults } = require("../controllers/voteController");

// POST vote
router.post("/submit", submitVote);

// GET votes count
router.get("/results", getResults);

module.exports = router;