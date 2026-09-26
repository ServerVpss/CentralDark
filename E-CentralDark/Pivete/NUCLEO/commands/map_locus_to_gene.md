# COMANDO - map_locus_to_gene.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.codex\.tmp\plugins\plugins\life-science-research\skills\locus-to-gene-mapper-skill\scripts\map_locus_to_gene.py
**SHA:** 9844fcad187346a0
**Timestamp:** 2026-08-26T18:31:15.963492
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- start = max(1, pos_i - DEFAULT_LOCUS_PADDING_BP)

### Contratos
- aggregate: dict[str, list[float]] = {}

### Ouro Bruto (primeiros 5000 chars)
```
#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import math
import re
import subprocess
import sys
import time
from pathlib import Path
from typing import Any

import requests

GWAS_BASE = "https://www.ebi.ac.uk/gwas/rest/api"
EFO_BASE = "https://www.ebi.ac.uk/ols4/api"
OT_BASE = "https://api.platform.opentargets.org/api/v4/graphql"
GNOMAD_BASE = "https://gnomad.broadinstitute.org/api"
REFSNP_BASE = "https://api.ncbi.nlm.nih.gov/variation/v0/refsnp"

DEFAULT_LOCUS_PADDING_BP = 1_000_000
REFSEQ_CHROMOSOMES = {f"NC_{i:06d}": str(i) for i in range(1, 23)}
REFSEQ_CHROMOSOMES.update({"NC_000023": "X", "NC_000024": "Y", "NC_012920": "MT"})

REPO_ROOT = Path(__file__).resolve().parents[2]
GTEX_EQTL_SCRIPT = REPO_ROOT / "gtex-eqtl-skill" / "scripts" / "gtex_eqtl.py"
GENEBASS_GENE_BURDEN_SCRIPT = (
    REPO_ROOT / "genebass-gene-burden-skill" / "scripts" / "genebass_gene_burden.py"
)

TOKEN_STOPWORDS = {
    "disease",
    "disorder",
    "trait",
    "syndrome",
    "chronic",
    "acute",
    "self",
    "reported",
    "unknown",
}

DEFAULT_TRAIT_SEED_RSIDS: dict[str, list[str]] = {
    "type 2 diabetes": ["rs7903146", "rs13266634", "rs7756992", "rs5219", "rs1801282", "rs4402960"],
    "type ii diabetes": [
        "rs7903146",
        "rs13266634",
        "rs7756992",
        "rs5219",
        "rs1801282",
        "rs4402960",
    ],
    "t2d": ["rs7903146", "rs13266634", "rs7756992", "rs5219", "rs1801282", "rs4402960"],
    "coronary artery disease": [
        "rs1333049",
        "rs4977574",
        "rs9349379",
        "rs6725887",
        "rs1746048",
        "rs3184504",
    ],
    "cad": ["rs1333049", "rs4977574", "rs9349379", "rs6725887", "rs1746048", "rs3184504"],
    "body mass index": [
        "rs9939609",
        "rs17782313",
        "rs6548238",
        "rs10938397",
        "rs7498665",
        "rs7138803",
    ],
    "bmi": ["rs9939609", "rs17782313", "rs6548238", "rs10938397", "rs7498665", "rs7138803"],
    "asthma": ["rs7216389", "rs2305480", "rs9273349"],
    "rheumatoid arthritis": ["rs2476601", "rs3761847", "rs660895"],
    "alzheimer disease": ["rs429358", "rs7412", "rs6733839", "rs11136000", "rs3851179"],
    "alzheimers disease": ["rs429358", "rs7412", "rs6733839", "rs11136000", "rs3851179"],
    "ldl cholesterol": ["rs7412", "rs429358", "rs6511720", "rs629301", "rs12740374", "rs11591147"],
    "total cholesterol": [
        "rs7412",
        "rs429358",
        "rs6511720",
        "rs629301",
        "rs12740374",
        "rs11591147",
    ],
}

SEARCH_STUDY_QUERY = """
query searchStudy($q: String!, $page: Pagination) {
  search(queryString: $q, entityNames: ["study"], page: $page) {
    total
    hits {
      score
      object {
        ... on Study {
          id
          projectId
          traitFromSource
          hasSumstats
        }
      }
    }
  }
}
"""

STUDY_CREDIBLE_SETS_QUERY = """
query studyCredibleSets($studyId: String!, $page: Pagination) {
  study(studyId: $studyId) {
    id
    projectId
    traitFromSource
    credibleSets(page: $page) {
      count
      rows {
        studyLocusId
        chromosome
        position
        pValueExponent
        pValueMantissa
        variant { id rsIds }
      }
    }
  }
}
"""

CREDIBLE_SETS_DETAIL_BATCH_QUERY = """
query l2gAndColoc($studyLocusIds: [String!]!) {
  credibleSets(studyLocusIds: $studyLocusIds) {
    rows {
      studyLocusId
      l2GPredictions {
        rows { score target { id approvedSymbol } }
      }
      colocalisation(page: {index: 0, size: 100}) {
        rows {
          colocalisationMethod
          h4
          clpp
          otherStudyLocus { studyId studyLocusId }
        }
      }
    }
  }
}
"""

SEARCH_TARGET_QUERY = """
query searchTarget($q: String!) {
  search(queryString: $q, entityNames: ["target"], page: {index: 0, size: 10}) {
    hits {
      score
      object {
        ... on Target {
          id
          approvedSymbol
          approvedName
        }
      }
    }
  }
}
"""

GNOMAD_GENE_QUERY = """
query GeneConstraint($geneSymbol: String!, $referenceGenome: ReferenceGenomeId!) {
  gene(gene_symbol: $geneSymbol, reference_genome: $referenceGenome) {
    symbol
    gencode_symbol
    gnomad_constraint {
      exp_lof
      obs_lof
      oe_lof
      oe_lof_lower
      oe_lof_upper
      lof_z
      mis_z
      pLI
    }
  }
}
"""

CODING_SEQUENCE_TERMS = {
    "missense_variant",
    "stop_gained",
    "stop_lost",
    "frameshift_variant",
    "protein_altering_variant",
    "inframe_insertion",
    "inframe_deletion",
    "splice_donor_variant",
    "splice_acceptor_variant",
}


def now_iso() -> str:
    return dt.datetime.now(dt.timezone.utc).isoformat()


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def dedupe_keep_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    out: list[str] = []
    for item in items:
        s = str(item).strip()
        if
```