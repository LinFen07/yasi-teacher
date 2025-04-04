import React, { useState } from 'react';
import { Table, Input, Select, Button, Space } from 'antd';
import './index.scss';

const { Option } = Select;

const StudentsList = () => {
  // 筛选状态
  const [filters, setFilters] = useState({
    college: 'all',
    major: 'all', 
    grade: 'all',
    searchText: ''
  });

  // 学生数据
  const data = [
    {
      key: '1',
      name: '陈诚',
      class: '1班',
      student_number: '1',
      gender: '男',
      college: '计算机学院',
      major: '软件工程',
      grade: '2021级'
    },
    {
      key: '2',
      name: '李明',
      class: '1班',
      student_number: '2',
      gender: '男',
      college: '计算机学院',
      major: '计算机科学', 
      grade: '2021级'
    },
    {
      key: '3',
      name: '王芳',
      class: '2班',
      student_number: '3',
      gender: '女',
      college: '文学院',
      major: '汉语言文学',
      grade: '2022级'
    }
  ];

  // 处理筛选变化
  const handleFilterChange = (key, value) => {
    setFilters({...filters, [key]: value});
  };

  // 查看试卷
  const viewExam = (record) => {
    alert(`查看 ${record.name} 的试卷`);
  };

  // 组合过滤
  const filteredData = data.filter(student => {
    // 学院筛选
    if(filters.college !== 'all' && student.college !== filters.college) {
      return false;
    }
    // 专业筛选
    if(filters.major !== 'all' && student.major !== filters.major) {
      return false;
    }
    // 年级筛选
    if(filters.grade !== 'all' && student.grade !== filters.grade) {
      return false;
    }
    // 关键词搜索
    if(filters.searchText && 
      !student.name.includes(filters.searchText) && 
      !student.student_number.includes(filters.searchText)) {
      return false;
    }
    return true;
  });

  // 列配置
  const columns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '学号',
      dataIndex: 'student_number',
      key: 'student_number',
    },
    {
      title: '班级',
      dataIndex: 'class',
      key: 'class',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => viewExam(record)}>
          查看试卷
        </Button>
      ),
    },
  ];

  return (
    <div className="student-list-container">
      <div className="filter-bar">
        <Select
          style={{ width: 120, marginRight: 10 }}
          value={filters.college}
          onChange={v => handleFilterChange('college', v)}
        >
          <Option value="all">全部学院</Option>
          <Option value="计算机学院">计算机学院</Option>
          <Option value="文学院">文学院</Option>
        </Select>

        <Select
          style={{ width: 120, marginRight: 10 }}
          value={filters.major}
          onChange={v => handleFilterChange('major', v)}
        >
          <Option value="all">全部专业</Option>
          <Option value="软件工程">软件工程</Option>
          <Option value="计算机科学">计算机科学</Option>
          <Option value="汉语言文学">汉语言文学</Option>
        </Select>

        <Select
          style={{ width: 120, marginRight: 10 }}
          value={filters.grade}
          onChange={v => handleFilterChange('grade', v)}
        >
          <Option value="all">全部年级</Option>
          <Option value="2021级">2021级</Option>
          <Option value="2022级">2022级</Option>
        </Select>

        <Input.Search
          placeholder="搜索姓名或学号"
          style={{ width: 200 }}
          value={filters.searchText}
          onChange={e => handleFilterChange('searchText', e.target.value)}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="key"
        size="middle"
      />
    </div>
  );
};

export default StudentsList;
