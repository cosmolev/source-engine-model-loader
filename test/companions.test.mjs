import test from 'node:test';
import assert from 'node:assert/strict';
import { LoadingManager, Texture } from 'three';
import { SourceModelLoader } from '../src/SourceModelLoader.js';
import { VMTLoader } from '../src/VMTLoader.js';
import { sourceModel, arrayBuffer } from './fixtures.mjs';

function fixture(base, options = {}) {
    const bundle = sourceModel();
    const files = new Map([[`${base}.mdl`, bundle.mdl], [`${base}.vvd`, bundle.vvd], [`${base}.dx90.vtx`, bundle.vtx]]);
    const requested = [], textures = [];
    const loader = new SourceModelLoader(new LoadingManager(), {
        loadFile(url, kind, onLoad, onProgress, onError) {
            requested.push(url);
            queueMicrotask(() => files.has(url)
                ? onLoad(kind === 'VMT' ? files.get(url).toString() : arrayBuffer(files.get(url)))
                : onError(new Error(`Missing ${url}`)));
        },
        loadTexture(url) { textures.push(url); return new Texture(); },
        ...options,
    });
    return { bundle, files, requested, textures, load: () => new Promise((resolve, reject) => loader.load(base, resolve, undefined, reject)) };
}

for (const [name, base, root] of [
    ['flat', '/download/upload/files/preview', '/download/upload/files/'],
    ['nested', '/download/upload/files/mdl/models/review/preview', '/download/upload/files/mdl/'],
    ['models in filename', '/download/upload/files/a-models-preview', '/download/upload/files/'],
]) {
    test(`${name}: absent VMT retains geometry and reports its filename`, async () => {
        const f = fixture(base), result = await f.load();
        assert.equal(result.group.children.filter(o => o.isMesh).length, 1);
        assert.deepEqual(result.materialIssues, [{ name: 'preview', candidates: [`${root}materials/review/preview.vmt`] }]);
        assert.deepEqual(f.textures, [], 'VTF names cannot be known before reading a VMT');
        assert.ok(!f.requested.some(url => url.startsWith('/materials/')));
    });
    test(`${name}: complete material resolves its texture inside the same bundle`, async () => {
        const f = fixture(base);
        f.files.set(`${root}materials/review/preview.vmt`, f.bundle.vmt);
        const result = await f.load();
        assert.deepEqual(result.materialIssues, []);
        assert.deepEqual(f.textures, [`${root}materials/review/preview.vtf`]);
        assert.equal(result.materials[0].name, 'preview');
    });
}

test('an explicit material path applies to both VMT and VTF files', async () => {
    const f = fixture('/upload/geometry/preview', { materialPath: '/upload/content/materials' });
    f.files.set('/upload/content/materials/review/preview.vmt', f.bundle.vmt);
    assert.deepEqual((await f.load()).materialIssues, []);
    assert.deepEqual(f.textures, ['/upload/content/materials/review/preview.vtf']);
});

test('searches alternate directories in order and reports no issue after success', async () => {
    const f = fixture('/upload/preview');
    const mdl = Buffer.concat([f.bundle.mdl, Buffer.alloc(80)]);
    mdl.writeInt32LE(mdl.length, 76);
    mdl.writeInt32LE(2, 212); mdl.writeInt32LE(1024, 216);
    mdl.writeInt32LE(1032, 1024); mdl.writeInt32LE(1048, 1028);
    mdl.write('absent/\0', 1032); mdl.write('review/\0', 1048);
    f.files.set('/upload/preview.mdl', mdl);
    f.files.set('/upload/materials/review/preview.vmt', f.bundle.vmt);
    const result = await f.load();
    assert.deepEqual(result.materialIssues, []);
    assert.deepEqual(f.requested.filter(url => url.endsWith('.vmt')), [
        '/upload/materials/absent/preview.vmt', '/upload/materials/review/preview.vmt',
    ]);
    assert.deepEqual(f.textures, ['/upload/materials/review/preview.vtf']);
});

test('models with no search directories try the material root', async () => {
    const f = fixture('/upload/preview');
    f.bundle.mdl.writeInt32LE(0, 212);
    assert.deepEqual((await f.load()).materialIssues[0].candidates, ['/upload/materials/preview.vmt']);
});

test('a rejected material URL settles with an issue instead of hanging', async () => {
    const f = fixture('/upload/preview');
    // A URL modifier may throw synchronously before a FileLoader starts any request.
    const original = VMTLoader.prototype.load;
    VMTLoader.prototype.load = () => { throw new Error('URL rejected'); };
    try { assert.equal((await f.load()).materialIssues.length, 1); }
    finally { VMTLoader.prototype.load = original; }
});

test('a missing required geometry file rejects the model load', async () => {
    const f = fixture('/upload/preview');
    f.files.delete('/upload/preview.vvd');
    await assert.rejects(f.load(), /Missing.*preview.vvd/);
});

test('parser exceptions reach the model error callback', async () => {
    const f = fixture('/upload/preview');
    f.files.set('/upload/preview.mdl', Buffer.alloc(1));
    await assert.rejects(f.load(), RangeError);
});

for (const [name, mutate, pattern] of [
    ['checksums', b => b.vvd.writeInt32LE(42, 8), /checksums/],
    ['cyclic bones', b => b.mdl.writeInt32LE(0, 412), /bone hierarchy/],
    ['vertex indices', b => b.vtx.writeUInt16LE(65535, 153), /vertex index/],
]) {
    test(`rejects invalid ${name}`, async () => {
        const f = fixture('/upload/preview');
        mutate(f.bundle);
        await assert.rejects(f.load(), pattern);
    });
}

test('bounds parser work on oversized material text', () => {
    assert.throws(() => new VMTLoader().parse(' '.repeat(100001), '/upload/materials/test.vmt'), /work limit/);
});
