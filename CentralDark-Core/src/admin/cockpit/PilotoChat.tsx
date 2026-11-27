import { useEffect, useRef, useState } from "react";
import { PILOTO_MSGS } from "./dados";

interface Msg {
  id: number;
  autor: string;
  texto: string;
  cor?: string;
  completo: boolean;
}

export function PilotoChat() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [current, setCurrent] = useState<Msg | null>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stopped = false;
    let idx = 0;
    let idCounter = 0;

    const loop = async () => {
      while (!stopped) {
        const base = PILOTO_MSGS[idx % PILOTO_MSGS.length];
        idx++;
        const id = idCounter++;
        const alvo: Msg = { id, ...base, completo: false };

        if (reduce) {
          setMsgs((prev) => trimTail([...prev, { ...alvo, completo: true }]));
          await sleep(1200);
          continue;
        }

        setCurrent(alvo);
        // typewriter
        for (let i = 1; i <= base.texto.length; i++) {
          if (stopped) return;
          setCurrent({ ...alvo, texto: base.texto.slice(0, i) });
          await sleep(22 + Math.random() * 30);
        }
        setMsgs((prev) => trimTail([...prev, { ...alvo, completo: true }]));
        setCurrent(null);
        await sleep(900);
      }
    };
    loop();

    return () => {
      stopped = true;
    };
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [msgs, current]);

  return (
    <div className="piloto-chat" ref={chatRef}>
      {msgs.map((m) => (
        <div key={m.id} className="piloto-msg" style={{ color: m.cor }}>
          <span className="autor">{m.autor}:</span>
          <span>{m.texto}</span>
        </div>
      ))}
      {current && (
        <div className="piloto-msg" style={{ color: current.cor }}>
          <span className="autor">{current.autor}:</span>
          <span>{current.texto}</span>
          <span className="caret" />
        </div>
      )}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
function trimTail(arr: Msg[]) {
  return arr.slice(-6);
}
