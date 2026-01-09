// Calculate membership fee based on type and duration
const calculateFee = (membershipType, months = 1) => {
  const feeStructure = {
    basic: 500,      // ₹500 per month
    premium: 800,    // ₹800 per month
    elite: 1200,     // ₹1200 per month
  };

  const monthlyFee = feeStructure[membershipType] || feeStructure.basic;
  return monthlyFee * months;
};

// Calculate expiry date from join date
const calculateExpiryDate = (joinDate, months = 1) => {
  const expiryDate = new Date(joinDate);
  expiryDate.setMonth(expiryDate.getMonth() + months);
  return expiryDate;
};

// Check if membership is expired
const isMembershipExpired = (expiryDate) => {
  const today = new Date();
  return expiryDate <= today;
};

// Calculate days until expiry
const daysUntilExpiry = (expiryDate) => {
  const today = new Date();
  const timeDiff = expiryDate - today;
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
  return daysDiff;
};

// Check if payment is due soon (within 7 days)
const isDueSoon = (expiryDate) => {
  const days = daysUntilExpiry(expiryDate);
  return days > 0 && days <= 7;
};

module.exports = {
  calculateFee,
  calculateExpiryDate,
  isMembershipExpired,
  daysUntilExpiry,
  isDueSoon,
};
