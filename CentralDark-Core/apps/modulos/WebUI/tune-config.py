import sqlite3, json, time
c=sqlite3.connect('/app/backend/data/webui.db')
now=int(time.time())
updates = {
  "webui.url": "https://ui.centralldark.com",
  "image_generation.enable": True,
  "image_generation.engine": "openai",
  "image_generation.model": "dall-e-3",
  "image_generation.size": "1024x1024",
  "image_generation.openai.api_base_url": "https://api.centralldark.com/v1",
  "image_generation.openai.api_key": "SEGREDO_ELITE_123",
  "images.edit.enable": True,
  "images.edit.engine": "openai",
  "images.edit.openai.api_base_url": "https://api.centralldark.com/v1",
  "images.edit.openai.api_key": "SEGREDO_ELITE_123",
  "audio.stt.engine": "openai",
  "audio.stt.model": "whisper-1",
  "audio.stt.openai.api_base_url": "https://api.centralldark.com/v1",
  "audio.stt.openai.api_key": "SEGREDO_ELITE_123",
  "audio.tts.engine": "openai",
  "audio.tts.model": "tts-1",
  "audio.tts.voice": "nova",
  "audio.tts.openai.api_base_url": "https://api.centralldark.com/v1",
  "audio.tts.openai.api_key": "SEGREDO_ELITE_123",
  "task.model.default": "arsenal-router",
  "task.model.external": "arsenal-router",
  "ui.default_models": "arsenal-parallel",
  "ui.default_pinned_models": ["arsenal-parallel","arsenal-router","arsenal-debate"],
  "ui.banners": [{"id":"arsenal","type":"success","title":"Arsenal Council ativo","content":"Modelos arsenal-router / arsenal-parallel / arsenal-debate disponiveis. Debates em status.centralldark.com/conselho.html","dismissible":True,"timestamp":now}],
}
n=0
for k,v in updates.items():
  val=json.dumps(v)
  cur=c.execute("UPDATE config SET value=?, updated_at=? WHERE key=?",(val,now,k))
  if cur.rowcount==0:
    c.execute("INSERT INTO config(key,value,updated_at) VALUES(?,?,?)",(k,val,now))
  n+=1
c.commit()
print("Atualizadas:",n)
