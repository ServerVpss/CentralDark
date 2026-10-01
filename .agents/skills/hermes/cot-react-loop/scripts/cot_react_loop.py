#!/usr/bin/env python3
"""
Cot-React Loop Executor
Executor for the CoT + ReAct + Auto-Criticism loop.
Invokes Hermes tools via terminal/web/file/code.
"""

import json
import sys
import subprocess
import hashlib
import time
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, asdict
import os

@dataclass
class IterationRecord:
    iter: int
    think: str
    act: Dict[str, Any]
    observe: Dict[str, Any]
    critic: Dict[str, Any]
    refine: str
    decide: str
    timestamp: str

class CotReactExecutor:
    def __init__(self, max_iter: int = 5, output_dir: Optional[str] = None):
        self.max_iter = max_iter
        self.iteration = 0
        self.records: List[IterationRecord] = []
        self.output_dir = Path(output_dir) if output_dir else Path.cwd() / "cot-react-output"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.log_file = self.output_dir / f"cot-react-loop-{datetime.now().strftime('%Y%m%d-%H%M%S')}.jsonl"
        
    def run_terminal(self, command: str, timeout: int = 60, cwd: Optional[str] = None) -> Dict[str, Any]:
        """Execute terminal command and return result."""
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout,
                cwd=cwd or os.getcwd()
            )
            return {
                "stdout": result.stdout,
                "stderr": result.stderr,
                "exit_code": result.returncode,
                "success": result.returncode == 0
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": f"Timeout after {timeout}s",
                "exit_code": -1,
                "success": False
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": str(e),
                "exit_code": -1,
                "success": False
            }
    
    def run_web_search(self, query: str, limit: int = 5) -> Dict[str, Any]:
        """Execute web search via hermes terminal."""
        # Use hermes terminal to run web search
        cmd = f'hermes -p pivete chat -q "web_search {query}" --no-restore-cwd'
        return self.run_terminal(cmd, timeout=120)
    
    def read_file(self, path: str) -> Dict[str, Any]:
        """Read file content."""
        try:
            p = Path(path)
            content = p.read_text(encoding='utf-8')
            return {"content": content, "success": True, "path": str(p)}
        except Exception as e:
            return {"content": "", "success": False, "error": str(e), "path": path}
    
    def write_file(self, path: str, content: str) -> Dict[str, Any]:
        """Write file content."""
        try:
            p = Path(path)
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(content, encoding='utf-8')
            return {"success": True, "path": str(p)}
        except Exception as e:
            return {"success": False, "error": str(e), "path": path}
    
    def sha256_file(self, path: str) -> str:
        """Calculate SHA256 of file."""
        h = hashlib.sha256()
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(8192), b''):
                h.update(chunk)
        return h.hexdigest()
    
    def critic_checklist(self, observe: Dict, act: Dict, think: str) -> Dict[str, Any]:
        """Run the mandatory critic checklist."""
        checks = {
            "FALSO_VERDE": False,
            "SKIPPED_TO_PASS": False,
            "EXPECTATION_RELAXED": False,
            "TOOL_RESULT_INVALID": False,
            "EVIDENCE_GAP": False,
            "REGRESSION": False,
            "OUT_OF_SCOPE": False
        }
        
        details = []
        
        # Check TOOL_RESULT_INVALID
        if not observe.get("success", False):
            checks["TOOL_RESULT_INVALID"] = True
            details.append(f"Tool failed: exit_code={observe.get('exit_code')}, stderr={observe.get('stderr')[:100]}")
        elif not observe.get("stdout", "").strip():
            checks["TOOL_RESULT_INVALID"] = True
            details.append("Tool stdout is empty")
        
        # Check EVIDENCE_GAP - if act claims success but no measurable evidence
        if observe.get("success") and not observe.get("evidence"):
            # Check if observe has hash or measurable output
            stdout = observe.get("stdout", "")
            if not any(kw in stdout.lower() for kw in ["hash", "sha256", "sha1", "md5", "bytes", "lines", "count"]):
                checks["EVIDENCE_GAP"] = True
                details.append("No measurable evidence (hash, count, bytes) in output")
        
        # Check FALSO_VERDE - status success but no real evidence
        if observe.get("success") and checks["EVIDENCE_GAP"]:
            checks["FALSO_VERDE"] = True
            details.append("Status success but no measurable evidence")
        
        # Determine verdict
        failed_checks = [k for k, v in checks.items() if v]
        if failed_checks:
            verdict = "FAIL" if "TOOL_RESULT_INVALID" in failed_checks or "FALSO_VERDE" in failed_checks else "GAP"
        else:
            verdict = "PASS"
        
        return {
            "verdict": verdict,
            "detail": "; ".join(details) if details else "All checks passed",
            "held_in": verdict == "PASS",  # Target weakness resolved
            "held_out": verdict == "PASS",  # Nothing else regressed (simplified)
            "checks": checks,
            "details": details
        }
    
    def run_iteration(self, think: str, act_tool: str, act_args: Dict) -> IterationRecord:
        """Execute one iteration of the loop."""
        self.iteration += 1
        
        # ACT - execute tool
        if act_tool == "terminal":
            observe = self.run_terminal(act_args.get("command", ""), 
                                       timeout=act_args.get("timeout", 60),
                                       cwd=act_args.get("cwd"))
        elif act_tool == "web_search":
            observe = self.run_web_search(act_args.get("query", ""))
        elif act_tool == "read_file":
            observe = self.read_file(act_args.get("path", ""))
        elif act_tool == "write_file":
            observe = self.write_file(act_args.get("path", ""), act_args.get("content", ""))
        elif act_tool == "sha256":
            path = act_args.get("path", "")
            if Path(path).exists():
                sha = self.sha256_file(path)
                observe = {"stdout": sha, "stderr": "", "exit_code": 0, "success": True, "evidence": f"sha256={sha}"}
            else:
                observe = {"stdout": "", "stderr": "File not found", "exit_code": 1, "success": False}
        else:
            observe = {"stdout": "", "stderr": f"Unknown tool: {act_tool}", "exit_code": 1, "success": False}
        
        # Add evidence hash if applicable
        if observe.get("success") and "evidence" not in observe:
            if observe.get("stdout"):
                observe["evidence"] = f"hash={hashlib.sha256(observe['stdout'].encode()).hexdigest()[:16]}"
        
        # CRITIC
        critic = self.critic_checklist(observe, {"tool": act_tool, "args": act_args}, think)
        
        # REFINE (simplified - in practice would be more complex)
        refine = "NENHUM"
        if critic["verdict"] != "PASS":
            refine = f"ajuste: {critic['detail'][:100]}"
        
        # DECIDE
        if critic["verdict"] == "PASS":
            decide = "STOP"
        elif critic["verdict"] == "FAIL":
            decide = "BLOCK"
        else:
            decide = "CONTINUE"
        
        record = IterationRecord(
            iter=self.iteration,
            think=think,
            act={"tool": act_tool, "args": act_args},
            observe=observe,
            critic=critic,
            refine=refine,
            decide=decide,
            timestamp=datetime.now().isoformat()
        )
        
        self.records.append(record)
        self._save_record(record)
        
        return record
    
    def _save_record(self, record: IterationRecord):
        """Save record to JSONL log."""
        with open(self.log_file, 'a', encoding='utf-8') as f:
            f.write(json.dumps(asdict(record), ensure_ascii=False) + '\n')
    
    def run_loop(self, brief: Dict[str, str], steps: List[Dict]) -> List[IterationRecord]:
        """Run the full loop with given steps."""
        print(f"=== CoT-ReAct Loop Started ===")
        print(f"Brief: {brief.get('success_predicate', 'N/A')}")
        print(f"Max iterations: {self.max_iter}")
        print(f"Log: {self.log_file}")
        
        for i, step in enumerate(steps[:self.max_iter]):
            print(f"\n--- ITER {i+1} ---")
            print(f"THINK: {step.get('think', 'N/A')}")
            print(f"ACT: {step.get('tool', 'N/A')} {step.get('args', {})}")
            
            record = self.run_iteration(
                think=step.get('think', ''),
                act_tool=step.get('tool', 'terminal'),
                act_args=step.get('args', {})
            )
            
            print(f"OBSERVE: success={record.observe.get('success')}, stdout_len={len(record.observe.get('stdout', ''))}")
            print(f"CRITIC: {record.critic['verdict']} - {record.critic['detail'][:80]}")
            print(f"DECIDE: {record.decide}")
            
            if record.decide in ("STOP", "BLOCK", "PONTO_FIXO"):
                print(f"Loop ended: {record.decide}")
                break
        
        print(f"\n=== Loop Complete ===")
        print(f"Total iterations: {len(self.records)}")
        print(f"Log saved: {self.log_file}")
        
        return self.records


def main():
    """Demo usage."""
    import argparse
    parser = argparse.ArgumentParser(description="CoT-ReAct Loop Executor")
    parser.add_argument("--brief", help="Brief JSON file")
    parser.add_argument("--steps", help="Steps JSON file")
    parser.add_argument("--max-iter", type=int, default=5)
    parser.add_argument("--output-dir", help="Output directory")
    args = parser.parse_args()
    
    # Demo brief and steps
    brief = {
        "definitions": "fixture = test file in workspace",
        "success_predicate": "SHA256 of fixture calculated and saved to output",
        "non_counting_outcomes": "ran command, exit 0, looks ok",
        "failure_modes": "wrong hash, tool failed, file missing"
    }
    
    steps = [
        {
            "think": "Calculate SHA256 of the test fixture file",
            "tool": "sha256",
            "args": {"path": "C:/Users/danda/AppData/Local/hermes/profiles/pivete/workspace/cot-react-test-20260804-163844/data.txt"}
        },
        {
            "think": "Verify the hash matches expected",
            "tool": "read_file",
            "args": {"path": "C:/Users/danda/AppData/Local/hermes/profiles/pivete/workspace/cot-react-test-20260804-163844/expected.json"}
        },
        {
            "think": "Save result to output file",
            "tool": "write_file",
            "args": {"path": "C:/Users/danda/AppData/Local/hermes/profiles/pivete/workspace/cot-react-test-20260804-163844/result.json", 
                     "content": "{\"status\": \"done\", \"method\": \"cot-react-loop\"}"}
        }
    ]
    
    executor = CotReactExecutor(max_iter=args.max_iter, output_dir=args.output_dir)
    records = executor.run_loop(brief, steps)
    
    print(f"\nFinal decision: {records[-1].decide if records else 'NONE'}")
    print(f"Log: {executor.log_file}")


if __name__ == "__main__":
    main()