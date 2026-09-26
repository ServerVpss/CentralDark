module.exports = {
  ok: (res, data) => res.status(200).json({ ok: true, data }),
  fail: (res, code, msg, status=400) => res.status(status).json({ ok: false, error: msg, code })
};
