import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Spin } from 'antd';
import {
    UserOutlined,
    TeamOutlined,
    BookOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { getDashboardStats } from '../../services/dashboardService';
import dayjs from 'dayjs';
import './Dashboard.css';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const result = await getDashboardStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    const recentStudentsColumns = [
        {
            title: 'الاسم',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'تاريخ التسجيل',
            dataIndex: 'registration_date',
            key: 'registration_date',
            render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
        },
        {
            title: 'الهاتف',
            dataIndex: 'phone',
            key: 'phone',
        },
    ];

    const violationsColumns = [
        {
            title: 'الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
        },
        {
            title: 'التاريخ',
            dataIndex: 'violation_date',
            key: 'violation_date',
            render: (date) => date ? dayjs(date).format('YYYY-MM-DD') : '-'
        },
        {
            title: 'الوصف',
            dataIndex: 'description',
            key: 'description',
        },
    ];

    return (
        <div className="dashboard">
            <h1>لوحة التحكم</h1>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="عدد الطلاب"
                            value={stats?.counts?.students || 0}
                            prefix={<UserOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="عدد المعلمين"
                            value={stats?.counts?.teachers || 0}
                            prefix={<TeamOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="عدد الحلقات"
                            value={stats?.counts?.halaqat || 0}
                            prefix={<BookOutlined />}
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card>
                        <Statistic
                            title="نسبة الحضور اليوم"
                            value={stats?.attendance?.today?.percentage || 0}
                            suffix="%"
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                    <Card title="آخر التسجيلات">
                        <Table
                            columns={recentStudentsColumns}
                            dataSource={stats?.recentStudents || []}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card title="آخر المخالفات">
                        <Table
                            columns={violationsColumns}
                            dataSource={stats?.recentViolations || []}
                            rowKey="id"
                            pagination={false}
                            size="small"
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24}>
                    <Card title="توزيع الطلاب على الحلقات">
                        <Table
                            columns={[
                                { title: 'اسم الحلقة', dataIndex: 'name', key: 'name' },
                                { title: 'المعلم', dataIndex: 'teacher_name', key: 'teacher_name' },
                                { title: 'عدد الطلاب', dataIndex: 'students_count', key: 'students_count' },
                            ]}
                            dataSource={stats?.halaqatDistribution || []}
                            rowKey="id"
                            pagination={{ pageSize: 5 }}
                            scroll={{ x: 'max-content' }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
