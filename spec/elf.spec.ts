import { FileHandle, open } from 'node:fs/promises';
import { ElfFile } from '../src/elf.js';
import { DataSource } from '../src/data-source.js';

/**
 * Node.js-specific DataSource implementation for tests.
 * This demonstrates how Node.js users can create their own DataSource.
 */
class FileHandleDataSource implements DataSource {
  private fileHandle: FileHandle;

  constructor(fileHandle: FileHandle) {
    this.fileHandle = fileHandle;
  }

  async read(offset: number, length: number): Promise<Uint8Array> {
    const buffer = new Uint8Array(length);
    const { bytesRead } = await this.fileHandle.read(buffer, 0, length, offset);
    return buffer.slice(0, bytesRead);
  }
}

describe('Elf', () => {
  let elf: ElfFile;
  let fileHandle: FileHandle;

  beforeEach(async () => {
    fileHandle = await open('./spec/hello.elf', 'r');
    const dataSource = new FileHandleDataSource(fileHandle);
    elf = new ElfFile(dataSource);
  });

  afterEach(async () => {
    await fileHandle.close();
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

function getUUID(section: Uint8Array) {
  return Array.from(section.slice(16, 36))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
