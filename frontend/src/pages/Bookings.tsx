import React, { useEffect, useState } from 'react'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'
import Layout from '../components/Layout'
import env from '../config/env.config'
import * as helper from '../common/helper'
import BookingList from '../components/BookingList'
import SupplierFilter from '../components/SupplierFilter'
import StatusFilter from '../components/StatusFilter'
import BookingFilter from '../components/BookingFilter'
import * as SupplierService from '../services/SupplierService'

import '../assets/css/bookings.css'

const Bookings = () => {
  const [user, setUser] = useState<bookcarsTypes.User>()
  const [allSuppliers, setAllSuppliers] = useState<bookcarsTypes.User[]>([])
  const [suppliers, setSuppliers] = useState<string[]>()
  const [statuses, setStatuses] = useState(helper.getBookingStatuses().map((status) => status.value))
  const [filter, setFilter] = useState<bookcarsTypes.Filter | null>()
  const [loadingSuppliers, setLoadingSuppliers] = useState(true)
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (user && user.verified) {
      const col1 = document.querySelector('div.col-1')
      if (col1) {
        setOffset(col1.clientHeight)
      }
    }
  }, [user])

  const handleSupplierFilterChange = (_suppliers: string[]) => {
    setSuppliers(_suppliers)
  }

  const handleStatusFilterChange = (_statuses: bookcarsTypes.BookingStatus[]) => {
    setStatuses(_statuses)
  }

  const handleBookingFilterSubmit = (_filter: bookcarsTypes.Filter | null) => {
    setFilter(_filter)
  }

  const onLoad = async (_user?: bookcarsTypes.User) => {
    setUser(_user)
    setLoadingSuppliers(true)

    const _allSuppliers = await SupplierService.getAllSuppliers()
    const _suppliers = bookcarsHelper.flattenSuppliers(_allSuppliers)
    setAllSuppliers(_allSuppliers)
    setSuppliers(_suppliers)
    setLoadingSuppliers(false)
  }

  return (
    <Layout onLoad={onLoad} strict>
      {user && (
        <div className="bookings">
          <div className="col-1">
            <div>
              <SupplierFilter suppliers={allSuppliers} onChange={handleSupplierFilterChange} className="cl-supplier-filter" />
              <StatusFilter onChange={handleStatusFilterChange} className="cl-status-filter" />
              <BookingFilter onSubmit={handleBookingFilterSubmit} language={(user && user.language) || env.DEFAULT_LANGUAGE} className="cl-booking-filter" collapse={!env.isMobile()} />
            </div>
          </div>
          <div className="col-2">
            <BookingList
              containerClassName="bookings"
              offset={offset}
              user={user}
              language={user.language}
              suppliers={suppliers}
              statuses={statuses}
              filter={filter}
              loading={loadingSuppliers}
              hideDates={env.isMobile()}
              checkboxSelection={false}
            />
          </div>
        </div>
      )}
    </Layout>
  )
}

export default Bookings
