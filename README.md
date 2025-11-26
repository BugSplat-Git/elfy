[![bugsplat-github-banner-basic-outline](https://user-images.githubusercontent.com/20464226/149019306-3186103c-5315-4dad-a499-4fd1df408475.png)](https://bugsplat.com)
<br/>

# <div align="center">BugSplat</div>

### **<div align="center">Crash and error reporting built for busy developers.</div>**

<div align="center">
    <a href="https://twitter.com/BugSplatCo">
        <img alt="Follow @bugsplatco on Twitter" src="https://img.shields.io/twitter/follow/bugsplatco?label=Follow%20BugSplat&style=social">
    </a>
    <a href="https://discord.gg/bugsplat">
        <img alt="Join BugSplat on Discord" src="https://img.shields.io/discord/664965194799251487?label=Join%20Discord&logo=Discord&style=social">
    </a>
</div>

<br/>

# elfy

A tiny utility for parsing ELF/SELF files. Works in both Node.js and browsers.

## Usage

1. Install this package

```sh
npm i @bugsplat/elfy
```

2. Create an instance of `ElfFile` by passing a `DataSource`. The library provides several built-in data sources:

### Browser (with File input)

```ts
import { ElfFile, BlobDataSource } from '@bugsplat/elfy';

// From a file input element
const file = document.getElementById('file-input').files[0];
const dataSource = new BlobDataSource(file);
const elfFile = new ElfFile(dataSource);
```

### Browser (with fetch)

```ts
import { ElfFile, BlobDataSource } from '@bugsplat/elfy';

const response = await fetch('https://example.com/file.elf');
const blob = await response.blob();
const dataSource = new BlobDataSource(blob);
const elfFile = new ElfFile(dataSource);
```

### Node.js (with FileHandle for large files)

```ts
import { open } from 'node:fs/promises';
import { ElfFile, DataSource } from '@bugsplat/elfy';

// Create a custom DataSource for Node.js file handles
class FileHandleDataSource implements DataSource {
  constructor(private fileHandle) {}

  async read(offset: number, length: number): Promise<Uint8Array> {
    const buffer = new Uint8Array(length);
    const { bytesRead } = await this.fileHandle.read(buffer, 0, length, offset);
    return buffer.slice(0, bytesRead);
  }
}

const fileHandle = await open('path/to/elf/file', 'r');
try {
  const dataSource = new FileHandleDataSource(fileHandle);
  const elfFile = new ElfFile(dataSource);
  // ... use elfFile
} finally {
  await fileHandle.close();
}
```

### In-memory buffer

```ts
import { ElfFile, BufferDataSource } from '@bugsplat/elfy';

// From an ArrayBuffer or Uint8Array already in memory
const dataSource = new BufferDataSource(arrayBuffer);
const elfFile = new ElfFile(dataSource);
```

3. Read the contents of a section using `readSection`. This method throws if the section does not exist.

```ts
const contents: Uint8Array = await elfFile.readSection('.note.gnu.build-id');
```

4. You can also safely read the contents of a section using `tryReadSection`.

```ts
const { success, section } = await elfFile.tryReadSection('.note.gnu.build-id');
```

## Data Sources

The library uses a `DataSource` interface to abstract reading bytes from any source:

```ts
interface DataSource {
  read(offset: number, length: number): Promise<Uint8Array>;
}
```

Built-in implementations:

- **`BlobDataSource`** - For browser `Blob`/`File` objects. Reads only the requested bytes using `Blob.slice()`.
- **`BufferDataSource`** - For in-memory `Uint8Array` or `ArrayBuffer` data.

You can create custom implementations for other sources (e.g., Node.js `FileHandle`, HTTP range requests, etc.).

## 🐛 About

[BugSplat](https://bugsplat.com) is a software crash and error reporting service with support for game engines like [Unreal Engine](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/unreal-engine), and supports platforms such as [PlayStation](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/playstation), [Xbox](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/xbox) and [many more](https://docs.bugsplat.com/introduction/getting-started/integrations). BugSplat automatically captures critical diagnostic data such as stack traces, log files, and other runtime information. BugSplat also provides automated incident notifications, a convenient dashboard for monitoring trends and prioritizing engineering efforts, and integrations with popular development tools to maximize productivity and ship more profitable software.
