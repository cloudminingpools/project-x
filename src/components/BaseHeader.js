import React from 'react';
import BaseHeaderTitle from './BaseHeaderTitle';
import BaseHeaderControlGroup from './BaseHeaderControlGroup';

const BaseHeader = ({connectionStatus}) => (
  <div className='header-container'>
    <BaseHeaderTitle />
    <BaseHeaderControlGroup connectionStatus={connectionStatus} />
  </div>
);

export default BaseHeader;
