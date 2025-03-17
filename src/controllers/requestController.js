const Request = require('../models/Request');
const User = require('../models/User');
const emailLogger = require('../utils/emailLogger');
const moment = require("moment");

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
        Estimated Processing Time: ${estimatedTime}
        `);

        // res.json({ message: 'Request submitted successfully', request: newRequest });
        res.send("<script> window.location.href='/student-add-request';</script>");
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


// exports.getStudentRequests = async (req, res) => {
//     try {
//         const studentId = req.user.userId;
//         const { status } = req.query; // Get status from query parameters

//         // Define the filter
//         let filter = { student: studentId };
//         if (status) {
//             filter.status = status; // Apply status filter if provided
//         }

//         const requests = await Request.find(filter).sort({ createdAt: -1 });

//         // Format dates before sending to the template
//         const formattedRequests = requests.map(request => ({
//             ...request.toObject(),
//             createdAt: moment(request.createdAt).format("YYYY-MM-DD HH:mm"),
//             estimatedCompletionTime: moment(request.estimatedCompletionTime).format("YYYY-MM-DD HH:mm")
//         }));

//         res.render("allRequest", { requests: formattedRequests });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };

exports.getStudentRequests = async (req, res) => {
    try {
        const studentId = req.user.userId;
        const { semester, status } = req.query; // Get semester and status from query parameters

        let filter = { student: studentId };

        // Apply semester-based filtering
        if (semester) {
            const [year, term] = semester.split("-");
            let startDate, endDate;

            if (term === "Spring") {
                startDate = moment(`${year}-01-01`).startOf("day");
                endDate = moment(`${year}-04-30`).endOf("day");
            } else if (term === "Summer") {
                startDate = moment(`${year}-05-01`).startOf("day");
                endDate = moment(`${year}-08-31`).endOf("day");
            } else if (term === "Fall") {
                startDate = moment(`${year}-09-01`).startOf("day");
                endDate = moment(`${year}-12-31`).endOf("day");
            }

            filter.createdAt = { $gte: startDate.toDate(), $lte: endDate.toDate() };
        }

        // Apply status-based filtering
        if (status) {
            filter.status = status;
        }

        const requests = await Request.find(filter).sort({ createdAt: -1 });

        // Format dates before sending to the template
        const formattedRequests = requests.map(req => ({
            ...req.toObject(),
            createdAt: moment(req.createdAt).format("YYYY-MM-DD HH:mm"),
            estimatedCompletionTime: moment(req.estimatedCompletionTime).format("YYYY-MM-DD HH:mm"),
        }));

        res.render("allRequest", { 
            requests: formattedRequests, 
            selectedSemester: semester, 
            selectedStatus: status 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.cancelRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await Request.findById(requestId);
        if (!request){
            console.log('Request not found')
            // return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending'){
            // return res.status(400).json({ message: 'Cannot cancel a resolved request' });
            console.log('Cannot cancel a resolved request')
            // res.send("<script>alert('Cannot cancel a resolved request'); window.location.href='/api/requests';</script>");
        }
            

        request.status = 'cancelled';
        await request.save();
        // res.json({ message: 'Request cancelled successfully' });
        console.log('Request cancelled successfully')
         res.send("<script> window.location.href='/api/requests';</script>");
    } catch (error) {
        // res.status(500).json({ message: 'Server error' });
        console.log('Server error')
    }
};
