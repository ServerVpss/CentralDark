const SECRET_KEY = /(password|passwd|secret|token|api[_-]?key|authorization|cookie|session[_-]?id|private[_-]?key|refresh[_-]?token|access[_-]?token)/i;

const SECRET_VALUE_PATTERNS = [
  /\bsk-[A-Za-z0-9_-]{12,}\b/g,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g,
  /\bBearer\s+[A-Za-z0-9._~+\/=-]{12,}\b/gi,
  /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g
];

function scrubString(input) {
  let out = input;
  for (const rx of SECRET_VALUE_PATTERNS) out = out.replace(rx, '[REDACTED_SECRET]');
  return out;
}

export function sanitize(value, path = '$') {
  if (value === null || value === undefined) return { value, sensitive: false, redactions: [] };

  if (typeof value === 'string') {
    const scrubbed = scrubString(value);
    return {
      value: scrubbed,
      sensitive: scrubbed !== value,
      redactions: scrubbed !== value ? [path] : []
    };
  }

  if (Array.isArray(value)) {
    let sensitive = false;
    const redactions = [];
    const arr = value.map((item, i) => {
      const r = sanitize(item, `${path}[${i}]`);
      sensitive ||= r.sensitive;
      redactions.push(...r.redactions);
      return r.value;
    });
    return { value: arr, sensitive, redactions };
  }

  if (typeof value === 'object') {
    const out = {};
    let sensitive = false;
    const redactions = [];
    for (const [k, v] of Object.entries(value)) {
      if (SECRET_KEY.test(k)) {
        out[k] = '[REDACTED_SECRET]';
        sensitive = true;
        redactions.push(`${path}.${k}`);
        continue;
      }
      const r = sanitize(v, `${path}.${k}`);
      out[k] = r.value;
      sensitive ||= r.sensitive;
      redactions.push(...r.redactions);
    }
    return { value: out, sensitive, redactions };
  }

  return { value, sensitive: false, redactions: [] };
}
