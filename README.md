# Wallflower

All rights reserved. See [the license](./LICENSE.md) for details.

## Installation

### Linux

<details>
<summary>Arch</summary>

```bash
yay -S wallflower-land
```

</details>

<details>
<summary>Endeavour</summary>

```bash
yay -S wallflower-land
```

</details>

<details>
<summary>Manjaro</summary>

```bash
yay -S wallflower-land
```

</details>

### Building From Source

You can build wallflower.land from source:

```bash
git clone https://github.com/wallflower-land/wallflower-land.github.io.git
cd wallflower-land.github.io
make build-from-source
```

## Contributing

### Prerequisites

[The makefile](./Makefile) will auto-detect your JavaScript package manager and tooling. You must have at least one of the following:

- `bun`
- `pnpm`
- `npm`
- `yarn`
- `deno`

The following other prerequisites are optional depending on your needs:

<details>
<summary>Building Windows EXEs from Linux</summary>

Building a Windows executable (.exe) from Linux requires these native packages:

- `nsis`
- `lld`
- `llvm`

</details>

### Usage

The following commands are supplied:

- `make build-site` - Build the website for production
- `make dev-site` - Start the website development server
- `make dev-native-app` - Start the app in development mode
- `make clean` - Remove all cached files
