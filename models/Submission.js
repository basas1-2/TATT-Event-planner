const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  phone: String,
  event: String,
  location: String,
  date: String,
  budget: String,
  message: String
}, { timestamps: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
