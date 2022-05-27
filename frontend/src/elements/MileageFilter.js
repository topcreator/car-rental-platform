import React, { Component } from 'react';
import { strings as commonStrings } from '../lang/common';
import { strings } from '../lang/cars';
import Accordion from './Accordion';

import '../assets/css/mileage-filter.css'

class MileageFilter extends Component {

    constructor(props) {
        super(props);

        this.state = {
            unlimited: true
        }
    }

    handleAllMileageClick = (e) => {
        const checkbox = e.currentTarget.previousSibling;
        if (!checkbox.checked) {
            checkbox.checked = !checkbox.checked;
            const event = e;
            event.currentTarget = checkbox;
            this.handleAllMileageChange(event);
        }
    };

    handleAllMileageChange = (e) => {
        if (e.currentTarget.checked) {
            const unlimited = false;
            document.querySelector('.unlimited-mileage-radio').checked = false;

            this.setState({ unlimited }, () => {
                if (this.props.onChange) {
                    this.props.onChange(unlimited);
                }
            });
        }
    };

    handleUnlimitedMileageClick = (e) => {
        const checkbox = e.currentTarget.previousSibling;
        if (!checkbox.checked) {
            checkbox.checked = !checkbox.checked;
            const event = e;
            event.currentTarget = checkbox;
            this.handleUnlimitedMileageChange(event);
        }
    };

    handleUnlimitedMileageChange = (e) => {
        if (e.currentTarget.checked) {
            const unlimited = true;
            document.querySelector('.all-mileage-radio').checked = false;

            this.setState({ unlimited }, () => {
                if (this.props.onChange) {
                    this.props.onChange(unlimited);
                }
            });
        }
    };

    componentDidMount() {
        document.querySelector('.all-mileage-radio').checked = true;
    }

    render() {
        return (
            <Accordion title={strings.MILEAGE} className={`${this.props.className ? `${this.props.className} ` : ''}mileage-filter`}>
                <div className='filter-elements'>
                    <div className='filter-element'>
                        <input type='radio' className='mileage-radio all-mileage-radio' onChange={this.handleAllMileageChange} />
                        <label onClick={this.handleAllMileageClick}>{commonStrings.ALL}</label>
                    </div>
                    <div className='filter-element'>
                        <input type='radio' className='mileage-radio unlimited-mileage-radio' onChange={this.handleUnlimitedMileageChange} />
                        <label onClick={this.handleUnlimitedMileageClick}>{strings.UNLIMITED}</label>
                    </div>
                </div>
            </Accordion>
        );
    }
}

export default MileageFilter;