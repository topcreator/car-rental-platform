import React, { Component } from 'react';
import Master from '../elements/Master';
import Env from '../config/env.config';
import { strings as commonStrings } from '../lang/common';
import { strings as ccStrings } from '../lang/create-company';
import { strings } from '../lang/create-user';
import Helper from '../common/Helper';
import UserService from '../services/UserService';
import CompanyService from '../services/CompanyService';
import NoMatch from './NoMatch';
import Error from '../elements/Error';
import Backdrop from '../elements/SimpleBackdrop';
import { Avatar } from '../elements/Avatar';
import DatePicker from '../elements/DatePicker';
import {
    Input,
    InputLabel,
    FormControl,
    FormHelperText,
    Button,
    Paper,
    Select,
    MenuItem,
    Link,
    FormControlLabel,
    Switch
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';
import { intervalToDuration } from 'date-fns';
import validator from 'validator';

import '../assets/css/update-user.css';

export default class CreateUser extends Component {

    constructor(props) {
        super(props);
        this.state = {
            loggedUser: null,
            user: null,
            visible: false,
            noMatch: false,
            admin: false,
            fullName: '',
            email: '',
            phone: '',
            location: '',
            bio: '',
            password: '',
            confirmPassword: '',
            error: false,
            emailError: false,
            loading: false,
            fullNameError: false,
            avatar: null,
            avatarError: false,
            type: '',
            birthDate: null,
            birthDateValid: true,
            phoneValid: true,
            payLater: false
        };
    }

    handleUserTypeChange = async (e) => {
        this.setState({ type: e.target.value }, async () => await this.validateFullName(this.state.fullName));
    };

    handleOnChangeFullName = (e) => {
        this.setState({
            fullName: e.target.value,
        });

        if (!e.target.value) {
            this.setState({ fullNameError: false });
        }
    };

    validateFullName = async (fullName) => {
        const { user, type } = this.state;

        if (type === Env.RECORD_TYPE.COMPANY) {
            if (user.fullName !== fullName || user.type !== type) {
                try {
                    const status = await CompanyService.validate({ fullName });

                    if (status === 200) {
                        this.setState({ fullNameError: false });
                        return true;
                    } else {
                        this.setState({
                            fullNameError: true,
                            avatarError: false,
                            passwordsDontMatch: false,
                            passwordError: false,
                            error: false
                        });
                        return false;
                    }
                } catch (err) {
                    UserService.signout();
                }
            } else {
                this.setState({ fullNameError: false });
                return true;
            }
        } else {
            this.setState({ fullNameError: false });
            return true;
        }
    };

    handleFullNameOnBlur = async (e) => {
        await this.validateFullName(e.target.value);
    };

    handlePhoneChange = (e) => {
        this.setState({ phone: e.target.value });

        if (!e.target.value) {
            this.setState({ phoneValid: true });
        }
    };

    validatePhone = (phone) => {
        if (phone) {
            const phoneValid = validator.isMobilePhone(phone);
            this.setState({ phoneValid });

            return phoneValid;
        } else {
            this.setState({ phoneValid: true });

            return true;
        }
    };

    handlePhoneBlur = (e) => {
        this.validatePhone(e.target.value);
    };

    validateBirthDate = (date) => {
        const { type } = this.state;

        if (date && type === Env.RECORD_TYPE.USER) {
            const now = new Date();
            const sub = intervalToDuration({ start: date, end: now }).years;
            const birthDateValid = sub >= Env.MINIMUM_AGE;

            this.setState({ birthDateValid });
            return birthDateValid;
        } else {
            this.setState({ birthDateValid: true });
            return true;
        }
    };

    handleOnChangeLocation = (e) => {
        this.setState({
            location: e.target.value,
        });
    };

    handleOnChangeBio = (e) => {
        this.setState({
            bio: e.target.value,
        });
    };

    handleOnChangePassword = (e) => {
        this.setState({
            password: e.target.value,
        });
    };

    handleOnChangeConfirmPassword = (e) => {
        this.setState({
            confirmPassword: e.target.value,
        });
    };

    handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    handleMouseDownConfirmPassword = (event) => {
        event.preventDefault();
    };

    handleChange = (e) => {
        e.preventDefault();
    };

    onBeforeUpload = () => {
        this.setState({ loading: true });
    };

    onAvatarChange = (avatar) => {

        const { loggedUser, user, type } = this.state;

        if (loggedUser._id === user._id) {
            const _loggedUser = Helper.clone(loggedUser);
            _loggedUser.avatar = avatar;
            this.setState({ loggedUser: _loggedUser });
        }

        const _user = Helper.clone(user);
        _user.avatar = avatar;

        this.setState({ loading: false, user: _user, avatar });

        if (avatar !== null && type === Env.RECORD_TYPE.COMPANY) {
            this.setState({ avatarError: false });
        }
    };

    handleCancel = () => {
        const { avatar } = this.state;

        if (avatar) {
            this.setState({ loading: true });

            UserService.deleteTempAvatar(avatar)
                .then((status) => {
                    window.location.href = '/users';
                })
                .catch(() => {
                    window.location.href = '/users';
                });
        } else {
            window.location.href = '/users';
        }
    };

    handleResendActivationLink = () => {
        const { email, type } = this.state;

        UserService.resend(email, false, type === Env.RECORD_TYPE.USER ? 'frontend' : 'backend')
            .then(status => {
                if (status === 200) {
                    Helper.info(commonStrings.ACTIVATION_EMAIL_SENT);
                } else {
                    Helper.error();
                }
            })
            .catch((err) => {
                Helper.error(err);
            });
    };

    onLoad = (loggedUser) => {

        this.setState({ loading: true }, () => {
            const params = new URLSearchParams(window.location.search);
            if (params.has('u')) {
                const id = params.get('u');
                if (id && id !== '') {
                    UserService.getUser(id)
                        .then(user => {
                            if (user) {
                                this.setState({
                                    loggedUser,
                                    user,
                                    admin: Helper.admin(loggedUser),
                                    type: user.type,
                                    email: user.email,
                                    avatar: user.avatar,
                                    fullName: user.fullName,
                                    phone: user.phone,
                                    location: user.location,
                                    bio: user.bio,
                                    birthDate: user.birthDate ? new Date(user.birthDate) : null,
                                    payLater: user.payLater,
                                    loading: false,
                                    visible: true
                                });
                            } else {
                                this.setState({ loading: false, noMatch: true });
                            }
                        })
                        .catch((err) => {
                            this.setState({ loading: false, visible: false }, () => {
                                Helper.error(err);
                            });
                        });
                } else {
                    this.setState({ loading: false, noMatch: true });
                }
            } else {
                this.setState({ loading: false, noMatch: true });
            }
        });
    };

    handleSubmit = async (e) => {
        e.preventDefault();

        const { type, fullName, phone, birthDate } = this.state;

        const fullNameValid = await this.validateFullName(fullName);
        if (!fullNameValid) {
            return;
        }

        const phoneValid = this.validatePhone(phone);
        if (!phoneValid) {
            return;
        }

        const birthDateValid = this.validateBirthDate(birthDate);
        if (!birthDateValid) {
            return;
        }

        if (type === Env.RECORD_TYPE.COMPANY && !this.state.avatar) {
            return this.setState({
                avatarError: true,
                passwordsDontMatch: false,
                passwordError: false,
                error: false
            });
        }

        const { user, location, bio, avatar, payLater } = this.state, language = UserService.getLanguage();
        const data = {
            _id: user._id,
            phone,
            location,
            bio,
            fullName,
            language,
            type,
            avatar,
            birthDate
        };

        if (type === Env.RECORD_TYPE.COMPANY) data.payLater = payLater;

        UserService.updateUser(data)
            .then(status => {
                if (status === 200) {
                    user.fullName = fullName;
                    user.type = type;
                    this.setState({ user });
                    Helper.info(commonStrings.UPDATED);
                } else {
                    Helper.error();

                    this.setState({
                        error: false,
                        passwordError: false,
                        passwordsDontMatch: false,
                        loading: false
                    });
                }
            }).catch(() => {
                UserService.signout();
            });

    };

    render() {
        const {
            loggedUser,
            user,
            visible,
            noMatch,
            admin,
            type,
            error,
            fullNameError,
            avatarError,
            loading,
            fullName,
            email,
            phone,
            location,
            bio,
            birthDate,
            birthDateValid,
            phoneValid,
            payLater
        } = this.state,
            company = type === Env.RECORD_TYPE.COMPANY,
            driver = type === Env.RECORD_TYPE.USER,
            activate = admin
                || (loggedUser && user && loggedUser.type === Env.RECORD_TYPE.COMPANY && user.type === Env.RECORD_TYPE.USER && user.company === loggedUser._id);

        return (
            <Master onLoad={this.onLoad} user={loggedUser} strict={true}>
                {loggedUser && user && visible &&
                    <div className='update-user'>
                        <Paper className="user-form user-form-wrapper" elevation={10}>
                            <h1 className="user-form-title"> {strings.CREATE_COMPANY_HEADING} </h1>
                            <form onSubmit={this.handleSubmit}>
                                <Avatar
                                    type={type}
                                    mode='update'
                                    record={user}
                                    size='large'
                                    readonly={false}
                                    onBeforeUpload={this.onBeforeUpload}
                                    onChange={this.onAvatarChange}
                                    color='disabled'
                                    className='avatar-ctn'
                                    hideDelete={type === Env.RECORD_TYPE.COMPANY}
                                />

                                {company && <div className='info'>
                                    <InfoIcon />
                                    <label>
                                        {ccStrings.RECOMMENDED_IMAGE_SIZE}
                                    </label>
                                </div>}

                                {admin &&
                                    <FormControl fullWidth margin="dense" style={{ marginTop: company ? 0 : 39 }}>
                                        <InputLabel className='required'>{commonStrings.TYPE}</InputLabel>
                                        <Select
                                            label={commonStrings.TYPE}
                                            value={type}
                                            onChange={this.handleUserTypeChange}
                                            variant='standard'
                                            required
                                            fullWidth
                                        >
                                            <MenuItem value={Env.RECORD_TYPE.ADMIN}>{Helper.getUserType(Env.RECORD_TYPE.ADMIN)}</MenuItem>
                                            <MenuItem value={Env.RECORD_TYPE.COMPANY}>{Helper.getUserType(Env.RECORD_TYPE.COMPANY)}</MenuItem>
                                            <MenuItem value={Env.RECORD_TYPE.USER}>{Helper.getUserType(Env.RECORD_TYPE.USER)}</MenuItem>
                                        </Select>
                                    </FormControl>
                                }

                                <FormControl fullWidth margin="dense">
                                    <InputLabel className='required'>{commonStrings.FULL_NAME}</InputLabel>
                                    <Input
                                        id="full-name"
                                        type="text"
                                        error={fullNameError}
                                        required
                                        onBlur={this.handleFullNameOnBlur}
                                        onChange={this.handleOnChangeFullName}
                                        autoComplete="off"
                                        value={fullName}
                                    />
                                    <FormHelperText error={fullNameError}>
                                        {(fullNameError && ccStrings.INVALID_COMPANY_NAME) || ''}
                                    </FormHelperText>
                                </FormControl>

                                <FormControl fullWidth margin="dense">
                                    <InputLabel className='required'>{commonStrings.EMAIL}</InputLabel>
                                    <Input
                                        id="email"
                                        type="text"
                                        value={email}
                                        disabled
                                    />
                                </FormControl>

                                {driver &&
                                    <FormControl fullWidth margin="dense">
                                        <DatePicker
                                            label={strings.BIRTH_DATE}
                                            value={birthDate}
                                            required
                                            onChange={(birthDate) => {
                                                const birthDateValid = this.validateBirthDate(birthDate);

                                                this.setState({ birthDate, birthDateValid });
                                            }}
                                            language={(user && user.language) || Env.DEFAULT_LANGUAGE}
                                        />
                                        <FormHelperText error={!birthDateValid}>
                                            {(!birthDateValid && commonStrings.BIRTH_DATE_NOT_VALID) || ''}
                                        </FormHelperText>
                                    </FormControl>
                                }

                                {
                                    company &&
                                    <FormControl component="fieldset" style={{ marginTop: 15 }}>
                                        <FormControlLabel
                                            control={<Switch checked={payLater} onChange={(e) => {
                                                this.setState({ payLater: e.target.checked });
                                            }} color="primary" />}
                                            label={commonStrings.PAY_LATER}
                                        />
                                    </FormControl>
                                }

                                <div className='info'>
                                    <InfoIcon />
                                    <label>{commonStrings.OPTIONAL}</label>
                                </div>

                                <FormControl fullWidth margin="dense">
                                    <InputLabel>{commonStrings.PHONE}</InputLabel>
                                    <Input
                                        id="phone"
                                        type="text"
                                        onChange={this.handlePhoneChange}
                                        onBlur={this.handlePhoneBlur}
                                        autoComplete="off"
                                        value={phone}
                                        error={!phoneValid}
                                    />
                                    <FormHelperText error={!phoneValid}>
                                        {(!phoneValid && commonStrings.PHONE_NOT_VALID) || ''}
                                    </FormHelperText>
                                </FormControl>

                                <FormControl fullWidth margin="dense">
                                    <InputLabel>{commonStrings.LOCATION}</InputLabel>
                                    <Input
                                        id="location"
                                        type="text"
                                        onChange={this.handleOnChangeLocation}
                                        autoComplete="off"
                                        value={location}
                                    />
                                </FormControl>

                                <FormControl fullWidth margin="dense">
                                    <InputLabel>{commonStrings.BIO}</InputLabel>
                                    <Input
                                        id="bio"
                                        type="text"
                                        onChange={this.handleOnChangeBio}
                                        autoComplete="off"
                                        value={bio}
                                    />
                                </FormControl>

                                {activate &&
                                    <FormControl fullWidth margin="dense" className='resend-activation-link'>
                                        <Link onClick={this.handleResendActivationLink}>{commonStrings.RESEND_ACTIVATION_LINK}</Link>
                                    </FormControl>
                                }

                                <div className="buttons">
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className='btn-primary btn-margin btn-margin-bottom'
                                        size="small"
                                        href={`/change-password?u=${user._id}`}
                                    >
                                        {commonStrings.RESET_PASSWORD}
                                    </Button>

                                    <Button
                                        type="submit"
                                        variant="contained"
                                        className='btn-primary btn-margin-bottom'
                                        size="small"
                                    >
                                        {commonStrings.SAVE}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        className='btn-secondary btn-margin-bottom'
                                        size="small"
                                        onClick={this.handleCancel}
                                    >
                                        {commonStrings.CANCEL}
                                    </Button>
                                </div>

                                <div className="form-error">
                                    {error && <Error message={commonStrings.GENERIC_ERROR} />}
                                    {avatarError && <Error message={commonStrings.IMAGE_REQUIRED} />}
                                </div>
                            </form>

                        </Paper>
                    </div>}
                {loading && <Backdrop text={commonStrings.PLEASE_WAIT} />}
                {noMatch && <NoMatch hideHeader />}
            </Master>
        );
    }
}