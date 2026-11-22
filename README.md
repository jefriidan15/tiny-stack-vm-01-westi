# Tiny Stack VM

[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/jefriidan15/tiny-stack-vm-01-westi/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/jefriidan15/tiny-stack-vm-01-westi/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

A tiny stack VM for the kit's ISA v1 in one file (`main.ts`, Node 22,
stdlib only): 32-bit wrapping arithmetic, 256-value stack, 64-deep call
stack, 256 words of memory, all ten traps with their own exit codes
(including the step and output limits). Practice set: **1,000,000
(40/40 perfect)**, ~0.4s, two runs byte-identical.

```sh
node main.ts
```
