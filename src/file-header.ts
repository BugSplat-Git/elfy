export const lengthOf64BitElfHeader = 64;
const elfMagic = [0x7f, 0x45, 0x4c, 0x46];

export class ElfFileHeader {
  constructor(
    public readonly segmentHeaderOffset: bigint,
    public readonly sectionHeaderOffset: bigint,
    public readonly segmentHeaderSize: number,
    public readonly segmentHeaderEntrySize: number,
    public readonly segmentHeaderEntryCount: number,
    public readonly sectionHeaderEntrySize: number,
    public readonly sectionHeaderEntryCount: number,
    public readonly stringTableIndex: number,
  ) {}

  static parse(buffer: Buffer) {
    if (buffer.length < lengthOf64BitElfHeader) {
      throw new Error('Could not parse ELF header, invalid buffer!');
    }

    const expected = Buffer.from(elfMagic);
    const isElf = Buffer.compare(buffer.subarray(0, 4), expected) === 0;

    if (!isElf) {
      throw new Error('Could not parse ELF header, invalid ELF file!');
    }

    const is64Bit =
      Buffer.compare(buffer.subarray(4, 5), Buffer.from([0x02])) === 0;

    if (!is64Bit) {
      throw new Error(
        'Could not parse ELF header, 32-bit ELF files are not supported!',
      );
    }

    const isLE =
      Buffer.compare(buffer.subarray(5, 6), Buffer.from([0x01])) === 0;

    if (!isLE) {
      throw new Error(
        'Could not parse ELF header, big endian is not supported!',
      );
    }

    const segmentHeaderOffset = buffer.readBigUInt64LE(32);
    const sectionHeaderOffset = buffer.readBigUInt64LE(40);
    const segmentHeaderSize = buffer.readUint16LE(52);
    const segmentHeaderEntrySize = buffer.readUint16LE(54);
    const segmentHeaderEntryCount = buffer.readUint16LE(56);
    const sectionHeaderEntrySize = buffer.readUint16LE(58);
    const sectionHeaderEntryCount = buffer.readUint16LE(60);
    const stringTableIndex = buffer.readUint16LE(62);

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
