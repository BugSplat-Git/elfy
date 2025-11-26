/**
 * Interface for reading byte ranges from a data source.
 * This abstraction allows the ELF parser to work with different backends:
 * - Browser: Blob/File objects
 * - Node.js: FileHandle or custom implementations
 */
export interface DataSource {
  /**
   * Read a range of bytes from the data source.
   * @param offset - Starting byte offset
   * @param length - Number of bytes to read
   * @returns Promise resolving to the requested bytes
   */
  read(offset: number, length: number): Promise<Uint8Array>;
}

/**
 * DataSource implementation for Blob/File objects.
 * Works in browsers with File objects from <input type="file"> or fetch responses.
 */
export class BlobDataSource implements DataSource {
  private blob: Blob;

  constructor(blob: Blob) {
    this.blob = blob;
  }

  async read(offset: number, length: number): Promise<Uint8Array> {
    const slice = this.blob.slice(offset, offset + length);
    const buffer = await slice.arrayBuffer();
    return new Uint8Array(buffer);
  }
}

/**
 * DataSource implementation for an in-memory Uint8Array or ArrayBuffer.
 * Useful for small files or when the entire file is already in memory.
 */
export class BufferDataSource implements DataSource {
  private data: Uint8Array;

  constructor(data: Uint8Array | ArrayBuffer) {
    this.data = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
  }

  async read(offset: number, length: number): Promise<Uint8Array> {
    return this.data.slice(offset, offset + length);
  }
}
