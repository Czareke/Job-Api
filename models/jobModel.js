const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Please Enter Company Name '],
    unique: true,
    minlength: 5,
    maxlength: 20,
  },
  position: {
    type: String,
    required: [true, 'Please Position held in Company'],
    minlength: 5,
    maxlength: 20,
  },
  status: {
    type: String,
    enum: ['active', 'Inactive'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false,
  },
});
const job = mongoose.model('job', jobSchema);

module.exports = job;
