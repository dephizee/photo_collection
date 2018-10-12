	exports.printcwd = function (ss='working') {
	console.log(ss+" "+process.cwd());
};
exports.addUser = function(db, email, pass){
	db.query("insert into users (email, password) values (?,?)", [email, pass], function (err, row) {
		if(err) throw err;
		// console.log(row);
	});	
};
exports.listCollection = function(db, user_no, resp) {
	db.query("select * from collections where user_no = ?", user_no, function (err, row) {
		if(err) throw err;
		resp.end(JSON.stringify(row));
	});
};
exports.listPhoto = function(db, collection_no, resp) {
	db.query("select * from photographs where collection_number = ?", collection_no, function (err, row) {
		if(err) throw err;
		// console.log(row);
		resp.end(JSON.stringify(row));
	});
};
exports.addPhoto = function(db, url, no, resp){
	db.query("insert into photographs (photo_url, collection_number) values (?,?)", [url, no], function (err, row) {
		if(err) throw err;
		// console.log(row);
		
		exports.listPhoto(db, no, resp);
	});	
};
exports.login = function(db, param, resp) {
	db.query("select * from users where email = ? and password = ?", [param.email, param.password], function (err, row) {
		if(err) throw err;
		// console.log(row);
		resp.end(JSON.stringify(row));
	});
};