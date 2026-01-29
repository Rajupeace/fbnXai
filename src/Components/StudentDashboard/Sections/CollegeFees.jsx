import React, { useState, useEffect, useCallback } from 'react';
import { FaCreditCard, FaHistory, FaCheckCircle, FaExclamationTriangle, FaReceipt, FaUniversity } from 'react-icons/fa';
import { apiGet, apiPost } from '../../../utils/apiClient';
import './CollegeFees.css';

const CollegeFees = ({ userData }) => {
    const [feeData, setFeeData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState('UPI');
    const [notification, setNotification] = useState(null);

    const fetchFees = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiGet(`/api/fees/${userData.sid}`);
            if (data) {
                setFeeData(data);
            }
        } catch (error) {
            console.error('Error fetching fees:', error);
        } finally {
            setLoading(false);
        }
    }, [userData.sid]);

    useEffect(() => {
        fetchFees();
    }, [fetchFees]);

    const handlePayment = async (e) => {
        e.preventDefault();
        if (!amount || isNaN(amount) || amount <= 0) {
            setNotification({ type: 'error', message: 'Please enter a valid amount' });
            return;
        }

        try {
            setPaying(true);
            const result = await apiPost('/api/fees/pay', {
                sid: userData.sid,
                amount: parseFloat(amount),
                method
            });

            if (result) {
                setFeeData(result.fee);
                setAmount('');
                setNotification({ type: 'success', message: 'Payment successful! Receipt generated.' });
                setTimeout(() => setNotification(null), 5000);
            }
        } catch (error) {
            setNotification({ type: 'error', message: 'Payment failed. Please try again.' });
        } finally {
            setPaying(false);
        }
    };

    if (loading) {
        return (
            <div className="fees-container">
                <div className="loading-shimmer">
                    <div className="shimmer-header"></div>
                    <div className="shimmer-grid">
                        <div className="shimmer-card"></div>
                        <div className="shimmer-card"></div>
                        <div className="shimmer-card"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fees-container">
            <header className="fees-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h2>College <span>Fees</span></h2>
                        <p>Manage your academic financial records and payments.</p>
                    </div>
                    <FaUniversity size={50} style={{ opacity: 0.2 }} />
                </div>
            </header>

            {notification && (
                <div className={`notification ${notification.type} animate-bounce-in`}>
                    {notification.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    <span>{notification.message}</span>
                </div>
            )}

            <div className="fees-summary-grid">
                <div className="fee-card total">
                    <span className="label">Total Fee</span>
                    <span className="value">₹{feeData?.totalFee?.toLocaleString()}</span>
                    <div className="card-bg-icon"><FaUniversity /></div>
                </div>
                <div className="fee-card paid">
                    <span className="label">Paid Amount</span>
                    <span className="value">₹{feeData?.paidAmount?.toLocaleString()}</span>
                    <div className="card-bg-icon"><FaCheckCircle /></div>
                </div>
                <div className="fee-card due">
                    <span className="label">Outstanding Due</span>
                    <span className="value">₹{feeData?.dueAmount?.toLocaleString()}</span>
                    <div className="card-bg-icon"><FaExclamationTriangle /></div>
                </div>
            </div>

            <div className="fee-progress-panel glass-panel">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-bold text-slate-700">PAYMENT PROGRESS</h3>
                    <span className="text-sm font-black text-indigo-600">
                        {Math.round((feeData?.paidAmount / feeData?.totalFee) * 100)}% COMPLETE
                    </span>
                </div>
                <div className="progress-track">
                    <div
                        className="progress-fill"
                        style={{ width: `${(feeData?.paidAmount / feeData?.totalFee) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-[0.65rem] font-bold text-slate-400 mt-2">
                    <span>ACADEMIC YEAR {feeData?.academicYear}</span>
                    <span>SEMESTER: {feeData?.semester}</span>
                </div>
            </div>

            <div className="payment-section">
                <div className="payment-form-card">
                    <h3><FaCreditCard /> Fast Payment</h3>
                    <form onSubmit={handlePayment}>
                        <div className="form-group">
                            <label>Payment Amount (INR)</label>
                            <input
                                type="number"
                                placeholder="Enter amount to pay"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                max={feeData?.dueAmount}
                                disabled={feeData?.dueAmount === 0}
                            />
                        </div>
                        <div className="form-group">
                            <label>Payment Method</label>
                            <select value={method} onChange={(e) => setMethod(e.target.value)}>
                                <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                                <option value="Card">Credit / Debit Card</option>
                                <option value="Net Banking">Net Banking</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="pay-btn"
                            disabled={paying || feeData?.dueAmount === 0 || !amount}
                        >
                            {paying ? 'Processing...' : `Pay ₹${amount || '0'} Now`}
                        </button>
                    </form>
                </div>

                <div className="history-card">
                    <h3><FaHistory /> Payment History</h3>
                    <div className="transaction-list">
                        {feeData?.transactions?.length > 0 ? (
                            feeData.transactions.map((txn, index) => (
                                <div className="transaction-item" key={index}>
                                    <div className="txn-info">
                                        <span className="txn-date">{new Date(txn.date).toLocaleDateString()}</span>
                                        <span className="txn-id">{txn.transactionId} via {txn.method}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="txn-amount">₹{txn.amount.toLocaleString()}</span>
                                        <FaReceipt className="text-indigo-400 cursor-pointer hover:text-indigo-600" title="Download Receipt" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="no-data">No transactions found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeFees;
