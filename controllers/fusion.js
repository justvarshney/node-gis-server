var pg = require('pg');
var geojson = require('../helpers/geojson');
var jsonp = require('../helpers/jsonp');

module.exports.controller = function (app) {

	/* enable CORS */
	app.all('*', function (req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});

	/* feature retrieval */

	/**
	 * retrieve all features (this could be really slow and is probably not what you really want to do)
	 */
	 
 app.get('/id', function(req, res){
	res.send('id: ' + req.query.id);
	console.log(req.query.id);
 });

 app.get('/fusion', function (req, res, next) {
	 var client = new pg.Client(app.conString);
	 var minx=req.query.minx;
	 var miny=req.query.miny;
	 var maxx=req.query.maxx;
	 var maxy=req.query.maxy;
	 var srid=req.query.srid;
	 
	 //res.send('minx: ' + minx + 'miny: ' + miny + 'maxx: '+ maxx + 'maxy: ' + maxy + 'srid: ' + srid);
	 
	//var sql = "SELECT st_asgeojson(st_transform(wkb_geometry," + srid + ")) as geojson, hazdesc,burnfreq,parceldens,foehnwinds FROM li.ca_firerisk as mytable WHERE mytable.wkb_geometry && ST_MakeEnvelope(" + minx + "," + miny + "," + maxx + "," + maxy + "," + srid + ") limit 2000;";
	//var sql = "SELECT st_asgeojson(st_transform(wkb_geometry,3857)) as geojson, a.* FROM li.blockgroup as mytable, li.customer a WHERE mytable.wkb_geometry && ST_MakeEnvelope(" + minx + "," + miny + "," + maxx + "," + maxy + "," + srid + ") and replace(a.block,'''','')=mytable.bkg_key;";
       //var sql = "SELECT st_asgeojson(st_transform(wkb_geometry," + srid + ")) as geojson, a.* FROM li.blockgroup as mytable, li.customer a WHERE mytable.wkb_geometry && ST_MakeEnvelope(" + minx + "," + miny + "," + maxx + "," + maxy + "," + srid + ") limit 2000;";
        var sql = "SELECT st_asgeojson(st_transform(wkb_geometry," + srid + ")) as geojson, * FROM li.blockgroup as mytable WHERE mytable.wkb_geometry && ST_MakeEnvelope(" + minx + "," + miny + "," + maxx + "," + maxy + "," + srid + ") limit 2000;";


console.log(sql);

	
	
			var crsobj = {
			"type" : "name",
			"properties" : {
				"name" : "urn:ogc:def:crs:EPSG:6.3:" + srid
			}
		};
		client.connect();
		var spatialcol = "";
		var tablename="ca_firerisk";
		var schemaname="li";
		var meta = client.query("select * from geometry_columns where f_table_name = '" + tablename + "' and f_table_schema = '" + schemaname + "';");
		meta.on('row', function (row) {
			var query;
			var coll;
			spatialcol = row.f_geometry_column;
			query = client.query(sql);
			coll = {
					type : "FeatureCollection",
					features : []
				};
		res.writeHead(200, {'Content-Type':'application/json'});
			query.on('row', function (result) {
				if (!result) {
					return res.send('No data found');
				} else {
					//coll.features.push(geojson.getFeatureResult(result, spatialcol));
				}
					res.write(jsonp.getJsonP(req.query.callback, geojson.getFeatureResult(result, spatialcol)));
					res.write("\n");
			});

			query.on('end', function (err, result) {
				//res.setHeader('Content-Type', 'application/json');
				//res.send(jsonp.getJsonP(req.query.callback, coll));
res.end();
console.log("Completed");
			});

			query.on('error', function (error) {
				//handle the error
				//res.status(500).send(error);
				next();
			});	 
	 
	});
}); 
}
