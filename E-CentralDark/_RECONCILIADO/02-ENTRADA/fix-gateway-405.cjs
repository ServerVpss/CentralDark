const fs = require('fs');
const path = require('path');

// Diagnosticou 405 Method Not Allowed.
// O Gateway emite esse erro quando chamamos o client wuzapi.
// Em wuzapiClient.js, criamos:
// async function getUserAvatar({ token, phone, preview = true }) {
//    const { data } = await client.post('/user/avatar', { Phone: phone, Preview: preview }, { headers: userHeaders(token) });
// }
// Mas espere, o 405 está ocorrendo onde? "Request failed with status code 405".
// Vamos ver as chamadas da WuzAPI que o Client Node JS faz e o que a documentação (spec vivo) do container diz:
// "Spec vivo do container confirmou: /user/contacts é GET, /user/info é POST, /user/avatar é POST, /chat/send/text é POST."
// Se a falha for /session/connect ou /session/qr... Espera, O WuzAPI antigo chamava /session/qr com GET. Se for POST e a gente manda GET, dá 405.
