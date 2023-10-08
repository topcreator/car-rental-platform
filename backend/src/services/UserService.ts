import axios from 'axios'
import * as bookcarsTypes from 'bookcars-types'
import Env from '../config/env.config'

/**
 * Create a User.
 *
 * @param {bookcarsTypes.CreateUserPayload} data
 * @returns {Promise<number>}
 */
export const create = (data: bookcarsTypes.CreateUserPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/create-user`,
      data,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Sign up.
 *
 * @param {bookcarsTypes.BackendSignUpPayload} data
 * @returns {Promise<number>}
 */
export const signup = (data: bookcarsTypes.BackendSignUpPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/admin-sign-up/ `,
      data
    )
    .then((res) => res.status)

/**
 * Check a validation token.
 *
 * @param {string} userId
 * @param {string} email
 * @param {string} token
 * @returns {Promise<number>}
 */
export const checkToken = (userId: string, email: string, token: string): Promise<number> =>
  axios
    .get(
      `${Env.API_HOST}/api/check-token/${Env.APP_TYPE}/${encodeURIComponent(userId)}/${encodeURIComponent(email)}/${encodeURIComponent(token)}`
    )
    .then((res) => res.status)

/**
 * Delete validation tokens.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const deleteTokens = (userId: string): Promise<number> =>
  axios
    .delete(
      `${Env.API_HOST}/api/delete-tokens/${encodeURIComponent(userId)}`
    )
    .then((res) => res.status)

/**
 * Resend a forgotten password or activation email.
 *
 * @param {?string} [email]
 * @param {boolean} [reset=false]
 * @param {string} [appType=bookcarsTypes.AppType.Backend]
 * @returns {Promise<number>}
 */
export const resend = (email?: string, reset = false, appType: string = bookcarsTypes.AppType.Backend): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/resend/${appType}/${encodeURIComponent(email || '')}/${reset}`
    )
    .then((res) => res.status)

/**
 * Activate an account.
 *
 * @param {bookcarsTypes.ActivatePayload} data
 * @returns {Promise<number>}
 */
export const activate = (data: bookcarsTypes.ActivatePayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/activate/ `,
      data,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Validate an email.
 *
 * @param {bookcarsTypes.ValidateEmailPayload} data
 * @returns {Promise<number>}
 */
export const validateEmail = (data: bookcarsTypes.ValidateEmailPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/validate-email`,
      data
    )
    .then((exist) => exist.status)

/**
 * Sign in.
 *
 * @param {bookcarsTypes.SignInPayload} data
 * @returns {Promise<{ status: number, data: bookcarsTypes.User }>}
 */
export const signin = (data: bookcarsTypes.SignInPayload): Promise<{ status: number, data: bookcarsTypes.User }> =>
  axios
    .post(
      `${Env.API_HOST}/api/sign-in/${Env.APP_TYPE}`,
      data,
      { withCredentials: true }
    )
    .then((res) => {
      localStorage.setItem('bc-user', JSON.stringify(res.data))
      return { status: res.status, data: res.data }
    })

/**
 * Sign out.
 *
 * @param {boolean} [redirect=true]
 */
export const signout = async (redirect = true) => {
  const deleteAllCookies = () => {
    const cookies = document.cookie.split('')

    for (const cookie of cookies) {
      const eqPos = cookie.indexOf('=')
      const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie
      document.cookie = `${name}=expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
  }

  sessionStorage.clear()
  localStorage.removeItem('bc-user')
  deleteAllCookies()

  await axios.post(
    `${Env.API_HOST}/api/sign-out`,
    null,
    { withCredentials: true }
  )

  if (redirect) {
    window.location.href = '/sign-in'
  }
}

/**
 * Validate autentication access token.
 *
 * @returns {Promise<number>}
 */
export const validateAccessToken = (): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/validate-access-token`,
      null,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Confirm an email.
 *
 * @param {string} email
 * @param {string} token
 * @returns {Promise<number>}
 */
export const confirmEmail = (email: string, token: string): Promise<number> => (
  axios
    .post(
      `${Env.API_HOST}/api/confirm-email/${encodeURIComponent(email)}/${encodeURIComponent(token)}`
    )
    .then((res) => res.status)
)

/**
 * Resend validation email.
 *
 * @param {bookcarsTypes.ResendLinkPayload} data
 * @returns {Promise<number>}
 */
export const resendLink = (data: bookcarsTypes.ResendLinkPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/resend-link`,
      data,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Get current language.
 *
 * @returns {string}
 */
export const getLanguage = (): string => {
  const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')

  if (user && user.language) {
    return user.language as string
  }
  const lang = localStorage.getItem('bc-language')
  if (lang && lang.length === 2) {
    return lang
  }
  return Env.DEFAULT_LANGUAGE
}

/**
 * Get language from query strings.
 *
 * @returns {(string | null)}
 */
export const getQueryLanguage = (): string | null => {
  const params = new URLSearchParams(window.location.search)
  if (params.has('l')) {
    return params.get('l') ?? ''
  }
  return ''
}

/**
 * Update language.
 *
 * @param {bookcarsTypes.UpdateLanguagePayload} data
 * @returns {Promise<number>}
 */
export const updateLanguage = (data: bookcarsTypes.UpdateLanguagePayload) =>
  axios
    .post(
      `${Env.API_HOST}/api/update-language`,
      data,
      { withCredentials: true }
    )
    .then((res) => {
      if (res.status === 200) {
        const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')
        user.language = data.language
        localStorage.setItem('bc-user', JSON.stringify(user))
      }
      return res.status
    })

/**
 * Set language.
 *
 * @param {string} lang
 */
export const setLanguage = (lang: string) => {
  localStorage.setItem('bc-language', lang)
}

/**
 * Get current User.
 *
 * @returns {bookcarsTypes.User|null}
 */
export const getCurrentUser = (): bookcarsTypes.User | null => {
  const user = JSON.parse(localStorage.getItem('bc-user') ?? 'null')
  return user
}

/**
 * Get User by ID.
 *
 * @param {string} id
 * @returns {Promise<bookcarsTypes.User|null>}
 */
export const getUser = (id?: string): Promise<bookcarsTypes.User | null> => {
  if (id) {
    return axios
      .get(
        `${Env.API_HOST}/api/user/${encodeURIComponent(id)}`,
        { withCredentials: true }
      )
      .then((res) => res.data)
  }
  return new Promise((resolve) => {
    resolve(null)
  })
}

/**
 * Get customers.
 *
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @returns {Promise<bookcarsTypes.Result<bookcarsTypes.User>>}
 */
export const getDrivers = (keyword: string, page: number, size: number): Promise<bookcarsTypes.Result<bookcarsTypes.User>> =>
  axios
    .post(
      `${Env.API_HOST}/api/users/${page}/${size}/?s=${encodeURIComponent(keyword)}`,
      { types: [bookcarsTypes.RecordType.User] },
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Get Users.
 *
 * @param {bookcarsTypes.GetUsersBody} payload
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @returns {Promise<bookcarsTypes.Result<bookcarsTypes.User>>}
 */
export const getUsers = (
  payload: bookcarsTypes.GetUsersBody,
  keyword: string,
  page: number,
  size: number
): Promise<bookcarsTypes.Result<bookcarsTypes.User>> =>
  axios
    .post(
      `${Env.API_HOST}/api/users/${page}/${size}/?s=${encodeURIComponent(keyword)}`,
      payload,
      { withCredentials: true }
    )
    .then((res) => res.data)

/**
 * Update a User.
 *
 * @param {bookcarsTypes.UpdateUserPayload} data
 * @returns {Promise<number>}
 */
export const updateUser = (data: bookcarsTypes.UpdateUserPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/update-user`,
      data,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Update email notifications flag.
 *
 * @param {bookcarsTypes.UpdateEmailNotificationsPayload} data
 * @returns {Promise<number>}
 */
export const updateEmailNotifications = (data: bookcarsTypes.UpdateEmailNotificationsPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/update-email-notifications`,
      data,
      { withCredentials: true }
    )
    .then((res) => {
      if (res.status === 200) {
        const user = getCurrentUser()
        if (user) {
          user.enableEmailNotifications = data.enableEmailNotifications
          localStorage.setItem('bc-user', JSON.stringify(user))
        }
      }
      return res.status
    })

/**
 * Create a temporary avatar.
 *
 * @param {Blob} file
 * @returns {Promise<string>}
 */
export const createAvatar = (file: Blob): Promise<string> => {
  const user = getCurrentUser()
  const formData = new FormData()
  formData.append('image', file)

  return axios
    .post(
      `${Env.API_HOST}/api/create-avatar`,
      formData,
      user && user.accessToken
        ? {
          headers: {
            'x-access-token': user.accessToken,
            'Content-Type': 'multipart/form-data',
          },
        }
        : { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((res) => res.data)
}

/**
 * Update Avatar.
 *
 * @param {string} userId
 * @param {Blob} file
 * @returns {Promise<number>}
 */
export const updateAvatar = (userId: string, file: Blob): Promise<number> => {
  const user = getCurrentUser()
  const formData = new FormData()
  formData.append('image', file)

  return axios
    .post(
      `${Env.API_HOST}/api/update-avatar/${encodeURIComponent(userId)}`,
      formData,
      user && user.accessToken
        ? {
          headers: {
            'x-access-token': user.accessToken,
            'Content-Type': 'multipart/form-data',
          },
        }
        : { headers: { 'Content-Type': 'multipart/form-data' } },
    )
    .then((res) => res.status)
}

/**
 * Delete Avatar.
 *
 * @param {string} userId
 * @returns {Promise<number>}
 */
export const deleteAvatar = (userId: string): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/delete-avatar/${encodeURIComponent(userId)}`,
      null,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Delete temporary Avatar.
 *
 * @param {string} avatar
 * @returns {Promise<number>}
 */
export const deleteTempAvatar = (avatar: string): Promise<number> => (
  axios
    .post(
      `${Env.API_HOST}/api/delete-temp-avatar/${encodeURIComponent(avatar)}`,
      null,
      { withCredentials: true }
    )
    .then((res) => res.status)
)

/**
 * Check Password.
 *
 * @param {string} id
 * @param {string} pass
 * @returns {Promise<number>}
 */
export const checkPassword = (id: string, pass: string): Promise<number> =>
  axios
    .get(
      `${Env.API_HOST}/api/check-password/${encodeURIComponent(id)}/${encodeURIComponent(pass)}`,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Change Password.
 *
 * @param {bookcarsTypes.ChangePasswordPayload} data
 * @returns {Promise<number>}
 */
export const changePassword = (data: bookcarsTypes.ChangePasswordPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/change-password/ `,
      data,
      { withCredentials: true }
    )
    .then((res) => res.status)

/**
 * Delete Users.
 *
 * @param {string[]} ids
 * @returns {Promise<number>}
 */
export const deleteUsers = (ids: string[]): Promise<number> => (
  axios
    .post(
      `${Env.API_HOST}/api/delete-users`,
      ids,
      { withCredentials: true }
    )
    .then((res) => res.status)
)
