import 'dotenv/config'
import request from 'supertest'
import { v1 as uuid } from 'uuid'
import * as bookcarsTypes from 'bookcars-types'
import app from '../src/app'
import * as DatabaseHelper from '../src/common/DatabaseHelper'
import * as TestHelper from './TestHelper'
import * as env from '../src/config/env.config'
import LocationValue from '../src/models/LocationValue'
import Location from '../src/models/Location'
import Car from '../src/models/Car'

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

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
    if (await DatabaseHelper.Connect()) {
        await TestHelper.initialize()
    }
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
    await TestHelper.close()
    await DatabaseHelper.Close()
})

//
// Unit tests
//

describe('POST /api/validate-location', () => {
    it('should validate a location', async () => {
        const token = await TestHelper.signinAsAdmin()

        const language = TestHelper.LANGUAGE
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

        await TestHelper.signout(token)
    })
})

describe('POST /api/create-location', () => {
    it('should create a location', async () => {
        const token = await TestHelper.signinAsAdmin()

        const payload: bookcarsTypes.LocationName[] = LOCATION_NAMES
        let res = await request(app)
            .post('/api/create-location')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        expect(res.body?.values?.length).toBe(2)
        LOCATION_ID = res.body?._id

        res = await request(app)
            .post('/api/create-location')
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await TestHelper.signout(token)
    })
})

describe('PUT /api/update-location/:id', () => {
    it('should update a location', async () => {
        const token = await TestHelper.signinAsAdmin()

        LOCATION_NAMES = [
            {
                language: 'en',
                name: uuid(),
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
        let res = await request(app)
            .put(`/api/update-location/${LOCATION_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
            .send(LOCATION_NAMES)
        expect(res.statusCode).toBe(200)
        expect(res.body.values?.length).toBe(3)

        res = await request(app)
            .put(`/api/update-location/${TestHelper.GetRandromObjectIdAsString()}`)
            .set(env.X_ACCESS_TOKEN, token)
            .send(LOCATION_NAMES)
        expect(res.statusCode).toBe(204)

        res = await request(app)
            .put(`/api/update-location/${LOCATION_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await TestHelper.signout(token)
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
            .get(`/api/location/${TestHelper.GetRandromObjectIdAsString()}/${language}`)
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
            .get(`/api/locations/${TestHelper.PAGE}/${TestHelper.SIZE}/${language}?s=${LOCATION_NAMES[0].name}`)
        expect(res.statusCode).toBe(200)
        expect(res.body.length).toBe(1)

        res = await request(app)
            .get(`/api/locations/unknown/${TestHelper.SIZE}/${language}`)
        expect(res.statusCode).toBe(400)
    })
})

describe('GET /api/check-location/:id', () => {
    it('should check a location', async () => {
        const token = await TestHelper.signinAsAdmin()

        const supplierName = TestHelper.getSupplierName()
        const supplierId = await TestHelper.createSupplier(`${supplierName}@test.bookcars.ma`, supplierName)
        const car = new Car({
            name: 'BMW X1',
            company: supplierId,
            minimumAge: 21,
            locations: [LOCATION_ID],
            price: 780,
            deposit: 9500,
            available: false,
            type: bookcarsTypes.CarType.Diesel,
            gearbox: bookcarsTypes.GearboxType.Automatic,
            aircon: true,
            // image: IMAGE1,
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
        })
        await car.save()
        let res = await request(app)
            .get(`/api/check-location/${LOCATION_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(200)

        await Car.deleteOne({ _id: car._id })
        await TestHelper.deleteSupplier(supplierId)
        res = await request(app)
            .get(`/api/check-location/${LOCATION_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(204)

        res = await request(app)
            .get(`/api/check-location/${uuid()}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await TestHelper.signout(token)
    })
})

describe('DELETE /api/delete-location/:id', () => {
    it('should delete a location', async () => {
        const token = await TestHelper.signinAsAdmin()

        let location = await Location.findById(LOCATION_ID)
        expect(location).not.toBeNull()
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

        await TestHelper.signout(token)
    })
})