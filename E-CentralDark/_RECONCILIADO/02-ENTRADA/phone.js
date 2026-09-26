// Validação/normalização de número de telefone E.164 (Brasil-friendly).
function normalizePhone(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

function isValidPhone(raw) {
  return normalizePhone(raw) !== null;
}

module.exports = { normalizePhone, isValidPhone };
