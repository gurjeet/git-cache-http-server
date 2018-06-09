// Generated by Haxe 4.0.0 (git build development @ e4774776c)
if (process.version < "v4.0.0") console.warn("Module " + (typeof(module) == "undefined" ? "" : module.filename) + " requires node.js version 4.0.0 or higher");
(function () { "use strict";
var $estr = function() { return js_Boot.__string_rec(this,''); };
function $extend(from, fields) {
	function Inherit() {} Inherit.prototype = from; var proto = new Inherit();
	for (var name in fields) proto[name] = fields[name];
	if( fields.toString !== Object.prototype.toString ) proto.toString = fields.toString;
	return proto;
}
var EReg = function(r,opt) {
	this.r = new RegExp(r,opt.split("u").join(""));
};
EReg.__name__ = true;
EReg.prototype = {
	match: function(s) {
		if(this.r.global) {
			this.r.lastIndex = 0;
		}
		this.r.m = this.r.exec(s);
		this.r.s = s;
		return this.r.m != null;
	}
	,matched: function(n) {
		if(this.r.m != null && n >= 0 && n < this.r.m.length) {
			return this.r.m[n];
		} else {
			throw new js__$Boot_HaxeError("EReg::matched");
		}
	}
};
var HxOverrides = function() { };
HxOverrides.__name__ = true;
HxOverrides.cca = function(s,index) {
	var x = s.charCodeAt(index);
	if(x != x) {
		return undefined;
	}
	return x;
};
HxOverrides.substr = function(s,pos,len) {
	if(len == null) {
		len = s.length;
	} else if(len < 0) {
		if(pos == 0) {
			len = s.length + len;
		} else {
			return "";
		}
	}
	return s.substr(pos,len);
};
var Main = function() { };
Main.__name__ = true;
Main.safeUser = function(basic) {
	var basic1 = basic.split(":");
	if(basic1.length != 2) {
		throw new js__$Boot_HaxeError("ERR: invalid Basic HTTP authentication");
	}
	var user = basic1[0];
	var pwd = basic1[1];
	if((user == pwd || pwd == "" || new EReg("oauth","").match(pwd)) && user.length > 5) {
		user = HxOverrides.substr(user,0,5) + "...";
	}
	return user;
};
Main.parseAuth = function(s) {
	if(s == null) {
		return null;
	}
	var parts = s.split(" ");
	if(parts[0] != "Basic") {
		throw new js__$Boot_HaxeError("ERR: HTTP authentication schemes other than Basic not supported");
	}
	return { authorization : s, basic : haxe_crypto_Base64.decode(parts[1]).toString()};
};
Main.getParams = function(req) {
	var r = new EReg("^/(.+)(.git)?/(info/refs\\?service=)?(git-[^-]+-pack)$","");
	if(!r.match(req.url)) {
		throw new js__$Boot_HaxeError("Cannot deal with url");
	}
	return { repo : r.matched(1), auth : Main.parseAuth(req.headers["authorization"]), service : r.matched(4), isInfoRequest : r.matched(3) != null};
};
Main.clone = function(remote,local,callback) {
	js_node_ChildProcess.exec("git clone --quiet --mirror \"" + remote + "\" \"" + local + "\"",callback);
};
Main.fetch = function(remote,local,callback) {
	js_node_ChildProcess.exec("git -C \"" + local + "\" remote set-url origin \"" + remote + "\"",function(err,stdout,stderr) {
		js_node_ChildProcess.exec("git -C \"" + local + "\" fetch --quiet",callback);
	});
};
Main.authenticate = function(params,infos,callback) {
	console.log("Main.hx:58:","INFO: authenticating on the upstream repo " + infos);
	var req = js_node_Https.request("https://" + params.repo + "/info/refs?service=" + params.service,callback);
	req.setHeader("User-Agent","git/");
	if(params.auth != null) {
		req.setHeader("Authorization",params.auth.authorization);
	}
	req.end();
};
Main.update = function(remote,local,infos,callback) {
	var _this = Main.updatePromises;
	if(!(__map_reserved[local] != null ? _this.existsReserved(local) : _this.h.hasOwnProperty(local))) {
		var this1 = Main.updatePromises;
		var v = new Promise(function(resolve,reject) {
			console.log("Main.hx:70:","INFO: updating: fetching from " + infos);
			Main.fetch(remote,local,function(ferr,stdout,stderr) {
				if(ferr != null) {
					console.log("Main.hx:73:","WARN: updating: fetch failed");
					console.log("Main.hx:74:",stdout);
					console.log("Main.hx:75:",stderr);
					console.log("Main.hx:76:","WARN: continuing with clone");
					Main.clone(remote,local,function(cerr,stdout1,stderr1) {
						if(cerr != null) {
							console.log("Main.hx:79:",stdout1);
							console.log("Main.hx:80:",stderr1);
							resolve("ERR: git clone exited with non-zero status: " + cerr.code);
						} else {
							console.log("Main.hx:83:","INFO: updating via clone: success");
							resolve(null);
						}
					});
				} else {
					console.log("Main.hx:88:","INFO: updating via fetch: success");
					resolve(null);
				}
			});
		}).then(function(success) {
			Main.updatePromises.remove(local);
			return Promise.resolve(success);
		})["catch"](function(err) {
			Main.updatePromises.remove(local);
			return Promise.reject(err);
		});
		var _this1 = this1;
		if(__map_reserved[local] != null) {
			_this1.setReserved(local,v);
		} else {
			_this1.h[local] = v;
		}
	} else {
		console.log("Main.hx:102:","INFO: reusing existing promise");
	}
	var _this2 = Main.updatePromises;
	return (__map_reserved[local] != null ? _this2.getReserved(local) : _this2.h[local]).then(function(nothing) {
		console.log("Main.hx:106:","INFO: promise fulfilled");
		callback(null);
	},function(err1) {
		callback(err1);
	});
};
Main.handleRequest = function(req,res) {
	try {
		console.log("Main.hx:116:","" + req.method + " " + req.url);
		var params = Main.getParams(req);
		var infos = "" + params.repo;
		if(params.auth != null) {
			infos += " (user " + Main.safeUser(params.auth.basic) + ")";
		}
		var _g = params.isInfoRequest;
		var _g1 = req.method == "GET";
		switch(_g1) {
		case false:
			if(_g != false) {
				var m = _g1;
				var i = _g;
				throw new js__$Boot_HaxeError("isInfoRequest=" + (i == null ? "null" : "" + i) + " but isPOST=" + (m == null ? "null" : "" + m));
			}
			break;
		case true:
			if(_g != true) {
				var m1 = _g1;
				var i1 = _g;
				throw new js__$Boot_HaxeError("isInfoRequest=" + (i1 == null ? "null" : "" + i1) + " but isPOST=" + (m1 == null ? "null" : "" + m1));
			}
			break;
		}
		if(params.service != "git-upload-pack") {
			throw new js__$Boot_HaxeError("Service " + params.service + " not supported yet");
		}
		var remote = params.auth == null ? "https://" + params.repo : "https://" + params.auth.basic + "@" + params.repo;
		var local = js_node_Path.join(Main.cacheDir,params.repo);
		Main.authenticate(params,infos,function(upRes) {
			var _g2 = upRes.statusCode;
			switch(_g2) {
			case 200:
				break;
			case 401:case 403:case 404:
				res.writeHead(upRes.statusCode,upRes.headers);
				res.end();
				return;
			}
			if(params.isInfoRequest) {
				Main.update(remote,local,infos,function(err) {
					if(err != null) {
						console.log("Main.hx:148:","ERR: " + err);
						console.log("Main.hx:149:",haxe_CallStack.toString(haxe_CallStack.exceptionStack()));
						res.statusCode = 500;
						res.end();
						return;
					}
					res.statusCode = 200;
					res.setHeader("Content-Type","application/x-" + params.service + "-advertisement");
					res.setHeader("Cache-Control","no-cache");
					res.write("001e# service=git-upload-pack\n0000");
					var up = js_node_ChildProcess.spawn(params.service,["--stateless-rpc","--advertise-refs",local]);
					up.stdout.pipe(res);
					up.stderr.on("data",function(data) {
						console.log("Main.hx:160:","" + params.service + " stderr: " + data);
					});
					up.on("exit",function(code) {
						if(code != 0) {
							res.end();
						}
						console.log("Main.hx:164:","INFO: " + params.service + " done with exit " + code);
					});
				});
			} else {
				res.statusCode = 200;
				res.setHeader("Content-Type","application/x-" + params.service + "-result");
				res.setHeader("Cache-Control","no-cache");
				var up1 = js_node_ChildProcess.spawn(params.service,["--stateless-rpc",local]);
				if(req.headers["content-encoding"] == "gzip") {
					var tmp = js_node_Zlib.createUnzip();
					req.pipe(tmp).pipe(up1.stdin);
				} else {
					req.pipe(up1.stdin);
				}
				up1.stdout.pipe(res);
				up1.stderr.on("data",function(data1) {
					console.log("Main.hx:178:","" + params.service + " stderr: " + data1);
				});
				up1.on("exit",function(code1) {
					if(code1 != 0) {
						res.end();
					}
					console.log("Main.hx:182:","" + params.service + " done with exit " + code1);
				});
			}
		});
	} catch( err1 ) {
		haxe_CallStack.lastException = err1;
		if (err1 instanceof js__$Boot_HaxeError) err1 = err1.val;
		console.log("Main.hx:187:","ERROR: " + Std.string(err1));
		console.log("Main.hx:188:",haxe_CallStack.toString(haxe_CallStack.exceptionStack()));
		res.statusCode = 500;
		res.end();
	}
};
Main.main = function() {
	var options = js_npm_Docopt.docopt(Main.usage,{ version : "0.0.2"});
	Main.cacheDir = options["--cache-dir"];
	Main.listenPort = Std.parseInt(options["--port"]);
	if(Main.listenPort == null || Main.listenPort < 1 || Main.listenPort > 65535) {
		throw new js__$Boot_HaxeError("Invalid port number: " + Std.string(options["--port"]));
	}
	console.log("Main.hx:220:","INFO: cache directory: " + Main.cacheDir);
	console.log("Main.hx:221:","INFO: listening to port: " + Main.listenPort);
	var server = js_node_Http.createServer(Main.handleRequest);
	server.setTimeout(7200000);
	server.listen(Main.listenPort);
};
Math.__name__ = true;
var Std = function() { };
Std.__name__ = true;
Std.string = function(s) {
	return js_Boot.__string_rec(s,"");
};
Std.parseInt = function(x) {
	var v = parseInt(x,10);
	if(v == 0 && (HxOverrides.cca(x,1) == 120 || HxOverrides.cca(x,1) == 88)) {
		v = parseInt(x);
	}
	if(isNaN(v)) {
		return null;
	}
	return v;
};
var StringBuf = function() {
	this.b = "";
};
StringBuf.__name__ = true;
var StringTools = function() { };
StringTools.__name__ = true;
StringTools.isSpace = function(s,pos) {
	var c = HxOverrides.cca(s,pos);
	if(!(c > 8 && c < 14)) {
		return c == 32;
	} else {
		return true;
	}
};
StringTools.ltrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,r)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,r,l - r);
	} else {
		return s;
	}
};
StringTools.rtrim = function(s) {
	var l = s.length;
	var r = 0;
	while(r < l && StringTools.isSpace(s,l - r - 1)) ++r;
	if(r > 0) {
		return HxOverrides.substr(s,0,l - r);
	} else {
		return s;
	}
};
StringTools.trim = function(s) {
	return StringTools.ltrim(StringTools.rtrim(s));
};
var Version = function() { };
Version.__name__ = true;
var haxe_StackItem = { __ename__ : true, __constructs__ : ["CFunction","Module","FilePos","Method","LocalFunction"] };
haxe_StackItem.CFunction = ["CFunction",0];
haxe_StackItem.CFunction.toString = $estr;
haxe_StackItem.CFunction.__enum__ = haxe_StackItem;
haxe_StackItem.Module = function(m) { var $x = ["Module",1,m]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.FilePos = function(s,file,line) { var $x = ["FilePos",2,s,file,line]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.Method = function(classname,method) { var $x = ["Method",3,classname,method]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
haxe_StackItem.LocalFunction = function(v) { var $x = ["LocalFunction",4,v]; $x.__enum__ = haxe_StackItem; $x.toString = $estr; return $x; };
var haxe_CallStack = function() { };
haxe_CallStack.__name__ = true;
haxe_CallStack.getStack = function(e) {
	if(e == null) {
		return [];
	}
	var oldValue = Error.prepareStackTrace;
	Error.prepareStackTrace = function(error,callsites) {
		var stack = [];
		var _g = 0;
		while(_g < callsites.length) {
			var site = callsites[_g];
			++_g;
			if(haxe_CallStack.wrapCallSite != null) {
				site = haxe_CallStack.wrapCallSite(site);
			}
			var method = null;
			var fullName = site.getFunctionName();
			if(fullName != null) {
				var idx = fullName.lastIndexOf(".");
				if(idx >= 0) {
					var className = HxOverrides.substr(fullName,0,idx);
					var methodName = HxOverrides.substr(fullName,idx + 1,null);
					method = haxe_StackItem.Method(className,methodName);
				}
			}
			stack.push(haxe_StackItem.FilePos(method,site.getFileName(),site.getLineNumber()));
		}
		return stack;
	};
	var a = haxe_CallStack.makeStack(e.stack);
	Error.prepareStackTrace = oldValue;
	return a;
};
haxe_CallStack.exceptionStack = function() {
	return haxe_CallStack.getStack(haxe_CallStack.lastException);
};
haxe_CallStack.toString = function(stack) {
	var b = new StringBuf();
	var _g = 0;
	while(_g < stack.length) {
		var s = stack[_g];
		++_g;
		b.b += "\nCalled from ";
		haxe_CallStack.itemToString(b,s);
	}
	return b.b;
};
haxe_CallStack.itemToString = function(b,s) {
	switch(s[1]) {
	case 0:
		b.b += "a C function";
		break;
	case 1:
		var m = s[2];
		b.b += "module ";
		b.b += m == null ? "null" : "" + m;
		break;
	case 2:
		var line = s[4];
		var file = s[3];
		var s1 = s[2];
		if(s1 != null) {
			haxe_CallStack.itemToString(b,s1);
			b.b += " (";
		}
		b.b += file == null ? "null" : "" + file;
		b.b += " line ";
		b.b += line == null ? "null" : "" + line;
		if(s1 != null) {
			b.b += ")";
		}
		break;
	case 3:
		var meth = s[3];
		var cname = s[2];
		b.b += cname == null ? "null" : "" + cname;
		b.b += ".";
		b.b += meth == null ? "null" : "" + meth;
		break;
	case 4:
		var n = s[2];
		b.b += "local function #";
		b.b += n == null ? "null" : "" + n;
		break;
	}
};
haxe_CallStack.makeStack = function(s) {
	if(s == null) {
		return [];
	} else if(typeof(s) == "string") {
		var stack = s.split("\n");
		if(stack[0] == "Error") {
			stack.shift();
		}
		var m = [];
		var rie10 = new EReg("^   at ([A-Za-z0-9_. ]+) \\(([^)]+):([0-9]+):([0-9]+)\\)$","");
		var _g = 0;
		while(_g < stack.length) {
			var line = stack[_g];
			++_g;
			if(rie10.match(line)) {
				var path = rie10.matched(1).split(".");
				var meth = path.pop();
				var file = rie10.matched(2);
				var line1 = Std.parseInt(rie10.matched(3));
				m.push(haxe_StackItem.FilePos(meth == "Anonymous function" ? haxe_StackItem.LocalFunction() : meth == "Global code" ? null : haxe_StackItem.Method(path.join("."),meth),file,line1));
			} else {
				m.push(haxe_StackItem.Module(StringTools.trim(line)));
			}
		}
		return m;
	} else {
		return s;
	}
};
var haxe_IMap = function() { };
haxe_IMap.__name__ = true;
var haxe_io_Bytes = function(data) {
	this.length = data.byteLength;
	this.b = new Uint8Array(data);
	this.b.bufferValue = data;
	data.hxBytes = this;
	data.bytes = this.b;
};
haxe_io_Bytes.__name__ = true;
haxe_io_Bytes.ofString = function(s) {
	var a = [];
	var i = 0;
	while(i < s.length) {
		var c = s.charCodeAt(i++);
		if(55296 <= c && c <= 56319) {
			c = c - 55232 << 10 | s.charCodeAt(i++) & 1023;
		}
		if(c <= 127) {
			a.push(c);
		} else if(c <= 2047) {
			a.push(192 | c >> 6);
			a.push(128 | c & 63);
		} else if(c <= 65535) {
			a.push(224 | c >> 12);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		} else {
			a.push(240 | c >> 18);
			a.push(128 | c >> 12 & 63);
			a.push(128 | c >> 6 & 63);
			a.push(128 | c & 63);
		}
	}
	return new haxe_io_Bytes(new Uint8Array(a).buffer);
};
haxe_io_Bytes.prototype = {
	getString: function(pos,len) {
		if(pos < 0 || len < 0 || pos + len > this.length) {
			throw new js__$Boot_HaxeError(haxe_io_Error.OutsideBounds);
		}
		var s = "";
		var b = this.b;
		var fcc = String.fromCharCode;
		var i = pos;
		var max = pos + len;
		while(i < max) {
			var c = b[i++];
			if(c < 128) {
				if(c == 0) {
					break;
				}
				s += fcc(c);
			} else if(c < 224) {
				s += fcc((c & 63) << 6 | b[i++] & 127);
			} else if(c < 240) {
				var c2 = b[i++];
				s += fcc((c & 31) << 12 | (c2 & 127) << 6 | b[i++] & 127);
			} else {
				var c21 = b[i++];
				var c3 = b[i++];
				var u = (c & 15) << 18 | (c21 & 127) << 12 | (c3 & 127) << 6 | b[i++] & 127;
				s += fcc((u >> 10) + 55232);
				s += fcc(u & 1023 | 56320);
			}
		}
		return s;
	}
	,toString: function() {
		return this.getString(0,this.length);
	}
};
var haxe_crypto_Base64 = function() { };
haxe_crypto_Base64.__name__ = true;
haxe_crypto_Base64.decode = function(str,complement) {
	if(complement == null) {
		complement = true;
	}
	if(complement) {
		while(HxOverrides.cca(str,str.length - 1) == 61) str = HxOverrides.substr(str,0,-1);
	}
	return new haxe_crypto_BaseCode(haxe_crypto_Base64.BYTES).decodeBytes(haxe_io_Bytes.ofString(str));
};
var haxe_crypto_BaseCode = function(base) {
	var len = base.length;
	var nbits = 1;
	while(len > 1 << nbits) ++nbits;
	if(nbits > 8 || len != 1 << nbits) {
		throw new js__$Boot_HaxeError("BaseCode : base length must be a power of two.");
	}
	this.base = base;
	this.nbits = nbits;
};
haxe_crypto_BaseCode.__name__ = true;
haxe_crypto_BaseCode.prototype = {
	initTable: function() {
		var tbl = [];
		var _g = 0;
		while(_g < 256) {
			var i = _g++;
			tbl[i] = -1;
		}
		var _g1 = 0;
		var _g2 = this.base.length;
		while(_g1 < _g2) {
			var i1 = _g1++;
			tbl[this.base.b[i1]] = i1;
		}
		this.tbl = tbl;
	}
	,decodeBytes: function(b) {
		var nbits = this.nbits;
		var base = this.base;
		if(this.tbl == null) {
			this.initTable();
		}
		var tbl = this.tbl;
		var size = b.length * nbits >> 3;
		var out = new haxe_io_Bytes(new ArrayBuffer(size));
		var buf = 0;
		var curbits = 0;
		var pin = 0;
		var pout = 0;
		while(pout < size) {
			while(curbits < 8) {
				curbits += nbits;
				buf <<= nbits;
				var i = tbl[b.b[pin++]];
				if(i == -1) {
					throw new js__$Boot_HaxeError("BaseCode : invalid encoded char");
				}
				buf |= i;
			}
			curbits -= 8;
			out.b[pout++] = buf >> curbits & 255 & 255;
		}
		return out;
	}
};
var haxe_ds_StringMap = function() {
	this.h = { };
};
haxe_ds_StringMap.__name__ = true;
haxe_ds_StringMap.__interfaces__ = [haxe_IMap];
haxe_ds_StringMap.prototype = {
	setReserved: function(key,value) {
		if(this.rh == null) {
			this.rh = { };
		}
		this.rh["$" + key] = value;
	}
	,getReserved: function(key) {
		if(this.rh == null) {
			return null;
		} else {
			return this.rh["$" + key];
		}
	}
	,existsReserved: function(key) {
		if(this.rh == null) {
			return false;
		}
		return this.rh.hasOwnProperty("$" + key);
	}
	,remove: function(key) {
		if(__map_reserved[key] != null) {
			key = "$" + key;
			if(this.rh == null || !this.rh.hasOwnProperty(key)) {
				return false;
			}
			delete(this.rh[key]);
			return true;
		} else {
			if(!this.h.hasOwnProperty(key)) {
				return false;
			}
			delete(this.h[key]);
			return true;
		}
	}
};
var haxe_io_Error = { __ename__ : true, __constructs__ : ["Blocked","Overflow","OutsideBounds","Custom"] };
haxe_io_Error.Blocked = ["Blocked",0];
haxe_io_Error.Blocked.toString = $estr;
haxe_io_Error.Blocked.__enum__ = haxe_io_Error;
haxe_io_Error.Overflow = ["Overflow",1];
haxe_io_Error.Overflow.toString = $estr;
haxe_io_Error.Overflow.__enum__ = haxe_io_Error;
haxe_io_Error.OutsideBounds = ["OutsideBounds",2];
haxe_io_Error.OutsideBounds.toString = $estr;
haxe_io_Error.OutsideBounds.__enum__ = haxe_io_Error;
haxe_io_Error.Custom = function(e) { var $x = ["Custom",3,e]; $x.__enum__ = haxe_io_Error; $x.toString = $estr; return $x; };
var js__$Boot_HaxeError = function(val) {
	Error.call(this);
	this.val = val;
	this.message = String(val);
	if(Error.captureStackTrace) {
		Error.captureStackTrace(this,js__$Boot_HaxeError);
	}
};
js__$Boot_HaxeError.__name__ = true;
js__$Boot_HaxeError.wrap = function(val) {
	if((val instanceof Error)) {
		return val;
	} else {
		return new js__$Boot_HaxeError(val);
	}
};
js__$Boot_HaxeError.__super__ = Error;
js__$Boot_HaxeError.prototype = $extend(Error.prototype,{
});
var js_Boot = function() { };
js_Boot.__name__ = true;
js_Boot.__string_rec = function(o,s) {
	if(o == null) {
		return "null";
	}
	if(s.length >= 5) {
		return "<...>";
	}
	var t = typeof(o);
	if(t == "function" && (o.__name__ || o.__ename__)) {
		t = "object";
	}
	switch(t) {
	case "function":
		return "<function>";
	case "object":
		if(o instanceof Array) {
			if(o.__enum__) {
				if(o.length == 2) {
					return o[0];
				}
				var str = o[0] + "(";
				s += "\t";
				var _g1 = 2;
				var _g = o.length;
				while(_g1 < _g) {
					var i = _g1++;
					if(i != 2) {
						str += "," + js_Boot.__string_rec(o[i],s);
					} else {
						str += js_Boot.__string_rec(o[i],s);
					}
				}
				return str + ")";
			}
			var l = o.length;
			var i1;
			var str1 = "[";
			s += "\t";
			var _g11 = 0;
			var _g2 = l;
			while(_g11 < _g2) {
				var i2 = _g11++;
				str1 += (i2 > 0 ? "," : "") + js_Boot.__string_rec(o[i2],s);
			}
			str1 += "]";
			return str1;
		}
		var tostr;
		try {
			tostr = o.toString;
		} catch( e ) {
			haxe_CallStack.lastException = e;
			return "???";
		}
		if(tostr != null && tostr != Object.toString && typeof(tostr) == "function") {
			var s2 = o.toString();
			if(s2 != "[object Object]") {
				return s2;
			}
		}
		var k = null;
		var str2 = "{\n";
		s += "\t";
		var hasp = o.hasOwnProperty != null;
		for( var k in o ) {
		if(hasp && !o.hasOwnProperty(k)) {
			continue;
		}
		if(k == "prototype" || k == "__class__" || k == "__super__" || k == "__interfaces__" || k == "__properties__") {
			continue;
		}
		if(str2.length != 2) {
			str2 += ", \n";
		}
		str2 += s + k + " : " + js_Boot.__string_rec(o[k],s);
		}
		s = s.substring(1);
		str2 += "\n" + s + "}";
		return str2;
	case "string":
		return o;
	default:
		return String(o);
	}
};
var js_node_ChildProcess = require("child_process");
var js_node_Http = require("http");
var js_node_Https = require("https");
var js_node_Path = require("path");
var js_node_Zlib = require("zlib");
var js_node_tls_SecureContext = function() { };
js_node_tls_SecureContext.__name__ = true;
var js_npm_Docopt = require("docopt");
String.__name__ = true;
Array.__name__ = true;
Date.__name__ = ["Date"];
var __map_reserved = {};
Main.updatePromises = new haxe_ds_StringMap();
Main.cacheDir = "/tmp/var/cache/git/";
Main.listenPort = 8080;
Main.usage = "\nA caching Git HTTP server.\n\nServe local mirror repositories over HTTP/HTTPS, updating them as they are requested.\n\nUsage:\n  git-cache-http-server.js [options]\n\nOptions:\n  -c,--cache-dir <path>   Location of the git cache [default: /var/cache/git]\n  -p,--port <port>        Bind to port [default: 8080]\n  -h,--help               Print this message\n  --version               Print the current version\n";
haxe_crypto_Base64.CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
haxe_crypto_Base64.BYTES = haxe_io_Bytes.ofString(haxe_crypto_Base64.CHARS);
Main.main();
})();
