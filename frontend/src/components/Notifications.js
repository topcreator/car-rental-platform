import React, { Component } from 'react';
import Header from '../elements/Header';
import {
    getCurrentUser,
    validateAccessToken,
    getUser,
    signout
} from '../services/user-service';
import '../assets/css/notifications.css';

export default class Notifications extends Component {

    constructor(props) {
        super(props);
        this.state = {
            user: null
        };
    }

    componentDidMount() {
        const currentUser = getCurrentUser();
        if (currentUser) {
            validateAccessToken().then(status => {
                if (status === 200) {
                    getUser(currentUser.id).then(user => {
                        if (user) {

                            if (user.isBlacklisted) {
                                signout();
                                return;
                            }

                            this.setState({ user });
                        } else {
                            signout();
                        }
                    }).catch(err => {
                        signout();
                    });;
                } else {
                    signout();
                }
            }).catch(err => {
                signout();
            });;
        } else {
            signout();
        }
    }

    render() {
        const { user } = this.state;

        return (
            <div>
                <Header user={user} />
                <div className='content'>Notifications!</div>
            </div>
        );
    }
}