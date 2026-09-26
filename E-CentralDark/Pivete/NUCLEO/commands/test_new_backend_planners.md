# COMANDO - test_new_backend_planners.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\ngs-analysis\tests\test_new_backend_planners.py
**SHA:** 70e8ded6adf55c88
**Timestamp:** 2026-08-26T18:31:11.236333
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- execute=False,
- execute=False,

### Ouro Bruto (primeiros 5000 chars)
```
import os
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

SCRIPT_DIR = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPT_DIR))

import ngs_epigenomics_utils  # noqa: E402
import ngs_reference_manager  # noqa: E402
import ngs_resource_gate  # noqa: E402
import ngs_visualization_utils  # noqa: E402
import run_amplicon_microbiome  # noqa: E402
import run_atacseq_peaks_qc  # noqa: E402
import run_chip_cutrun_peaks_qc  # noqa: E402
import run_dna_somatic_variants  # noqa: E402
import run_dna_umi_panel_variants  # noqa: E402
import run_nfcore_pipeline  # noqa: E402
import run_shotgun_metagenomics  # noqa: E402


def write(path: Path, text: str = "") -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")
    return path


class ReferenceManagerTests(unittest.TestCase):
    def test_check_expected_files_reports_missing_bundle_members(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            write(root / "genome.fa", ">chr1\nACGT\n")
            result = ngs_reference_manager.check_expected_files(
                bundle_name="reduced",
                bundle={"kind": "reference", "required_files": ["genome.fa", "genome.fa.fai"]},
                override_root=root,
            )
            self.assertFalse(result["ok"])
            self.assertEqual(result["missing"], ["genome.fa.fai"])

    def test_pipeline_resource_plan_writes_manifest_and_env_hints(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            db = root / "kraken"
            db.mkdir()
            write(db / "hash.k2d", "hash")
            outdir = root / "plan"
            result = ngs_reference_manager.plan_pipeline_resources(
                "shotgun_metagenomics",
                bundle_roots={"kraken2_standard": db},
                include_optional=True,
            )
            outputs = ngs_reference_manager.write_resource_plan_outputs(result, outdir)
            self.assertFalse(result["ok"])
            self.assertEqual(result["resources"][0]["bundle"], "kraken2_standard")
            self.assertIn("opts.k2d", result["missing_required"][0]["missing"])
            self.assertTrue(Path(outputs["resource_manifest"]).exists())
            env_text = Path(outputs["resource_env"]).read_text(encoding="utf-8")
            self.assertIn("NGS_DB_KRAKEN2_ROOT", env_text)
            self.assertTrue(Path(outputs["resource_setup_summary"]).exists())
            setup_text = Path(outputs["resource_setup_summary"]).read_text(encoding="utf-8")
            self.assertIn("kraken2_standard", setup_text)
            self.assertIn("kraken2-build", setup_text)
            self.assertIn("Validation command", setup_text)
            commands_text = Path(outputs["resource_setup_commands"]).read_text(encoding="utf-8")
            self.assertIn("# kraken2-build", commands_text)
            self.assertIn("--kind database --bundle kraken2_standard", commands_text)

    def test_setup_plan_lists_missing_optional_database_actions(self) -> None:
        with mock.patch.dict(os.environ, {}, clear=True):
            result = ngs_reference_manager.plan_pipeline_resources(
                "shotgun_metagenomics",
                include_optional=True,
            )
            setup_plan = ngs_reference_manager.setup_plan_from_resource_plan(result)
        bundles = {item["bundle"] for item in setup_plan["actions"]}
        self.assertEqual(setup_plan["blocking_count"], 1)
        self.assertIn("kraken2_standard", bundles)
        self.assertIn("bracken_standard", bundles)
        self.assertIn("humann_uniref90", bundles)
        kraken = next(
            item for item in setup_plan["actions"] if item["bundle"] == "kraken2_standard"
        )
        self.assertIn("kraken2-build", "\n".join(kraken["suggested_setup"]))
        self.assertIn(
            "${NGS_DB_KRAKEN2_ROOT:-/path/to/kraken2_standard}", kraken["validation_command"]
        )

    def test_genome_pipeline_resource_plan_selects_build_bundle(self) -> None:
        result = ngs_reference_manager.plan_pipeline_resources("atacseq", genome_build="mm39")
        self.assertEqual(result["pipeline"], "atacseq_peaks_qc")
        self.assertEqual(result["resources"][0]["bundle"], "grcm39_core")
        self.assertFalse(result["ok"])

    def test_resource_inventory_writes_dashboard_and_env_hints(self) -> None:
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bundle_root = root / "reduced_ref"
            write(bundle_root / "genome.fa", ">chr1\nACGT\n")
            write(bundle_root / "genome.fa.fai", "chr1\t4\t6\t4\t5\n")
            registries = {
                "references": {
                    "reduced_bundle": {
                        "display_name": "Local bundle",
                        "kind": "reduced_reference
```