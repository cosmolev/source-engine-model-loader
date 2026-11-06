// A loose model shares its upload directory with materials/. Source game trees instead
// place materials/ beside models/. Match complete directory segments, not filenames.
export function getMaterialPath( url, directory = 'models' ) {

	const marker = `/${ directory }/`;
	const index = url.lastIndexOf( marker );
	const root = index === - 1 ? url.slice( 0, url.lastIndexOf( '/' ) + 1 ) : url.slice( 0, index + 1 );
	return `${ root }materials/`;

}

export function materialCandidates( path, directories, name ) {

	return [ ...new Set( ( directories.length ? directories : [ '' ] ).map( directory => {

		directory = directory.replace( /\\/g, '/' );
		name = name.replace( /\\/g, '/' );
		return `${ path }${ directory }${ directory && ! directory.endsWith( '/' ) ? '/' : '' }${ name }${ /\.vmt$/i.test( name ) ? '' : '.vmt' }`;

	} ) ) ];

}

// Search in the order recorded by the MDL. A failed candidate is not a missing
// dependency when another search directory contains the material.
export async function loadMaterial( loader, candidates ) {

	for ( const url of candidates ) {

		const material = await new Promise( resolve => {

			try { loader.load( url, resolve, undefined, () => resolve( null ) ); }
			catch ( error ) { resolve( null ); }

		} );
		if ( material ) return material;

	}
	return null;

}
