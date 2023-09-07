require("dotenv").config()
const express = require("express")
const cors = require("cors")
const Note = require("./models/note")

const app = express()

app.use(express.static("dist"))
app.use(express.json())
app.use(cors())

////////////////////
// Routes

app.get("/api/notes", (req, res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

app.get("/api/notes/:id", (req, res, next) => {
  Note.findById(req.params.id)
    .then(note => {
      if (note) {
        res.json(note)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

app.delete("/api/notes/:id", (req, res, next) => {
  Note.findByIdAndRemove(req.params.id)
    .then(note => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

app.put("/api/notes/:id", (req, res, next) => {
  const body = req.body

  const note = {
    content: body.content,
    important: body.important,
  }

  Note.findByIdAndUpdate(req.params.id, note, {new: true})
    .then(updatedNote => {
      res.json(updatedNote)
    })
    .catch(error => next(error))
})

app.post("/api/notes/", (req, res) => {
  const body = req.body
  if (!body.content) {
    return res.status(400).json({
      error: "content missing"
    })
  }

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    res.json(savedNote)
  })
})

////////////////////
// Error handling
const unknownEndpoint = (req, res) => {
  res.status(404).send({error: 'unknown endpoint'})
}
// olemattomien osoitteiden käsittely
app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({error: 'malformatted id'})
  }

  next(error)
}
// virheellisten pyyntöjen käsittely
app.use(errorHandler)

////////////////////
// Run app
const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 