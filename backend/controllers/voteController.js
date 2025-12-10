const Vote = require("../models/Vote");

exports.submitVote = async (req, res) => {
  try {
    const { studentId, food } = req.body;

    if (!studentId || !food) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const alreadyVoted = await Vote.findOne({ studentId });

    if (alreadyVoted) {
      return res.status(400).json({ error: "Already voted" });
    }
    
    await Vote.create({ studentId, food });

    res.json({ message: "Vote submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const votes = await Vote.find();
    const result = {};

    votes.forEach((v) => {
      result[v.food] = (result[v.food] || 0) + 1;
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};