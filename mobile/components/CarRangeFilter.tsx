import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import * as bookcarsTypes from ':bookcars-types'
import * as bookcarsHelper from ':bookcars-helper'

import i18n from '../lang/i18n'
import Accordion from './Accordion'
import Link from './Link'
import Switch from './Switch'

interface CarRangeFilterProps {
  visible?: boolean
  style?: object
  onChange?: (values: bookcarsTypes.CarRange[]) => void
}

const allRanges = bookcarsHelper.getAllRanges()

const CarRangeFilter = ({
  visible,
  style,
  onChange
}: CarRangeFilterProps) => {
  const [mini, setMini] = useState(false)
  const [midi, setMidi] = useState(false)
  const [maxi, setMaxi] = useState(false)
  const [scooter, setScooter] = useState(false)
  const [values, setValues] = useState<bookcarsTypes.CarRange[]>([])
  const [allChecked, setAllChecked] = useState(false)

  const handleChange = (_values: bookcarsTypes.CarRange[]) => {
    if (onChange) {
      onChange(_values.length === 0 ? allRanges : bookcarsHelper.clone(_values))
    }
  }

  const onValueChangeMini = (checked: boolean) => {
    if (checked) {
      values.push(bookcarsTypes.CarRange.Mini)

      if (values.length === allRanges.length) {
        setAllChecked(true)
      }
    } else {
      values.splice(
        values.findIndex((v) => v === bookcarsTypes.CarRange.Mini),
        1,
      )

      if (values.length === 0) {
        setAllChecked(false)
      }
    }

    setMini(checked)
    setValues(values)
    handleChange(values)
  }

  const onValueChangeMidi = (checked: boolean) => {
    if (checked) {
      values.push(bookcarsTypes.CarRange.Midi)

      if (values.length === allRanges.length) {
        setAllChecked(true)
      }
    } else {
      values.splice(
        values.findIndex((v) => v === bookcarsTypes.CarRange.Midi),
        1,
      )

      if (values.length === 0) {
        setAllChecked(false)
      }
    }

    setMidi(checked)
    setValues(values)
    handleChange(values)
  }

  const onValueChangeMaxi = (checked: boolean) => {
    if (checked) {
      values.push(bookcarsTypes.CarRange.Maxi)

      if (values.length === allRanges.length) {
        setAllChecked(true)
      }
    } else {
      values.splice(
        values.findIndex((v) => v === bookcarsTypes.CarRange.Maxi),
        1,
      )

      if (values.length === 0) {
        setAllChecked(false)
      }
    }

    setMaxi(checked)
    setValues(values)
    handleChange(values)
  }

  const onValueChangeScooter = (checked: boolean) => {
    if (checked) {
      values.push(bookcarsTypes.CarRange.Scooter)

      if (values.length === allRanges.length) {
        setAllChecked(true)
      }
    } else {
      values.splice(
        values.findIndex((v) => v === bookcarsTypes.CarRange.Scooter),
        1,
      )

      if (values.length === 0) {
        setAllChecked(false)
      }
    }

    setScooter(checked)
    setValues(values)
    handleChange(values)
  }

  return (
    visible && (
      <View style={{ ...styles.container, ...style }}>
        <Accordion style={styles.accordion} title={i18n.t('CAR_RANGE')}>
          <View style={styles.contentContainer}>
            <Switch style={styles.component} textStyle={styles.text} value={mini} label={i18n.t('CAR_RANGE_MINI')} onValueChange={onValueChangeMini} />
            <Switch style={styles.component} textStyle={styles.text} value={midi} label={i18n.t('CAR_RANGE_MIDI')} onValueChange={onValueChangeMidi} />
            <Switch style={styles.component} textStyle={styles.text} value={maxi} label={i18n.t('CAR_RANGE_MAXI')} onValueChange={onValueChangeMaxi} />
            <Switch style={styles.component} textStyle={styles.text} value={scooter} label={i18n.t('CAR_RANGE_SCOOTER')} onValueChange={onValueChangeScooter} />
          </View>
          <Link
            style={styles.link}
            textStyle={styles.linkText}
            label={allChecked ? i18n.t('UNCHECK_ALL') : i18n.t('CHECK_ALL')}
            onPress={() => {
              if (allChecked) {
                setMini(false)
                setMidi(false)
                setMaxi(false)
                setScooter(false)
                setAllChecked(false)
                setValues([])
              } else {
                const _values = allRanges
                setMini(true)
                setMidi(true)
                setMaxi(true)
                setScooter(true)
                setAllChecked(true)
                setValues(_values)
                handleChange(_values)
              }
            }}
          />
        </Accordion>
      </View>
    )
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  accordion: {
    width: '100%',
    maxWidth: 480,
  },
  component: {
    marginTop: 0,
  },
  text: {
    fontSize: 12,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    fontSize: 12,
  },
})

export default CarRangeFilter