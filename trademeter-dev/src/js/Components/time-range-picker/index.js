import React, { useState } from 'react'
import ReactDOM from 'react-dom'

import { Button, TimePicker } from 'antd'

import moment from 'moment'

import "./style.scss"

export default function TimeRangePicker({ onChange }) {
  const [startTime, setStartTime] = useState( moment() );
  const [endTime, setEndTime] = useState( moment() );

  return (
    <div className="time-range-picker">
      <TimePicker
        defaultValue={startTime}
        placeholder="Начало"
        format={'HH:mm'}
        allowClear={false}
        onChange={startTime => {
          setStartTime(startTime);
          let diff;
          if (startTime != null) {
            diff = endTime.diff(startTime);
          }
          onChange(diff);
        }}
        on
      />
      <TimePicker
        defaultValue={endTime}
        placeholder="Конец"
        format={'HH:mm'}
        allowClear={false}
        onChange={endTime => {
          setEndTime(endTime);
          let diff;
          if (endTime != null) {
            diff = endTime.diff(startTime);
          }
          onChange(diff);
        }}
      />
    </div>
  )  
}