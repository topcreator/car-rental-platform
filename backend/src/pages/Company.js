import React, { useState, useEffect } from 'react'
import Env from '../config/env.config'
import { strings as commonStrings } from '../lang/common'
import { strings as clStrings } from '../lang/company-list'
import * as SupplierService from '../services/SupplierService'
import * as Helper from '../common/Helper'
import Master from '../components/Master'
import Backdrop from '../components/SimpleBackdrop'
import Avatar from '../components/Avatar'
import CarList from '../components/CarList'
import InfoBox from '../components/InfoBox'
import Error from './Error'
import NoMatch from './NoMatch'
import {
    Typography,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip
} from '@mui/material'
import {
    Edit as EditIcon,
    Delete as DeleteIcon
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

import '../assets/css/company.css'

const Company = () => {
    const navigate = useNavigate()
    const [user, setUser] = useState()
    const [company, setCompany] = useState()
    const [companies, setCompanies] = useState([])
    const [error, setError] = useState(false)
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(true)
    const [noMatch, setNoMatch] = useState(false)
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
    const [rowCount, setRowCount] = useState(-1)
    const [offset, setOffset] = useState(0)

    useEffect(() => {
        if (visible) {
            setOffset(document.querySelector('.col-1').clientHeight)
        }
    }, [visible])

    const onBeforeUpload = () => {
        setLoading(true)
    }

    const onAvatarChange = (avatar) => {

        if (user._id === company._id) {
            const _user = Helper.clone(user)
            _user.avatar = avatar

            setUser(_user)
        }

        setLoading(false)
    }

    const handleDelete = () => {

        setOpenDeleteDialog(true)
    }

    const handleConfirmDelete = async () => {
        try {
            setOpenDeleteDialog(false)

            const status = await SupplierService.deleteCompany(company._id)

            if (status === 200) {
                navigate('/suppliers')
            } else {
                Helper.error()
            }
        } catch (err) {
            Helper.error(err)
        }
    }

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false)
    }

    const handleCarListLoad = (data) => {
        setRowCount(data.rowCount)
    }

    const handleCarDelete = (rowCount) => {
        setRowCount(rowCount)
    }

    const onLoad = async (user) => {
        setUser(user)

        if (user && user.verified) {
            const params = new URLSearchParams(window.location.search)
            if (params.has('c')) {
                const id = params.get('c')
                if (id && id !== '') {
                    try {
                        const company = await SupplierService.getCompany(id)

                        if (company) {
                            setCompany(company)
                            setCompanies([company._id])
                            setVisible(true)
                            setLoading(false)
                        } else {
                            setLoading(false)
                            setNoMatch(true)
                        }
                    } catch {
                        setLoading(false)
                        setError(true)
                        setVisible(false)
                    }
                } else {
                    setLoading(false)
                    setNoMatch(true)
                }
            } else {
                setLoading(false)
                setNoMatch(true)
            }
        }
    }

    const edit = (user && company) && (user.type === Env.RECORD_TYPE.ADMIN || user._id === company._id)

    return (
        <Master onLoad={onLoad} user={user} strict={true}>
            {visible && company && companies &&
                <div className='company'>
                    <div className='col-1'>
                        <section className='company-avatar-sec'>
                            {edit ? (<Avatar
                                record={company}
                                type={Env.RECORD_TYPE.COMPANY}
                                mode='update'
                                size='large'
                                hideDelete
                                onBeforeUpload={onBeforeUpload}
                                onChange={onAvatarChange}
                                readonly={!edit}
                                color='disabled'
                                className='company-avatar' />)
                                :
                                <div className='car-company'>
                                    <span className='car-company-logo'>
                                        <img src={Helper.joinURL(Env.CDN_USERS, company.avatar)}
                                            alt={company.fullName}
                                            style={{ width: Env.COMPANY_IMAGE_WIDTH }}
                                        />
                                    </span>
                                    <span className='car-company-info'>
                                        {company.fullName}
                                    </span>
                                </div>
                            }
                        </section>
                        {edit && <Typography variant="h4" className="company-name">{company.fullName}</Typography>}
                        {company.bio && company.bio !== '' && <Typography variant="h6" className="company-info">{company.bio}</Typography>}
                        {company.location && company.location !== '' && <Typography variant="h6" className="company-info">{company.location}</Typography>}
                        {company.phone && company.phone !== '' && <Typography variant="h6" className="company-info">{company.phone}</Typography>}
                        <div className="company-actions">
                            {edit &&
                                <Tooltip title={commonStrings.UPDATE}>
                                    <IconButton href={`/update-supplier?c=${company._id}`}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                            {edit &&
                                <Tooltip title={commonStrings.DELETE}>
                                    <IconButton data-id={company._id} onClick={handleDelete}>
                                        <DeleteIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                        </div>
                        {rowCount > 0 &&
                            <InfoBox value={`${rowCount} ${commonStrings.CAR}${rowCount > 1 ? 's' : ''}`} className='car-count' />
                        }
                    </div>
                    <div className='col-2'>
                        <CarList
                            containerClassName={Env.isMobile() ? 'company' : null}
                            offset={offset}
                            user={user}
                            companies={companies}
                            keyword=''
                            reload={false}
                            onLoad={handleCarListLoad}
                            onDelete={handleCarDelete}
                            hideCompany
                        />
                    </div>
                </div>
            }
            <Dialog
                disableEscapeKeyDown
                maxWidth="xs"
                open={openDeleteDialog}
            >
                <DialogTitle className='dialog-header'>{commonStrings.CONFIRM_TITLE}</DialogTitle>
                <DialogContent>{clStrings.DELETE_COMPANY}</DialogContent>
                <DialogActions className='dialog-actions'>
                    <Button onClick={handleCancelDelete} variant='contained' className='btn-secondary'>{commonStrings.CANCEL}</Button>
                    <Button onClick={handleConfirmDelete} variant='contained' color='error'>{commonStrings.DELETE}</Button>
                </DialogActions>
            </Dialog>
            {loading && <Backdrop text={commonStrings.LOADING} />}
            {error && <Error />}
            {noMatch && <NoMatch hideHeader />}
        </Master>
    )
}

export default Company