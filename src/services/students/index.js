const { response } = require("express")
const { check, validationResult } = require("express-validator")
const express = require("express")
const { writeFile, createReadStream, writeJson, readJSON } = require("fs-extra")
const fs = require("fs") //I kinda need file system acces don't I?
const path = require("path") //mostly to appease window's folks
const uniqid = require("uniqid") //my relational database formation screams at me against this thing
const multer = require("multer")
const upload = multer({})

const router = express.Router()

const studentsfilePath = path.join(__dirname, "students.json")

/**
 * You are in charge of building the Backend using ExpressJS. The backend should include the following routes:
 *   GET /students => returns the list of students  done
 *   GET /students/123 => returns a single student  done
 *   POST /students => create a new student done
 *   PUT /students/123 => edit the student with the given id    done
 *   DELETE /students/123 => delete the student with the given id   done
 *   The persistence must be granted via file system (es.: Json file with a list of students inside)    done
 **/

/**
 * manage the /students path in GET
 */
router.get("/", async (req, res) => {
	console.log("our 'database' is in", studentsfilePath)
	const buffyer = fs.readFileSync(studentsfilePath)
	let response = JSON.parse(buffyer.toString())
	res.send(response)
})

/**
 * manage the /students/id path in GET
 */

router.get("/:id", async (req, res) => {
	const id = req.params.id
	console.log("searching for", id)
	const buffyer = fs.readFileSync(studentsfilePath)
	let response = JSON.parse(buffyer.toString())[id]
	res.send(response)
})

/**
 * manage /students path in POST
 */

router.post("/", async (req, res) => {
	const id = uniqid()

	const buffyer = fs.readFileSync(studentsfilePath)
	let stds = JSON.parse(buffyer.toString())
	const newStd = req.body
	if (!checkEmail(newStd.mail, stds)) {
		res
			.status(400)
			.send("good try fantocci but you should use PUT to change your username")
		return false
	}
	console.log("saving student", newStd)
	stds[id] = newStd
	fs.writeFileSync(studentsfilePath, JSON.stringify(stds))
	res.send(id)
})

/**
 * manage /students/:id path in PUT
 */

router.put("/:id", async (req, res) => {
	const id = req.params.id
	const buffyer = fs.readFileSync(studentsfilePath)
	let stds = JSON.parse(buffyer.toString())
	const newStd = req.body
	console.log("updating student", newStd)
	stds[id] = newStd
	fs.writeFileSync(studentsfilePath, JSON.stringify(stds))
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

//D4

/**
 * POST /students/id/uploadPhoto => uploads a picture
 * (save as idOfTheStudent.jpg in the public/img/students folder) for the student specified by the id.
 * Add a field on the students model called image, in where you store the newly created URL
 * (http://localhost:3000/img/students/idOfTheStudent.jpg)
 */

router.post(
	"/:id/uploadPhoto",
	[check("id").exists()],
	upload.single("picture"),
	async (req, res, next) => {
		/**
		 * verify the existance of id in the db
		 */
		let Stds = {}
		try {
			Stds = await readJSON(path.join(__dirname, "students.json"))
		} catch (err) {
			console.error(err)
			next(err)
		}

		if (Stds.hasOwnProperty(req.params.id)) {
			/**
			 * do the thing
			 */
			try {
				const dest = path.join(__dirname, "../../../public/img/students")
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
		Stds[req.params.id].image =
			"http://localhost:3000/img/students/" + req.file.originalname
		try {
			await writeJson(path.join(__dirname, "students.json"), Stds)
		} catch (err) {
			console.error(err)
			next(err)
		}
	}
)

/**
 * [EXTRA] //FRONTEND
 *   You are in charge of building the Frontend too. Use ReactJS to create an application for managing the students.
 *   The features for the application are:
 *   - Add a new Student ([EXTRA]use CheckEmail before sending the post to the backend)
 *   - Show Students on a list
 *   - Every Student could be edited or deleted
 **/

module.exports = router
