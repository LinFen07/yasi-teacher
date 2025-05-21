import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Table, Tag, Button, Input, Form, AutoComplete } from "antd";
import "../../components/Table/index.scss"
const TaskTable = ({
    papers,
    selectedPaper,
    paperOptions,
    handleSelectChange,
    paperName,
    handleStartGrading,
    pageNow,
    handleChange,
    filterPendingPapers,
    setEssayLoading,
    setCurrentPaper,
    setViewMode,
    setIsEditingMode
}) => {
    const [searchText, setSearchText] = useState('');
    const [searchName, setSearchName] = useState('');
    const [activeSearchText, setActiveSearchText] = useState('');
    const [activeSearchName, setActiveSearchName] = useState('');

    const handlePaperSearchChange = (value) => {
        const finalValue = typeof value === 'string'
            ? value
            : value?.value || value?.target?.value || '';
        setSearchText(finalValue);
    };

    const handleStudentSearchChange = (value) => {
        const finalValue = typeof value === 'string'
            ? value
            : value?.value || value?.target?.value || '';
        setSearchName(finalValue);
    };

    const handleSearch = () => {
        setActiveSearchText(searchText);
        setActiveSearchName(searchName);
    };
    // 获取教师分配的数据
    const { tasks } = useSelector(state => state.tasks);
    const studentNameList = tasks?.response?.items?.map(item => item.studentName) || [];
    return (
        <>
            <Form>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <AutoComplete
                        style={{ width: 200 }}
                        placeholder="输入试卷名称筛选"
                        value={searchText}
                        onChange={handlePaperSearchChange}
                        options={
                            paperName && paperName.length > 0
                                ? paperName.map(opt => ({
                                    value: opt.name,
                                    label: opt.name
                                }))
                                : []
                        }
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        dropdownStyle={{
                            zIndex: 9999,
                            minWidth: 200,
                            maxHeight: 250,
                            overflow: 'auto'
                        }}
                        defaultActiveFirstOption={false}
                    />
                    <AutoComplete
                        style={{ width: 200 }}
                        placeholder="请输入考生姓名"
                        value={searchName}
                        onChange={handleStudentSearchChange}
                        options={
                            studentNameList && studentNameList.length > 0
                                ? studentNameList.map(opt => ({
                                    value: opt,
                                    label: opt
                                }))
                                : []
                        }
                        filterOption={(inputValue, option) =>
                            option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                        }
                        dropdownStyle={{
                            zIndex: 9999,
                            minWidth: 200,
                            maxHeight: 250,
                            overflow: 'auto'
                        }}
                        defaultActiveFirstOption={false}
                    />
                    <Button
                        type="primary"
                        onClick={handleSearch}
                        disabled={papers.length === 0}
                    >
                        筛选
                    </Button>
                </div>
            </Form>
            <Table
                columns={[
                    {
                        title: '考生',
                        key: 'student',
                        render: (_, record) => record.studentName,
                    },
                    {
                        title: '试卷名称',
                        dataIndex: 'paperName',
                        key: 'paperName',
                        render: (_, record) => record.paperName,
                    },
                    {
                        title: '状态',
                        dataIndex: 'status',
                        key: 'status',
                        render: status => (
                            <Tag color={status === '已阅' ? 'green' : 'orange'}>
                                {status === '已阅' ? '已评阅' : '待评阅'}
                            </Tag>
                        )
                    },
                    {
                        title: '操作',
                        key: 'action',
                        render: (_, record) => (
                            <Button
                                type="link"
                                onClick={() => {
                                    setEssayLoading(true);
                                    try {
                                        setCurrentPaper(record);
                                        setViewMode('grade');
                                        setIsEditingMode(record.status === '已阅');
                                    } finally {
                                        setEssayLoading(false);
                                    }
                                }}
                            >
                                {record.status === '已阅' ? '修改' : '评阅'}
                            </Button>
                        ),
                    },
                ]}
                pagination={{
                    current: pageNow[0],
                    pageSize: 10,
                    onChange: (page) => {
                        handleChange(page);
                        setTimeout(() => {
                            window.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        }, 100);
                    },
                }}
                dataSource={papers
                    .filter(p =>
                        (activeSearchText === '' || p.paperName.includes(activeSearchText)) &&
                        (activeSearchName === '' || p.studentName.includes(activeSearchName))
                    )
                    .map(item => ({ ...item, key: `${item.examPaperId}-${item.studentId}` }))
                    .sort((a, b) => {
                        if (a.status === '待阅' && b.status !== '待阅') return -1;
                        if (a.status !== '待阅' && b.status === '待阅') return 1;
                        return 0;
                    })}
            />
        </>
    );
};

export default TaskTable;