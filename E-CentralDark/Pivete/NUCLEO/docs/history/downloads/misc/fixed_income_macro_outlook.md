# OUTRO - fixed_income_macro_outlook.js
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\templates\fixed_income_macro_outlook.js
**SHA:** 2ae8ac1cf21d2615
**Timestamp:** 2026-08-28T02:52:34.589593
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- // Run:     node recreate_deck.js
- const run = runs[ri];
- const isLastRun  = ri === runs.length - 1;

### Ouro Bruto (primeiros 5000 chars)
```
// Auto-generated pptxgenjs script for DoubleLine 2026 Fixed Income Outlook.
// Updated to match Fixed_Income_Outlook_-_Revised.pptx (manual edits applied).
// Reproduces the final 15-slide deck.
// Install: npm install pptxgenjs
// Run:     node recreate_deck.js
// Output:  ./DoubleLine_2026_Outlook_Revised.pptx

const pptxgen = require("pptxgenjs");

// ---------------------------------------------------------------------------
// Embedded arrow images (PNG, base64) for slide 15 positioning-call cards.
// ---------------------------------------------------------------------------
const ARROW_UP   = "image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAACXBIWXMAAAsTAAALEwEAmpwYAAANUklEQVR4nO3dfahlVR3G8a2R2StFkVS+9CJpFlSYzpy1zji9mQrmqHjWOjNjDUQJZZbj2z1rHeEYFfQCQQWFliFR/2hBQVkhVn9UkEKCQmpFgWIYQeWo1KgzxR5f0vHes+/L3udZe63vB37/DcNea+/nOefee+66VQUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACZzZPRsXbiL7PB3Wyju9cGv/fARHevCf4mM/WXbJmOXsctAjJSh9pE920b3D4b/X/njYn+MRP8tVum/ij1dQPYoEEYn2eie6gp+MvMHhP9Nm4A0FMm+Gij37+O8D/1bmAQx59QrwPAGtngr1pv8J89LnADgCLDTwkAhYefEgAKDz8lACRrGP1S9+GnBIDCw08JAIWHnxIACg8/JQAUHn5KACg8/JQAUHj4KQGg8PBTAkDh4acEgMLDTwkAhYefEgAKDz8lABQefkoAKDz8lACwaia4K/RhpQSAhcs7/LwTAAoPPyUAFB5+SgAoPPyUAFB4+CkBFIzwUwIoFOHnnQAKRfj5cgCFIvx8TwCFIvx8YxCFIvz8dACFIvz8iBCFIvx8TgCFIvx8WAiFMtFfrv+EXW7jgvq+Ao0IPyWAQhF+3gmgUISfLwdQKMLP9wRQKMLPNwZRKMKv/skAPx2ACOFXB58SgAjhVweeEoAI4VcHnRKACOFXB5wSAOFPIGSpDx8bRot45VcHmhKACOFXB5kSgAjhVweYEoCInfjL9A8v08YemOAjQcKqEf78iocSwKoQfn1YKQFIEH59SCkBSBB+fTgpAUgQfn0oKQFIEH59GCkBSBB+fQjVY/gRYZkIvz58qYyhBMpC+PWhS20MJVAGwq8PW6pjKIG8EX59yFIfQwnkifDrw9WXMZRAXgi/PlR9G0MJ5IHw68PU1zGUQL/Z4C5VP0RMv/fAUAL9NIx+KbuHMfpfqa8hh2tc8wR3qfp5Rumv/MHfNpzseJn8Ohrm5NnOl9jgblVfR9tjeCfQD5mG/65NYXzEgfWpr6Vh6mvcOtv+Chv9HepraXsMJZC2LMMf/R+3xJ2vemqN+uuZO09e52B2/ittdHeqr6ftMZRAmnIMvwnunk1L/rXPWGcC1zVvnn6tJ1+x80gb3V/yuy+eMwZTkmP4bXB/G4Ttxz9rrerrapiDr3fzZHSsCe6v6utqewwlkIYcw2+C+/sguLcsu94Erm/eLHfN5srRcTa6+/O7T553Ako5ht8G94CJ43esuGb19TXMStdt4uhtJrp/qK+v7TGUgEae4fcPD6bulLnrVl9jw8y7djMZDUzwD6qvse0xlMBiZRr+vTb6MxrXrr7Ohmm6/kHw7zHB/Vt9nW2PoQQWI8vwR/eIje79q1q//Frnz2rWMIjuNBP9f9TXalseSqBjOYbfRP/YcDravuo9SOCa583q76U/1wT/qPp6W7+fvBPoRo7ht9HvN2H0kTXtg/6a586a1jIZ7bLB7VNfs215KIGWZRr+df2SifyaG2bt93Z8ofqabQdDCbTETP0l6pvZzbiwnv3QX/f8Wdc9DuPd6uu2HQwlsEHZhj+4z6x3T+TX3jDrX5f7rPrabQdDCaxTruE3wX11vXvyeFD0a5g3G1mbCe6Led5zzycG1/Qg5Br+6K+rZrNDNxIS9RqaZiNrq6rqEBPc1Vne+0AJFB1+G/z3RqPRczYYkNwLoKoL0kT3XfU6bAdDCZQa/uh+eOIFFzx3w+EooQCqqqqL0gR/vXottoOhBAoLvwn+pq2zXYdXLVGvp2naWucJs9FhJrgbM30mYlv7lIVcw2+j/83W2ehFbe5VAmuaO22u9cTZmS8w0f9SvSbbwVACuYf/iUM8q5bJ19Uwba/3wCGj0d+iXpftYIovgWzDH/0dJ03OfnnVgQTWNne6WPPW2baX2uh+p16b7WCKLYGMw/+MQzzblsD65k5X6871kFFbYgnkGv7lDvFsm3qNTdPl2utDRk3wf87z2fFllECu4a8P8azPvut6/+TrbJiu12+m/g02uvvU67QdTPYlkGv460M87ZXjNy9iD9VrbZpF7EGuh4zanEsg19/4stH/a94hnm1LYL1zZ2H7sOTemuMhozbHEsg2/ME/bILfssi9lK+5YRa7F25zjoeM2pxKIOPw7x1Oxqcvej/l626YRe/HYDp+d46HjNocSiDb8K/hEM+26dc+fxR7Yib+fTkeMmr7XAK5hr8+xNOGkVPtq3r9TSPblzByB+5Njs9cGO+u+sTG8Tk5Hva4nkM8299b+R7MHe3euA9m+dwFt89MxmdVfbDpSv8mE91D8k3r5EaML1Tvr3wPGka+P5keMmqDe2A42fH6KnX1777neQP8pEqAfB8apkqAje7iTJ/B71QpG0zcSfJN6mBM9J+uEqHei6apElHfM/Ve2LYnuH3DMDqhSpWN7kvyTWp/vlIlJIH9mDtVQmxwX1Dvh217gr+qSpWJ7m75BrU719QHVVYJSWBP5k6VlkPqe6jeE9vmBHdrlaLTLzr9efV3yeUb1Nq4G9o4xLNt+n2ZP1VqZrND66+d1ftiW5r6Q09ViuzS6Gj15rQ2wf2grUM82ybfm4apEpTbIaNbZ9teWqVm82R0rHpj2hn3s/rdTJUo/f7MnypRB96hBv9T9f7YFqY+HKVKjbn8rBerN2bDE9yv2z7Es23yPWqYKmGbd4+e3/dDRk3wj270j8t05sDvxSewSeucW+oDKKvEJbBPc0e9P9kfMhrcn6pU9fabLcHf3tUhnm2T71XDVD3Q50NGzQb/tmSnhlM/6t2GRnf3pjA+ouoJ9X41TdUT9T23wd+l3q+1znDq3lulqv5uqw3u970Jf3D3DKY7jql6RL1nuRRATw8ZvSW1z6U8iw3+3AQ2ahXj7qsPmKx6Rr9v+RRAzw4Z3W+n/p1VH9jovpbAhq049Tcrk/5M9RzqvcutAGrDiX9j8oeMpvwR4IPVH6Kxwd2cZvj9PwdL47dXPaXevxwLoFY/E/Wzkegze33yb/2X+8OOyZWA4BDPtsn3MNMCqA0n4002+j1pPbPuRyl/MK0/JRD83kF0p1U9J9/HjAugZoJ7VzKHjPY5/GmVgHtkOPFnVhmQP5SZF0Ayh4zmEP4USqA+KHIQ3LjKhDrgJRTAk+da1h+71Tyz7vup/jJa30pgv4nuw1VG1AEvpQBqw4n/wKIPGc0y/M8ogeh/vrDN7NtxyqugDnhJBVCzcfShRZ1zkXX4F10Cw+iXqgypA15aASzqkNEiwr+4EnCfqjKlDniJBVCrnynC34cSCO7LVcbUAS+1AGo2+s+3vV9FvfIvoAS+1btPTK2ROuAlF0BVHzIa/NcJf4tOvfT8F5rgftFK+FM9KaVF6oAXXgBV/YyZ6L658b1yNxT7yn+wE2ajwzawqfuf+EWJrF/5n6QOePEF8AQb/CfX+SPC/Sa4z5XwYrVmdjLaVf+O/qo3M/jbbRifWhVEHXAK4P8GU3eKDf63a3heb6s/Zfi0/wIH2zrbdbgJ/qP16bzLfRzz8T886m4wU+9TPLe/a+qAUwDL/vGRM2zw31j+XAF3v4n+OhP9tlLepbZ7iuuVo+PsdDSspz69p/Svm9QBpwCav7E9CNuPr88YqE/KbvjnwNqoA04BAELqgFMAgJA64BQAIKQOOAUACKkDTgEAQuqAUwCAkDrgFAAgpA44BQAIqQNOAQBC6oBTAICQOuAUAEABrFgEPBxAh9Sv8LwDAITUAacAACF1wCkAQEgdcAoAEFIHnAIAhNQBpwAAIXXAKQBASB1wCgAQUgecAgCE1AGnAAAhdcApAEBIHXAKABBSB5wCAITUAacAACF1wCkAQEgdcAoAEFIHnAIAhNQBpwAAIXXAKQBASB1wCgAQUgecAgCE1AGnAAAhdcApAEBIHXAKABBSB5wCAITUAacAACF1wCkAQEgdcAoAEFIHnAIAhNQBpwAAIXXAKQCAAlixCHg4gA6pX+F5BwAIqQNOAQBC6oBTAICQOuAUACCkDjgFAAipA04BAELqgFMAgJA64BQAIKQOOAUACKkDTgEAQuqAUwCAkDrgFAAgpA44BQAIqQNOAQBC6oBTAICQOuAUACCkDjgFAAipA04BAELqgFMAgJA64BQAIKQOOAUACKkDTgEAQuqAUwCAkDrgFAAgpA44BQAIqQNOAQBC6oBTAICQOuAUACCkDjgFAAipA04BAELqgFMAgJA64BQAIKQOOAUACKkDTgEAQuqAUwCAkAn+QXXIV5zgHuDhADpkgvuDPOgrjruTmw90yET3E33QV5wfc/OBDpngLkog6MvOML
```