'use strict';

const { IncomingMessage, ServerResponse } = require("http");

/**
 * 
 * @param {IncomingMessage} req 
 * @param {ServerResponse} res 
 */
module.exports = (req, res) => {
	try {
		var url = req.url;

		switch (url) {
			case '/':
				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ status: 'success', message: 'Hello from datathon_function' }));
				break;
			default:
				res.writeHead(404, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ status: 'error', message: `Endpoint ${url} not found` }));
				break;
		}
	} catch (err) {
		console.error('Unhandled Error in datathon_function:', err);
		if (!res.headersSent) {
			res.writeHead(500, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify({ status: 'error', message: 'Internal Server Error' }));
		}
	}
};
