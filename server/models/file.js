var mongoose = require('mongoose');

var fileSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId
  },
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
  processPeriod: {
    type: Number,
    required: true
  },
  timestamp: {
    type: String,
    required: true,
    trim: true
  },
  docCount: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true,
    trim: true
  }
});

var File = mongoose.model('file', fileSchema);

module.exports = {File};
