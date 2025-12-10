const RoomAllocation = require("../models/RoomAllocation");

exports.confirmRoom = async (req, res) => {
  try {
    const { studentId, room, bed } = req.body;

    if (!studentId || !room || !bed) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const allocation = await RoomAllocation.create({
      studentId,
      room,
      bed,
    });

    return res.status(200).json({
      success: true,
      message: "Room allocated successfully!",
      allocation
    });
  } catch (error) {
    console.error("Room Allocation Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};