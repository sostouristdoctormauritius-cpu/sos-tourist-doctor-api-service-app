const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateOtpRequest = (contactType, deliveryMethod) => {
  if (contactType !== 'email' && contactType !== 'phone') {
    throw new Error('Invalid contact type. Must be email or phone');
  }

  if (deliveryMethod !== 'email' && deliveryMethod !== 'sms' && deliveryMethod !== 'whatsapp') {
    throw new Error('Invalid delivery method. Must be email, sms, or whatsapp');
  }
};

module.exports = {
  isValidEmail,
  validateOtpRequest
};
