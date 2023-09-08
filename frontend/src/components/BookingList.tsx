import React, { useState, useEffect } from 'react'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as csStrings } from '../lang/cars'
import { strings } from '../lang/booking-list'
import * as Helper from '../common/Helper'
import * as BookingService from '../services/BookingService'
import {
  DataGrid,
  frFR,
  enUS,
  GridColDef,
  GridPaginationModel,
  GridRowId
} from '@mui/x-data-grid'
import {
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Stack
} from '@mui/material'
import {
  Visibility as ViewIcon,
  Check as CheckIcon,
  Cancel as CancelIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import { fr as dfnsFR, enUS as dfnsENUS } from 'date-fns/locale'
import * as bookcarsTypes from 'bookcars-types'
import * as bookcarsHelper from 'bookcars-helper'

import '../assets/css/booking-list.css'

const BookingList = (
  {
    companies: bookingCompanies,
    statuses: bookingStatuses,
    filter: bookingFilter,
    reload: bookingReload,
    car: bookingCar,
    offset: bookingOffset,
    user: bookingUser,
    loading: bookingLoading,
    containerClassName,
    hideDates,
    hideCarColumn,
    hideCompanyColumn,
    language,
    checkboxSelection,
    onLoad,
  }: {
    companies?: string[]
    statuses?: string[]
    filter?: bookcarsTypes.Filter | null
    reload?: boolean
    car?: string
    offset?: number
    user?: bookcarsTypes.User
    containerClassName?: string
    hideDates?: boolean
    hideCarColumn?: boolean
    hideCompanyColumn?: boolean
    language?: string
    loading?: boolean
    checkboxSelection?: boolean
    onLoad?: bookcarsTypes.DataEvent<bookcarsTypes.Booking>
  }
) => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(Env.isMobile() ? Env.BOOKINGS_MOBILE_PAGE_SIZE : Env.BOOKINGS_PAGE_SIZE)
  const [columns, setColumns] = useState<GridColDef<bookcarsTypes.Booking>[]>([])
  const [rows, setRows] = useState<bookcarsTypes.Booking[]>([])
  const [rowCount, setRowCount] = useState(0)
  const [fetch, setFetch] = useState(false)
  const [selectedId, setSelectedId] = useState('')
  const [companies, setCompanies] = useState<string[]>(bookingCompanies || [])
  const [statuses, setStatuses] = useState<string[]>(bookingStatuses || [])
  const [filter, setFilter] = useState<bookcarsTypes.Filter | undefined | null>(bookingFilter)
  const [reload, setReload] = useState(bookingReload)
  const [car, setCar] = useState<string>(bookingCar || '')
  const [offset, setOffset] = useState(0)
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    pageSize: Env.BOOKINGS_PAGE_SIZE,
    page: 0,
  })
  const [load, setLoad] = useState(false)
  const [loading, setLoading] = useState(true)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [cancelRequestSent, setCancelRequestSent] = useState(false)
  const [cancelRequestProcessing, setCancelRequestProcessing] = useState(false)

  useEffect(() => {
    setPage(paginationModel.page)
    setPageSize(paginationModel.pageSize)
  }, [paginationModel])

  const _fetch = async (page: number, user?: bookcarsTypes.User) => {
    try {
      const _pageSize = Env.isMobile() ? Env.BOOKINGS_MOBILE_PAGE_SIZE : pageSize

      if (companies.length > 0) {
        setLoading(true)

        const data = await BookingService.getBookings(
          {
            companies,
            statuses,
            filter: filter || undefined,
            car,
            user: (user && user._id) || undefined,
          },
          page,
          _pageSize,
        )
        const _data = data && data.length > 0 ? data[0] : { pageInfo: { totalRecord: 0 }, resultData: [] }
        if (!_data) {
          Helper.error()
          return
        }
        const totalRecords = Array.isArray(_data.pageInfo) && _data.pageInfo.length > 0 ? _data.pageInfo[0].totalRecords : 0

        if (Env.isMobile()) {
          const _rows = page === 0 ? _data.resultData : [...rows, ..._data.resultData]
          setRows(_rows)
          setRowCount(totalRecords)
          setFetch(_data.resultData.length > 0)
          if (onLoad) {
            onLoad({ rows: _data.resultData, rowCount: totalRecords })
          }
        } else {
          setRows(_data.resultData)
          setRowCount(totalRecords)
          if (onLoad) {
            onLoad({ rows: _data.resultData, rowCount: totalRecords })
          }
        }
      } else {
        setRows([])
        setRowCount(0)
        if (onLoad) {
          onLoad({ rows: [], rowCount: 0 })
        }
      }
    } catch (err) {
      Helper.error(err)
    } finally {
      setLoading(false)
      setLoad(false)
    }
  }

  useEffect(() => {
    setCompanies(bookingCompanies || [])
  }, [bookingCompanies])

  useEffect(() => {
    setStatuses(bookingStatuses || [])
  }, [bookingStatuses])

  useEffect(() => {
    setFilter(bookingFilter || null)
  }, [bookingFilter])

  useEffect(() => {
    setCar(bookingCar || '')
  }, [bookingCar])

  useEffect(() => {
    setOffset(bookingOffset || 0)
  }, [bookingOffset])

  useEffect(() => {
    setReload(bookingReload || false)
  }, [bookingReload])

  useEffect(() => {
    if (reload) {
      setPage(0)
      _fetch(0, user)
    }
  }, [reload]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (load) {
      _fetch(page, user)
      setLoad(false)
    }
  }, [load]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (bookingUser && companies.length > 0 && statuses.length > 0) {
      const columns = getColumns()
      setUser(bookingUser)
      setColumns(columns)
      setLoad(true)
    }
  }, [bookingUser, page, pageSize, companies, statuses, filter]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (Env.isMobile()) {
      const element: HTMLDivElement | null = (containerClassName ?
        document.querySelector(`.${containerClassName}`)
        : document.querySelector('div.bookings'))

      if (element) {
        element.onscroll = (event) => {
          const target = event.target as HTMLDivElement
          if (fetch &&
            !loading &&
            target.scrollTop > 0 &&
            target.offsetHeight + target.scrollTop >= target.scrollHeight) {
            const p = page + 1
            setPage(p)
          }
        }
      }
    }
  }, [containerClassName, page, fetch, loading, offset]) // eslint-disable-line react-hooks/exhaustive-deps

  const getDate = (date: Date) => {
    const d = new Date(date)
    return `${bookcarsHelper.formatDatePart(d.getDate())}-${bookcarsHelper.formatDatePart(d.getMonth() + 1)}-${d.getFullYear()}`
  }

  const getColumns = () => {
    const columns = [
      {
        field: 'from',
        headerName: commonStrings.FROM,
        flex: 1,
        valueGetter: (params: any) => getDate(params.value),
      },
      {
        field: 'to',
        headerName: commonStrings.TO,
        flex: 1,
        valueGetter: (params: any) => getDate(params.value),
      },
      {
        field: 'price',
        headerName: strings.PRICE,
        flex: 1,
        valueGetter: (params: any) => `${bookcarsHelper.formatNumber(params.value)} ${strings.CURRENCY}`,
        renderCell: (params: any) => <span className="bp">{params.value}</span>,
      },
      {
        field: 'status',
        headerName: strings.STATUS,
        flex: 1,
        renderCell: (params: any) => <span className={`bs bs-${params.value}`}>{Helper.getBookingStatus(params.value)}</span>,
        valueGetter: (params: any) => params.value,
      },
      {
        field: 'action',
        headerName: '',
        sortable: false,
        disableColumnMenu: true,
        renderCell: (params: any) => {
          const cancelBooking = (e: React.MouseEvent<HTMLElement>) => {
            e.stopPropagation() // don't select this row after clicking
            setSelectedId(params.row._id)
            setOpenCancelDialog(true)
          }

          return (
            <>
              <Tooltip title={strings.VIEW}>
                <IconButton href={`booking?b=${params.row._id}`}>
                  <ViewIcon />
                </IconButton>
              </Tooltip>
              {params.row.cancellation &&
                !params.row.cancelRequest &&
                params.row.status !== bookcarsTypes.BookingStatus.Cancelled &&
                new Date(params.row.from) > new Date() && (
                  <Tooltip title={strings.CANCEL}>
                    <IconButton onClick={cancelBooking}>
                      <CancelIcon />
                    </IconButton>
                  </Tooltip>
                )}
            </>
          )
        },
      },
    ]

    if (hideDates) {
      columns.splice(0, 2)
    }

    if (!hideCarColumn) {
      columns.unshift({
        field: 'car',
        headerName: strings.CAR,
        flex: 1,
        valueGetter: (params: any) => params.value.name,
      })
    }

    if (!hideCompanyColumn) {
      columns.unshift({
        field: 'company',
        headerName: commonStrings.SUPPLIER,
        flex: 1,
        renderCell: (params: any) => (
          <div className="cell-company">
            <img src={bookcarsHelper.joinURL(Env.CDN_USERS, params.row.company.avatar)} alt={params.value} />
          </div>
        ),
        valueGetter: (params: any) => params.value.fullName,
      })
    }

    return columns
  }

  const handleCloseCancelBooking = () => {
    setOpenCancelDialog(false)
    if (cancelRequestSent) {
      setTimeout(() => {
        setCancelRequestSent(false)
      }, 500)
    }
  }

  const handleConfirmCancelBooking = async () => {
    try {
      setCancelRequestProcessing(true)
      const status = await BookingService.cancel(selectedId)
      if (status === 200) {
        const row = rows.find((r) => r._id === selectedId)
        if (row) {
          row.cancelRequest = true

          setCancelRequestSent(true)
          setRows(rows)
          setSelectedId('')
          setCancelRequestProcessing(false)
        } else {
          Helper.error()
        }
      } else {
        Helper.error()
        setOpenCancelDialog(false)
        setCancelRequestProcessing(false)
      }
    } catch (err) {
      Helper.error(err)
      setOpenCancelDialog(false)
      setCancelRequestProcessing(false)
    }
  }

  const _fr = language === 'fr'
  const _locale = _fr ? dfnsFR : dfnsENUS
  const _format = _fr ? 'eee d LLL kk:mm' : 'eee, d LLL, kk:mm'
  const bookingDetailHeight = Env.COMPANY_IMAGE_HEIGHT + 10

  return (
    <div className="bs-list">
      {user &&
        (rows.length === 0 ? (
          !loading &&
          !bookingLoading && (
            <Card variant="outlined" className="empty-list">
              <CardContent>
                <Typography color="textSecondary">{strings.EMPTY_LIST}</Typography>
              </CardContent>
            </Card>
          )
        ) : Env.isMobile() ? (
          <>
            {rows.map((booking) => {
              const bookingCar = booking.car as bookcarsTypes.Car
              const bookingSupplier = booking.company as bookcarsTypes.User
              const from = new Date(booking.from)
              const to = new Date(booking.to)
              const days = bookcarsHelper.days(from, to)

              return (
                <div key={booking._id} className="booking-details">
                  <div className={`bs bs-${booking.status}`}>
                    <label>{Helper.getBookingStatus(booking.status)}</label>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{strings.CAR}</label>
                    <div className="booking-detail-value">{`${bookingCar.name} (${bookcarsHelper.formatNumber(bookingCar.price)} ${csStrings.CAR_CURRENCY})`}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{strings.DAYS}</label>
                    <div className="booking-detail-value">{`${Helper.getDaysShort(bookcarsHelper.days(from, to))} (${bookcarsHelper.capitalize(
                      format(from, _format, { locale: _locale }),
                    )} - ${bookcarsHelper.capitalize(format(to, _format, { locale: _locale }))})`}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{commonStrings.PICKUP_LOCATION}</label>
                    <div className="booking-detail-value">{(booking.pickupLocation as bookcarsTypes.Location).name}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{commonStrings.DROP_OFF_LOCATION}</label>
                    <div className="booking-detail-value">{(booking.dropOffLocation as bookcarsTypes.Location).name}</div>
                  </div>
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{commonStrings.SUPPLIER}</label>
                    <div className="booking-detail-value">
                      <div className="car-company">
                        <img src={bookcarsHelper.joinURL(Env.CDN_USERS, bookingSupplier.avatar)} alt={bookingSupplier.fullName} />
                        <label className="car-company-name">{bookingSupplier.fullName}</label>
                      </div>
                    </div>
                  </div>

                  {(booking.cancellation ||
                    booking.amendments ||
                    booking.collisionDamageWaiver ||
                    booking.theftProtection ||
                    booking.fullInsurance ||
                    booking.additionalDriver) && (
                      <>
                        <div className="extras">
                          <label className="extras-title">{commonStrings.OPTIONS}</label>
                          {booking.cancellation && (
                            <div className="extra">
                              <CheckIcon className="extra-icon" />
                              <label className="extra-title">{csStrings.CANCELLATION}</label>
                              <label className="extra-text">{Helper.getCancellationOption(bookingCar.cancellation, _fr)}</label>
                            </div>
                          )}

                          {booking.amendments && (
                            <div className="extra">
                              <CheckIcon className="extra-icon" />
                              <label className="extra-title">{csStrings.AMENDMENTS}</label>
                              <label className="extra-text">{Helper.getAmendmentsOption(bookingCar.amendments, _fr)}</label>
                            </div>
                          )}

                          {booking.collisionDamageWaiver && (
                            <div className="extra">
                              <CheckIcon className="extra-icon" />
                              <label className="extra-title">{csStrings.COLLISION_DAMAGE_WAVER}</label>
                              <label className="extra-text">{Helper.getCollisionDamageWaiverOption(bookingCar.collisionDamageWaiver, days, _fr)}</label>
                            </div>
                          )}

                          {booking.theftProtection && (
                            <div className="extra">
                              <CheckIcon className="extra-icon" />
                              <label className="extra-title">{csStrings.THEFT_PROTECTION}</label>
                              <label className="extra-text">{Helper.getTheftProtectionOption(bookingCar.theftProtection, days, _fr)}</label>
                            </div>
                          )}

                          {booking.fullInsurance && (
                            <div className="extra">
                              <CheckIcon className="extra-icon" />
                              <label className="extra-title">{csStrings.FULL_INSURANCE}</label>
                              <label className="extra-text">{Helper.getFullInsuranceOption(bookingCar.fullInsurance, days, _fr)}</label>
                            </div>
                          )}

                          {booking.additionalDriver && (
                            <div className="extra">
                              <CheckIcon className="extra-icon" />
                              <label className="extra-title">{csStrings.ADDITIONAL_DRIVER}</label>
                              <label className="extra-text">{Helper.getAdditionalDriverOption(bookingCar.additionalDriver, days)}</label>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  <div className="booking-detail" style={{ height: bookingDetailHeight }}>
                    <label className="booking-detail-title">{strings.COST}</label>
                    <div className="booking-detail-value booking-price">{`${bookcarsHelper.formatNumber(booking.price)} ${commonStrings.CURRENCY}`}</div>
                  </div>

                  <div className="bs-buttons">
                    {booking.cancellation &&
                      !booking.cancelRequest &&
                      booking.status !== bookcarsTypes.BookingStatus.Cancelled &&
                      new Date(booking.from) > new Date() && (
                        <Button
                          variant="contained"
                          className="btn-secondary"
                          onClick={() => {
                            setSelectedId(booking._id as string)
                            setOpenCancelDialog(true)
                          }}
                        >
                          {strings.CANCEL}
                        </Button>
                      )}
                  </div>
                </div>
              )
            })}
          </>
        ) : (
          <DataGrid
            className="data-grid"
            checkboxSelection={checkboxSelection}
            getRowId={(row: bookcarsTypes.Booking): GridRowId => row._id as GridRowId}
            columns={columns}
            rows={rows}
            rowCount={rowCount}
            loading={loading}
            initialState={{
              pagination: {
                paginationModel: { pageSize: Env.BOOKINGS_PAGE_SIZE },
              },
            }}
            pageSizeOptions={[Env.BOOKINGS_PAGE_SIZE, 50, 100]}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            localeText={(user.language === 'fr' ? frFR : enUS).components.MuiDataGrid.defaultProps.localeText}
            // slots={{
            //   noRowsOverlay: () => '',
            // }}
            disableRowSelectionOnClick
          />
        ))}

      <Dialog disableEscapeKeyDown maxWidth="xs" open={openCancelDialog}>
        <DialogTitle className="dialog-header">{!cancelRequestSent && !cancelRequestProcessing && commonStrings.CONFIRM_TITLE}</DialogTitle>
        <DialogContent className="dialog-content">
          {cancelRequestProcessing ? (
            <Stack sx={{ color: '#f37022' }}>
              <CircularProgress color="inherit" />
            </Stack>
          ) : cancelRequestSent ? (
            strings.CANCEL_BOOKING_REQUEST_SENT
          ) : (
            strings.CANCEL_BOOKING
          )}
        </DialogContent>
        <DialogActions className="dialog-actions">
          {!cancelRequestProcessing && (
            <Button onClick={handleCloseCancelBooking} variant="contained" className="btn-secondary">
              {commonStrings.CLOSE}
            </Button>
          )}
          {!cancelRequestSent && !cancelRequestProcessing && (
            <Button onClick={handleConfirmCancelBooking} variant="contained" className="btn-primary">
              {commonStrings.CONFIRM}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default BookingList
