#!/usr/bin/env python3
import pathlib
import runpy
runpy.run_path(str(pathlib.Path(__file__).with_name('pipeline-lovable.py')), run_name='__main__')
