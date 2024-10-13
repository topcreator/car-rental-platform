import React from 'react'
import ReactDOM from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

import { frFR as corefrFR, enUS as coreenUS, elGR as coreelGR } from '@mui/material/locale'
import { frFR, enUS, elGR } from '@mui/x-date-pickers/locales'
import { frFR as dataGridfrFR, enUS as dataGridenUS, elGR as dataGridelGR } from '@mui/x-data-grid/locales'
import { disableDevTools } from ':disable-react-devtools'
import * as helper from '@/common/helper'
import * as UserService from '@/services/UserService'
import env from '@/config/env.config'
import App from '@/App'

import { strings as activateStrings } from '@/lang/activate'
import { strings as bookingStrings } from '@/lang/booking'
import { strings as bookingCarListStrings } from '@/lang/booking-car-list'
import { strings as bookingFilterStrings } from '@/lang/booking-filter'
import { strings as bookingListStrings } from '@/lang/booking-list'
import { strings as bookingsStrings } from '@/lang/bookings'
import { strings as carMultimediaFilterStrings } from '@/lang/car-multimedia-filter'
import { strings as carRangeFilterStrings } from '@/lang/car-range-filter'
import { strings as carRatingFilterStrings } from '@/lang/car-rating-filter'
import { strings as carsStrings } from '@/lang/cars'
import { strings as carSeatsFilterStrings } from '@/lang/car-seats-filter'
import { strings as carSpecsStrings } from '@/lang/car-specs'
import { strings as changePasswordStrings } from '@/lang/change-password'
import { strings as checkoutStrings } from '@/lang/checkout'
import { strings as commonStrings } from '@/lang/common'
import { strings as contactFormStrings } from '@/lang/contact-form'
import { strings as footerStrings } from '@/lang/footer'
import { strings as headerStrings } from '@/lang/header'
import { strings as homeStrings } from '@/lang/home'
import { strings as locationCarrouselStrings } from '@/lang/location-carrousel'
import { strings as mapStrings } from '@/lang/map'
import { strings as masterStrings } from '@/lang/master'
import { strings as noMatchStrings } from '@/lang/no-match'
import { strings as notificationsStrings } from '@/lang/notifications'
import { strings as resetPasswordStrings } from '@/lang/reset-password'
import { strings as searchSrings } from '@/lang/search'
import { strings as searchFormStrings } from '@/lang/search-form'
import { strings as settingsStrings } from '@/lang/settings'
import { strings as signInStrings } from '@/lang/sign-in'
import { strings as signUpStrings } from '@/lang/sign-up'
import { strings as tosStrings } from '@/lang/tos'

import 'github-fork-ribbon-css/gh-fork-ribbon.css'

import 'react-toastify/dist/ReactToastify.min.css'
import '@/assets/css/common.css'
import '@/assets/css/index.css'

if (env.isProduction) {
  disableDevTools()
}

let language = env.DEFAULT_LANGUAGE
const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')
let lang = UserService.getQueryLanguage()

if (lang) {
  if (!env.LANGUAGES.includes(lang)) {
    lang = localStorage.getItem('bc-language')

    if (lang && !env.LANGUAGES.includes(lang)) {
      lang = env.DEFAULT_LANGUAGE
    }
  }

  try {
    if (user) {
      language = user.language
      if (lang && lang.length === 2 && user.language !== lang) {
        const data = {
          id: user.id,
          language: lang,
        }

        const status = await UserService.validateAccessToken()

        if (status === 200) {
          const _status = await UserService.updateLanguage(data)
          if (_status !== 200) {
            helper.error(null, commonStrings.CHANGE_LANGUAGE_ERROR)
          }
        }

        language = lang
      }
    } else if (lang) {
      language = lang
    }
    UserService.setLanguage(language)
    commonStrings.setLanguage(language)
  } catch (err) {
    helper.error(err, commonStrings.CHANGE_LANGUAGE_ERROR)
  }
} else {
  //
  // If language not set, set language by IP
  //
  let storedLang

  if (user && user.language) {
    storedLang = user.language
  } else {
    const slang = localStorage.getItem('bc-language')
    if (slang && slang.length === 2) {
      storedLang = slang
    }
  }

  const updateLang = (_lang: string) => {
    UserService.setLanguage(_lang)

    activateStrings.setLanguage(_lang)
    bookingStrings.setLanguage(_lang)
    bookingCarListStrings.setLanguage(_lang)
    bookingFilterStrings.setLanguage(_lang)
    bookingListStrings.setLanguage(_lang)
    bookingsStrings.setLanguage(_lang)
    carMultimediaFilterStrings.setLanguage(_lang)
    carRangeFilterStrings.setLanguage(_lang)
    carRatingFilterStrings.setLanguage(_lang)
    carsStrings.setLanguage(_lang)
    carSeatsFilterStrings.setLanguage(_lang)
    changePasswordStrings.setLanguage(_lang)
    checkoutStrings.setLanguage(_lang)
    commonStrings.setLanguage(_lang)
    contactFormStrings.setLanguage(_lang)
    footerStrings.setLanguage(_lang)
    headerStrings.setLanguage(_lang)
    homeStrings.setLanguage(_lang)
    locationCarrouselStrings.setLanguage(_lang)
    mapStrings.setLanguage(_lang)
    masterStrings.setLanguage(_lang)
    noMatchStrings.setLanguage(_lang)
    notificationsStrings.setLanguage(_lang)
    resetPasswordStrings.setLanguage(_lang)
    searchSrings.setLanguage(_lang)
    searchFormStrings.setLanguage(_lang)
    settingsStrings.setLanguage(_lang)
    signInStrings.setLanguage(_lang)
    signUpStrings.setLanguage(_lang)
    tosStrings.setLanguage(_lang)
    carSpecsStrings.setLanguage(_lang)
  }

  if (env.SET_LANGUAGE_FROM_IP && !storedLang) {
    const country = await UserService.getCountryFromIP()

    if (country === 'France' || country === 'Morocco') {
      updateLang('fr')
    } else if (country === 'Greece') {
      updateLang('el')
    } else {
      updateLang(env.DEFAULT_LANGUAGE)
    }
  }
}

language = UserService.getLanguage()
const isFr = language === 'fr'
const isEL = language === 'el'

const theme = createTheme(
  {
    // palette: {
    //   primary: {
    //     main: '#1976D2',
    //     contrastText: '#121212',
    //     dark: '#1976D2',
    //   },
    // },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        "'Segoe UI'",
        'Roboto',
        "'Helvetica Neue'",
        'Arial',
        'sans-serif',
        "'Apple Color Emoji'",
        "'Segoe UI Emoji'",
        "'Segoe UI Symbol'",
      ].join(','),
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: '#FAFAFA',
          },
        },
      },
      MuiFormControl: {
        styleOverrides: {
          root: {
            '& .Mui-disabled': {
              color: '#333 !important',
            },
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            '& .Mui-checked': {
              color: '#1976D2 !important',
            },
            '& .Mui-checked+.MuiSwitch-track': {
              opacity: 0.7,
              backgroundColor: '#1976D2 !important',
            },
          },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          root: {
            '& .MuiAutocomplete-inputRoot': {
              paddingRight: '20px !important',
            },
          },
          listbox: {
            '& .Mui-focused': {
              backgroundColor: '#eee !important',
            },
          },
          option: {
            // Hover
            // '&[data-focus="true"]': {
            //     backgroundColor: '#eee !important',
            //     borderColor: 'transparent',
            // },
            // Selected
            '&[aria-selected="true"]': {
              backgroundColor: '#faad43 !important',
            },
          },
        },
      },
    },
  },
  isFr ? frFR : isEL ? elGR : enUS,
  isFr ? dataGridfrFR : isEL ? dataGridelGR : dataGridenUS,
  isFr ? corefrFR : isEL ? coreelGR : coreenUS,
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={theme}>
    <CssBaseline>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        draggable={false}
        pauseOnHover
        theme="dark"
      />
      <a
        className="github-fork-ribbon fixed left-bottom"
        href="https://github.com/aelassas/bookcars"
        data-ribbon="Fork me on GitHub"
        title="Fork me on GitHub"
      >
        Fork me on GitHub
      </a>
    </CssBaseline>
  </ThemeProvider>,
)
