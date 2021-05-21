import http = require("http");
import https = require("https");
import JSONResponse = require("./jsonResponse");
import { URL } from "url";

export = class JSONRequest {
	private static async send(method: string, url: string, jsonBody: string, headers: any): Promise<JSONResponse> {
		return new Promise<JSONResponse>((resolve, reject) => {
			try {
				const u = new URL(url);

				if (u.protocol === "https:") {
					let options: https.RequestOptions = {
						host: u.host,
						port: (u.port || 443),
						path: (u.search ? (u.pathname + u.search) : u.pathname),
						method: method,
						headers: {
							"Accept": "application/json"
						}
					};

					if (jsonBody)
						options.headers["Content-Type"] = "application/json";

					if (headers) {
						for (let h in headers)
							options.headers[h] = headers[h];
					}

					const httpreq = https.request(options, function (response) {
						let json = "";
						response.setEncoding("utf8");
						response.on("error", function (err) {
							resolve(new JSONResponse(false, 0, null, err ? err.toString() : "Erro"));
						});
						response.on("data", function (chunk) {
							json += chunk;
						});
						response.on("end", function () {
							try {
								resolve(new JSONResponse(response.statusCode >= 200 && response.statusCode <= 299, response.statusCode, json ? JSON.parse(json) : null, null));
							} catch (ex) {
								resolve(new JSONResponse(false, response.statusCode, json, ex.message || ex.toString()));
							}
						})
					});
					if (jsonBody)
						httpreq.write(jsonBody);
					httpreq.end();
				} else {
					const options: http.RequestOptions = {
						host: u.host,
						port: (u.port || 80),
						path: (u.search ? (u.pathname + u.search) : u.pathname),
						method: method,
						headers: {
							"Accept": "application/json"
						}
					};

					if (jsonBody)
						options.headers["Content-Type"] = "application/json";

					if (headers) {
						for (let h in headers)
							options.headers[h] = headers[h];
					}

					const httpreq = http.request(options, function (response) {
						let json = "";
						response.setEncoding("utf8");
						response.on("error", function (err) {
							resolve(new JSONResponse(false, 0, null, err ? err.toString() : "Erro"));
						});
						response.on("data", function (chunk) {
							json += chunk;
						});
						response.on("end", function () {
							try {
								resolve(new JSONResponse(response.statusCode >= 200 && response.statusCode <= 299, response.statusCode, json ? JSON.parse(json) : null, null));
							} catch (ex) {
								resolve(new JSONResponse(false, 0, null, ex.message || ex.toString()));
							}
						})
					});
					if (jsonBody)
						httpreq.write(jsonBody);
					httpreq.end();
				}
			} catch (ex) {
				reject(ex.message || ex.toString());
			}
		});
	}

	public static async get(url: string, headers?: any): Promise<JSONResponse> {
		return JSONRequest.send("GET", url, null, headers);
	}

	public static async delete(url: string, headers?: any): Promise<JSONResponse> {
		return JSONRequest.send("DELETE", url, null, headers);
	}

	public static async post(url: string, jsonBody: string, headers?: any): Promise<JSONResponse> {
		return JSONRequest.send("POST", url, jsonBody, headers);
	}

	public static async put(url: string, jsonBody: string, headers?: any): Promise<JSONResponse> {
		return JSONRequest.send("PUT", url, jsonBody, headers);
	}
}
