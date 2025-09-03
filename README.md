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

Additionally, you either need [the Tauri CLI](https://v2.tauri.app/reference/cli/) installed through cargo (preferred):

```bash
cargo install tauri-cli --version "^2.0.0" --locked
```

or through your JavaScript package manager:

```bash
bun install -D @tauri-apps/cli@latest
npm install --save-dev @tauri-apps/cli@latest
yarn add -D @tauri-apps/cli@latest
pnpm add -D @tauri-apps/cli@latest
deno add -D npm:@tauri-apps/cli@latest
```

The following other prerequisites are optional depending on your needs:


<details>
<summary>Building Windows EXEs from Linux</summary>

Building a Windows executable (.exe) from Linux requires these native packages:

- `nsis`
- `lld`
- `llvm`

Also, the Windows toolchain needs to be added to rust:

```bash
rustup target add x86_64-pc-windows-msvc
```

and	`cargo-xwin` needs to be installed:

```bash
cargo install --locked cargo-xwin
```
</details>

### Usage

The following commands are supplied:

- `make build-site` - Build the website for production
- `make dev-site` - Start the website development server
- `make dev-native-app` - Start the app in development mode
- `make build-linux-app` - Build a native linux executable from Linux
- `make build-exe` - Build a Windows executable (.exe) from Linux
- `make build-all` - Build for all available platforms
- `make clean` - Remove all cached files
