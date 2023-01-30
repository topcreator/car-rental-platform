import React from 'react'
import Master from '../components/Master'

import '../assets/css/contact.css'

const Contact = () => {

    const onLoad = (user) => {
    }

    return (
        <Master onLoad={onLoad} strict={false}>
            Contact!
        </Master>
    )
}

export default Contact