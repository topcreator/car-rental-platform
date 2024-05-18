import 'dotenv/config'
import mongoose from 'mongoose'
import * as bookcarsTypes from ':bookcars-types'
import * as env from '../src/config/env.config'
import * as databaseHelper from '../src/common/databaseHelper'
import * as mailHelper from '../src/common/mailHelper'
import * as testHelper from './testHelper'
import AdditionalDriver from '../src/models/AdditionalDriver'
import User from '../src/models/User'

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  const res = await databaseHelper.connect(env.DB_URI, false, false)
  expect(res).toBeTruthy()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  if (mongoose.connection.readyState) {
    await databaseHelper.close()
  }
})

const ADDITIONAL_DRIVER: bookcarsTypes.AdditionalDriver = {
  email: testHelper.GetRandomEmail(),
  fullName: 'Additional Driver 1',
  birthDate: new Date(1990, 5, 20),
  phone: '',
}

describe('Test AdditionalDriver phone validation', () => {
  it('should test AdditionalDriver phone validation', async () => {
    let res = true
    try {
      const additionalDriver = new AdditionalDriver(ADDITIONAL_DRIVER)
      await additionalDriver.save()
    } catch (err) {
      res = false
    }
    expect(res).toBeFalsy()
  })
})

describe('Test User phone validation', () => {
  it('should test User phone validation', async () => {
    let res = true
    const USER: bookcarsTypes.User = {
      email: testHelper.GetRandomEmail(),
      fullName: 'Additional Driver 1',
      birthDate: new Date(1990, 5, 20),
      phone: '',
    }

    let userId = ''
    try {
      const user = new User(USER)
      await user.save()
      userId = user.id
      user.phone = 'unknown'
      await user.save()
    } catch (err) {
      res = false
    } finally {
      if (userId) {
        await User.deleteOne({ _id: userId })
      }
    }
    expect(res).toBeFalsy()
  })
})

describe('Test email sending error', () => {
  it('should test email sending error', async () => {
    let res = true
    try {
      await mailHelper.sendMail({
        from: testHelper.GetRandomEmail(),
        to: 'wrong-email',
        subject: 'dummy subject',
        html: 'dummy body',
      })
    } catch (err) {
      res = false
    }
    expect(res).toBeFalsy()
  })
})
