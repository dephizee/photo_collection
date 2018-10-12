var http = require('http');
var url = require('url');
var join = require('path').join;
var qs = require('querystring');
var fs = require('fs');
var mkdirp = require('mkdirp');
var formidable = require('formidable');
var fileServer = require('./lib/fileserver.js');
var mysql = require('mysql');
var db = mysql.createConnection({
	host: '127.0.0.1',
	user: 'root',
	password: '',
	database: 'photo_collection' 
});
db.connect(function(err) {
	if(err)throw err;
	console.log("connected");
});
http.createServer(function(req, resp) {
	switch (req.method) {
		case 'GET':
			var new_uri = url.parse(req.url);
			if(new_uri.pathname.indexOf('/public/images')== 0){
				// console.log(new_uri);
				fs.createReadStream('.'+new_uri.pathname).pipe(resp);
				// resp.end("a phto");
				return;	
			}
			if(new_uri.pathname == '/api' ){
				if(new_uri.query == null){
					// console.log('Invalid api');
					fs.createReadStream('./public/form.html').pipe(resp);
					return;
				}
				var para = new_uri.query.split('&');
				// console.log(para[0].split('='));
				// console.log(para[1].split('='));
				db.query("select * from users where email = ?", para[0].split('=')[1], function (err, row) {
					if(err) throw err;
					console.log(row);
					if(row.length == 0){
						fileServer.addUser(db, para[0].split('=')[1], para[1].split('=')[1]);
						resp.end('New Acccount');
					}else{
						resp.setHeader('exist_before', true);
						resp.end(JSON.stringify(row));
					}
					
				});	
			}
			break;
		case 'POST':
		var body = '';
			var new_post_uri = url.parse(req.url);
			if(new_post_uri.pathname == '/addcollection'){
				// console.log(new_post_uri);
				body = '';
				req.on('data', function(chunk) {
					body += chunk;
				});
				req.on('end', function() {
					var parameters = qs.parse(body);
					// console.log(parameters);
					db.query("insert into collections (collection_name, user_no) values (?,?)", [parameters.collection_name, parameters.user_no], function (err, row) {
						if(err) throw err;
						var jsonresp = fileServer.listCollection(db, parameters.user_no, resp);
						// resp.end(JSON.stringify(row));
					});
				});
				return;	
			}
			if(new_post_uri.pathname == '/login'){
				// console.log(new_post_uri);
				body = '';
				req.on('data', function(chunk) {
					body += chunk;
				});
				req.on('end', function() {
					var parameters = qs.parse(body);
					// console.log(parameters);
					fileServer.login(db, parameters, resp);
				});
				return;	
			}
			if(new_post_uri.pathname == '/listcollection'){
				// console.log(new_post_uri);
				body = '';
				req.on('data', function(chunk) {
					body += chunk;
				});
				req.on('end', function() {
					var parameters = qs.parse(body);
					// console.log(parameters);
					fileServer.listCollection(db, parameters.user_no, resp);
				});
				return;	
			}
			if(new_post_uri.pathname.indexOf('/listphoto')== 0){
				// console.log(new_post_uri.pathname.split("/")[2]);
				
				fileServer.listPhoto(db, new_post_uri.pathname.split("/")[2], resp);
				return;	
			}
			
			
			if(new_post_uri.pathname == '/upload'){
				body = '';
				// console.log(req.headers['content-type']);
					
				var form = new formidable.IncomingForm();
				form.parse(req, function (err, fields, files) {
					if(err)throw err;
					// console.log("Successfully formidable");
					db.query("select * from photographs where collection_number = ?", fields.file_details, function (err, row) {
						if(err) throw err;
						// console.log(row);
						var new_url = "public/images/"+fields.file_details;
						mkdirp(new_url, function (err) {
							if(err)throw err;
							// console.log("Successfully made dir");
							fs.rename(files.uploaded_file.path, new_url+"/"+row.length+".jpg", function (err) {
								if (err) throw err;
								// console.log("Successfully Uploaded");
								fileServer.addPhoto(db, new_url+"/"+row.length+".jpg", fields.file_details, resp);
							});
							// console.log(files.uploaded_file.name);
						});
						
					});
					
				});
				return;
			}
			
			// form.on('')
			// resp.end("success");
			// form.on('progress', function(cur, total) {
			// 	console.log(Math.floor(cur/total * 100));
			// });
			// req.on('data', function(chunk) {
			// 	body += chunk;
			// });
			// req.on('end', function () {
			// 	console.log(body);
			// 	resp.end("success");
			// });
			// req.on('end', function(chunk) {
				
			// 	// mkdirp('public/images/test', function (err) {
			// 	// 	if(err)throw err;
			// 	// 	console.log("Successfully made dir");
			// 	// });
			// 	// fs.writeFile(join(__dirname,"public/images/test/32.jpg"), body, function (err) {
			// 	// 	if(err)throw err;
			// 	// 	console.log("Successfull");
			// 	// });
				
			// });
			// req.on('end', function() {
			// 	var parameters = qs.parse(body);
			// 	console.log(parameters);
			// 	db.query("select * from users where email = ?", parameters.email, function (err, row) {
			// 		if(err) throw err;
			// 		console.log(row);
			// 		if(row.length == 0){
			// 			fileServer.addUser(db, parameters.email, parameters.password);
			// 			resp.end('New Acccount');
			// 		}else{
			// 			resp.setHeader('exist_before', true);
			// 			resp.end(JSON.stringify(row));
			// 		}
					
			// 	});
			// });
			
			break;
	
		default:
			break;
	}
}).listen(3030 || process.env.PORT, function() {
	console.log("Listening to 3030");
});
fileServer.printcwd("runing");

