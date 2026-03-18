const QRCode = require('qrcode');

/**
 * Generate a QR code as a base64 data-URL for the given payload object.
 * @param {object} payload - Data to encode into the QR code.
 * @returns {Promise<string>} Base64 data URL string.
 */
const generateQRCode = async (payload) => {
  const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
  return QRCode.toDataURL(data);
};

module.exports = { generateQRCode };
