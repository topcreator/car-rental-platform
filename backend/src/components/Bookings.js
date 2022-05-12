import React, { Component } from 'react';
import Master from '../elements/Master';
import BookingList from '../elements/BookingList';

import '../assets/css/bookings.css';

export default class Bookings extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null,
        };
    }

    onLoad = (user) => {
        this.setState({ user });
    }

    componentDidMount() {
    }

    render() {
        const { user } = this.state;

        return (
            <Master onLoad={this.onLoad} strict={true}>
                {user &&
                    <div className='bookings'>
                        <div className='col-1'>

                        </div>
                        <div className='col-2'>
                            <BookingList language={user.language} width='100%' height='100%' className='bookings-list' />
                        </div>
                    </div>}
            </Master>
        );
    }
}