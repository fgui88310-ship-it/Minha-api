// emoji-db.mjs
import fs from 'fs';
import crypto from 'crypto';

const MAGIC = Buffer.from([0x45, 0x44, 0x42, 0x01]); // "EDB\x01"

function crc32(buf) {
  let table = crc32._table;
  if (!table) {
    table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
      table[i] = c >>> 0;
    }
    crc32._table = table;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

class EmojiDB {
  constructor(filepath) {
    this.path = filepath;
    this.fd = null;
    this.index = new Map(); // emoji → posição no arquivo
  }

  async open() {
    if (!fs.existsSync(this.path)) fs.writeFileSync(this.path, MAGIC);
    this.fd = fs.openSync(this.path, 'r+');
    this._buildIndex();
  }

  close() {
    if (this.fd) fs.closeSync(this.fd);
  }

  _read(pos, len) {
    const buf = Buffer.alloc(len);
    fs.readSync(this.fd, buf, 0, len, pos);
    return buf;
  }

  _buildIndex() {
    const size = fs.fstatSync(this.fd).size;
    const head = this._read(0, 4);
    if (!head.equals(MAGIC)) throw new Error('Arquivo inválido');
    let pos = 4;
    while (pos + 8 <= size) {
      const recSize = this._read(pos, 4).readUInt32BE(0);
      const crc = this._read(pos + 4, 4).readUInt32BE(0);
      if (pos + 8 + recSize > size) break;
      const data = this._read(pos + 8, recSize);
      if (crc32(data) !== crc) break;
      const emojiLen = data.readUInt8(0);
      const emoji = data.slice(1, 1 + emojiLen).toString('utf8');
      this.index.set(emoji, pos);
      pos += 8 + recSize;
    }
  }

  _writeRecord(emoji, nome, categoria, detalhesJson) {
    const eBuf = Buffer.from(emoji, 'utf8');
    const nBuf = Buffer.from(nome || '', 'utf8');
    const cBuf = Buffer.from(categoria || '', 'utf8');
    const dBuf = Buffer.from(detalhesJson || '{}', 'utf8');

    const len = 1 + eBuf.length + 1 + nBuf.length + 1 + cBuf.length + 2 + dBuf.length;
    const data = Buffer.alloc(len);
    let off = 0;
    data.writeUInt8(eBuf.length, off); off++;
    eBuf.copy(data, off); off += eBuf.length;
    data.writeUInt8(nBuf.length, off); off++;
    nBuf.copy(data, off); off += nBuf.length;
    data.writeUInt8(cBuf.length, off); off++;
    cBuf.copy(data, off); off += cBuf.length;
    data.writeUInt16BE(dBuf.length, off); off += 2;
    dBuf.copy(data, off);

    const recSize = data.length;
    const crc = crc32(data);

    const header = Buffer.alloc(8);
    header.writeUInt32BE(recSize, 0);
    header.writeUInt32BE(crc, 4);

    return Buffer.concat([header, data]);
  }

  add(emoji, nome, categoria, detalhesJson) {
    const buf = this._writeRecord(emoji, nome, categoria, detalhesJson);
    const pos = fs.fstatSync(this.fd).size;
    fs.writeSync(this.fd, buf, 0, buf.length, pos);
    fs.fsyncSync(this.fd);
    this.index.set(emoji, pos);
  }

  get(emoji) {
    const pos = this.index.get(emoji);
    if (!pos) return null;
    const recSize = this._read(pos, 4).readUInt32BE(0);
    const data = this._read(pos + 8, recSize);
    let off = 0;
    const eLen = data.readUInt8(off); off++;
    const e = data.slice(off, off + eLen).toString('utf8'); off += eLen;
    const nLen = data.readUInt8(off); off++;
    const n = data.slice(off, off + nLen).toString('utf8'); off += nLen;
    const cLen = data.readUInt8(off); off++;
    const c = data.slice(off, off + cLen).toString('utf8'); off += cLen;
    const dLen = data.readUInt16BE(off); off += 2;
    const d = JSON.parse(data.slice(off, off + dLen).toString('utf8'));
    return { emoji: e, nome: n, categoria: c, detalhes: d };
  }

  list() {
    return [...this.index.keys()];
  }
}

export default EmojiDB;