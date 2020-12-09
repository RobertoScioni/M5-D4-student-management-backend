const { response } = require("express")
const { check, validationResult } = require("express-validator")
const express = require("express")

const fs = require("fs") //I kinda need file system acces don't I?
const path = require("path") //mostly to appease window's folks
const uniqid = require("uniqid") //my relational database formation screams at me against this thing

const router = express.Router()

const projectsfilePath = path.join(__dirname, "projects.json")
const studentsfilePath = path.join(__dirname, "..", "students", "students.json") //i'm on linux why must i suffer for MS sins?

const openDb = () => {
	const buffyer = fs.readFileSync(projectsfilePath)
	return JSON.parse(buffyer.toString())
}

const updateStd = (id, pid) => {
	let stds = JSON.parse(fs.readFileSync(studentsfilePath).toString())
	if (stds.hasOwnProperty(id)) {
		stds[id].numberOfProjects = stds[id].hasOwnProperty("numberOfProjects")
			? stds[id].numberOfProjects + 1
			: 1
		fs.writeFileSync(studentsfilePath, JSON.stringify(stds))
		return 1
	} else {
		const err = new Error("StudentId Not Found")
		err.httpStatusCode = 400

		throw err
	}
}

/**
 * You are in charge of building the Backend using NodeJS + Express. The backend should include the following routes:
    GET /projects => returns the list of projects
    GET /projects/id => returns a single project
    POST /projects => create a new project (Add an extra property NumberOfProjects on student and update it every time a new project is created)
    PUT /projects/id => edit the project with the given id
    DELETE /projects/id => delete the project with the given id
    The persistence must be granted via file system (es.: Json file with a list of students inside)
*/

/**
 * manage the /projects path in GET
 */
router.get("/", async (req, res) => {
	console.log("our 'database' is in", projectsfilePath)
	res.send(openDb())
})

/**
 * manage the /projects/id path in GET
 */

router.get("/:id", async (req, res) => {
	const id = req.params.id
	console.log("searching for", id)
	res.send(openDb[id])
})

/**
 * manage /projects path in POST
 */

router.post(
	"/",
	[
		check("name")
			.isLength({ min: 4 })
			.withMessage("name not valid")
			.exists()
			.withMessage("missing name"),
		check("description")
			.isLength({ min: 4 })
			.withMessage("description not valid")
			.exists()
			.withMessage("missing description"),
		check("RepoUrl")
			.if(check("RepoUrl").exists())
			.isURL()
			.withMessage("RepoUrl not valid"),
		check("LiveUrl")
			.if(check("LiveUrl").exists())
			.isURL()
			.withMessage("RepoUrl not valid"),
	],
	async (req, res, next) => {
		const newPj = req.body
		/** example expected schema
	 *  "name": "test",
		"description": "test description",
		"creation date": "now",
		"RepoURL": "test github",
		"LiveUrl": "trdythodying",
		"StudentId": "a student's ID"
	 */
		const fields = ["name", "description", "StudentID"]

		/*try {
			fields.forEach((field) => {
				if (!newPj[field]) {
					const err = new Error("missing " + field + " field")
					err.httpStatusCode = 400
					throw err
				}
			})
		} catch (error) {
			next(error)
			return
		}*/
		//try {
		const errors = validationResult(req)

		if (!errors.isEmpty()) {
			const err = new Error()
			err.message = errors
			err.httpStatusCode = 400
			next(err)
			return
		}

		try {
			updateStd(newPj.StudentID)
		} catch (error) {
			next(error)
			return
		}
		newPj["creation date"] = new Date()
		const id = uniqid()
		let pjs = openDb()
		console.log("saving Project", newPj)
		pjs[id] = newPj
		fs.writeFileSync(projectsfilePath, JSON.stringify(pjs))
		res.send(id)
	}
)

/**
 * manage /projects/:id path in PUT
 */

router.put("/:id", async (req, res) => {
	const id = req.params.id

	const fields = ["name", "description", "StudentID"]

	try {
		fields.forEach((field) => {
			if (!newPj[field]) {
				const err = new Error("missing " + field + " field")
				err.httpStatusCode = 400
				throw err
			}
		})
	} catch (error) {
		next(error)
		return
	}

	try {
		updateStd(newPj.StudentID)
	} catch (error) {
		next(error)
		return
	}

	const buffyer = fs.readFileSync(projectsfilePath)
	let stds = JSON.parse(buffyer.toString())
	const newStd = req.body
	console.log("updating student", newStd)
	stds[id] = newStd
	fs.writeFileSync(projectsfilePath, JSON.stringify(stds))
	res.send(id)
})

/**
 * manage students deletion
 */
router.delete("/:id", async (req, res) => {
	const id = req.params.id
	const buffyer = fs.readFileSync(studentsfilePath)
	let stds = JSON.parse(buffyer.toString())
	console.log("deleting student", id)
	delete stds[id]
	fs.writeFileSync(studentsfilePath, JSON.stringify(stds))
	res.send(id)
})

/**
 * [EXTRA] POST /checkEmail => check if another student has the same email. The parameter should be passed in the body.
 *  It should return true or false.
 *  It should not be possible to add a new student (with POST /students) if another has the same email.
 **/
checkEmail = (mail, stds) => {
	//console.log(typeof stds.entries)
	for (const [key, value] of Object.entries(stds)) {
		if (value.mail === mail) {
			console.log("redundant data")
			return false
		}
	}
	return true
}

/**
 * [EXTRA] //FRONTEND
 *   You are in charge of building the Frontend too. Use ReactJS to create an application for managing the students.
 *   The features for the application are:
 *   - Add a new Student ([EXTRA]use CheckEmail before sending the post to the backend)
 *   - Show Students on a list
 *   - Every Student could be edited or deleted
 **/

module.exports = router
