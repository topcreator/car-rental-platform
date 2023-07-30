import React, { useState } from 'react'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
// import { TextField } from '@mui/material'
// import { format } from 'date-fns'
import { fr, enUS } from "date-fns/locale"
// import * as Helper from '../common/Helper'

const DateTimePicker = (props) => {
    const [value, setValue] = useState(props.value || null)

    // const _locale = props.language === 'fr' ? fr : enUS
    // const _format = props.language === 'fr' ? 'eee d LLL kk:mm' : 'eee, d LLL, kk:mm'
    const _format = props.language === 'fr' ? 'eee d LLL HH:mm' : 'eee, d LLL, HH:mm'

    return (
        <LocalizationProvider adapterLocale={props.language === 'fr' ? fr : enUS} dateAdapter={AdapterDateFns}>
            <MuiDateTimePicker
                label={props.label}
                showToolbar
                value={value}
                readOnly={props.readOnly}
                onChange={(value) => {
                    setValue(value)
                    if (props.onChange) props.onChange(value)
                }}
                minDate={props.minDate}
                defaultCalendarMonth={props.minDate}
                slotProps={{
                    textField: {
                        variant: props.variant || 'standard',
                        readOnly: true,
                        required: props.required
                    },
                    actionBar: {
                        actions: ['accept', 'cancel', 'today', 'clear']
                    }
                }}
                format={_format}
            />
        </LocalizationProvider>
    )
}

export default DateTimePicker