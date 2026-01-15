import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, DatePicker, Select, Button, Space, message } from 'antd';
import { FileTextOutlined, PrinterOutlined, FilterOutlined } from '@ant-design/icons';
import { getGeneralReport } from '../../services/reportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [dates, setDates] = useState([dayjs().startOf('month'), dayjs()]);

    useEffect(() => {
        loadReport();
    }, []);

    const loadReport = async () => {
        setLoading(true);
        try {
            const params = {
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD')
            };
            const result = await getGeneralReport(params);
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل التقرير');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card title="التقارير والإحصائيات">
            <Space style={{ marginBottom: 24 }}>
                <RangePicker
                    value={dates}
                    onChange={setDates}
                />
                <Button
                    type="primary"
                    icon={<FilterOutlined />}
                    onClick={loadReport}
                    loading={loading}
                >
                    تحديث البيانات
                </Button>
                <Button
                    icon={<PrinterOutlined />}
                    onClick={() => window.print()}
                >
                    طباعة
                </Button>
            </Space>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="إجمالي الحفظ"
                            value={data?.totalMemorization || 0}
                            suffix="سجل"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="إجمالي المراجعة"
                            value={data?.totalReview || 0}
                            suffix="سجل"
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card size="small">
                        <Statistic
                            title="نسبة الانضباط العامة"
                            value={data?.attendanceRate || 0}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
                <h3>أكثر الطلاب إنجازاً</h3>
                <Table
                    dataSource={data?.topStudents || []}
                    rowKey="student_id"
                    columns={[
                        { title: 'اسم الطالب', dataIndex: 'full_name', key: 'full_name' },
                        { title: 'عدد الأسطر/الصفحات', dataIndex: 'total_achievement', key: 'total_achievement' },
                        { title: 'متوسط التقييم', dataIndex: 'avg_rating', key: 'avg_rating' },
                    ]}
                    pagination={false}
                    loading={loading}
                    scroll={{ x: 'max-content' }}
                />
            </div>
        </Card>
    );
};

export default Reports;
