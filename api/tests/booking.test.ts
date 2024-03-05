import 'dotenv/config'
import request from 'supertest'
import * as bookcarsTypes from 'bookcars-types'
import { v1 as uuid } from 'uuid'
import mongoose from 'mongoose'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import Car from '../src/models/Car'
import Booking from '../src/models/Booking'
import AdditionalDriver from '../src/models/AdditionalDriver'
import User from '../src/models/User'
import * as env from '../src/config/env.config'
import PushToken from '../src/models/PushToken'
import Token from '../src/models/Token'

let SUPPLIER_ID: string
let DRIVER1_ID: string
let DRIVER2_ID: string
let LOCATION_ID: string
let CAR1_ID: string
let CAR2_ID: string
let BOOKING_ID: string
let ADDITIONAL_DRIVER_ID: string

const ADDITIONAL_DRIVER_EMAIL: string = 'addtional.driver@test.bookcars.ma'
const ADDITIONAL_DRIVER: bookcarsTypes.AdditionalDriver = {
    email: ADDITIONAL_DRIVER_EMAIL,
    fullName: 'Additional Driver 1',
    birthDate: new Date(1990, 5, 20),
    phone: '0102010101',
}

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
    if (await databaseHelper.Connect()) {
        await testHelper.initialize()

        // create a supplier
        const supplierName = testHelper.getSupplierName()
        SUPPLIER_ID = await testHelper.createSupplier(`${supplierName}@test.bookcars.ma`, supplierName)

        // get user id
        DRIVER1_ID = testHelper.getUserId()

        // create a location
        LOCATION_ID = await testHelper.createLocation('Location 1 EN', 'Location 1 FR')

        // create car
        const payload: bookcarsTypes.CreateCarPayload = {
            name: 'BMW X1',
            company: SUPPLIER_ID,
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
            additionalDriver: 0,
        }

        // car 1
        let car = new Car(payload)
        await car.save()
        CAR1_ID = car.id

        // car 2
        car = new Car({ ...payload, name: 'BMW X5', price: 880 })
        await car.save()
        CAR2_ID = car.id
    }
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
    await testHelper.close()

    // delete the supplier
    await testHelper.deleteSupplier(SUPPLIER_ID)

    // delete the location
    await testHelper.deleteLocation(LOCATION_ID)

    // delete the car
    await Car.deleteMany({ _id: { $in: [CAR1_ID, CAR2_ID] } })

    // delete drivers
    await User.deleteOne({ _id: { $in: [DRIVER1_ID, DRIVER2_ID] } })

    await databaseHelper.Close()
})

//
// Unit tests
//

describe('POST /api/create-booking', () => {
    it('should create a booking', async () => {
        const token = await testHelper.signinAsAdmin()

        const payload: bookcarsTypes.UpsertBookingPayload = {
            booking: {
                company: SUPPLIER_ID,
                car: CAR1_ID,
                driver: DRIVER1_ID,
                pickupLocation: LOCATION_ID,
                dropOffLocation: LOCATION_ID,
                from: new Date(2024, 2, 1),
                to: new Date(1990, 2, 4),
                status: bookcarsTypes.BookingStatus.Pending,
                cancellation: true,
                amendments: true,
                theftProtection: false,
                collisionDamageWaiver: false,
                fullInsurance: false,
                price: 3120,
                additionalDriver: true,
            },
            additionalDriver: ADDITIONAL_DRIVER,
        }
        let res = await request(app)
            .post('/api/create-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        BOOKING_ID = res.body._id
        const additionalDriver = await AdditionalDriver.findOne({ email: ADDITIONAL_DRIVER_EMAIL })
        expect(additionalDriver).not.toBeNull()
        ADDITIONAL_DRIVER_ID = additionalDriver?.id

        res = await request(app)
            .post('/api/create-booking')
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('POST /api/checkout', () => {
    it('should checkout', async () => {
        let bookings = await Booking.find({ driver: DRIVER1_ID })
        expect(bookings.length).toBe(1)

        const payload: bookcarsTypes.CheckoutPayload = {
            booking: {
                company: SUPPLIER_ID,
                car: CAR1_ID,
                driver: DRIVER1_ID,
                pickupLocation: LOCATION_ID,
                dropOffLocation: LOCATION_ID,
                from: new Date(2024, 3, 1),
                to: new Date(1990, 3, 4),
                status: bookcarsTypes.BookingStatus.Pending,
                cancellation: true,
                amendments: true,
                theftProtection: false,
                collisionDamageWaiver: false,
                fullInsurance: false,
                price: 3120,
                additionalDriver: true,
            },
            payLater: true,
        }
        let res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(200)
        bookings = await Booking.find({ driver: DRIVER1_ID })
        expect(bookings.length).toBeGreaterThan(1)

        payload.driver = {
            fullName: 'driver',
            email: testHelper.GetRandomEmail(),
            language: testHelper.LANGUAGE,
        }
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(200)
        const driver2 = await User.findOne({ email: payload.driver.email })
        expect(driver2).not.toBeNull()
        DRIVER2_ID = driver2?.id
        const token = await Token.findOne({ user: DRIVER2_ID })
        expect(token).not.toBeNull()
        expect(token?.token.length).toBeGreaterThan(0)
        await token?.deleteOne()

        payload.driver = undefined
        payload.additionalDriver = {
            email: testHelper.GetRandomEmail(),
            fullName: 'Addtional Driver',
            birthDate: new Date(1980, 2, 25),
            phone: '01010101',
        }
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(200)
        const additionalDrivers = await AdditionalDriver.find({ email: payload.additionalDriver.email })
        expect(additionalDrivers.length).toBe(1)

        payload.additionalDriver = undefined
        payload.booking!.car = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(204)

        payload.booking!.car = CAR1_ID
        payload.booking!.pickupLocation = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(204)

        payload.booking!.pickupLocation = LOCATION_ID
        payload.booking!.dropOffLocation = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(204)

        payload.booking!.dropOffLocation = LOCATION_ID
        payload.booking!.company = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(204)

        payload.booking!.company = SUPPLIER_ID
        payload.booking!.driver = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(204)

        payload.booking = undefined
        res = await request(app)
            .post('/api/checkout')
            .send(payload)
        expect(res.statusCode).toBe(400)

        res = await request(app)
            .post('/api/checkout')
            .send({ booking: { driver: DRIVER1_ID } })
        expect(res.statusCode).toBe(400)
    })
})

describe('POST /api/update-booking', () => {
    it('should update a booking', async () => {
        const token = await testHelper.signinAsAdmin()

        ADDITIONAL_DRIVER.fullName = 'Additional Driver 2'
        const payload: bookcarsTypes.UpsertBookingPayload = {
            booking: {
                _id: BOOKING_ID,
                company: SUPPLIER_ID,
                car: CAR2_ID,
                driver: DRIVER1_ID,
                pickupLocation: LOCATION_ID,
                dropOffLocation: LOCATION_ID,
                from: new Date(2024, 2, 1),
                to: new Date(1990, 2, 4),
                status: bookcarsTypes.BookingStatus.Paid,
                cancellation: true,
                amendments: true,
                theftProtection: false,
                collisionDamageWaiver: false,
                fullInsurance: false,
                price: 3520,
                additionalDriver: true,
            },
            additionalDriver: ADDITIONAL_DRIVER,
        }
        let res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        expect(res.body.car).toBe(CAR2_ID)
        expect(res.body.price).toBe(3520)
        expect(res.body.status).toBe(bookcarsTypes.BookingStatus.Paid)
        let additionalDriver = await AdditionalDriver.findOne({ email: ADDITIONAL_DRIVER_EMAIL })
        expect(additionalDriver).not.toBeNull()
        expect(additionalDriver?.fullName).toBe(ADDITIONAL_DRIVER.fullName)

        const booking = await Booking.findById(BOOKING_ID)
        expect(booking).not.toBeNull()
        booking!._additionalDriver = testHelper.GetRandromObjectId()
        await booking?.save()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(204)

        payload.booking.additionalDriver = false
        payload.additionalDriver = undefined
        booking!._additionalDriver = new mongoose.Types.ObjectId(ADDITIONAL_DRIVER_ID)
        await booking?.save()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        additionalDriver = await AdditionalDriver.findOne({ email: ADDITIONAL_DRIVER_EMAIL })
        expect(additionalDriver).toBeNull()

        payload.additionalDriver = ADDITIONAL_DRIVER
        booking!._additionalDriver = undefined
        await booking?.save()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        const deleteRes = await AdditionalDriver.deleteOne({ email: ADDITIONAL_DRIVER_EMAIL })
        expect(deleteRes.deletedCount).toBe(1)

        payload.booking._id = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(204)

        // notifyDriver
        payload.booking._id = BOOKING_ID
        payload.booking.status = bookcarsTypes.BookingStatus.Cancelled
        payload.additionalDriver = undefined
        payload.booking.driver = testHelper.GetRandromObjectIdAsString()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)

        payload.booking.driver = DRIVER1_ID
        payload.booking.status = bookcarsTypes.BookingStatus.Void
        let pushToken = new PushToken({ user: payload.booking.driver, token: uuid() })
        await pushToken.save()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        await PushToken.deleteOne({ _id: pushToken._id })

        payload.booking.status = bookcarsTypes.BookingStatus.Cancelled
        pushToken = new PushToken({ user: payload.booking.driver, token: '0' })
        await pushToken.save()
        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        await PushToken.deleteOne({ _id: pushToken._id })

        res = await request(app)
            .put('/api/update-booking')
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('POST /api/update-booking-status', () => {
    it('should update booking status', async () => {
        const token = await testHelper.signinAsAdmin()

        const payload: bookcarsTypes.UpdateStatusPayload = {
            ids: [BOOKING_ID],
            status: bookcarsTypes.BookingStatus.Reserved,
        }
        let res = await request(app)
            .post('/api/update-booking-status')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        const booking = await Booking.findById(BOOKING_ID)
        expect(booking?.status).toBe(bookcarsTypes.BookingStatus.Reserved)

        res = await request(app)
            .post('/api/update-booking-status')
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('GET /api/booking/:id/:language', () => {
    it('should get a booking', async () => {
        const token = await testHelper.signinAsAdmin()

        let res = await request(app)
            .get(`/api/booking/${BOOKING_ID}/${testHelper.LANGUAGE}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(200)
        expect(res.body.car._id).toBe(CAR2_ID)

        res = await request(app)
            .get(`/api/booking/${testHelper.GetRandromObjectIdAsString()}/${testHelper.LANGUAGE}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(204)

        res = await request(app)
            .get(`/api/booking/${uuid()}/${testHelper.LANGUAGE}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('POST /api/bookings/:page/:size/:language', () => {
    it('should get bookings', async () => {
        const token = await testHelper.signinAsAdmin()

        const payload: bookcarsTypes.GetBookingsPayload = {
            companies: [SUPPLIER_ID],
            statuses: [bookcarsTypes.BookingStatus.Reserved],
            filter: {
                pickupLocation: LOCATION_ID,
                dropOffLocation: LOCATION_ID,
                from: new Date(2024, 2, 1),
                to: new Date(1990, 2, 4),
                keyword: testHelper.USER_FULL_NAME,
            },
            user: testHelper.getUserId(),
            car: CAR2_ID,
        }

        let res = await request(app)
            .post(`/api/bookings/${testHelper.PAGE}/${testHelper.SIZE}/${testHelper.LANGUAGE}`)
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        expect(res.body[0].resultData.length).toBe(1)

        payload.filter!.keyword = BOOKING_ID
        res = await request(app)
            .post(`/api/bookings/${testHelper.PAGE}/${testHelper.SIZE}/${testHelper.LANGUAGE}`)
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        expect(res.body[0].resultData.length).toBe(1)

        res = await request(app)
            .post(`/api/bookings/${testHelper.PAGE}/${testHelper.SIZE}/${testHelper.LANGUAGE}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('GET /api/has-bookings/:driver', () => {
    it("should check driver's bookings", async () => {
        const token = await testHelper.signinAsAdmin()

        let res = await request(app)
            .get(`/api/has-bookings/${DRIVER1_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(200)

        res = await request(app)
            .get(`/api/has-bookings/${SUPPLIER_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(204)
        const booking = await Booking.findById(BOOKING_ID)
        expect(booking?.status).toBe(bookcarsTypes.BookingStatus.Reserved)

        res = await request(app)
            .get(`/api/has-bookings/${uuid()}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('POST /api/cancel-booking/:id', () => {
    it('should cancel a booking', async () => {
        const token = await testHelper.signinAsUser()

        let booking = await Booking.findById(BOOKING_ID)
        expect(booking?.cancelRequest).toBeFalsy()

        let res = await request(app)
            .post(`/api/cancel-booking/${BOOKING_ID}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(200)
        booking = await Booking.findById(BOOKING_ID)
        expect(booking?.cancelRequest).toBeTruthy()

        res = await request(app)
            .post(`/api/cancel-booking/${testHelper.GetRandromObjectIdAsString()}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(204)

        res = await request(app)
            .post(`/api/cancel-booking/${uuid()}`)
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})

describe('DELETE /api/delete-bookings', () => {
    it('should delete bookings', async () => {
        const token = await testHelper.signinAsAdmin()

        const drivers = [DRIVER1_ID, DRIVER2_ID]
        let bookings = await Booking.find({ driver: { $in: drivers } })
        expect(bookings.length).toBeGreaterThan(0)
        const payload: string[] = bookings.map((u) => u.id)
        let res = await request(app)
            .post('/api/delete-bookings')
            .set(env.X_ACCESS_TOKEN, token)
            .send(payload)
        expect(res.statusCode).toBe(200)
        bookings = await Booking.find({ driver: { $in: drivers } })
        expect(bookings.length).toBe(0)
        const additionalDriver = await AdditionalDriver.findOne({ email: ADDITIONAL_DRIVER_EMAIL })
        expect(additionalDriver).toBeNull()

        res = await request(app)
            .post('/api/delete-bookings')
            .set(env.X_ACCESS_TOKEN, token)
        expect(res.statusCode).toBe(400)

        await testHelper.signout(token)
    })
})
