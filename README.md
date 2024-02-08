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

A tiny utility for parsing ELF/SELF files.

## Usage

1. Install this package

```sh
npm i elfy
```

2. Create an instance of `ElfFile` using the async static factory function `create`. The `ElfFile` class implements `Disposable` so you should use a [using](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) statement in TypeScript 5.2+ or call `dispose` manually.

```ts
import { ElfFile } from 'elfy';
using elfFile = await ElfFile.create('path/to/elf/file');
// or
const elfFile = await ElfFile.create('path/to/elf/file');
try {
    ...
} finally {
    elfFile.dispose();
}
```

3. Read the contents of a section using `readSection`. This method throws if the section does not exist.

```ts
const contents: Buffer = await elfFile.readSection('.note.gnu.build-id');
```

4. You can also safely read the contents of a section using `tryReadSection`.

```ts
const { success, section } = await elfFile.tryReadSection('.note.gnu.build-id');
```

## 🐛 About

[BugSplat](https://bugsplat.com) is a software crash and error reporting service with support for game engines like [Unreal Engine](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/unreal-engine), and supports platforms such as [PlayStation](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/playstation), [Xbox](https://docs.bugsplat.com/introduction/getting-started/integrations/game-development/xbox) and [many more](https://docs.bugsplat.com/introduction/getting-started/integrations). BugSplat automatically captures critical diagnostic data such as stack traces, log files, and other runtime information. BugSplat also provides automated incident notifications, a convenient dashboard for monitoring trends and prioritizing engineering efforts, and integrations with popular development tools to maximize productivity and ship more profitable software.
