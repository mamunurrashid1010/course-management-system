const Request = require('../models/Request');
const User = require('../models/User');
const emailLogger = require('../utils/emailLogger');

// exports.getRequestQueues = async (req, res) => {
//     try {
//         const queues = await Request.aggregate([
//             { $match: { status: 'pending' } },
//             { $group: { _id: "$category", count: { $sum: 1 } } }
//         ]);

//         res.json(queues);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.getQueueRequests = async (req, res) => {
//     try {
//         const { category } = req.params;
//         const requests = await Request.find({ category, status: 'pending' }).populate('student', 'name email');

//         res.json(requests);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.resolveRequest = async (req, res) => {
//     try {
//         const { requestId } = req.params;
//         const { resolutionNote, status } = req.body;
//         const departmentHeadId = req.user.userId;

//         if (!['resolved', 'rejected'].includes(status)) {
//             return res.status(400).json({ message: 'Invalid status' });
//         }

//         const request = await Request.findById(requestId).populate('student', 'email name');
//         if (!request) return res.status(404).json({ message: 'Request not found' });

//         request.status = status;
//         request.resolutionNote = resolutionNote;
//         request.resolvedBy = departmentHeadId;
//         request.resolvedAt = new Date();

//         await request.save();

//         emailLogger(`
//         To: ${request.student.email}
//         Subject: Your Request Status Update
//         Message: Hello ${request.student.name}, your request (ID: ${requestId}) has been ${status}. 
//         Note from Department Head: ${resolutionNote}
//         `);

//         res.json({ message: `Request ${status} successfully` });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

// exports.getRandomRequest = async (req, res) => {
//     try {
//         const request = await Request.aggregate([{ $match: { status: 'pending' } }, { $sample: { size: 1 } }]);

//         if (request.length === 0) return res.json({ message: 'No pending requests' });

//         res.json(request[0]);
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };



exports.getQueuesPage = async (req, res) => {
    try {
        const queues = await Request.aggregate([
            { $match: { status: 'pending' } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        res.render('queues', { queues });
    } catch (error) {
        res.status(500).send('Server error');
    }
};

exports.getQueueRequestsPage = async (req, res) => {
    try {
        const { category } = req.params;
        const requests = await Request.find({ category, status: 'pending' }).populate('student', 'name email').lean();
        res.render('requests', { category, requests });
    } catch (error) {
        res.status(500).send('Server error');
    }
};

exports.resolveRequestPage = async (req, res) => {
    if (req.method === "GET") {
        try {
            const { requestId } = req.params;
            const request = await Request.findById(requestId).populate('student', 'name email').lean();
            if (!request) return res.status(404).send('Request not found');

            res.render('resolve', { request });
        } catch (error) {
            res.status(500).send('Server error');
        }
    } else if (req.method === "POST") {
        try {
            const { requestId } = req.params;
            const { resolutionNote, status } = req.body;
            const departmentHeadId = req.user.userId;

            if (!['resolved', 'rejected'].includes(status)) {
                return res.status(400).send('Invalid status');
            }

            const request = await Request.findById(requestId).populate('student', 'email name');
            if (!request) return res.status(404).send('Request not found');

            request.status = status;
            request.resolutionNote = resolutionNote;
            request.resolvedBy = departmentHeadId;
            request.resolvedAt = new Date();

            await request.save();

            emailLogger(`To: ${request.student.email}\nSubject: Your Request Status Update\nMessage: Hello ${request.student.name}, your request (ID: ${requestId}) has been ${status}. Note: ${resolutionNote}`);

            res.redirect('/api/department-head');
        } catch (error) {
            res.status(500).send('Server error');
        }
    }
};

exports.getRandomRequestPage = async (req, res) => {
    try {
        const request = await Request.aggregate([{ $match: { status: 'pending' } }, { $sample: { size: 1 } }]);

        if (request.length === 0) return res.send('No pending requests');

        res.redirect(`/api/department-head/request/${request[0]._id}`);
    } catch (error) {
        res.status(500).send('Server error');
    }
};
