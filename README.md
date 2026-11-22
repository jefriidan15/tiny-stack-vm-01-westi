# Tiny Stack VM

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/jefriidan15/tiny-stack-vm-01-westi/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/jefriidan15/tiny-stack-vm-01-westi/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack virtual machine for make.fun's tiny stack ISA v1, written from
the ISA spec in one file (`main.ts`, Node 22, standard library only). It runs
every bytecode program in a set and answers with exactly the bytes the program
writes and the exit code it ends with.

- 32-bit wrapping integers (`Math.imul` for `MUL`, truncating `DIV`, signed
  remainder for `MOD`, unsigned `DIVU`/`MODU`/`LTU`)
- 256-value data stack, 64-deep call stack, 256 words of memory
- Branches, calls, input (`IN` returns -1 past the end) and output
  (`PRINT` decimal, `PUTC` low byte)
- All ten traps with their own exit codes, including the step limit
  (1,000,000) and the output limit (65,536 bytes); a trap keeps the output
  written before it
- Correct edge cases: `SHRU` is a logical (zero-fill) shift, `PUSH8`
  sign-extends, `EXIT` takes the low byte, falling off the end traps 9

Practice set: **1,000,000 (40/40 perfect)** in ~0.4s for the whole set,
two runs byte-identical.

## Run

```sh
node main.ts
# reads /input/<id>/program.bin + input.bin, writes
# /output/<id>/stdout.bin + /output/<id>/exit.txt
```
