import { DataSource } from './data-source.js';
import { ElfFileHeader, lengthOf64BitElfHeader } from './file-header.js';
import { ElfSectionHeader } from './section-header.js';

export class ElfFile {
  private header?: ElfFileHeader;
  private stringTable?: string[];
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
  }

  async tryReadSection(name: string): Promise<{ success: boolean; section?: Uint8Array }> {
    let section: Uint8Array | undefined = undefined;
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

  async readSection(name: string): Promise<Uint8Array> {
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

    const data = await this.dataSource.read(Number(sectionOffset), Number(sectionSize));

    if (data.length !== Number(sectionSize)) {
      throw new Error(`Could not read section ${name}`);
    }

    return data;
  }

  private async createStringTable(): Promise<Array<string>> {
    const { stringTableIndex } = this.header!;
    const stringTableHeader = await this.readSectionHeader(stringTableIndex);
    const { sectionOffset, sectionSize } = stringTableHeader;

    const stringTableData = await this.dataSource.read(Number(sectionOffset), Number(sectionSize));

    if (stringTableData.length !== Number(sectionSize)) {
      throw new Error('Could not read string table');
    }

    const stringTable: Array<string> = [];

    // The section names in the strings table aren't necessarily in the same order as the corresponding sections.
    // Read all the section headers to find the true order of the sections.
    for (let i = 0; i < this.header!.sectionHeaderEntryCount; i++) {
      const { sectionNameOffset } = await this.readSectionHeader(i);
      const nextNull = stringTableData.indexOf(0x00, sectionNameOffset);
      const nameBytes = stringTableData.slice(sectionNameOffset, nextNull);
      const name = new TextDecoder().decode(nameBytes);
      stringTable.push(name);
    }

    return stringTable;
  }

  async readSectionHeader(i: number): Promise<ElfSectionHeader> {
    const { sectionHeaderOffset, sectionHeaderEntrySize } = this.header!;
    const headerStart = Number(sectionHeaderOffset) + i * sectionHeaderEntrySize;

    const data = await this.dataSource.read(headerStart, sectionHeaderEntrySize);

    if (data.length !== sectionHeaderEntrySize) {
      throw new Error('Could not read section header');
    }

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const sectionNameOffset = view.getUint32(0, true);
    const sectionType = view.getUint32(4, true);
    const sectionFlags = view.getBigUint64(8, true);
    const sectionLoadAddress = view.getBigUint64(16, true);
    const sectionOffset = view.getBigUint64(24, true);
    const sectionSize = view.getBigUint64(32, true);
    const sectionLink = view.getUint32(40, true);
    const sectionInfo = view.getUint32(44, true);
    const sectionAlignment = view.getBigUint64(48, true);
    const sectionEntrySize = view.getBigUint64(56, true);

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
      sectionEntrySize,
    );
  }

  async readFileHeader(): Promise<ElfFileHeader> {
    const data = await this.dataSource.read(0, lengthOf64BitElfHeader);

    if (data.length !== lengthOf64BitElfHeader) {
      throw new Error('Could not read ELF header');
    }

    return ElfFileHeader.parse(data);
  }
}
