import Plan from '../models/Plan.js';

// @desc    Create a new plan
// @route   POST /api/plans
// @access  Private (Staff only)
const createPlan = async (req, res) => {
    try {
        const { assignedTo, type, title, week, instructions } = req.body;

        // Constraint Check: Ensure user doesn't already have a plan from this staff's role for this week
        // We know req.user is the staff member. We need to check if ANY plan exists for this user, this week, from a staff of this role.
        // OR simpler as per request: "one nutritionist one trainer".
        // So we check plans assignedTo this user, with the same 'type' (since type maps to role functionality e.g. workout->trainer, diet->nutritionist)
        // OR we check based on the assignedBy user's role. Let's use the assignedBy user's role.

        const staffRole = req.user.role; // e.g., 'trainer'

        // Find if a plan already exists for this week, assigned to this user, created by ANY staff with this role.
        // We need to query plans and populate assignedBy, then filter? No, that's inefficient.
        // Better: Query plans for this user and week, then populate assignedBy, then check role.
        // Even Better: Use aggregate or just fetch all plans for this user/week and check in JS (assuming low volume per week).

        const existingPlans = await Plan.find({
            assignedTo,
            week
        }).populate('assignedBy');

        const conflict = existingPlans.find(p => p.assignedBy.role === staffRole);

        if (conflict) {
            return res.status(400).json({
                message: `A plan for Week ${week} has already been assigned by a ${staffRole}. Only one plan per role per week is allowed.`
            });
        }

        const plan = await Plan.create({
            assignedBy: req.user._id,
            assignedTo,
            type,
            title,
            week,
            instructions,
        });

        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get plans assigned to the logged-in user
// @route   GET /api/plans/my-plans
// @access  Private (User)
const getMyPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ assignedTo: req.user._id, status: 'active' })
            .populate('assignedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get plans created by the logged-in staff member
// @route   GET /api/plans/created-plans
// @access  Private (Staff)
const getCreatedPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ assignedBy: req.user._id })
            .populate('assignedTo', 'name')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get plans for a specific user (Staff access)
// @route   GET /api/plans/user/:userId
// @access  Private (Staff)
const getUserPlans = async (req, res) => {
    try {
        const plans = await Plan.find({ assignedTo: req.params.userId })
            .populate('assignedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a plan
// @route   PUT /api/plans/:id
// @access  Private (Creator only)
const updatePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (plan) {
            // Check if the user is the creator
            if (plan.assignedBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to edit this plan' });
            }

            plan.title = req.body.title || plan.title;
            plan.instructions = req.body.instructions || plan.instructions;
            // Not allowing week/type/assignedTo changes for now to prevent fundamental shifts
            // that might conflict with other constraints, unless strictly handled.

            const updatedPlan = await plan.save();
            res.json(updatedPlan);
        } else {
            res.status(404).json({ message: 'Plan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a plan
// @route   DELETE /api/plans/:id
// @access  Private (Creator only)
const deletePlan = async (req, res) => {
    try {
        const plan = await Plan.findById(req.params.id);

        if (plan) {
            // Check if the user is the creator
            if (plan.assignedBy.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized to delete this plan' });
            }

            await plan.deleteOne();
            res.json({ message: 'Plan removed' });
        } else {
            res.status(404).json({ message: 'Plan not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export { createPlan, getMyPlans, getCreatedPlans, getUserPlans, updatePlan, deletePlan };
