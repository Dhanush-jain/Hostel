const Admission = require("../models/Admission");

exports.submitAdmission = async (req, res) => {
  try {
    const {
      name,
      rollNo,
      department,
      year,
      phone,
      email,
      hostel,
    } = req.body;

    const feeReceiptFile = req.files?.feeReceipt?.[0];

    if (!feeReceiptFile) {
      return res.status(400).json({ error: "Fee receipt is required" });
    }

    const admission = await Admission.create({
      name,
      rollNo,
      department,
      year,
      phone,
      email,
      hostel,
      feeReceipt: feeReceiptFile.filename,
    });

    return res.status(200).json({
      success: true,
      message: "Admission submitted successfully!",
      studentId: admission._id,
    });
  } catch (error) {
    console.error("Admission Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAdmissionInfo = async (req, res) => {
  try {
    const email = req.params.email;
    const student = await Admission.findOne({ email });

    if (!student) {
      return res.status(404).json({ error: "No admission record found" });
    }

    return res.status(200).json(student);
  } catch (error) {
    console.error("Fetch Admission Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};