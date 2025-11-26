export class ElfSectionHeader {
  readonly sectionNameOffset: number;
  readonly sectionType: number;
  readonly sectionFlags: bigint;
  readonly sectionLoadAddress: bigint;
  readonly sectionOffset: bigint;
  readonly sectionSize: bigint;
  readonly sectionLink: number;
  readonly sectionInfo: number;
  readonly sectionAlignment: bigint;
  readonly sectionEntrySize: bigint;

  constructor(
    sectionNameOffset: number,
    sectionType: number,
    sectionFlags: bigint,
    sectionLoadAddress: bigint,
    sectionOffset: bigint,
    sectionSize: bigint,
    sectionLink: number,
    sectionInfo: number,
    sectionAlignment: bigint,
    sectionEntrySize: bigint,
  ) {
    this.sectionNameOffset = sectionNameOffset;
    this.sectionType = sectionType;
    this.sectionFlags = sectionFlags;
    this.sectionLoadAddress = sectionLoadAddress;
    this.sectionOffset = sectionOffset;
    this.sectionSize = sectionSize;
    this.sectionLink = sectionLink;
    this.sectionInfo = sectionInfo;
    this.sectionAlignment = sectionAlignment;
    this.sectionEntrySize = sectionEntrySize;
  }
}
