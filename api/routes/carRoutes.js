import express from 'express';
import routeNames from '../config/carRoutes.config.js';
import Env from '../config/env.config.js';
import strings from '../config/app.config.js';
import authJwt from '../middlewares/authJwt.js';
import Car from '../schema/Car.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v1 as uuid } from 'uuid';
import escapeStringRegexp from 'escape-string-regexp';
import mongoose from 'mongoose';

const CDN = process.env.BC_CDN_CARS;
const CDN_TEMP = process.env.BC_CDN_TEMP_CARS;

const routes = express.Router();

routes.route(routeNames.create).post(authJwt.verifyToken, (req, res) => {
    const { body } = req;

    if (!body.image) {
        console.error(`[car.create]  ${strings.CAR_IMAGE_REQUIRED} ${req.body}`);
        res.status(400).send(strings.CAR_IMAGE_REQUIRED + err);
        return;
    }

    const car = new Car(req.body);

    car.save()
        .then(async car => {

            if (car.image) {
                const image = path.join(CDN_TEMP, body.image);
                if (fs.existsSync(image)) {
                    const filename = `${car._id}_${Date.now()}${path.extname(body.image)}`;
                    const newPath = path.join(CDN, filename);

                    try {
                        fs.renameSync(image, newPath);
                        car.image = filename;
                        try {
                            await car.save();
                        } catch (err) {
                            console.error(strings.DB_ERROR, err);
                            res.status(400).send(strings.DB_ERROR + err);
                        }
                    } catch (err) {
                        console.error(strings.ERROR, err);
                        res.status(400).send(strings.ERROR + err);
                    }
                } else {
                    console.error(strings.CAR_IMAGE_NOT_FOUND, body);

                    try {
                        await Car.deleteOne({ _id: car._id });
                    } catch (err) {
                        console.error(strings.DB_ERROR, err);
                        res.status(400).send(strings.DB_ERROR + err);
                    }
                    finally {
                        res.status(400).send(strings.CAR_IMAGE_NOT_FOUND + body);
                    }

                    return;
                }
            }

            res.json(car);
        })
        .catch(err => {
            console.error(`[car.create]  ${strings.DB_ERROR} ${req.body}`, err);
            res.status(400).send(strings.DB_ERROR + err);
        });
});

routes.route(routeNames.update).put(authJwt.verifyToken, (req, res) => {
    Car.findById(req.body._id)
        .then(car => {
            if (car) {
                const {
                    company,
                    name,
                    available,
                    type,
                    locations,
                    price,
                    seats,
                    doors,
                    aircon,
                    gearbox,
                    fuelPolicy,
                    cancellation,
                    amendments,
                    theftProtection,
                    collisionDamageWaiver,
                    fullInsurance,
                    addionaldriver
                } = req.body;

                car.company = company;
                car.locations = locations;
                car.name = name;
                car.available = available;
                car.type = type;
                car.price = price;
                car.seats = seats;
                car.doors = doors;
                car.aircon = aircon;
                car.gearbox = gearbox;
                car.fuelPolicy = fuelPolicy;
                car.cancellation = cancellation;
                car.amendments = amendments;
                car.theftProtection = theftProtection;
                car.collisionDamageWaiver = collisionDamageWaiver;
                car.fullInsurance = fullInsurance;
                car.addionaldriver = addionaldriver;

                car.save()
                    .then(_ => res.sendStatus(200))
                    .catch(err => {
                        console.error(`[car.update]  ${strings.DB_ERROR} ${req.body}`, err);
                        res.status(400).send(strings.DB_ERROR + err);
                    });
            } else {
                console.error('[car.update] Car not found:', req.body);
                res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(`[car.update]  ${strings.DB_ERROR} ${req.body}`, err);
            res.status(400).send(strings.DB_ERROR + err);
        });
});

routes.route(routeNames.delete).delete(authJwt.verifyToken, (req, res) => {
    const id = req.params.id;
    // TODO
    res.sendStatus(200);
});

routes.route(routeNames.createImage).post([authJwt.verifyToken, multer({ storage: multer.memoryStorage() }).single('image')], (req, res) => {
    try {
        if (!fs.existsSync(CDN_TEMP)) {
            fs.mkdirSync(CDN_TEMP, { recursive: true });
        }

        const filename = `${uuid()}_${Date.now()}${path.extname(req.file.originalname)}`;
        const filepath = path.join(CDN_TEMP, filename);

        fs.writeFileSync(filepath, req.file.buffer);
        res.json(filename);
    } catch (err) {
        console.error(strings.ERROR, err);
        res.status(400).send(strings.ERROR + err);
    }
});

routes.route(routeNames.updateImage).post([authJwt.verifyToken, multer({ storage: multer.memoryStorage() }).single('image')], (req, res) => {

    Car.findById(req.params.id)
        .then(car => {
            if (car) {
                if (!fs.existsSync(CDN)) {
                    fs.mkdirSync(CDN, { recursive: true });
                }

                if (car.image) {
                    const image = path.join(CDN, car.image);
                    if (fs.existsSync(image)) {
                        fs.unlinkSync(image);
                    }
                }

                const filename = `${car._id}_${Date.now()}${path.extname(req.file.originalname)}`;
                const filepath = path.join(CDN, filename);

                fs.writeFileSync(filepath, req.file.buffer);
                car.image = filename;
                car.save()
                    .then(usr => {
                        res.sendStatus(200);
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        res.status(400).send(strings.DB_ERROR + err);
                    });
            } else {
                console.error('[car.updateImage] Car not found:', req.params.id);
                res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            res.status(400).send(strings.DB_ERROR + err);
        });
});

routes.route(routeNames.deleteImage).post(authJwt.verifyToken, (req, res) => {

    Car.findById(req.params.id)
        .then(car => {
            if (car) {
                if (car.image) {
                    const image = path.join(CDN, car.image);
                    if (fs.existsSync(image)) {
                        fs.unlinkSync(image);
                    }
                }
                car.image = null;

                car.save()
                    .then(_ => {
                        res.sendStatus(200);
                    })
                    .catch(err => {
                        console.error(strings.DB_ERROR, err);
                        res.status(400).send(strings.DB_ERROR + err);
                    });
            } else {
                console.error('[car.deleteImage] Car not found:', req.params.id);
                res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(strings.DB_ERROR, err);
            res.status(400).send(strings.DB_ERROR + err);
        });
});

routes.route(routeNames.deleteTempImage).post(authJwt.verifyToken, (req, res) => {
    try {
        const image = path.join(CDN_TEMP, req.params.image);
        if (fs.existsSync(image)) {
            fs.unlinkSync(image);
        }
        res.sendStatus(200);
    } catch (err) {
        console.error(strings.ERROR, err);
        res.status(400).send(strings.ERROR + err);
    }
});

routes.route(routeNames.getCar).get(authJwt.verifyToken, (req, res) => {
    Car.findById(req.params.id)
        .populate('company')
        .populate('locations')
        .then(car => {
            if (car) {
                res.json(car);
            } else {
                console.error('[car.getCar] Car not found:', req.params.id);
                res.sendStatus(204);
            }
        })
        .catch(err => {
            console.error(`[car.getCar]  ${strings.DB_ERROR} ${req.params.id}`, err);
            res.status(400).send(strings.DB_ERROR + err);
        });
});

routes.route(routeNames.getCars).post(authJwt.verifyToken, async (req, res) => {
    try {
        const keyword = escapeStringRegexp(req.query.s || '');
        const options = 'i';
        const page = parseInt(req.params.page);
        const size = parseInt(req.params.size);

        const companies = [];
        for (const id of req.body) {
            companies.push(mongoose.Types.ObjectId(id));
        }

        const cars = await Car.aggregate([
            { $match: { name: { $regex: keyword, $options: options }, company: { $in: companies } } },
            {
                $lookup: {
                    from: 'User',
                    let: { userId: '$company' },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ['$_id', '$$userId'] }
                            }
                        }
                    ],
                    as: 'company'
                }
            },
            { $unwind: { path: '$company', preserveNullAndEmptyArrays: false } },
            { $sort: { name: 1 } },
            { $skip: ((page - 1) * size) },
            { $limit: size }
        ]);

        res.json(cars);
    } catch (err) {
        console.error(`[location.getLocations]  ${strings.DB_ERROR} ${req.query.s}`, err);
        res.status(400).send(strings.DB_ERROR + err);
    }
});


export default routes;