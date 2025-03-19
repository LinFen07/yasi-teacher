import React, { useState } from 'react';
import type { InputNumberProps } from 'antd';
import { Col, InputNumber, Row, Slider } from 'antd';
import stores from '@/stores';

const IntegerStep: React.FC = () => {
  const [inputValue, setInputValue] = useState(18);

  const onChange: InputNumberProps['onChange'] = (newValue) => {
    setInputValue(newValue as number);
    stores.ExamStore.changeFontSize(inputValue);
  };

  return (
    <Row>
      <p style={{marginRight:'12px'}}>字体大小</p>
      <Col span={12} style={{marginTop:'5px'}}>
        <Slider
          min={18}
          max={26}
          onChange={onChange}
          value={typeof inputValue === 'number' ? inputValue : 0}
        />
      </Col>
      <Col span={4} style={{marginTop:'5px'}}>
        <InputNumber
          min={1}
          max={20}
          style={{ margin: '0 16px' }}
          value={inputValue}
          onChange={onChange}
        />
      </Col>
    </Row>
  );
};

export default IntegerStep;