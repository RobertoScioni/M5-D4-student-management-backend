const badRequest = (err, req, res, next) => {
	if (err.httpStatusCode === 400) {
		console.log(err)
		res.status(400).send("bad request!")
	}
	next(err)
}

const catchAllHandler = (err, req, res, next) => {
	if (!res.headersSent) {
		console.log(err)
		res.status(err.httpStatusCode || 500).send("Generic Server Error")
	}
}

module.exports = { badRequest, catchAllHandler }
