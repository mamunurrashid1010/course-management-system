const Request = require('../models/Request');
const User = require('../models/User');
const emailLogger = require('../utils/emailLogger');

exports.createRequest = async (req, res) => {
    try {
        const { category } = req.body;
        const studentId = req.user.userId;

        const existingRequests = await Request.countDocuments({ status: 'pending' });
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + existingRequests * 15); // Assume each request takes 15 min

        const request = new Request({
            student: studentId,
            category,
            estimatedCompletionTime: estimatedTime
        });

        await request.save();
        res.status(201).json({ message: 'Request submitted successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// need to check
exports.submitRequest = async (req, res) => {
    try {
        const { category } = req.body;
        const studentId = req.user.userId;

        const queueSize = await Request.countDocuments({ category, status: 'pending' });
        const estimatedTime = new Date();
        estimatedTime.setMinutes(estimatedTime.getMinutes() + queueSize * 15); // 15 mins per request

        const newRequest = new Request({
            student: studentId,
            category,
            estimatedCompletionTime: estimatedTime,
        });

        await newRequest.save();

        emailLogger(`
        To: ${req.user.email}
        Subject: Request Submitted Successfully
        Message: Hello ${req.user.name}, your request for '${category}' has been submitted successfully.
        Estimated Completion Time: ${estimatedTime}
        `);

        res.json({ message: 'Request submitted successfully', request: newRequest });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getStudentRequests = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const requests = await Request.find({ student: studentId }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.cancelRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await Request.findById(requestId);
        if (!request) return res.status(404).json({ message: 'Request not found' });

        if (request.status !== 'pending') return res.status(400).json({ message: 'Cannot cancel a resolved request' });

        request.status = 'cancelled';
        await request.save();
        res.json({ message: 'Request cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
