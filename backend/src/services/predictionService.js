/**
 * Prediction Service — ML Integration Boundary
 *
 * This file is the designated integration point for the future ML service.
 *
 * CURRENT STATE: Returns rule-based academic alerts only.
 * FUTURE STATE: Will call a Python FastAPI ML service and return risk predictions.
 *
 * Future flow:
 *   Node.js (this file) → HTTP POST → FastAPI → ML Model → risk score → back here
 */

// TODO (ML Phase): Replace this with an HTTP call to the FastAPI prediction service
// Example future implementation:
//   const axios = require('axios');
//   const response = await axios.post(process.env.ML_SERVICE_URL + '/predict', studentFeatures);
//   return response.data;

/**
 * Rule-based academic alert check (NOT ML — transparent rule logic)
 * Returns alerts for a student based on attendance and marks data.
 */
const getAcademicAlerts = (attendancePercentage, averageMarksPercentage) => {
  const alerts = [];

  if (attendancePercentage < 75) {
    alerts.push({
      type: 'ATTENDANCE_ALERT',
      message: `Attendance is ${attendancePercentage.toFixed(1)}% — below the 75% threshold`,
      severity: attendancePercentage < 60 ? 'HIGH' : 'MEDIUM',
    });
  }

  if (averageMarksPercentage < 40) {
    alerts.push({
      type: 'PERFORMANCE_ALERT',
      message: `Average score is ${averageMarksPercentage.toFixed(1)}% — requires academic attention`,
      severity: 'HIGH',
    });
  } else if (averageMarksPercentage < 60) {
    alerts.push({
      type: 'PERFORMANCE_ALERT',
      message: `Average score is ${averageMarksPercentage.toFixed(1)}% — below expected performance`,
      severity: 'MEDIUM',
    });
  }

  return alerts;
};

module.exports = { getAcademicAlerts };
