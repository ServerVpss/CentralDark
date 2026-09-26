// Helpers para respostas HTTP padronizadas.
function ok(res, data, status = 200) {
  return res.status(status).json({ ok: true, data });
}
function fail(res, code, message, status = 400, extra) {
  return res.status(status).json({ ok: false, error: { code, message, ...(extra || {}) } });
}
module.exports = { ok, fail };
