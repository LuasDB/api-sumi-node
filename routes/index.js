import express from 'express'
import collectionsRouter from './collections.router.js'
import authRouter from './auth.router.js'
import sumiRouter from './sumi.router.js'

const router = express.Router()

const AppRouter = (app,io) => {

  app.use('/api/v1', router)
  router.use('/collections', collectionsRouter(io))
  router.use('/auth', authRouter)
  router.use('/sumi', sumiRouter(io))



}

export default AppRouter
