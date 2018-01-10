var mongoose = require('mongoose');

var reconData = mongoose.model('loadFile', {

  providerCode: {
    type: String,
    required: true,
    minlength: 3,
    trim: true
  },
  dataType: {
    type: String,
    required: true,
    trim: true
  },
  filename: {
    type: String,
    required: true,
    trim: true
  },
  period: {
    type: Number,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  timestamp: {
    type: String,
    required: true,
    trim: true
  },
  userId: {
    type: String,
    required: true,
    trim: true
  },
  recordCount: {
    type: Number,
    required: true
  }
});

module.exports = {loadFile};
