import React, { Component } from 'react';
import Env from '../config/env.config';
import { strings as commonStrings } from '../lang/common';
import { strings } from '../lang/cars';
import Helper from '../common/Helper';
import CarService from '../services/CarService';
import UserService from '../services/UserService';
import { toast } from 'react-toastify';
import Backdrop from './SimpleBackdrop';
import {
    Button,
    Tooltip,
    Card,
    CardContent,
    Typography
} from '@mui/material';
import {
    LocalGasStation as FuelIcon,
    AccountTree as GearboxIcon,
    Person as SeatsIcon,
    AcUnit as AirconIcon,
    DirectionsCar as MileageIcon,
    Check as CheckIcon,
    Clear as UncheckIcon,
} from '@mui/icons-material';

import DoorsIcon from '../assets/img/car-door.png';

import '../assets/css/car-list.css';

class CarList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            language: Env.DEFAULT_LANGUAGE,
            companies: props.companies,
            loading: true,
            fetch: false,
            reload: false,
            rows: [],
            rowCount: 0,
            page: 1,
            size: Env.CARS_PAGE_SIZE,
            carId: '',
            carIndex: -1,
            from: null,
            to: null,
            days: 0,
            pickupLocation: props.pickupLocation,
            dropOffLocation: props.dropOffLocation,
            fuel: props.fuel,
            gearbox: props.gearbox,
            mileageUnlimited: props.mileageUnlimited
        };
    }

    fetch = () => {
        const { page, size, companies, pickupLocation, rows, fuel, gearbox, mileageUnlimited } = this.state;

        this.setState({ loading: true });

        const payload = { companies, pickupLocation, fuel, gearbox, mileageUnlimited };

        CarService.getCars(payload, page, size)
            .then(data => {
                const _data = data.length > 0 ? data[0] : {};
                if (_data.length === 0) _data.resultData = [];
                const totalRecords = _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0;
                const _rows = page === 1 ? _data.resultData : [...rows, ..._data.resultData];
                this.setState({ rows: _rows, rowCount: totalRecords, loading: false, fetch: _data.resultData.length > 0 }, () => {
                    if (page === 1) {
                        // document.querySelector('section.car-list').scrollTo(0, 0);
                        document.querySelector('div.cars').scrollTo(0, 0);
                    }
                    if (this.props.onLoad) {
                        this.props.onLoad({ rows: _data.resultData, rowCount: totalRecords });
                    }
                });
            })
            .catch(() => toast(commonStrings.GENERIC_ERROR, { type: 'error' }));
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const { companies, pickupLocation, dropOffLocation, from, to, reload, fuel, gearbox, mileageUnlimited } = prevState;

        if (nextProps.companies && !Helper.arrayEqual(companies, nextProps.companies)) {
            return { companies: Helper.clone(nextProps.companies) };
        }

        if (nextProps.fuel && !Helper.arrayEqual(fuel, nextProps.fuel)) {
            return { fuel: Helper.clone(nextProps.fuel) };
        }

        if (nextProps.gearbox && !Helper.arrayEqual(gearbox, nextProps.gearbox)) {
            return { gearbox: Helper.clone(nextProps.gearbox) };
        }

        if (mileageUnlimited !== nextProps.mileageUnlimited) {
            return { mileageUnlimited: nextProps.mileageUnlimited };
        }

        if (pickupLocation !== nextProps.pickupLocation) {
            return { pickupLocation: nextProps.pickupLocation };
        }

        if (dropOffLocation !== nextProps.dropOffLocation) {
            return { dropOffLocation: nextProps.dropOffLocation };
        }

        if (from !== nextProps.from) {
            return { from: nextProps.from };
        }

        if (to !== nextProps.to) {
            return { to: nextProps.to };
        }

        if (reload !== nextProps.reload) {
            return { reload: nextProps.reload };
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        const { companies, pickupLocation, from, to, reload, fuel, gearbox, mileageUnlimited } = this.state;

        if (!Helper.arrayEqual(companies, prevState.companies)) {
            return this.setState({ page: 1 }, () => this.fetch());
        }

        if (!Helper.arrayEqual(fuel, prevState.fuel)) {
            return this.setState({ page: 1 }, () => this.fetch());
        }

        if (!Helper.arrayEqual(gearbox, prevState.gearbox)) {
            return this.setState({ page: 1 }, () => this.fetch());
        }

        if (mileageUnlimited !== prevState.mileageUnlimited) {
            return this.setState({ page: 1 }, () => this.fetch());
        }

        if (pickupLocation && pickupLocation !== prevState.pickupLocation) {
            return this.setState({ page: 1 }, () => this.fetch());
        }

        if (reload && !prevState.reload) {
            return this.setState({ page: 1 }, () => this.fetch());
        }

        if (from !== prevState.from || to !== prevState.to) {
            return this.setState({ days: Helper.days(from, to) });
        }

    }

    componentDidMount() {
        // const section = document.querySelector('section.car-list');
        const div = document.querySelector('div.cars');
        if (div) {
            div.onscroll = (event) => {
                const { fetch, loading, page } = this.state;
                let offset = 0;
                if (Env.isMobile()) offset = document.querySelector('div.col-1').clientHeight;
                if (fetch
                    && !loading
                    && event.target.scrollTop > 0
                    && (event.target.offsetHeight + event.target.scrollTop + offset) >= (event.target.scrollHeight - Env.CAR_PAGE_OFFSET)) {
                    this.setState({ page: page + 1 }, () => {
                        this.fetch();
                    });
                }
            };
        }

        const { companies, cars } = this.props;

        if (companies) {
            if (companies.length > 0) {
                this.fetch();
            } else {
                this.setState({ rows: [], rowCount: 0, loading: false, fetch: false }, () => {
                    if (this.props.onLoad) {
                        this.props.onLoad({ rows: [], rowCount: 0 });
                    }
                });
            }
        } else if (cars) {
            this.setState({ rows: cars, rowCount: cars.length, loading: false, fetch: false }, () => {
                if (this.props.onLoad) {
                    this.props.onLoad({ rows: [], rowCount: 0 });
                }
            });
        }

        this.setState({ language: UserService.getLanguage() })
    }

    render() {
        const { rows, loading, language, from, to, days, pickupLocation, dropOffLocation } = this.state;
        const fr = language === 'fr';

        return (
            <section className='car-list'>
                {rows.length === 0 ?
                    !loading && !this.props.loading && <Card variant="outlined" className="empty-list">
                        <CardContent>
                            <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
                        </CardContent>
                    </Card>
                    :
                    ((from && to) || this.props.hideTotalPrice) && rows.map((car, index) => (
                        <article key={car._id}>
                            <div className='name'><h2>{car.name}</h2></div>
                            <div className='car'>
                                <img src={Helper.joinURL(Env.CDN_CARS, car.image)}
                                    alt={car.name} className='car-img'
                                    style={{
                                        maxWidth: Env.CAR_IMAGE_WIDTH,
                                    }} />
                                {!this.props.hideCompany &&
                                    <div className='car-company'>
                                        <span className='car-company-logo'>
                                            <img src={Helper.joinURL(Env.CDN_USERS, car.company.avatar)}
                                                alt={car.company.fullName}
                                                style={{
                                                    width: Env.COMPANY_IMAGE_WIDTH,
                                                }}
                                            />
                                        </span>
                                        <label className='car-company-info'>{car.company.fullName}</label>
                                    </div>
                                }
                            </div>
                            <div className='car-info'>
                                <ul className='car-info-list'>
                                    <li className='car-type'>
                                        <Tooltip title={Helper.getCarTypeTooltip(car.type)} placement='top'>
                                            <div className='car-info-list-item'>
                                                <FuelIcon />
                                                <span className='car-info-list-text'>{Helper.getCarTypeShort(car.type)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li className='gearbox'>
                                        <Tooltip title={Helper.getGearboxTooltip(car.gearbox)} placement='top'>
                                            <div className='car-info-list-item'>
                                                <GearboxIcon />
                                                <span className='car-info-list-text'>{Helper.getGearboxTypeShort(car.gearbox)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li className='seats'>
                                        <Tooltip title={Helper.getSeatsTooltip(car.seats)} placement='top'>
                                            <div className='car-info-list-item'>
                                                <SeatsIcon />
                                                <span className='car-info-list-text'>{car.seats}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li className='doors'>
                                        <Tooltip title={Helper.getDoorsTooltip(car.doors)} placement='top'>
                                            <div className='car-info-list-item'>
                                                <img src={DoorsIcon} alt='' className='car-doors' />
                                                <span className='car-info-list-text'>{car.doors}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    {car.aircon &&
                                        <li className='aircon'>
                                            <Tooltip title={strings.AIRCON_TOOLTIP} placement='top'>
                                                <div className='car-info-list-item'>
                                                    <AirconIcon />
                                                </div>
                                            </Tooltip>
                                        </li>
                                    }
                                    <li className='mileage'>
                                        <Tooltip title={Helper.getMileageTooltip(car.mileage, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                <MileageIcon />
                                                <span className='car-info-list-text'>{`${strings.MILEAGE}${fr ? ' : ' : ': '}${Helper.getMileage(car.mileage)}`}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li className='fuel-policy'>
                                        <Tooltip title={Helper.getFuelPolicyTooltip(car.fuelPolicy)} placement='left'>
                                            <div className='car-info-list-item'>
                                                <FuelIcon />
                                                <span className='car-info-list-text'>{`${strings.FUEL_POLICY}${fr ? ' : ' : ': '}${Helper.getFuelPolicy(car.fuelPolicy)}`}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                </ul>
                                <ul className='extras-list'>
                                    <li>
                                        <Tooltip title={car.cancellation > -1 ? strings.CANCELLATION_TOOLTIP : Helper.getCancellation(car.cancellation, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                {car.cancellation > -1 ? <CheckIcon className='available' /> : <UncheckIcon className='unavailable' />}
                                                <span className='car-info-list-text'>{Helper.getCancellation(car.cancellation, fr)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li>
                                        <Tooltip title={car.amendments > -1 ? strings.AMENDMENTS_TOOLTIP : Helper.getAmendments(car.amendments, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                {car.amendments > -1 ? <CheckIcon className='available' /> : <UncheckIcon className='unavailable' />}
                                                <span className='car-info-list-text'>{Helper.getAmendments(car.amendments, fr)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li>
                                        <Tooltip title={car.theftProtection > -1 ? strings.THEFT_PROTECTION_TOOLTIP : Helper.getTheftProtection(car.theftProtection, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                {car.theftProtection > -1 ? <CheckIcon className='available' /> : <UncheckIcon className='unavailable' />}
                                                <span className='car-info-list-text'>{Helper.getTheftProtection(car.theftProtection, fr)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li>
                                        <Tooltip title={car.collisionDamageWaiver > -1 ? strings.COLLISION_DAMAGE_WAVER_TOOLTIP : Helper.getCollisionDamageWaiver(car.collisionDamageWaiver, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                {car.collisionDamageWaiver > -1 ? <CheckIcon className='available' /> : <UncheckIcon className='unavailable' />}
                                                <span className='car-info-list-text'>{Helper.getCollisionDamageWaiver(car.collisionDamageWaiver, fr)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li>
                                        <Tooltip title={car.fullInsurance > -1 ? strings.FULL_INSURANCE_TOOLTIP : Helper.getFullInsurance(car.fullInsurance, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                {car.fullInsurance > -1 ? <CheckIcon className='available' /> : <UncheckIcon className='unavailable' />}
                                                <span className='car-info-list-text'>{Helper.getFullInsurance(car.fullInsurance, fr)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                    <li>
                                        <Tooltip title={Helper.getAdditionalDriver(car.additionalDriver, fr)} placement='left'>
                                            <div className='car-info-list-item'>
                                                {car.additionalDriver > -1 ? <CheckIcon className='available' /> : <UncheckIcon className='unavailable' />}
                                                <span className='car-info-list-text'>{Helper.getAdditionalDriver(car.additionalDriver, fr)}</span>
                                            </div>
                                        </Tooltip>
                                    </li>
                                </ul>
                            </div>
                            <div className='price'>
                                {this.props.hideTotalPrice ?
                                    <label className='price-main'>
                                        {`${car.price} ${strings.CAR_CURRENCY}`}
                                    </label>
                                    :
                                    <>
                                        <label className='price-days'>
                                            {Helper.getDays(days)}
                                        </label>
                                        <label className='price-main'>
                                            {`${Helper.price(car, from, to)} ${commonStrings.CURRENCY}`}
                                        </label>
                                        <label className='price-day'>
                                            {`${strings.PRICE_FOR_DAY} ${car.price} ${commonStrings.CURRENCY}`}
                                        </label>
                                    </>}

                            </div>
                            {!this.props.hideTotalPrice &&
                                <div className='action'>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className='btn-book btn-margin-bottom'
                                        href={`/create-booking?c=${car._id}&p=${pickupLocation}&d=${dropOffLocation}&f=${from.getTime()}&t=${to.getTime()}`}
                                    >
                                        {strings.BOOK}
                                    </Button>
                                </div>}
                        </article>
                    ))
                }
                {loading && <Backdrop text={commonStrings.LOADING} />}
            </section>
        );
    }
}

export default CarList;