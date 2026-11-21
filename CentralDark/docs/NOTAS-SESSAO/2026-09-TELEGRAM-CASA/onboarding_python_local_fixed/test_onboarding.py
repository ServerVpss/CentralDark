import requests, time, json

BASE_URL = "http://127.0.0.1:3000"
session = requests.Session()
session.headers.update({
    "Content-Type": "application/json",
    "User-Agent": "QA-Onboarding-Test-Python"
})

def post(path, payload=None):
    r = session.post(BASE_URL + path, json=payload, timeout=10)
    r.raise_for_status()
    return r.json()

def run():
    print("🚀 Iniciando onboarding local...")
    start = post("/onboarding/start")
    oid = start["onboarding_id"]
    print("✔ ID:", oid)

    steps = [
        ("chip", {"type":"esim","device_brand":"test_brand","device_model":"test_model"}),
        ("plan", {"plan_id":"test_plan_30gb","price_first_month":0}),
        ("number", {"ddd":"11","number":"96000-0000"}),
        ("address", {"cep":"00000-000","street":"Rua de Teste","number":"100","district":"Centro","city":"Cidade Teste","state":"SP"}),
        ("person", {"name":"Usuario Teste","birth_date":"1990-07-03","document_type":"CPF","document_number":"00000000000"}),
        ("email", {"email":f"teste_{int(time.time())}@example.com"}),
        ("payment", {"method":"mock","tokenized":True}),
    ]

    for step, payload in steps:
        post(f"/onboarding/{oid}/{step}", payload)
        print(f"✔ {step}")

    result = post(f"/onboarding/{oid}/confirm")
    print("\n🎉 Finalizado com sucesso")
    print(json.dumps(result, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    run()
