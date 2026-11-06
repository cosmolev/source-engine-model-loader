// Generated triangle fixture; no third-party game assets.
export function sourceModel(version = 48) {
    const checksum = 0x126126, bone = 408, texture = 624, directory = 688;
    const body = 692, model = 708, mesh = 856, skin = 972, strings = 974;
    const mdl = Buffer.alloc(1024);
    mdl.write('IDST'); mdl.writeInt32LE(version, 4); mdl.writeInt32LE(checksum, 8);
    mdl.write('preview.mdl', 12); mdl.writeInt32LE(mdl.length, 76);
    for (const [at, value] of [[156, 1], [160, bone], [204, 1], [208, texture], [212, 1], [216, directory],
        [220, 1], [224, 1], [228, skin], [232, 1], [236, body]]) mdl.writeInt32LE(value, at);
    mdl.writeInt32LE(-1, bone + 4); mdl.writeFloatLE(1, bone + 56);
    mdl.writeInt32LE(strings - texture, texture); mdl.write('preview\0review/\0', strings);
    mdl.writeInt32LE(strings + 8, directory);
    mdl.writeInt32LE(1, body + 4); mdl.writeInt32LE(model - body, body + 12);
    mdl.write('triangle', model); mdl.writeInt32LE(1, model + 72); mdl.writeInt32LE(mesh - model, model + 76);
    mdl.writeInt32LE(3, model + 80); mdl.writeInt32LE(3, mesh + 8);

    const vvd = Buffer.alloc(64 + 3 * 64);
    vvd.write('IDSV'); vvd.writeInt32LE(4, 4); vvd.writeInt32LE(checksum, 8);
    vvd.writeInt32LE(1, 12); vvd.writeInt32LE(3, 16); vvd.writeInt32LE(64, 56); vvd.writeInt32LE(208, 60);
    const positions = [[-1, 0, 0], [1, 0, 0], [0, 0, 2]];
    positions.forEach((position, i) => {
        const at = 64 + i * 48;
        vvd.writeFloatLE(1, at); vvd[at + 15] = 1;
        position.forEach((value, axis) => vvd.writeFloatLE(value, at + 16 + axis * 4));
        vvd.writeFloatLE(-1, at + 32);
    });

    const vtx = Buffer.alloc(182);
    // Header, empty material replacement list, body, model, LOD, mesh, group, strip, vertices, indices.
    for (const [at, value] of [[0, 7], [16, checksum], [20, 1], [24, 36], [28, 1], [32, 44],
        [44, 1], [48, 8], [52, 1], [56, 8], [60, 1], [64, 12], [72, 1], [76, 9],
        [81, 3], [85, 68], [89, 3], [93, 95], [97, 1], [101, 33], [114, 3], [122, 3]]) vtx.writeInt32LE(value, at);
    vtx[132] = 1; // triangle list
    for (let i = 0; i < 3; i++) { vtx.writeUInt16LE(i, 149 + i * 9 + 4); vtx.writeUInt16LE(i, 176 + i * 2); }
    return { mdl, vvd, vtx, vmt: Buffer.from('VertexLitGeneric\n{\n"$basetexture" "review/preview"\n}\n') };
}

export function arrayBuffer(bytes) { return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength); }
