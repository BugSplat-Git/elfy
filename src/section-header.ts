export class ElfSectionHeader {
  constructor(
    public readonly sectionNameOffset: number,
    public readonly sectionType: number,
    public readonly sectionFlags: bigint,
    public readonly sectionLoadAddress: bigint,
    public readonly sectionOffset: bigint,
    public readonly sectionSize: bigint,
    public readonly sectionLink: number,
    public readonly sectionInfo: number,
    public readonly sectionAlignment: bigint,
    public readonly sectionEntrySize: bigint,
  ) {}
}
