#!/usr/bin/env python3
"""Descoberta de repos usando subprocess find (funciona quando os.walk falha).
Evita os problemas do pipeline bash find | while."""
import os, subprocess, datetime, re

ROOT="/e/CentralDark"
RECEIPT_DIR=os.path.join(ROOT,"docs/RECEIPTS")
os.makedirs(RECEIPT_DIR, exist_ok=True)
TS=datetime.datetime.utcnow().strftime("%Y%m%dT%H%⟪HERMES-CONTEXT-COMPRESSION: 5,498 of 5,698 chars omitted here by Hermes's context compressor. This is NOT part of the original tool call and must never be reproduced in new output — always write full, untruncated content.⟫