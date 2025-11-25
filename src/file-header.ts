export const lengthOf64BitElfHeader = 64;
const elfMagic = [0x7f, 0x45, 0x4c, 0x46];

export class ElfFileHeader {
  readonly segmentHeaderOffset: bigint;
  readonly sectionHeaderOffset: bigint;
  readonly segmentHeaderSize: number;
  readonly segmentHeaderEntrySize: number;
  readonly segmentHeaderEntryCount: number;
  readonly sectionHeaderEntrySize: number;
  readonly sectionHeaderEntryCount: number;
  readonly stringTableIndex: number;

  constructor(
    segmentHeaderOffset: bigint,
    sectionHeaderOffset: bigint,
    segmentHeaderSize: number,
    segmentHeaderEntrySize: number,
    segmentHeaderEntryCount: number,
    sectionHeaderEntrySize: number,
    sectionHeaderEntryCount: number,
    stringTableIndex: number,
  ) {
    this.segmentHeaderOffset = segmentHeaderOffset;
    this.sectionHeaderOffset = sectionHeaderOffset;
    this.segmentHeaderSize = segmentHeaderSize;
    this.segmentHeaderEntrySize = segmentHeaderEntrySize;
    this.segmentHeaderEntryCount = segmentHeaderEntryCount;
    this.sectionHeaderEntrySize = sectionHeaderEntrySize;
    this.sectionHeaderEntryCount = sectionHeaderEntryCount;
    this.stringTableIndex = stringTableIndex;
  }

  static parse(data: Uint8Array): ElfFileHeader {
    if (data.length < lengthOf64BitElfHeader) {
      throw new Error('Could not parse ELF header, invalid buffer!');
    }

    const isElf = data[0] === elfMagic[0] 
      && data[1] === elfMagic[1] 
      && data[2] === elfMagic[2] 
      && data[3] === elfMagic[3];

    if (!isElf) {
      throw new Error('Could not parse ELF header, invalid ELF file!');
    }

    const is64Bit = data[4] === 0x02;

    if (!is64Bit) {
      throw new Error(
        'Could not parse ELF header, 32-bit ELF files are not supported!',
      );
    }

    const isLE = data[5] === 0x01;

    if (!isLE) {
      throw new Error(
        'Could not parse ELF header, big endian is not supported!',
      );
    }

    const view = new DataView(data.buffer, data.byteOffset, data.byteLength);

    const segmentHeaderOffset = view.getBigUint64(32, true);
    const sectionHeaderOffset = view.getBigUint64(40, true);
    const segmentHeaderSize = view.getUint16(52, true);
    const segmentHeaderEntrySize = view.getUint16(54, true);
    const segmentHeaderEntryCount = view.getUint16(56, true);
    const sectionHeaderEntrySize = view.getUint16(58, true);
    const sectionHeaderEntryCount = view.getUint16(60, true);
    const stringTableIndex = view.getUint16(62, true);

    return new ElfFileHeader(
      segmentHeaderOffset,
      sectionHeaderOffset,
      segmentHeaderSize,
      segmentHeaderEntrySize,
      segmentHeaderEntryCount,
      sectionHeaderEntrySize,
      sectionHeaderEntryCount,
      stringTableIndex,
    );
  }
}
