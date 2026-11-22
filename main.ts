// Tiny stack VM for make.fun tiny-stack-vm-01-run-20261122.
// Implements the kit's tiny stack ISA v1 from its spec: 32-bit wrapping ints,
// 256-value data stack, 64-deep call stack, 256 words of memory, ten traps,
// 1,000,000-step and 65,536-byte output limits. Runs every instance in
// /input/<id>/ and writes /output/<id>/stdout.bin + /output/<id>/exit.txt.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const NEED: Record<number, [number, number]> = {
  0x00: [0, 0], 0x01: [0, 1], 0x02: [0, 1], 0x03: [1, 0], 0x04: [1, 2],
  0x05: [2, 2], 0x06: [2, 3], 0x07: [3, 3], 0x10: [2, 1], 0x11: [2, 1],
  0x12: [2, 1], 0x13: [2, 1], 0x14: [2, 1], 0x15: [2, 1], 0x16: [2, 1],
  0x17: [1, 1], 0x18: [2, 1], 0x19: [2, 1], 0x1a: [2, 1], 0x1b: [1, 1],
  0x1c: [2, 1], 0x1d: [2, 1], 0x1e: [2, 1], 0x20: [2, 1], 0x21: [2, 1],
  0x22: [2, 1], 0x30: [0, 0], 0x31: [1, 0], 0x32: [1, 0], 0x33: [0, 0],
  0x34: [0, 0], 0x40: [1, 1], 0x41: [2, 0], 0x50: [1, 0], 0x51: [1, 0],
  0x52: [0, 1], 0x53: [1, 0],
};
const IMM: Record<number, number> = {
  0x01: 1, 0x02: 4, 0x30: 2, 0x31: 2, 0x32: 2, 0x33: 2,
};

function run(prog: Buffer, input: Buffer): { out: Buffer; code: number } {
  const st: number[] = [];
  const cs: number[] = [];
  const mem = new Int32Array(256);
  const out: number[] = [];
  let pc = 0, ip = 0, steps = 0;
  const done = (code: number) => ({ out: Buffer.from(out), code });
  for (;;) {
    if (steps >= 1000000) return done(10);
    if (pc < 0 || pc >= prog.length) return done(9);
    const op = prog[pc];
    const need = NEED[op];
    if (!need) return done(5);
    const n = IMM[op] ?? 0;
    if (pc + 1 + n > prog.length) return done(9);
    if (st.length < need[0]) return done(2);
    if (st.length - need[0] + need[1] > 256) return done(3);
    steps++;
    const next = pc + 1 + n;
    let imm = 0;
    if (n === 1) imm = prog[pc + 1];
    else if (n === 4) imm = prog.readInt32LE(pc + 1);
    else if (n === 2) imm = op === 0x33 ? prog.readUInt16LE(pc + 1) : prog.readInt16LE(pc + 1);
    pc = next;
    switch (op) {
      case 0x00: return done(0);
      case 0x01: st.push((imm << 24) >> 24); break;
      case 0x02: st.push(imm | 0); break;
      case 0x03: st.pop(); break;
      case 0x04: st.push(st[st.length - 1]); break;
      case 0x05: { const b = st.pop()!; const a = st.pop()!; st.push(b, a); break; }
      case 0x06: st.push(st[st.length - 2]); break;
      case 0x07: { const c = st.pop()!; const b = st.pop()!; const a = st.pop()!; st.push(b, c, a); break; }
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14:
      case 0x15: case 0x16: case 0x18: case 0x19: case 0x1a:
      case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: {
        const b = st.pop()!, a = st.pop()!;
        let r = 0;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { if (b === 0) return done(4); r = Math.trunc(a / b) | 0; }
        else if (op === 0x14) { if (b === 0) return done(4); r = (a % b) | 0; }
        else if (op === 0x15) { if (b === 0) return done(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 0x16) { if (b === 0) return done(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 0x18) r = (a & b) | 0;
        else if (op === 0x19) r = (a | b) | 0;
        else if (op === 0x1a) r = (a ^ b) | 0;
        else if (op === 0x1c) r = (a << (b & 31)) | 0;
        else if (op === 0x1d) r = a >> (b & 31);
        else if (op === 0x1e) r = (a >>> (b & 31)) | 0; // logical: zero-fill, not sign-fill
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        st.push(r);
        break;
      }
      case 0x17: st.push((-st.pop()!) | 0); break;
      case 0x1b: st.push(~st.pop()!); break;
      case 0x30: pc = next + imm; break;
      case 0x31: if (st.pop()! === 0) pc = next + imm; break;
      case 0x32: if (st.pop()! !== 0) pc = next + imm; break;
      case 0x33: if (cs.length >= 64) return done(7); cs.push(next); pc = imm; break;
      case 0x34: if (cs.length === 0) return done(8); pc = cs.pop()!; break;
      case 0x40: { const a = st.pop()!; if (a < 0 || a > 255) return done(6); st.push(mem[a]); break; }
      case 0x41: { const a = st.pop()!; const v = st.pop()!; if (a < 0 || a > 255) return done(6); mem[a] = v; break; }
      case 0x50: { const s = String(st.pop()!); if (out.length + s.length > 65536) return done(11); for (const c of s) out.push(c.charCodeAt(0)); break; }
      case 0x51: if (out.length + 1 > 65536) return done(11); out.push(st.pop()! & 255); break;
      case 0x52: st.push(ip < input.length ? input[ip++] : -1); break;
      case 0x53: return done(st.pop()! & 255);
    }
  }
}

for (let i = 1; i <= 40; i++) {
  const id = "i" + String(i).padStart(3, "0");
  let prog = Buffer.alloc(0), input = Buffer.alloc(0);
  try { prog = readFileSync(`/input/${id}/program.bin`); } catch { /* empty program traps 9 */ }
  try { input = readFileSync(`/input/${id}/input.bin`); } catch { /* no input */ }
  const r = run(prog, input);
  mkdirSync(`/output/${id}`, { recursive: true });
  writeFileSync(`/output/${id}/stdout.bin`, r.out);
  writeFileSync(`/output/${id}/exit.txt`, String(r.code));
}
