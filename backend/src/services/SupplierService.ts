import axios from 'axios'
import Env from '../config/env.config'
import * as UserService from './UserService'
import * as bookcarsTypes from 'bookcars-types'

/**
 * Validate Supplier name.
 *
 * @param {bookcarsTypes.ValidateSupplierPayload} data
 * @returns {Promise<number>}
 */
export const validate = (data: bookcarsTypes.ValidateSupplierPayload): Promise<number> =>
  axios
    .post(
      `${Env.API_HOST}/api/validate-supplier`,
      data,
      { headers: UserService.authHeader() }
    )
    .then((res) => res.status)

/**
 * Update a Supplier.
 *
 * @param {bookcarsTypes.UpdateSupplierPayload} data
 * @returns {Promise<number>}
 */
export const update = (data: bookcarsTypes.UpdateSupplierPayload): Promise<number> =>
  axios
    .put(
      `${Env.API_HOST}/api/update-supplier`,
      data,
      { headers: UserService.authHeader() }
    )
    .then((res) => res.status)

/**
 * Delete a Supplier.
 *
 * @param {string} id
 * @returns {Promise<number>}
 */
export const deleteSupplier = (id: string): Promise<number> =>
  axios
    .delete(
      `${Env.API_HOST}/api/delete-supplier/${encodeURIComponent(id)}`,
      { headers: UserService.authHeader() }
    )
    .then((res) => res.status)

/**
 * Get a Supplier by ID.
 *
 * @param {string} id
 * @returns {Promise<bookcarsTypes.User>}
 */
export const getSupplier = (id: string): Promise<bookcarsTypes.User> =>
  axios
    .get(
      `${Env.API_HOST}/api/supplier/${encodeURIComponent(id)}`,
      { headers: UserService.authHeader() }
    )
    .then((res) => res.data)

/**
 * Get Suppliers.
 *
 * @param {string} keyword
 * @param {number} page
 * @param {number} size
 * @returns {Promise<bookcarsTypes.Result<bookcarsTypes.User>>}
 */
export const getSuppliers = (keyword: string, page: number, size: number): Promise<bookcarsTypes.Result<bookcarsTypes.User>> =>
  axios
    .get(
      `${Env.API_HOST}/api/suppliers/${page}/${size}/?s=${encodeURIComponent(keyword)}`,
      { headers: UserService.authHeader() }
    )
    .then((res) => res.data)

/**
 * Get all Suppliers.
 *
 * @returns {Promise<bookcarsTypes.User[]>}
 */
export const getAllSuppliers = (): Promise<bookcarsTypes.User[]> =>
  axios
    .get(
      `${Env.API_HOST}/api/all-suppliers`,
      { headers: UserService.authHeader() })
    .then((res) => res.data)
