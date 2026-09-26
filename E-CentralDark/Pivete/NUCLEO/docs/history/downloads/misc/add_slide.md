# OUTRO - add_slide.py
**Origem:** E:\CentralDark\_MAPA_CASA\PASTA DO CHEFE JOGA ARQUIOVOS QUAIS QUUER SER GARIMPO DO CHEFE\.grok\bundled\skills\pptx\scripts\add_slide.py
**SHA:** a77836a685284a96
**Timestamp:** 2026-08-28T02:52:29.907480
**Portoes:** {"ocorrencias": true, "ganho": true, "contraprova": true, "sha": true}

## Ouro Extraido

### Padroes
- after_pattern = re.compile(

### Ouro Bruto (primeiros 5000 chars)
```
"""Add a new slide to an unpacked PPTX directory.

Duplicates an existing slide or creates one from a layout, then automatically
inserts it into the slide order in presentation.xml.

Usage:
    python scripts/add_slide.py unpacked/ slide2.xml
    # Duplicates slide2, appends to end of presentation

    python scripts/add_slide.py unpacked/ slide2.xml --after slide1.xml
    # Duplicates slide2, inserts after slide1

    python scripts/add_slide.py unpacked/ slide2.xml --after 1
    # Same — inserts after slide 1

    python scripts/add_slide.py unpacked/ slideLayout2.xml
    # Creates empty slide from slideLayout2, appends to end

To see available layouts: ls unpacked/ppt/slideLayouts/
"""

import re
import shutil
import sys
from pathlib import Path


def get_next_slide_number(slides_dir: Path) -> int:
    existing = [
        int(m.group(1))
        for f in slides_dir.glob("slide*.xml")
        if (m := re.match(r"slide(\d+)\.xml", f.name))
    ]
    return max(existing) + 1 if existing else 1


def create_slide_from_layout(
    unpacked_dir: Path, layout_file: str, after_slide: str | None = None
) -> str:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"
    layouts_dir = unpacked_dir / "ppt" / "slideLayouts"

    layout_path = layouts_dir / layout_file
    if not layout_path.exists():
        print(f"Error: {layout_path} not found", file=sys.stderr)
        sys.exit(1)

    next_num = get_next_slide_number(slides_dir)
    dest = f"slide{next_num}.xml"
    dest_slide = slides_dir / dest
    dest_rels = rels_dir / f"{dest}.rels"

    slide_xml = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr>
        <a:xfrm>
          <a:off x="0" y="0"/>
          <a:ext cx="0" cy="0"/>
          <a:chOff x="0" y="0"/>
          <a:chExt cx="0" cy="0"/>
        </a:xfrm>
      </p:grpSpPr>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr>
    <a:masterClrMapping/>
  </p:clrMapOvr>
</p:sld>"""
    dest_slide.write_text(slide_xml, encoding="utf-8")

    rels_dir.mkdir(exist_ok=True)
    rels_xml = f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/{layout_file}"/>
</Relationships>"""
    dest_rels.write_text(rels_xml, encoding="utf-8")

    _add_to_content_types(unpacked_dir, dest)
    rid = _add_to_presentation_rels(unpacked_dir, dest)
    next_slide_id = _get_next_slide_id(unpacked_dir)
    _add_to_sldIdLst(unpacked_dir, rid, next_slide_id, after_slide=after_slide)

    pos = f" after {after_slide}" if after_slide else " at end"
    print(f"Created {dest} from {layout_file} — inserted{pos}")
    return dest


def duplicate_slide(unpacked_dir: Path, source: str, after_slide: str | None = None) -> str:
    slides_dir = unpacked_dir / "ppt" / "slides"
    rels_dir = slides_dir / "_rels"

    source_slide = slides_dir / source

    if not source_slide.exists():
        print(f"Error: {source_slide} not found", file=sys.stderr)
        sys.exit(1)

    next_num = get_next_slide_number(slides_dir)
    dest = f"slide{next_num}.xml"
    dest_slide = slides_dir / dest

    source_rels = rels_dir / f"{source}.rels"
    dest_rels = rels_dir / f"{dest}.rels"

    shutil.copy2(source_slide, dest_slide)

    if source_rels.exists():
        shutil.copy2(source_rels, dest_rels)

        rels_content = dest_rels.read_text(encoding="utf-8")
        rels_content = re.sub(
            r'\s*<Relationship[^>]*Type="[^"]*notesSlide"[^>]*/>\s*',
            "\n",
            rels_content,
        )
        dest_rels.write_text(rels_content, encoding="utf-8")

    _add_to_content_types(unpacked_dir, dest)
    rid = _add_to_presentation_rels(unpacked_dir, dest)
    next_slide_id = _get_next_slide_id(unpacked_dir)
    _add_to_sldIdLst(unpacked_dir, rid, next_slide_id, after_slide=after_slide)

    pos = f" after {after_slide}" if after_slide else " at end"
    print(f"Created {dest} from {source} — inserted{pos}")
    return dest


def _add_to_content_types(unpacked_dir: Path, dest: str) -> None:
    content_types_path = unpacked_dir / "[Content_Types].xml"
    content_types = content_types_path.read_text(encoding="utf-8")

    new_override = f'<Override PartName="/ppt/slides/{dest}" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>'

    if f"/ppt/slides/{dest}" not in content_types:
        content_types = content_types.replace("</Types>", f"  {new_override}\n</Types>")
```