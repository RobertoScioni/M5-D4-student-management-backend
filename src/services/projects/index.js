const { response } = require("express")
const { check, validationResult } = require("express-validator")
const express = require("express")
const fs = require("fs") //I kinda need file system acces don't I?
const { writeFile, createReadStream, writeJson, readJSON } = require("fs-extra")
const path = require("path") //mostly to appease window's folks
const uniqid = require("uniqid") //my relational database formation screams at me against this thing
const multer = require("multer")
const upload = multer({})

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
router.get("/", async (req, res, next) => {
	console.log("our 'database' is in", projectsfilePath)
	res.send(openDb())
})

/**
 * manage the /projects/id path in GET
 */

router.get("/:id", async (req, res, next) => {
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
		//could i declare this stuff as a variable? you knbow for reusability's sake...
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
		"creation date": "now",	//we create this
		"RepoURL": "test github", //i suppose this can be optional?
		"LiveUrl": "trdythodying",// and this too?
		"StudentId": "a student's ID"
	 */
		const fields = ["name", "description", "StudentID"]

		/*try {   hahahha my old obsolete validation code T_T
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

router.put(
	"/:id",
	[
		//could i declare this stuff as a variable? you knbow for reusability's sake...
		check("id").exists(),
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
		const id = req.params.id

		try {
			updateStd(newPj.StudentID)
		} catch (error) {
			next(error)
			return -1
		}

		let pjs = openDb()
		if (pjs.hasOwnProperty(id)) {
			const newPj = req.body
			pjs[id] = newPj
			fs.writeFileSync(projectsfilePath, JSON.stringify(pjs))
			res.send(id)
			return 1
		} else {
			let err = new Error("not existing project")
			err.httpStatusCode = 400
			next(err)
			return -1
		}
	}
)

/**
 * manage Project deletion
 */
router.delete("/:id", [check("id").exists()], async (req, res, next) => {
	const id = req.params.id
	let pjs = openDb()
	if (pjs.hasOwnProperty(id)) {
		delete stds[id]
		fs.writeFileSync(projectsfilePath, JSON.stringify(pjs))
		res.send(id)
		return 1
	} else {
		let err = new Error("not existing project")
		err.httpStatusCode = 400
		next(err)
		return -1
	}
})

/**
 *  [EXTRA] GET /students/:studentsId/projects/ => get all the projects for a student with a given ID
 */

/**
 * [EXTRA] GET /projects?name=searchQuery => filter the projects and extracts the only that match the condition (es.: Name contains searchQuery)
 */

//D4

/**
 * POST /projects/id/uploadPhoto => uploads a picture
 * (save as idOfTheStudent.jpg in the public/img/projects folder) for the student specified by the id.
 * Add a field on the projects model called image, in where you store the newly created URL
 * (http://localhost:3000/img/projects/idOfTheProject.jpg)
 */
router.post(
	"/:id/uploadPhoto",
	[check("id").exists()],
	upload.single("picture"),
	async (req, res, next) => {
		/**
		 * verify the existance of id in the db
		 */
		const Pjs = openDb()
		if (Pjs.hasOwnProperty(req.params.id)) {
			/**
			 * do the thing
			 */
			try {
				const dest = path.join(__dirname, "../../../public/img/projects")
				console.log(dest)
				await writeFile(path.join(dest, req.file.originalname), req.file.buffer)
				res.send("success")
			} catch (err) {
				console.error(err)
				next(err)
			}
		}
		/**
		 * update project with the image url
		 */
		Pjs[req.params.id].image =
			"http://localhost:3000/img/projects/" + req.file.originalname
		try {
			await writeJson(path.join(__dirname, "projects.json"), Pjs)
		} catch (err) {
			console.error(err)
			next(err)
		}
	}
)
/**
 * GET /projects/id/reviews => get all the reviews for a given project
 */
router.get("/:id/reviews", async (req, res, next) => {
	const id = req.params.id
})
/**
 * POST /projects/id/reviews => add a new review for the given project
 */
router.post(
	"/:id/reviews",
	[check("description").exists()],
	async (req, res, next) => {
		const Pid = req.params.id
		const id = uniqid()
		let reviews = {}
		try {
			reviews = await readJSON(path.join(__dirname, "reviews.json"))
		} catch (err) {
			console.error(err)
			next(err)
		}
		reviews[id] = req.body
		reviews[id].Pid = Pid
	}
)
module.exports = router
