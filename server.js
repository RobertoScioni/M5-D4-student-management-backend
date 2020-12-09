const express = require("express")
const cors = require("cors")
const studentsRoutes = require("./services/students")
const server = express()
const port = 3001

server.use(cors())
server.use(express.json())
server.use("/students", studentsRoutes)

server.listen(port, () => {
	console.log("server running on port:", port)
})
