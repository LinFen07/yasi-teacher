import React, { useState } from "react";
import { Table, Tag, Button, Input, Form } from "antd";
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

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    const handleSearch = () => {
        setActiveSearchText(searchText);
        setActiveSearchName(searchName);
    };

    return (
        <>
            <Form>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <Input
                        style={{ width: 200 }}
                        placeholder="输入试卷名称筛选"
                        value={searchText}
                        onChange={handleSearchChange}
                    />
                    <Input
                        style={{ width: 200 }}
                        placeholder="请输入考生姓名"
                        value={searchName}
                        onChange={e => setSearchName(e.target.value)}
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
                    onChange: handleChange,
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