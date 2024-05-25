import * as bookcarsTypes from ':bookcars-types'
import Const from './const'

//
// ISO 639-1 language codes and their labels
// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
//
const LANGUAGES = [
  {
    code: 'en',
    label: 'English',
  },
  {
    code: 'fr',
    label: 'Français',
  },
  {
    code: 'el',
    label: 'Greek',
  },
]

const env = {
  isMobile: () => window.innerWidth <= 960,

  APP_TYPE: bookcarsTypes.AppType.Frontend,
  API_HOST: String(import.meta.env.VITE_BC_API_HOST),
  LANGUAGES: LANGUAGES.map((l) => l.code),
  _LANGUAGES: LANGUAGES,
  DEFAULT_LANGUAGE: String(import.meta.env.VITE_BC_DEFAULT_LANGUAGE || 'en'),
  PAGE_SIZE: Number.parseInt(String(import.meta.env.VITE_BC_PAGE_SIZE), 10) || 30,
  CARS_PAGE_SIZE: Number.parseInt(String(import.meta.env.VITE_BC_CARS_PAGE_SIZE), 10) || 15,
  BOOKINGS_PAGE_SIZE: Number.parseInt(String(import.meta.env.VITE_BC_BOOKINGS_PAGE_SIZE), 10) || 20,
  BOOKINGS_MOBILE_PAGE_SIZE: Number.parseInt(String(import.meta.env.VITE_BC_BOOKINGS_MOBILE_PAGE_SIZE), 10) || 10,
  CDN_USERS: String(import.meta.env.VITE_BC_CDN_USERS),
  CDN_CARS: String(import.meta.env.VITE_BC_CDN_CARS),
  PAGE_OFFSET: 200,
  INFINITE_SCROLL_OFFSET: 40,
  SUPPLIER_IMAGE_WIDTH: Number.parseInt(String(import.meta.env.VITE_BC_SUPPLIER_IMAGE_WIDTH), 10) || 60,
  SUPPLIER_IMAGE_HEIGHT: Number.parseInt(String(import.meta.env.VITE_BC_SUPPLIER_IMAGE_HEIGHT), 10) || 30,
  CAR_IMAGE_WIDTH: Number.parseInt(String(import.meta.env.VITE_BC_CAR_IMAGE_WIDTH), 10) || 300,
  CAR_IMAGE_HEIGHT: Number.parseInt(String(import.meta.env.VITE_BC_CAR_IMAGE_HEIGHT), 10) || 200,
  CAR_OPTION_IMAGE_HEIGHT: 85,
  SELECTED_CAR_OPTION_IMAGE_HEIGHT: 30,
  RECAPTCHA_ENABLED: (import.meta.env.VITE_BC_RECAPTCHA_ENABLED && import.meta.env.VITE_BC_RECAPTCHA_ENABLED.toLowerCase()) === 'true',
  RECAPTCHA_SITE_KEY: String(import.meta.env.VITE_BC_RECAPTCHA_SITE_KEY),
  MINIMUM_AGE: Number.parseInt(String(import.meta.env.VITE_BC_MINIMUM_AGE), 10) || 21,
  /**
   * PAGINATION_MODE: CLASSIC or INFINITE_SCROLL
   * If you choose CLASSIC, you will get a classic pagination with next and previous buttons on desktop and infinite scroll on mobile.
   * If you choose INFINITE_SCROLL, you will get infinite scroll on desktop and mobile.
   * Default is CLASSIC
   */
  PAGINATION_MODE:
    (import.meta.env.VITE_BC_PAGINATION_MODE && import.meta.env.VITE_BC_PAGINATION_MODE.toUpperCase()) === Const.PAGINATION_MODE.INFINITE_SCROLL
      ? Const.PAGINATION_MODE.INFINITE_SCROLL
      : Const.PAGINATION_MODE.CLASSIC,
  STRIPE_PUBLISHABLE_KEY: String(import.meta.env.VITE_BC_STRIPE_PUBLISHABLE_KEY),
  /**
   * The three-letter ISO 4217 alphabetic currency code, e.g. "USD" or "EUR". Required for Stripe payments. Default is "USD".
   * Must be a supported currency: https://docs.stripe.com/currencies
   * */
  STRIPE_CURRENCY_CODE: String(import.meta.env.VITE_BC_STRIPE_CURRENCY_CODE || 'USD'),
  CURRENCY: import.meta.env.VITE_BC_CURRENCY || '$',
  SET_LANGUAGE_FROM_IP: (import.meta.env.VITE_BC_SET_LANGUAGE_FROM_IP && import.meta.env.VITE_BC_SET_LANGUAGE_FROM_IP.toLowerCase()) === 'true',
}

export default env
