import { ElfFile } from '../src/elf';

describe('Elf', () => {
  let elf: ElfFile;

  beforeEach(async () => {
    elf = await ElfFile.create('./spec/hello.elf');
  });

  afterEach(() => {
    elf[Symbol.dispose]();
  });

  describe('tryReadSection', () => {
    it("should return false if section can't be read", async () => {
      const { success } = await elf.tryReadSection('.does-not-exist');
      expect(success).toEqual(false);
    });

    it('should return section if section can be read', async () => {
      const { success } = await elf.tryReadSection('.note.gnu.build-id');
      expect(success).toEqual(true);
    });
  });

  describe('readSection', () => {
    it('should return section contents', async () => {
      const section = await elf.readSection('.note.gnu.build-id');
      const uuid = getUUID(section!);
      expect(uuid).toBe('85fe216fc7dd441f04c237310a56081fbf23c082');
    });
  });
});

function getUUID(section: Buffer) {
  return section.subarray(16, 36).toString('hex');
}
