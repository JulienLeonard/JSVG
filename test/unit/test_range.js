QUnit.test( "range R builder", 
			function( assert ) {
				var crange= new R(0.0,1.0);

				assert.equal( crange.v1(), 0.0, "v1" );
				assert.equal( crange.v2(), 1.0, "v2" );
			}
	);