import { FileLoader } from 'three';

// Embedders can supply their own transport (validation, credentials, cancellation, etc.).
// Parsing failures must reach the same error callback as transport failures.
export function loadResource( loader, url, kind, onLoad, onProgress, onError ) {

	const loaded = data => {

		try { onLoad( data ); } catch ( error ) { if ( onError ) onError( error ); }

	};
	try {

		if ( loader.loadFile ) return loader.loadFile( url, kind, loaded, onProgress, onError );
		const file = new FileLoader( loader.manager );
		file.setPath( loader.path );
		file.setResponseType( kind === 'VMT' ? 'text' : 'arraybuffer' );
		return file.load( url, loaded, onProgress, onError );

	} catch ( error ) {

		if ( onError ) onError( error );

	}

}
