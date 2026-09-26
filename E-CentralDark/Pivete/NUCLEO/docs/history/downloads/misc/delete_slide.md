# OUTRO - delete_slide.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\scripts\delete_slide.py
**SHA:** 547de2395e9f2cb1
**Timestamp:** 2026-08-28T02:52:29.785825
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Comandos
- dry_run: bool = False,
- dry_run: preview without modifying
- if dry_run:
- deleted = delete_slides(unpacked_dir, to_delete, dry_run=args.dry_run)

### Padroes
- pattern = re.compile(

### Gaps
- missing = to_delete - existing_names
- if missing:

### Ouro Bruto (primeiros 5000 chars)
```
"""Delete slides from an unpacked PPTX by removing them from presentation.xml.

Removes the specified slides from <p:sldIdLst> in presentation.xml, then runs
the same orphan-cleanup logic as clean.py to remove the now-unreferenced slide
files, media, and relationships.

Usage:
    # Delete specific slides (by filename)
    python scripts/delete_slide.py unpacked/ slide3.xml slide5.xml slide7.xml

    # Keep only specific slides (delete everything else)
    python scripts/delete_slide.py unpacked/ --keep slide1.xml slide4.xml slide8.xml

    # Delete by slide number
    python scripts/delete_slide.py unpacked/ 3 5 7

    # Keep by slide number
    python scripts/delete_slide.py unpacked/ --keep 1 4 8

    # Dry run (preview without modifying)
    python scripts/delete_slide.py unpacked/ slide3.xml --dry-run

After deletion, run pack.py to produce the final PPTX.
"""

import re
import sys
from pathlib import Path

import defusedxml.minidom


def _normalize_slide_name(arg: str) -> str:
    """Convert '3' → 'slide3.xml', or pass through 'slide3.xml' as-is."""
    if arg.isdigit():
        return f"slide{arg}.xml"
    if not arg.endswith(".xml"):
        return f"{arg}.xml"
    return arg


def _get_slide_order(unpacked_dir: Path) -> list[dict]:
    """Parse presentation.xml and rels to get ordered list of slides.

    Returns list of dicts: {rid, slide_id, slide_name, sldId_xml}
    """
    pres_path = unpacked_dir / "ppt" / "presentation.xml"
    pres_rels_path = unpacked_dir / "ppt" / "_rels" / "presentation.xml.rels"

    if not pres_path.exists() or not pres_rels_path.exists():
        return []

    # Build rId → slide filename mapping
    rels_dom = defusedxml.minidom.parse(str(pres_rels_path))
    rid_to_slide: dict[str, str] = {}
    for rel in rels_dom.getElementsByTagName("Relationship"):
        rid = rel.getAttribute("Id")
        target = rel.getAttribute("Target")
        rel_type = rel.getAttribute("Type")
        if "slide" in rel_type.lower() and target.startswith("slides/"):
            rid_to_slide[rid] = target.replace("slides/", "")

    # Parse <p:sldIdLst> in order
    pres_dom = defusedxml.minidom.parse(str(pres_path))
    slides = []
    for sldId in pres_dom.getElementsByTagName("p:sldId"):
        rid = sldId.getAttribute("r:id")
        sid = sldId.getAttribute("id")
        slide_name = rid_to_slide.get(rid, f"?({rid})")
        slides.append(
            {
                "rid": rid,
                "slide_id": sid,
                "slide_name": slide_name,
            }
        )

    return slides


def delete_slides(
    unpacked_dir: Path,
    to_delete: set[str],
    dry_run: bool = False,
) -> list[str]:
    """Remove slides from <p:sldIdLst> in presentation.xml.

    Args:
        unpacked_dir: path to unpacked PPTX directory
        to_delete: set of slide filenames to remove (e.g. {"slide3.xml", "slide5.xml"})
        dry_run: preview without modifying

    Returns list of deleted slide names.
    """
    pres_path = unpacked_dir / "ppt" / "presentation.xml"
    if not pres_path.exists():
        print("Error: presentation.xml not found", file=sys.stderr)
        return []

    raw = pres_path.read_text(encoding="utf-8")
    slides = _get_slide_order(unpacked_dir)

    if not slides:
        print("Error: no slides found in presentation.xml", file=sys.stderr)
        return []

    # Validate that all requested slides exist
    existing_names = {s["slide_name"] for s in slides}
    missing = to_delete - existing_names
    if missing:
        print(
            f"Warning: slides not found (skipping): {', '.join(sorted(missing))}", file=sys.stderr
        )

    actual_delete = to_delete & existing_names
    if not actual_delete:
        print("No slides to delete", file=sys.stderr)
        return []

    remaining = [s for s in slides if s["slide_name"] not in actual_delete]
    if not remaining:
        print("Error: cannot delete ALL slides — at least one must remain", file=sys.stderr)
        return []

    # Show what will happen
    print(f"Slides to DELETE ({len(actual_delete)}):")
    for s in slides:
        if s["slide_name"] in actual_delete:
            print(f"  ✗ {s['slide_name']} (id={s['slide_id']}, {s['rid']})")

    print(f"\nSlides to KEEP ({len(remaining)}):")
    for i, s in enumerate(remaining, 1):
        print(f"  {i}. {s['slide_name']}")

    if dry_run:
        print("\n[DRY RUN] No changes made")
        return sorted(actual_delete)

    # Remove <p:sldId> entries for deleted slides from raw XML
    new_raw = raw
    for s in slides:
        if s["slide_name"] in actual_delete:
            # Remove the <p:sldId> element matching this rId
            rid_escaped = re.escape(s["rid"])
            pattern = re.compile(
                r'\s*<p:sldId\b[^>]*r:id="' + rid_escaped + r'"[^>]*/>\s*',
                re.DOTALL,
            )
            new_raw = pattern.sub("\n", new_raw, count=1)

    if new_raw != raw:
        pres_path.write_text(new_raw,
```