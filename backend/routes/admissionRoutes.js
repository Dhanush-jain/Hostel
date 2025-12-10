const express = require("express");
const router = express.Router();

// File upload middleware
const upload = require("../uploads/upload");

// Controllers
const {
  submitAdmission,
  getAdmissionInfo,
} = require("../controllers/admissionController");

// ===============================
//  POST: Submit Admission Form
// ===============================
router.post(
  "/submit",
  upload.fields([
    { name: "feeReceipt", maxCount: 1 }, // Upload single fee receipt
  ]),
  submitAdmission
);

// ===============================
//  GET: Fetch Admission Info by Email
// ===============================
router.get("/info/:email", getAdmissionInfo);

// Export router
module.exports = router;
