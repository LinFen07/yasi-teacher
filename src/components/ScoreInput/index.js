import React from 'react';
import PropTypes from 'prop-types';
import { InputNumber } from 'antd';

/**
 * 评分输入组件
 * @param {number} value - 当前分数
 * @param {function} onChange - 分数变化回调
 * @param {boolean} disabled - 是否禁用
 * @param {number} min - 最低分
 * @param {number} max - 最高分
 */
const ScoreInput = ({ 
  value, 
  onChange, 
  disabled = false,
  min = 0,
  max = 100
}) => {
  return (
    <InputNumber
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      disabled={disabled}
      addonAfter="分"
      style={{ width: '120px' }}
    />
  );
};

ScoreInput.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number
};

export default ScoreInput;
