import { FileHandle, open } from 'node:fs/promises';
import { ElfFileHeader, lengthOf64BitElfHeader } from './file-header';
import { ElfSectionHeader } from './section-header';

export class ElfFile implements Disposable {
  private header?: ElfFileHeader;
  private stringTable?: string[];

  private constructor(private fileHandle: FileHandle) { }

  static async create(path: string) {
    const fileHandle = await open(path, 'r');
    return new ElfFile(fileHandle);
  }

  [Symbol.dispose]() {
    this.dispose();
  }

  dispose() {
    this.fileHandle?.close();
  }

  async tryReadSection(
    name: string
  ): Promise<{ success: boolean; section?: Buffer }> {
    let section: Buffer | undefined = undefined;
    let success = true;

    try {
      section = await this.readSection(name);
    } catch {
      success = false;
    }

    return {
      success,
      section,
    };
  }

  async readSection(name: string): Promise<Buffer> {
    if (!this.header) {
      this.header = await this.readFileHeader();
    }

    if (!this.stringTable) {
      this.stringTable = await this.createStringTable();
    }

    const index = this.stringTable.indexOf(name);
    const found = index !== -1;
    if (!found) {
      throw new Error(`Section ${name} not found`);
    }

    const header = await this.readSectionHeader(index);
    const { sectionOffset, sectionSize } = header;
    const { buffer, bytesRead } = await this.fileHandle.read(
      Buffer.alloc(Number(sectionSize)),
      0,
      Number(sectionSize),
      Number(sectionOffset)
    );

    if (bytesRead !== Number(sectionSize)) {
      throw new Error(`Could not read section ${name}`);
    }

    return buffer;
  }

  private async createStringTable(): Promise<Array<string>> {
    const { stringTableIndex } = this.header!;
    const stringTableHeader = await this.readSectionHeader(stringTableIndex);
    const { sectionOffset, sectionSize } = stringTableHeader;
    const { buffer, bytesRead } = await this.fileHandle.read(
      Buffer.alloc(Number(sectionSize)),
      0,
      Number(sectionSize),
      Number(sectionOffset)
    );

    if (bytesRead !== Number(sectionSize)) {
      throw new Error('Could not read string table');
    }

    const stringTable = [] as Array<string>;

    // The section names in the strings table aren't necessarily in the same order as the corresponding sections.
    // Read all the section headers to find the true order of the sections.
    for (let i = 0; i < this.header!.sectionHeaderEntryCount; i++) {
      const { sectionNameOffset } = await this.readSectionHeader(i);
      const nextNull = buffer.indexOf(0x00, sectionNameOffset);
      const name = buffer.subarray(sectionNameOffset, nextNull).toString('utf-8');
      stringTable.push(name);
    }

    return stringTable;
  }

  async readSectionHeader(i: number): Promise<ElfSectionHeader> {
    const { sectionHeaderOffset, sectionHeaderEntrySize } = this.header!;
    const headerStart =
      Number(sectionHeaderOffset) + i * sectionHeaderEntrySize;
    const { buffer, bytesRead } = await this.fileHandle.read(
      Buffer.alloc(sectionHeaderEntrySize),
      0,
      sectionHeaderEntrySize,
      headerStart
    );

    if (bytesRead !== sectionHeaderEntrySize) {
      throw new Error('Could not read section header');
    }

    const sectionNameOffset = buffer.readUInt32LE(0);
    const sectionType = buffer.readUInt32LE(4);
    const sectionFlags = buffer.readBigUInt64LE(8);
    const sectionLoadAddress = buffer.readBigUInt64LE(16);
    const sectionOffset = buffer.readBigUInt64LE(24);
    const sectionSize = buffer.readBigUInt64LE(32);
    const sectionLink = buffer.readUInt32LE(40);
    const sectionInfo = buffer.readUInt32LE(44);
    const sectionAlignment = buffer.readBigUInt64LE(48);
    const sectionEntrySize = buffer.readBigUInt64LE(56);

    return new ElfSectionHeader(
      sectionNameOffset,
      sectionType,
      sectionFlags,
      sectionLoadAddress,
      sectionOffset,
      sectionSize,
      sectionLink,
      sectionInfo,
      sectionAlignment,
      sectionEntrySize
    );
  }

  async readFileHeader(): Promise<ElfFileHeader | undefined> {
    const { buffer, bytesRead } = await this.fileHandle.read(
      Buffer.alloc(lengthOf64BitElfHeader),
      0,
      lengthOf64BitElfHeader,
      0
    );

    if (bytesRead !== lengthOf64BitElfHeader) {
      throw new Error('Could not read ELF header');
    }

    return ElfFileHeader.parse(buffer);
  }
}

function splitBuffer(buffer: Buffer, delimiter: number) {
  const parts = [] as Array<Buffer>;
  let start = 0;
  let index = 0;
  // Believe it or not, according to elfsharp the first part is indeed empty
  while ((index = buffer.indexOf(delimiter, start)) !== -1) {
    parts.push(buffer.subarray(start, index));
    start = index + 1;
  }
  parts.push(buffer.subarray(start));
  return parts;
}
