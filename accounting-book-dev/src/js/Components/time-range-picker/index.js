import React, { useState, useEffect } from 'react'

import { TimePicker } from 'antd/es'

import moment from 'moment'

import "./style.scss"

export default function TimeRangePicker(props) {
  const { onChange } = props;

  const [startTime, setStartTime] = useState( props.startTime != null ? moment(new Date(props.startTime)) : moment() );
  const [endTime, setEndTime] = useState( props.endTime != null ? moment(new Date(props.endTime)) : moment() );
  const [mobile, setMobile] = useState( innerWidth <= 576 );

  useEffect(() => {
    setMobile(innerWidth <= 576);
  }, [innerWidth]);

  return (
    <div className="time-range-picker">
      {mobile
        ?
          <input
            type="time"
            value={startTime.format('HH:mm')}
            onChange={e => {
              const { value } = e.target;
              console.log(value);
              const h = +value.split(':')[0];
              const m = +value.split(':')[1];

              const date = new Date(0);
              date.setHours(h);
              date.setMinutes(m);

              const startTime = moment(+date);
              setStartTime(startTime);
              if (onChange) {
                onChange(+startTime, +endTime);
              }
            }}
          />
        :
          <TimePicker
            defaultValue={startTime}
            placeholder="Начало"
            format={'HH:mm'}
            allowClear={false}
            onChange={startTime => {
              setStartTime(startTime);
              if (onChange) {
                onChange(+startTime, +endTime);
              }
            }}
          />
      }
      {mobile
        ?
          <input
            type="time"
            value={endTime.format('HH:mm')}
            onChange={e => {
              const { value } = e.target;
              console.log(value);
              const h = +value.split(':')[0];
              const m = +value.split(':')[1];

              const date = new Date(0);
              date.setHours(h);
              date.setMinutes(m);

              const endTime = moment(+date);
              setEndTime(endTime);
              if (onChange) {
                onChange(+startTime, +endTime);
              }
            }}
          />
        :
          <TimePicker
            defaultValue={endTime}
            placeholder="Конец"
            format={'HH:mm'}
            allowClear={false}
            onChange={endTime => {
              setEndTime(endTime);
              if (onChange) {
                onChange(+startTime, +endTime);
              }
            }}
          />
      }
    </div>
  )  
}