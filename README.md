# source-engine-model-loader

[![build](https://img.shields.io/github/actions/workflow/status/gkjohnson/source-engine-model-loader/node.js.yml?style=flat-square&label=build&branch=master)](https://github.com/gkjohnson/source-engine-model-loader/actions)
[![github](https://flat.badgen.net/badge/icon/github?icon=github&label)](https://github.com/gkjohnson/source-engine-model-loader/)
[![twitter](https://flat.badgen.net/badge/twitter/@garrettkjohnson/?icon&label)](https://twitter.com/garrettkjohnson)

Unofficial Three.js loader for parsing Valve's Source Engine models built by referencing the data structures in the [ValveSoftware/source-sdk-2013](https://github.com/ValveSoftware/source-sdk-2013) project and the source engine [wiki](https://developer.valvesoftware.com/wiki/MDL). Demo models from the [Source Filmmaker](https://store.steampowered.com/app/1840/Source_Filmmaker/) installation.

![](./images/banner.png)

Get models from [SFMLab](https://SFMLab.com) or [Source Filmmaker](https://store.steampowered.com/app/1840/Source_Filmmaker/).

Demo [here!](https://gkjohnson.github.io/source-engine-model-loader/dist/index.html)

# License Information

Models shown in this repo are not covered by the code license, copyright their respective owners, and are for demo purposes only.

# Use

```js
import { SourceModelLoader } from 'source-engine-model-loader';

new SourceModelLoader()
  .load( './folder/model', ( { group } ) => {

    scene.add( group );

  } );
```

# API

## SourceModelLoader

### constructor

```js
constructor( manager : LoadingManager )
```

### load

```js
load(
	url : string,
	onComplete : ( { group : Group } ) => void
) : void
```

Loads the set of Source Engine model files at the given path. It is expected that a model with the extensions `.mdl`, `.vvd`, and `.vtx` exist.

# Unimplemented Features

See [issue #4](https://github.com/gkjohnson/source-engine-model-loader/issues/4) for full list of unimplemented features.

## Companion resolution fork

This fork supports loose uploads as well as Source game folder trees. A model outside
`models/` looks for `materials/` beside itself. `SourceModelLoader(manager, options)`
accepts an explicit `materialPath` (also used for VTF references), an optional
`loadFile(url, kind, onLoad, onProgress, onError)` transport, and an optional
`loadTexture(url, onLoad, onProgress, onError)` transport returning a Three.js texture.
The default transports remain Three.js loaders. Embedders can use these hooks for
bounded requests, validation, cancellation and texture capability checks.

Material search directories are tried in order. Geometry still loads if no material
is available; the result includes `materialIssues`, each with a material `name` and
its unresolved `candidates`. A failed search candidate alone is not a missing material.
Texture failures continue to use the loading manager's error callback. Required-file
transport/parser failures reach `onError`. Parser work, vertex indices, checksums and
bone ancestry retain the guards previously applied by the decompiler build.

Run `npm test` for generated-fixture regression tests (Node.js 18+).
