import express, { Express } from 'express'
import compression from 'compression'
import helmet from 'helmet'
import nocache from 'nocache'
import cookieParser from 'cookie-parser'
import strings from './config/app.config'
import * as env from './config/env.config'
import cors from './middlewares/cors'
import allowedMethods from './middlewares/allowedMethods'
import supplierRoutes from './routes/supplierRoutes'
import bookingRoutes from './routes/bookingRoutes'
import locationRoutes from './routes/locationRoutes'
import notificationRoutes from './routes/notificationRoutes'
import carRoutes from './routes/carRoutes'
import userRoutes from './routes/userRoutes'
import * as helper from './common/helper'

const app: Express = express()

app.use(helmet.contentSecurityPolicy())
app.use(helmet.dnsPrefetchControl())
app.use(helmet.crossOriginEmbedderPolicy())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.permittedCrossDomainPolicies())
app.use(helmet.referrerPolicy())
app.use(helmet.xssFilter())
app.use(helmet.originAgentCluster())
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }))
app.use(helmet.crossOriginOpenerPolicy())

app.use(nocache())
app.use(compression({ threshold: 0 }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.json({ limit: '50mb' }))

app.use(cors())
app.options('*', cors())
app.use(cookieParser(env.COOKIE_SECRET))
app.use(allowedMethods)

app.use('/', supplierRoutes)
app.use('/', bookingRoutes)
app.use('/', locationRoutes)
app.use('/', notificationRoutes)
app.use('/', carRoutes)
app.use('/', userRoutes)

strings.setLanguage(env.DEFAULT_LANGUAGE)

helper.mkdir(env.CDN_USERS)
helper.mkdir(env.CDN_TEMP_USERS)
helper.mkdir(env.CDN_CARS)
helper.mkdir(env.CDN_TEMP_CARS)

export default app
