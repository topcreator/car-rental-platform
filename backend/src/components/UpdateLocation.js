import React, { Component } from 'react';
import Master from '../elements/Master';
import { strings as commonStrings } from '../lang/common';
import { strings as clStrings } from '../lang/create-location';
import { strings } from '../lang/update-location';
import LocationService from '../services/LocationService';
import { toast } from 'react-toastify';
import NoMatch from './NoMatch';
import Error from './Error';
import Backdrop from '../elements/SimpleBackdrop';
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper
} from '@mui/material';
import UserService from '../services/UserService';

import '../assets/css/update-location.css';

export default class UpdateLocation extends Component {

    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            loading: false,
            name: '',
            nameError: false,
            noMatch: false,
            error: false
        };
    }

    handleOnChangeName = (e) => {
        this.setState({ name: e.target.value });
    };

    handleOnBlurName = e => {
        const data = { name: e.target.value, };
        const { location } = this.state;

        if (data.name !== location.name) {
            LocationService.validate(data).then(status => {
                if (status === 204) {
                    this.setState({ nameError: true });
                } else {
                    this.setState({ nameError: false });
                }
            }).catch(() => {
                UserService.signout();
            });
        } else {
            this.setState({ nameError: false });
        }
    };

    handleOnKeyDownName = (e) => {
        if (e.key === 'Enter') {
            this.handleSubmit(e);
        }
    }

    error = () => {
        this.setState({ loading: false });
        toast(commonStrings.GENERIC_ERROR, { type: 'error' });
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const { location, name } = this.state;
        const data = { _id: location._id, name };

        const update = () => {
            LocationService.update(data)
                .then(status => {
                    if (status === 200) {
                        location.name = name;
                        this.setState({ loading: false, location });
                        toast(strings.LOCATION_UPDATED, { type: 'info' });
                    } else {
                        this.error();
                    }
                }).catch(() => {
                    UserService.signout();
                });
        };

        if (name !== location.name) {
            LocationService.validate(data)
                .then(status => {
                    if (status === 204) {
                        this.setState({ nameError: true, loading: false });
                    } else {
                        this.setState({ nameError: false });
                        update();
                    }
                }).catch(() => {
                    UserService.signout();
                });
        } else {
            this.setState({ nameError: false });
            update();
        }

    };

    onLoad = (user) => {
        this.setState({ loading: true }, () => {
            const params = new URLSearchParams(window.location.search);
            if (params.has('l')) {
                const id = params.get('l');
                if (id && id !== '') {
                    LocationService.getLocation(id)
                        .then(location => {
                            if (location) {
                                this.setState({
                                    location,
                                    name: location.name,
                                    loading: false,
                                    visible: true
                                });
                            } else {
                                this.setState({ loading: false, noMatch: true });
                            }
                        })
                        .catch(() => {
                            this.setState({ loading: false, error: true, visible: false });
                        });
                } else {
                    this.setState({ loading: false, noMatch: true });
                }
            } else {
                this.setState({ loading: false, noMatch: true });
            }
        });
    }

    componentDidMount() {
    }

    render() {
        const { visible, loading, noMatch, error, location, name, nameError } = this.state;

        return (
            <Master onLoad={this.onLoad} strict={true}>
                {!error && !noMatch &&
                    <div className='update-location'>
                        <Paper className="location-form location-form-wrapper" elevation={10} style={visible ? null : { display: 'none' }}>
                            <h1 className="location-form-title"> {strings.UPDATE_LOCATION} </h1>
                            <form onSubmit={this.handleSubmit}>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel className='required'>{clStrings.LOCATION_NAME}</InputLabel>
                                    <Input
                                        type="text"
                                        value={name}
                                        error={nameError}
                                        required
                                        onBlur={this.handleOnBlurName}
                                        onChange={this.handleOnChangeName}
                                        onKeyDown={this.handleOnKeyDownName}
                                        autoComplete="off"
                                    />
                                    <FormHelperText error={nameError}>
                                        {nameError ? clStrings.INVALID_LOCATION : ''}
                                    </FormHelperText>
                                </FormControl>

                                <div className="buttons">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className='btn-primary btn-margin-bottom'
                                        size="small"
                                        disabled={location && location.name === name}
                                    >
                                        {commonStrings.SAVE}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        className='btn-secondary btn-margin-bottom'
                                        size="small"
                                        href='/locations'
                                    >
                                        {commonStrings.CANCEL}
                                    </Button>
                                </div>
                            </form>

                        </Paper>
                    </div>}
                {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
                {error && <Error />}
                {noMatch && <NoMatch hideHeader />}
            </Master>
        );
    }
}