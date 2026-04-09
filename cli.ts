#!/usr/bin/env node

import { open } from 'node:fs/promises';
import { DataSource } from './src/data-source.js';
import { ElfFile } from './src/elf.js';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: elfy <path-to-elf-file>');
  process.exit(1);
}

const fileHandle = await open(filePath, 'r');
try {
  const dataSource: DataSource = {
    async read(offset: number, length: number): Promise<Uint8Array> {
      const buffer = new Uint8Array(length);
      const { bytesRead } = await fileHandle.read(buffer, 0, length, offset);
      return buffer.slice(0, bytesRead);
    },
  };

  const elf = new ElfFile(dataSource);
  const { success, section } = await elf.tryReadSection('.note.gnu.build-id');
  if (!success || !section) {
    console.error('Could not find .note.gnu.build-id section');
    process.exit(1);
  }

  const uuid = Array.from(section.slice(16, 36))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  console.log(uuid);
} finally {
  await fileHandle.close();
}
