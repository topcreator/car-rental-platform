import 'dotenv/config'
import request from 'supertest'
import url from 'url'
import path from 'path'
import fs from 'node:fs/promises'
import { v1 as uuid } from 'uuid'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import * as env from '../src/config/env.config'
import * as helper from '../src/common/helper'
import LocationValue from '../src/models/LocationValue'
import Location from '../src/models/Location'
import Country from '../src/models/Country'
import Car from '../src/models/Car'

const __filename = url.fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const IMAGE0 = 'location0.jpg'
const IMAGE0_PATH = path.resolve(__dirname, `./img/${IMAGE0}`)
const IMAGE1 = 'location1.jpg'
const IMAGE1_PATH = path.resolve(__dirname, `./img/${IMAGE1}`)
const IMAGE2 = 'location2.jpg'
const IMAGE2_PATH = path.resolve(__dirname, `./img/${IMAGE2}`)

let LOCATION_ID: string

let LOCATION_NAMES: bookcarsTypes.LocationName[] = [
  {
    language: 'en',
    name: uuid(),
  },
  {
    language: 'fr',
    name: uuid(),
  },
]

let countryValue1Id = ''
let countryValue2Id = ''
let countryId = ''

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  const res = await databaseHelper.connect(env.DB_URI, false, false)
  expect(res).toBeTruthy()
  await testHelper.initialize()

  const countryValue1 = new LocationValue({ language: 'en', value: 'Country 1' })
  await countryValue1.save()
  countryValue1Id = countryValue1.id
  const countryValue2 = new LocationValue({ language: 'fr', value: 'Pays 1' })
  await countryValue2.save()
  countryValue2Id = countryValue2.id
  const country = new Country({ values: [countryValue1.id, countryValue2.id] })
  await country.save()
  countryId = country.id
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  await LocationValue.deleteMany({ _id: { $in: [countryValue1Id, countryValue2Id] } })
  await Country.deleteOne({ _id: countryId })

  if (mongoose.connection.readyState) {
    await testHelper.close()
    await databaseHelper.close()
  }
})

//
// Unit tests
//

describe('POST /api/validate-location', () => {
  it('should validate a location', async () => {
    const token = await testHelper.signinAsAdmin()

    const language = testHelper.LANGUAGE
    const name = uuid()
    const locationValue = new LocationValue({ language, value: name })
    await locationValue.save()
    const payload: bookcarsTypes.ValidateLocationPayload = {
      language,
      name,
    }
    let res = await request(app)
      .post('/api/validate-location')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    payload.name = uuid()
    res = await request(app)
      .post('/api/validate-location')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    await LocationValue.deleteOne({ _id: locationValue._id })

    res = await request(app)
      .post('/api/validate-location')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('POST /api/create-location', () => {
  it('should create a location', async () => {
    const token = await testHelper.signinAsAdmin()

    const payload: bookcarsTypes.UpsertLocationPayload = {
      country: countryId,
      names: LOCATION_NAMES,
      latitude: 28.0268755,
      longitude: 1.6528399999999976,
      image: 'unknown.jpg',
      parkingSpots: [
        {
          latitude: 28.1268755,
          longitude: 1.752839999999997,
          values: [{ language: 'en', value: 'Parking spot 1' }, { language: 'fr', value: 'Parking 1' }],
        },
        {
          latitude: 28.2268755,
          longitude: 1.8528399999999976,
          values: [{ language: 'en', value: 'Parking spot 2' }, { language: 'fr', value: 'Parking 2' }],
        },
      ],
    }

    // image not found
    let res = await request(app)
      .post('/api/create-location')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(400)

    // image found
    const tempImage = path.join(env.CDN_TEMP_LOCATIONS, IMAGE0)
    if (!await helper.exists(tempImage)) {
      await fs.copyFile(IMAGE0_PATH, tempImage)
    }
    payload.image = IMAGE0
    res = await request(app)
      .post('/api/create-location')
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body?.country).toBe(payload.country)
    expect(res.body?.values?.length).toBe(2)
    expect(res.body?.latitude).toBe(payload.latitude)
    expect(res.body?.longitude).toBe(payload.longitude)
    expect(res.body?.parkingSpots?.length).toBe(2)
    LOCATION_ID = res.body?._id

    // no payload
    res = await request(app)
      .post('/api/create-location')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('PUT /api/update-location/:id', () => {
  it('should update a location', async () => {
    const token = await testHelper.signinAsAdmin()

    LOCATION_NAMES = [
      {
        language: 'en',
        name: 'test-en',
      },
      {
        language: 'fr',
        name: uuid(),
      },
      {
        language: 'es',
        name: uuid(),
      },
    ]

    const location = await Location
      .findById(LOCATION_ID)
      .populate<{ parkingSpots: env.ParkingSpot[] }>({
        path: 'parkingSpots',
        populate: {
          path: 'values',
          model: 'LocationValue',
        },
      })
      .lean()
    expect(location?.parkingSpots.length).toBe(2)

    const parkingSpot2 = (location!.parkingSpots[1]) as bookcarsTypes.ParkingSpot
    expect(parkingSpot2.values!.length).toBe(2)
    parkingSpot2.values![0].value = 'Parking spot 2 updated'
    parkingSpot2.values![2] = { language: 'es', value: 'Parking spot 2 es' }

    const payload: bookcarsTypes.UpsertLocationPayload = {
      country: countryId,
      names: LOCATION_NAMES,
      latitude: 29.0268755,
      longitude: 2.6528399999999976,
      parkingSpots: [
        parkingSpot2,
        {
          latitude: 28.1268755,
          longitude: 1.752839999999997,
          values: [{ language: 'en', value: 'Parking spot 3' }, { language: 'fr', value: 'Parking 3' }],
        },
        {
          latitude: 28.2268755,
          longitude: 1.8528399999999976,
          values: [{ language: 'en', value: 'Parking spot 4' }, { language: 'fr', value: 'Parking 4' }],
        },
      ],
    }

    let res = await request(app)
      .put(`/api/update-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body?.country).toBe(payload.country)
    expect(res.body.values?.length).toBe(3)
    expect(res.body?.latitude).toBe(payload.latitude)
    expect(res.body?.longitude).toBe(payload.longitude)
    expect(res.body?.parkingSpots.length).toBe(3)

    payload.parkingSpots = undefined
    res = await request(app)
      .put(`/api/update-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body?.country).toBe(payload.country)
    expect(res.body.values?.length).toBe(3)
    expect(res.body?.latitude).toBe(payload.latitude)
    expect(res.body?.longitude).toBe(payload.longitude)
    expect(res.body?.parkingSpots.length).toBe(0)

    payload.parkingSpots = [
      {
        latitude: 28.1268755,
        longitude: 1.752839999999997,
        values: [{ language: 'en', value: 'Parking spot 1' }, { language: 'fr', value: 'Parking 1' }],
      },
    ]
    res = await request(app)
      .put(`/api/update-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body?.country).toBe(payload.country)
    expect(res.body.values?.length).toBe(3)
    expect(res.body?.latitude).toBe(payload.latitude)
    expect(res.body?.longitude).toBe(payload.longitude)
    expect(res.body?.parkingSpots.length).toBe(1)

    res = await request(app)
      .put(`/api/update-location/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
      .send(payload)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .put(`/api/update-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('GET /api/location-id/:name/:language', () => {
  it('should get a location id', async () => {
    const language = 'en'
    const name = 'test-en'

    let res = await request(app)
      .get(`/api/location-id/${name}/${language}`)
    expect(res.statusCode).toBe(200)
    expect(res.body).toBeDefined()

    res = await request(app)
      .get(`/api/location-id/unknown/${language}`)
    expect(res.statusCode).toBe(204)
  })
})

describe('POST /api/create-location-image', () => {
  it('should create a location image', async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .post('/api/create-location-image')
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE1_PATH)
    expect(res.statusCode).toBe(200)
    const filename = res.body as string
    const filePath = path.resolve(env.CDN_TEMP_LOCATIONS, filename)
    const imageExists = await helper.exists(filePath)
    expect(imageExists).toBeTruthy()
    await fs.unlink(filePath)

    res = await request(app)
      .post('/api/create-location-image')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('POST /api/update-location-image/:id', () => {
  it('should update a location image', async () => {
    const token = await testHelper.signinAsAdmin()

    let res = await request(app)
      .post(`/api/update-location-image/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE2_PATH)
    expect(res.statusCode).toBe(200)
    const filename = res.body as string
    const imageExists = await helper.exists(path.resolve(env.CDN_LOCATIONS, filename))
    expect(imageExists).toBeTruthy()
    const location = await Location.findById(LOCATION_ID)
    expect(location).not.toBeNull()
    expect(location?.image).toBe(filename)

    location!.image = `${uuid()}.jpg`
    await location?.save()
    res = await request(app)
      .post(`/api/update-location-image/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE2_PATH)
    expect(res.statusCode).toBe(200)
    location!.image = filename
    await location?.save()

    res = await request(app)
      .post(`/api/update-location-image/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    res = await request(app)
      .post(`/api/update-location-image/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE1_PATH)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .post(`/api/update-location-image/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE1_PATH)
    expect(res.statusCode).toBe(200)

    res = await request(app)
      .post('/api/update-location-image/0')
      .set(env.X_ACCESS_TOKEN, token)
      .attach('image', IMAGE1_PATH)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('POST /api/delete-location-image/:id', () => {
  it('should delete a location image', async () => {
    const token = await testHelper.signinAsAdmin()

    let location = await Location.findById(LOCATION_ID)
    expect(location).not.toBeNull()
    expect(location?.image).toBeDefined()
    const filename = location?.image as string
    let imageExists = await helper.exists(path.resolve(env.CDN_LOCATIONS, filename))
    expect(imageExists).toBeTruthy()

    let res = await request(app)
      .post(`/api/delete-location-image/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    imageExists = await helper.exists(path.resolve(env.CDN_LOCATIONS, filename))
    expect(imageExists).toBeFalsy()
    location = await Location.findById(LOCATION_ID)
    expect(location?.image).toBeNull()

    res = await request(app)
      .post(`/api/delete-location-image/${testHelper.GetRandromObjectIdAsString()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    await testHelper.signout(token)
  })
})

describe('POST /api/delete-temp-location-image/:image', () => {
  it('should delete a temporary location image', async () => {
    const token = await testHelper.signinAsAdmin()

    const tempImage = path.join(env.CDN_TEMP_LOCATIONS, IMAGE1)
    if (!await helper.exists(tempImage)) {
      await fs.copyFile(IMAGE1_PATH, tempImage)
    }
    let res = await request(app)
      .post(`/api/delete-temp-location-image/${IMAGE1}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    const tempImageExists = await helper.exists(tempImage)
    expect(tempImageExists).toBeFalsy()

    res = await request(app)
      .post('/api/delete-temp-location-image/unknown.jpg')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('GET /api/location/:id/:language', () => {
  it('should get a location', async () => {
    const language = 'en'

    let res = await request(app)
      .get(`/api/location/${LOCATION_ID}/${language}`)
    expect(res.statusCode).toBe(200)
    expect(res.body?.name).toBe(LOCATION_NAMES.filter((v) => v.language === language)[0].name)

    res = await request(app)
      .get(`/api/location/${testHelper.GetRandromObjectIdAsString()}/${language}`)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get(`/api/location/${LOCATION_ID}/zh`)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/locations/:page/:size/:language', () => {
  it('should get locations', async () => {
    const language = 'en'

    let res = await request(app)
      .get(`/api/locations/${testHelper.PAGE}/${testHelper.SIZE}/${language}?s=${LOCATION_NAMES[0].name}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)

    res = await request(app)
      .get(`/api/locations/unknown/${testHelper.SIZE}/${language}`)
    expect(res.statusCode).toBe(400)
  })
})

describe('GET /api/locations-with-position/:language', () => {
  it('should get locations with position', async () => {
    const language = 'en'

    let res = await request(app)
      .get(`/api/locations-with-position/${language}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(1)

    res = await request(app)
      .get('/api/locations-with-position/unknown')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(0)
  })
})

describe('GET /api/check-location/:id', () => {
  it('should check a location', async () => {
    const token = await testHelper.signinAsAdmin()

    const supplierName = testHelper.getSupplierName()
    const supplierId = await testHelper.createSupplier(`${supplierName}@test.bookcars.ma`, supplierName)
    const car = new Car({
      name: 'BMW X1',
      supplier: supplierId,
      minimumAge: 21,
      locations: [LOCATION_ID],
      price: 780,
      deposit: 9500,
      available: false,
      type: bookcarsTypes.CarType.Diesel,
      gearbox: bookcarsTypes.GearboxType.Automatic,
      aircon: true,
      seats: 5,
      doors: 4,
      fuelPolicy: bookcarsTypes.FuelPolicy.FreeTank,
      mileage: -1,
      cancellation: 0,
      amendments: 0,
      theftProtection: 90,
      collisionDamageWaiver: 120,
      fullInsurance: 200,
      additionalDriver: 200,
      range: bookcarsTypes.CarRange.Midi,
    })
    await car.save()
    let res = await request(app)
      .get(`/api/check-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)

    await Car.deleteOne({ _id: car._id })
    await testHelper.deleteSupplier(supplierId)
    res = await request(app)
      .get(`/api/check-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .get(`/api/check-location/${uuid()}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})

describe('DELETE /api/delete-location/:id', () => {
  it('should delete a location', async () => {
    const token = await testHelper.signinAsAdmin()

    let location = await Location.findById(LOCATION_ID)
    expect(location).not.toBeNull()

    if (!location?.image) {
      const image = path.join(env.CDN_LOCATIONS, IMAGE0)
      if (!await helper.exists(image)) {
        await fs.copyFile(IMAGE0_PATH, image)
      }
      location!.image = IMAGE0
      await location!.save()
    }

    let res = await request(app)
      .delete(`/api/delete-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(200)
    location = await Location.findById(LOCATION_ID)
    expect(location).toBeNull()

    res = await request(app)
      .delete(`/api/delete-location/${LOCATION_ID}`)
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(204)

    res = await request(app)
      .delete('/api/delete-location/0')
      .set(env.X_ACCESS_TOKEN, token)
    expect(res.statusCode).toBe(400)

    await testHelper.signout(token)
  })
})
