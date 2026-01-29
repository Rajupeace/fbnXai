const express = require('express');
const router = express.Router();
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const { protect, admin } = require('../middleware/authMiddleware');

// Get fee details for a student (Student Access)
router.get('/:sid', protect, async (req, res) => {
    try {
        const { sid } = req.params;

        // Authorization check: User can only see their own fees unless they are admin
        if (req.user.role !== 'admin' && req.user.sid !== sid) {
            return res.status(403).json({ message: 'Not authorized to view these fee records' });
        }

        let fee = await Fee.findOne({ studentId: sid }).sort({ createdAt: -1 });

        // If no fee record exists, create a dummy one for demonstration/testing
        if (!fee) {
            const student = await Student.findOne({ sid });
            if (!student) return res.status(404).json({ message: 'Student not found' });

            fee = new Fee({
                studentId: sid,
                totalFee: 75000,
                paidAmount: 25000,
                dueAmount: 50000,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                status: 'Partial',
                academicYear: '2023-24',
                semester: student.year ? `${student.year} Year` : '1st Year',
                transactions: [
                    {
                        transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
                        amount: 25000,
                        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
                        method: 'UPI',
                        status: 'Success'
                    }
                ]
            });
            await fee.save();
        }

        res.json(fee);
    } catch (error) {
        console.error('Error fetching fees:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Record a new payment
router.post('/pay', protect, async (req, res) => {
    try {
        const { sid, amount, method } = req.body;

        // Only allow student to pay their own fees or admin to record
        if (req.user.role !== 'admin' && req.user.sid !== sid) {
            return res.status(403).json({ message: 'Not authorized to pay for this account' });
        }

        const fee = await Fee.findOne({ studentId: sid });
        if (!fee) return res.status(404).json({ message: 'Fee record not found' });

        const transaction = {
            transactionId: 'TXN' + Math.floor(Math.random() * 1000000),
            amount,
            date: new Date(),
            method,
            status: 'Success'
        };

        fee.transactions.push(transaction);
        fee.paidAmount += amount;
        fee.dueAmount = Math.max(0, fee.totalFee - fee.paidAmount);

        if (fee.dueAmount === 0) {
            fee.status = 'Paid';
        } else if (fee.paidAmount > 0) {
            fee.status = 'Partial';
        }

        await fee.save();
        res.json({ message: 'Payment successful', fee });
    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all fee records
router.get('/', protect, admin, async (req, res) => {
    try {
        const fees = await Fee.find().sort({ updatedAt: -1 });
        res.json(fees);
    } catch (error) {
        console.error('Error fetching all fees:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Update fee record (set total fee, manual payment, etc.)
router.put('/:sid', protect, admin, async (req, res) => {
    try {
        const { sid } = req.params;
        const updateData = req.body;

        let fee = await Fee.findOne({ studentId: sid });
        if (!fee) {
            fee = new Fee({ studentId: sid, ...updateData });
        } else {
            Object.assign(fee, updateData);
            // Recalculate due
            fee.dueAmount = Math.max(0, (fee.totalFee || 0) - (fee.paidAmount || 0));
            if (fee.dueAmount === 0) fee.status = 'Paid';
            else if (fee.paidAmount > 0) fee.status = 'Partial';
            else fee.status = 'Unpaid';
        }

        await fee.save();
        res.json({ message: 'Fee record updated', fee });
    } catch (error) {
        console.error('Error updating fee:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
