
import {
    BC_APP_TYPE,
    BC_API_HOST,
    BC_DEFAULT_LANGUAGE,
    BC_DATE_FORMAT,
    BC_PAGE_SIZE,
    BC_CARS_PAGE_SIZE,
    BC_BOOKINGS_PAGE_SIZE,
    BC_CDN_USERS,
    BC_CDN_CARS,
    BC_COMAPANY_IMAGE_WIDTH,
    BC_COMAPANY_IMAGE_HEIGHT,
    BC_CAR_IMAGE_WIDTH,
    BC_CAR_IMAGE_HEIGHT,
    BC_RECAPTCHA_SITE_KEY,
    BC_MINIMUM_AGE
} from '@env';

const Env = {
    APP_TYPE: BC_APP_TYPE || 'frontend',
    API_HOST: BC_API_HOST,
    LANGUAGES: ['fr', 'en'],
    DEFAULT_LANGUAGE: BC_DEFAULT_LANGUAGE || 'fr',
    LANGUAGE: {
        FR: 'fr',
        EN: 'en'
    },
    DATE_FORMAT: BC_DATE_FORMAT || 'llll',
    PAGE_SIZE: parseInt(BC_PAGE_SIZE || 30),
    CARS_PAGE_SIZE: parseInt(BC_CARS_PAGE_SIZE || 15),
    BOOKINGS_PAGE_SIZE: parseInt(BC_BOOKINGS_PAGE_SIZE || 20),
    CDN_USERS: BC_CDN_USERS,
    CDN_CARS: BC_CDN_CARS,
    PAGE_OFFSET: 200,
    CAR_PAGE_OFFSET: 400,
    COMPANY_IMAGE_WIDTH: parseInt(BC_COMAPANY_IMAGE_WIDTH || 60),
    COMPANY_IMAGE_HEIGHT: parseInt(BC_COMAPANY_IMAGE_HEIGHT || 30),
    CAR_IMAGE_WIDTH: parseInt(BC_CAR_IMAGE_WIDTH || 300),
    CAR_IMAGE_HEIGHT: parseInt(BC_CAR_IMAGE_HEIGHT || 200),
    CAR_OPTION_IMAGE_HEIGHT: 85,
    SELECTED_CAR_OPTION_IMAGE_HEIGHT: 30,
    RECAPTCHA_SITE_KEY: BC_RECAPTCHA_SITE_KEY,
    RECORD_TYPE: {
        ADMIN: 'admin',
        COMPANY: 'company',
        USER: 'user',
        CAR: 'car',
        LOCATION: 'location'
    },
    CAR_TYPE: {
        DIESEL: 'diesel',
        GASOLINE: 'gasoline'
    },
    GEARBOX_TYPE: {
        MANUAL: 'manual',
        AUTOMATIC: 'automatic'
    },
    FUEL_POLICY: {
        LIKE_FOR_LIKE: 'likeForlike',
        FREE_TANK: 'freeTank'
    },
    BOOKING_STATUS: {
        VOID: 'void',
        PENDING: 'pending',
        DEPOSIT: 'deposit',
        PAID: 'paid',
        RESERVED: 'reserved',
        CANCELLED: 'cancelled'
    },
    MINIMUM_AGE: parseInt(BC_MINIMUM_AGE || 21),
    MILEAGE: {
        LIMITED: 'limited',
        UNLIMITED: 'unlimited'
    },
    ORIENTATION: {
        PORTRAIT: 'portrait',
        LANDSCAPE: 'landscape'
    }
};

export default Env;