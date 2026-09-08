#!/usr/bin/env python3
"""Stable old entrypoint delegating to the canonical Omni launcher."""

from launch_omni_router import main


if __name__ == "__main__":
    raise SystemExit(main())
