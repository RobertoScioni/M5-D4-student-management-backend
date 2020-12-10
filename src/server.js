const express = require("express")
const cors = require("cors")
const studentsRoutes = require("./services/students")
const projectsRoutes = require("./services/projects")
const { badRequest, funny, catchAllHandler } = require("../error")
const { join } = require("path")
const server = express()
const port = process.env.PORT || 3001

server.use(cors())
server.use(express.json())
server.use(express.static(join(__dirname, "../public")))
server.use("/students", studentsRoutes)
server.use("/projects", projectsRoutes)

server.use(badRequest)
server.use(funny)
server.use(catchAllHandler)

server.listen(port, () => {
	console.log("server running on port:", port)
})
