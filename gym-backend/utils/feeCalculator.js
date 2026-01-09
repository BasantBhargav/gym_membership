// Monthly fee structure
const feeStructure = {
  basic: 500,
  premium: 800,
  elite: 1200,
};

// Calculate total fee
const calculateTotalFee = (membershipType = 'basic', months = 1) => {
  const monthlyFee = feeStructure[membershipType] || feeStructure.basic;
  return monthlyFee * months;
};

// Calculate expiry date
const calculateExpiryDate = (joinDate, months = 1) => {
  const expiryDate = new Date(joinDate);
  expiryDate.setMonth(expiryDate.getMonth() + months);
  return expiryDate;
};

// Check if membership expired
const isMembershipExpired = (expiryDate) => {
  return new Date(expiryDate) <= new Date();
};

// Days left until expiry
const daysUntilExpiry = (expiryDate) => {
  const diff = new Date(expiryDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// Due soon (within 7 days)
const isDueSoon = (expiryDate) => {
  const days = daysUntilExpiry(expiryDate);
  return days > 0 && days <= 7;
};

module.exports = {
  calculateTotalFee,
  calculateExpiryDate,
  isMembershipExpired,
  daysUntilExpiry,
  isDueSoon,
};
