import { getMaterialPath } from './materialPaths.js';
import { loadResource } from './loadResource.js';
import {
	DefaultLoadingManager,
	MeshPhongMaterial,
	RepeatWrapping,
	LinearEncoding,
} from 'three';
import { VTFLoader } from './VTFLoader.js';

// VMT: https://developer.valvesoftware.com/wiki/VMT

function addExt( path, ext ) {

	const re = new RegExp( `.${ ext }$`, 'i' );
	if ( re.test( path ) ) return path;
	else return `${ path }.${ ext }`;

}

const VMTLoader = function ( manager, loadFile ) {

	this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
	this.loadFile = loadFile;

};

VMTLoader.prototype = {

	constructor: VMTLoader,

	load: function ( url, onLoad, onProgress, onError ) {

		const scope = this;

		return loadResource( this, url, 'VMT', text => onLoad( scope.parse( text, url ) ), onProgress, onError );

	},

	// TODO: Fix this url use and follow the "path" pattern of other loaders
	parse: function ( string, url ) {

		let parseWork = 0;

		let type = '';
		let root = null;
		const objects = [];
		let currData = '';
		for ( let i = 0, l = string.length; i < l; i ++ ) {
			if ( ++ parseWork > 100000 ) throw new Error( 'Source parser work limit exceeded.' );

			const c = string[ i ];
			if ( c === '{' ) {

				const newObj = {};
				if ( objects.length === 0 ) {

					type += currData;

				} else {

					objects[ objects.length - 1 ][ currData.trim() ] = newObj;

				}

				objects.push( newObj );
				if ( root === null ) {

					root = newObj;

				}

				currData = '';

			} else if ( c === '}' ) {

				objects.pop();

			} else if ( c === '\n' ) {

				if ( objects.length === 0 ) {

					type += currData;

				} else {

					const tokens = currData.trim().split( /\s+/ );
					if ( tokens.length >= 2 ) {

						const mapped = tokens.map( t => t.replace( /"/g, '' ) );
						const name = mapped[ 0 ];
						let contents = mapped[ 1 ];

						if ( /^\[/.test( contents ) ) {

							contents = contents
								.replace( /[\[\]]/g, '' )
								.split( /\s+/g )
								.map( n => parseFloat( n ) );

						} else if ( /^\d*\.?\d*$/.test( contents ) ) {

							contents = parseFloat( contents );

						}

						objects[ objects.length - 1 ][ name ] = contents;


					}

				}

				currData = '';

			} else {

				currData += c;

			}

		}

		// TODO: Repeat wrapping should be handled in the VFT loads
		const path = this.materialPath || getMaterialPath( url, 'materials' );
		const material = new MeshPhongMaterial();
		const vtfLoader = this.loadTexture ? { load: this.loadTexture } : new VTFLoader( this.manager );
		for ( const key in root ) {
			if ( ++ parseWork > 100000 ) throw new Error( 'Source parser work limit exceeded.' );

			// TODO: Use more keys
			// TODO: bump map is causing all normals to disappear here
			const field = root[ key ];
			switch ( key.toLowerCase() ) {

			case '$basetexture':
				material.map = vtfLoader.load( addExt( `${ path }${ field }`, 'vtf' ) );
				material.map.wrapS = RepeatWrapping;
				material.map.wrapT = RepeatWrapping;
				material.map.encoding = LinearEncoding;
				break;
			case '$bumpmap':
				// TODO: This doesn't seem to quite map correctly to normal map
				// material.normalMap = vtfLoader.load( addExt( `${ path }${ field }`, '.vtf' ) );
				// material.normalMap.wrapS = RepeatWrapping;
				// material.normalMap.wrapT = RepeatWrapping;
				break;
			case '$phongexponenttexture':
				// TODO: This doesn't quite map appropriately to a specular map
				material.specularMap = vtfLoader.load( addExt( `${ path }${ field }`, 'vtf' ) );
				material.specularMap.wrapS = RepeatWrapping;
				material.specularMap.wrapT = RepeatWrapping;
				break;

			}

		}

		return material;

	}

};

export { VMTLoader };
