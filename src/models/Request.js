const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: String, required: true },
    status: { type: String, enum: ['pending', 'resolved', 'rejected', 'cancelled'], default: 'pending' },
    estimatedCompletionTime: { type: Date },
    resolutionNote: { type: String },
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    createdAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date }
});

module.exports = mongoose.model('Request', RequestSchema);
