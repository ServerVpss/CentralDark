// Gerador de BR Code (payload PIX copia-e-cola) — padrão EMV do BACEN.
// Pura função, sem dependência nativa. Roda no Worker.

function emv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

// CRC16-CCITT (polinômio 0x1021) — exigido pelo padrão PIX.
function crc16(payload: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

// Remove acentos e limita o tamanho. Cidade/nome só ASCII no BR Code.
function sanitize(text: string, max: number): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Za-z0-9 ]/g, "")
    .trim()
    .substring(0, max)
    .toUpperCase();
}

export type BrCodeInput = {
  key: string;                  // chave PIX (cpf, cnpj, email, telefone, aleatória)
  beneficiaryName: string;      // até 25 chars
  beneficiaryCity: string;      // até 15 chars
  amount?: number;              // opcional — se omitido, pagador digita
  description?: string;         // opcional, até 50 chars
  txid?: string;                // 1-25 chars, [A-Za-z0-9]
};

export function generateBrCode(input: BrCodeInput): string {
  const name = sanitize(input.beneficiaryName, 25) || "RECEBEDOR";
  const city = sanitize(input.beneficiaryCity, 15) || "SAO PAULO";
  const txid = (input.txid || "***").replace(/[^A-Za-z0-9]/g, "").substring(0, 25) || "***";

  // Merchant Account Information — PIX
  const gui = emv("00", "br.gov.bcb.pix");
  const keyField = emv("01", input.key);
  const descField = input.description
    ? emv("02", input.description.substring(0, 50))
    : "";
  const merchantAccount = emv("26", gui + keyField + descField);

  // Additional Data Field — txid
  const additionalData = emv("62", emv("05", txid));

  const payloadSemCrc =
    emv("00", "01") +                    // Payload Format
    emv("01", "11") +                    // Point of Initiation — 11 = estático
    merchantAccount +
    emv("52", "0000") +                  // MCC
    emv("53", "986") +                   // Moeda BRL
    (input.amount && input.amount > 0
      ? emv("54", input.amount.toFixed(2))
      : "") +
    emv("58", "BR") +                    // País
    emv("59", name) +
    emv("60", city) +
    additionalData +
    "6304";                              // CRC placeholder

  return payloadSemCrc + crc16(payloadSemCrc);
}
