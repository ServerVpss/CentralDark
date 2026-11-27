from __future__ import annotations

import json
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np
from safetensors.numpy import save_file

HERE = Path(__file__).resolve().parent
MCP_DIR = HERE.parent
sys.path.insert(0, str(MCP_DIR))

from semantic_core import (  # noqa: E402
    DIMENSION,
    MODEL_ID,
    SOURCE_LICENSE,
    SOURCE_REVISION,
    GloveSemanticCore,
    ModelIntegrityError,
    sha256_file,
)

TOKENS = ["carro", "automovel", "veiculo", "banana", "fruta", "rei"]

def fixture_vectors() -> np.ndarray:
    v = np.zeros((len(TOKENS), DIMENSION), dtype=np.float32)
    v[0, :2] = [1.0, 0.0]; v[1, :2] = [0.995, 0.005]; v[2, :2] = [0.98, 0.02]
    v[3, :2] = [0.0, 1.0]; v[4, :2] = [0.02, 0.98]; v[5, :2] = [0.7, 0.7]
    return v

def create_model(root: Path, *, revision: str = SOURCE_REVISION, bad_sha: bool = False) -> Path:
    model_dir = root / "model"; model_dir.mkdir(parents=True)
    emb=model_dir/"embeddings.safetensors"; vocab=model_dir/"vocab.txt"; readme=model_dir/"README.md"; attrs=model_dir/".gitattributes"
    save_file({"embeddings": fixture_vectors()}, str(emb)); vocab.write_text("\n".join(TOKENS)+"\n", encoding="utf-8")
    readme.write_text("fixture only\n", encoding="utf-8"); attrs.write_text("*.safetensors filter=lfs diff=lfs merge=lfs -text\n", encoding="utf-8")
    manifest={"model_id":MODEL_ID,"revision":revision,"license":SOURCE_LICENSE,"files":[
        {"name":"embeddings.safetensors","sha256":"0"*64 if bad_sha else sha256_file(emb),"size":emb.stat().st_size},
        {"name":"vocab.txt","sha256":sha256_file(vocab),"size":vocab.stat().st_size},
        {"name":"README.md","sha256":sha256_file(readme),"size":readme.stat().st_size},
        {"name":".gitattributes","sha256":sha256_file(attrs),"size":attrs.stat().st_size}]}
    (model_dir/"manifest.json").write_text(json.dumps(manifest),encoding="utf-8"); return model_dir

class SemanticCoreTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(); self.model_dir=create_model(Path(self.tmp.name)); self.core=GloveSemanticCore(self.model_dir,verify_source_hash=False).load()
    def tearDown(self): self.tmp.cleanup()
    def test_t1_vocab_rows_equal_embedding_rows(self): self.assertEqual(self.core.model_info()["vocab_size"],len(TOKENS))
    def test_t2_dimension_is_50(self): self.assertEqual(self.core.model_info()["dimension"],50)
    def test_t3_known_lookup_is_deterministic(self):
        a=self.core.lookup("carro"); b=self.core.lookup("carro"); self.assertFalse(a["oov"]); self.assertEqual(a["vector"],b["vector"])
    def test_t4_unknown_token_is_oov_without_invented_vector(self):
        r=self.core.lookup("naoexiste"); self.assertTrue(r["oov"]); self.assertIsNone(r["vector"])
    def test_t5_same_query_is_deterministic(self): self.assertEqual(self.core.neighbors("carro",3)["neighbors"],self.core.neighbors("carro",3)["neighbors"])
    def test_t6_cosine_self_similarity_is_one(self): self.assertAlmostEqual(self.core.similarity("carro","carro")["score"],1.0,places=6)
    def test_t7_ranking_is_stable(self): self.assertEqual(self.core.rank("carro",["banana","automovel","veiculo"])["ranked"][0]["candidate"],"automovel")
    def test_t8_dedupe_does_not_candidate_proven_different_pair(self): self.assertEqual(self.core.dedupe(["carro","banana"],0.95)["merge_candidates"],[])
    def test_t9_dedupe_recognizes_representative_similar_pair_as_candidate_only(self):
        r=self.core.dedupe(["carro","automovel","banana"],0.95); self.assertIn(("carro","automovel"),{(p["left"],p["right"]) for p in r["merge_candidates"]}); self.assertFalse(r["same_intent_claim"])
    def test_t10_candidate_never_becomes_truth_automatically(self): self.assertFalse(self.core.expand("carro",2)["candidate_is_truth"]); self.assertFalse(self.core.dedupe(["carro","automovel"],0.95)["automatic_merge"])
    def test_revision_mismatch_fails_closed(self):
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaises(ModelIntegrityError): GloveSemanticCore(create_model(Path(td),revision="deadbeef"),verify_source_hash=False).load()
    def test_sha_mismatch_fails_closed(self):
        with tempfile.TemporaryDirectory() as td:
            with self.assertRaises(ModelIntegrityError): GloveSemanticCore(create_model(Path(td),bad_sha=True),verify_source_hash=False).load()
    def test_offline_fixture_requires_no_network(self): self.assertTrue(self.core.health()["ok"])
    def test_cache_key_contract_includes_model_and_normalization_identity(self):
        self.core.neighbors("carro",2); self.assertEqual(self.core.model_info()["cache"]["key_contract"],["MODEL_ID","NORMALIZATION_VERSION","INPUT_HASH","PARAMETERS"])
    def test_phrase_aggregation_is_heuristic_and_preserves_oov(self): self.assertIn("desconhecido",self.core.similarity("carro desconhecido","automovel")["left_oov_tokens"])
    def test_threshold_is_not_magic_default(self):
        r=self.core.dedupe(["carro","automovel"]); self.assertIsNone(r["threshold"]); self.assertEqual(r["decision"],"UNPROVEN_THRESHOLD"); self.assertEqual(r["merge_candidates"],[])

if __name__ == "__main__": unittest.main()
