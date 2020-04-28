const express = require('express')
const { uuid, isUuid } = require('uuidv4')

const app = express()

app.use(express.json())

app.listen('3333', () => {
  console.log('🚀 Started at localhost:3333')
})

const repositories = []

function logRequest(req, res, next) {
  const { method, url } = req
  const reqData = `[${method.toUpperCase()}] ${url}`
  console.time(reqData)

  next()

  return console.timeEnd(reqData)
}

function validateId(req, res, next) {
  const { id } = req.params

  if (!isUuid(id))
    return res.status(400).json({ error: 'Invalid id' })

  return next()
}

app.use(logRequest)
app.use('/repositories/:id', validateId)

app.get('/repositories', (req, res) => {
  res.json({ repositories })
})

app.get('/repositories/:id', (req, res) => {
  const { id } = req.params

  if (!id)
    return res.status(400).json({ error: 'id is required'})

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0)
    return res.status(400).json({ error: `We could not find a repository with id ${id}`})

  return res.json(repositories[repositoryIndex])
})

app.post('/repositories', (req, res) => {
  const { url, techs, title } = req.body
  const repository = { id: uuid(), likes: 0, url, techs, title }

  repositories.push(repository)

  res.status(200).json({ repository })
})

app.post('/repositories/:id/like', (req, res) => {
  const { id } = req.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)
  const repository = repositories[repositoryIndex]

  repository.likes++;

  res.status(200).json({ repository })
})

app.put('/repositories/:id', (req, res) => {
  const { id } = req.params
  const { url, techs, title } = req.body

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)
  
  if (repositoryIndex < 0)
    return res.status(400).json({ error: `We could not find a repository with id ${id}`})
  
  repositories[repositoryIndex] = { id, url, techs, title }

  return res.json(repositories[repositoryIndex])
})

app.delete('/repositories/:id', (req, res) => {
  const { id } = req.params

  const repositoryIndex = repositories.findIndex(repository => repository.id === id)

  if (repositoryIndex < 0)
    return res.status(400).json({ error: `We could not find a repository with id ${id}`})

  repositories.splice(repositoryIndex, 0)

  return res.status(204).send()
})