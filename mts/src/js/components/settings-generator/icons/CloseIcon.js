import React, { useState } from 'react'
import ReactDOM from 'react-dom'

const CloseIcon = props => {
  return (
    <svg 
      {...props}
      width="1em" 
      height="1em" 
      viewBox="0 0 51.976 51.976"
    >
      <path d="M44.373 7.603c-10.137-10.137-26.632-10.138-36.77 0-10.138 10.138-10.137 26.632 0 36.77s26.632 10.138 36.77 0c10.137-10.138 10.137-26.633 0-36.77zm-8.132 28.638a2 2 0 01-2.828 0l-7.425-7.425-7.778 7.778a2 2 0 11-2.828-2.828l7.778-7.778-7.425-7.425a2 2 0 112.828-2.828l7.425 7.425 7.071-7.071a2 2 0 112.828 2.828l-7.071 7.071 7.425 7.425a2 2 0 010 2.828z"/>
    </svg>
  )
};

export default CloseIcon;