import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Card, Select, Rate, DatePicker, Row, Col, Tag, App } from 'antd';
import { PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { getHalaqat } from '../../services/halaqaService';
import { recordMemorization, getStudentProgress, getSurahs, getHalaqaProgress } from '../../services/memorizationService';
import dayjs from 'dayjs';

const { Option } = Select;

const Memorization = () => {
    const [halaqat, setHalaqat] = useState([]);
    const [surahs, setSurahs] = useState([]);
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isHistoryVisible, setIsHistoryVisible] = useState(false);
    const [historyData, setHistoryData] = useState([]);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [form] = Form.useForm();
    const { message: messageApi } = App.useApp();

    useEffect(() => {
        loadHalaqat();
        loadSurahs();
    }, []);

    const loadSurahs = async () => {
        try {
            const result = await getSurahs();
            if (result.success) setSurahs(result.data);
        } catch (error) {
            console.error('Error loading surahs:', error);
        }
    };

    const loadHalaqat = async () => {
        try {
            const result = await getHalaqat();
            if (result.success) setHalaqat(result.data);
        } catch (error) {
            messageApi.error('خطأ في تحميل الحلقات');
        }
    };

    const loadStudents = async (halaqaId) => {
        setLoading(true);
        try {
            const result = await getHalaqaProgress(halaqaId);
            if (result.success) setStudents(result.data);
        } catch (error) {
            messageApi.error('خطأ في تحميل الطلاب');
        } finally {
            setLoading(false);
        }
    };

    const handleHalaqaChange = (id) => {
        setSelectedHalaqa(id);
        if (id) {
            loadStudents(id);
        } else {
            setStudents([]);
        }
    };

    const showModal = (student) => {
        setCurrentStudent(student);
        form.resetFields();
        form.setFieldsValue({
            date: dayjs(),
            type: 'memo'
        });
        setIsModalVisible(true);
    };

    const showHistory = async (student) => {
        setCurrentStudent(student);
        setLoading(true);
        try {
            const result = await getStudentProgress(student.student_id);
            if (result.success) {
                setHistoryData(result.data);
                setIsHistoryVisible(true);
            }
        } catch (error) {
            messageApi.error('خطأ في جلب السجل');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        const data = {
            student_id: currentStudent.student_id,
            halaqa_id: selectedHalaqa,
            day: values.date.date(),
            month: values.date.month() + 1,
            year: values.date.year(),
            start_surah_id: values.start_surah_id,
            start_ayah: values.start_ayah,
            end_surah_id: values.end_surah_id,
            end_ayah: values.end_ayah,
            type: values.type,
            quality_rating: values.quality_rating,
            notes: values.notes
        };

        try {
            const result = await recordMemorization(data);
            if (result.success) {
                messageApi.success('تم تسجيل الإنجاز بنجاح');
                setIsModalVisible(false);
                loadStudents(selectedHalaqa);
            }
        } catch (error) {
            messageApi.error('خطأ في التسجيل');
        }
    };

    const columns = [
        {
            title: 'اسم الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
            sorter: (a, b) => a.student_name.localeCompare(b.student_name)
        },
        {
            title: 'أحدث سجل',
            key: 'latest_record',
            render: (_, record) => {
                const latest = record.latest_memorization;
                if (!latest) return <Tag color="default">لا يوجد سجل</Tag>;
                return (
                    <div style={{ fontSize: '12px' }}>
                        <Tag color="cyan">{latest.type === 'memo' ? 'حفظ' : 'مراجعة'}</Tag>
                        <span>{latest.start_surah_name} ({latest.start_ayah}) - {latest.end_surah_name} ({latest.end_ayah})</span>
                        <div style={{ color: '#888' }}>{latest.month}/{latest.year}</div>
                    </div>
                );
            }
        },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal(record)}
                    >
                        تسجيل إنجاز
                    </Button>
                    <Button
                        icon={<HistoryOutlined />}
                        onClick={() => showHistory(record)}
                    >
                        السجل
                    </Button>
                </Space>
            ),
        },
    ];

    const historyColumns = [
        {
            title: 'الشهر/السنة',
            key: 'month_year',
            render: (r) => `${r.month}/${r.year}`
        },
        {
            title: 'النوع',
            key: 'type',
            render: (r) => <Tag color={r.type === 'memo' ? 'blue' : 'green'}>{r.type === 'memo' ? 'حفظ' : 'مراجعة'}</Tag>
        },
        {
            title: 'من',
            key: 'from',
            render: (r) => `${r.start_surah_name || ''} (${r.start_ayah || '-'})`
        },
        {
            title: 'إلى',
            key: 'to',
            render: (r) => `${r.end_surah_name || ''} (${r.end_ayah || '-'})`
        },
        {
            title: 'التقييم',
            dataIndex: 'quality_rating',
            key: 'quality_rating',
            render: (val) => <Rate disabled defaultValue={val} />
        }
    ];

    return (
        <Card title="متابعة الحفظ والمراجعة">
            <Select
                placeholder="اختر الحلقة"
                style={{ width: 250, marginBottom: 16 }}
                onChange={handleHalaqaChange}
                allowClear
            >
                {halaqat.map(h => (
                    <Option key={h.id} value={h.id}>{h.name}</Option>
                ))}
            </Select>

            <Table
                columns={columns}
                dataSource={students}
                rowKey="student_id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                pagination={false}
            />

            {/* تسجيل إنجاز */}
            <Modal
                title={`تسجيل إنجاز للطالب: ${currentStudent?.student_name}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={600}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="date" label="التاريخ" rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="type" label="النوع" rules={[{ required: true }]}>
                                <Select>
                                    <Option value="memo">حفظ جديد</Option>
                                    <Option value="review">مراجعة</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item name="start_surah_id" label="من سورة" rules={[{ required: true }]}>
                                <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {surahs.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="start_ayah" label="آية">
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={18}>
                            <Form.Item name="end_surah_id" label="إلى سورة" rules={[{ required: true }]}>
                                <Select showSearch filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}>
                                    {surahs.map(s => <Option key={s.id} value={s.id}>{s.name}</Option>)}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="end_ayah" label="آية">
                                <Input type="number" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="quality_rating" label="التقييم" rules={[{ required: true }]}>
                        <Rate />
                    </Form.Item>

                    <Form.Item name="notes" label="ملاحظات">
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            حفظ الإنجاز
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* سجل الإنجازات */}
            <Modal
                title={`سجل إنجازات الطالب: ${currentStudent?.student_name}`}
                open={isHistoryVisible}
                onCancel={() => setIsHistoryVisible(false)}
                footer={null}
                width={800}
            >
                <Table
                    columns={historyColumns}
                    dataSource={historyData}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    size="small"
                />
            </Modal>
        </Card>
    );
};

export default Memorization;
