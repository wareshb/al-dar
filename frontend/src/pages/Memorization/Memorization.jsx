import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Card, Select, Rate, DatePicker } from 'antd';
import { PlusOutlined, HistoryOutlined } from '@ant-design/icons';
import { getHalaqat } from '../../services/halaqaService';
import { getHalaqaAttendance } from '../../services/attendanceService'; // لاستخدام نفس الطلاب
import { recordMemorization, getStudentProgress } from '../../services/memorizationService';
import dayjs from 'dayjs';

const { Option } = Select;

const Memorization = () => {
    const [halaqat, setHalaqat] = useState([]);
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [currentStudent, setCurrentStudent] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadHalaqat();
    }, []);

    const loadHalaqat = async () => {
        try {
            const result = await getHalaqat();
            if (result.success) setHalaqat(result.data);
        } catch (error) {
            message.error('خطأ في تحميل الحلقات');
        }
    };

    const loadStudents = async (halaqaId) => {
        setLoading(true);
        try {
            // نستخدم خدمة الحضور لجلب الطلاب المسجلين في الحلقة
            const result = await getHalaqaAttendance(halaqaId, dayjs().format('YYYY-MM-DD'));
            if (result.success) setStudents(result.data);
        } catch (error) {
            message.error('خطأ في تحميل الطلاب');
        } finally {
            setLoading(false);
        }
    };

    const handleHalaqaChange = (id) => {
        setSelectedHalaqa(id);
        loadStudents(id);
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

    const onFinish = async (values) => {
        const data = {
            ...values,
            student_id: currentStudent.student_id,
            halaqa_id: selectedHalaqa,
            date: values.date.format('YYYY-MM-DD'),
            year: values.date.year(),
            month: values.date.month() + 1
        };

        try {
            const result = await recordMemorization(data);
            if (result.success) {
                message.success('تم تسجيل الحفظ بنجاح');
                setIsModalVisible(false);
            }
        } catch (error) {
            message.error('خطأ في التسجيل');
        }
    };

    const columns = [
        {
            title: 'اسم الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
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
                        onClick={() => message.info('قيد التطوير: عرض السجل')}
                    >
                        السجل
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <Card title="متابعة الحفظ والمراجعة">
            <Select
                placeholder="اختر الحلقة"
                style={{ width: 250, marginBottom: 16 }}
                onChange={handleHalaqaChange}
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
            />

            <Modal
                title={`تسجيل إنجاز للطالب: ${currentStudent?.student_name}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item name="date" label="التاريخ" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="type" label="النوع" rules={[{ required: true }]}>
                        <Select>
                            <Option value="memo">حفظ جديد</Option>
                            <Option value="review">مراجعة</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="surah_from" label="من سورة" rules={[{ required: true }]}>
                        <Input placeholder="اسم السورة" />
                    </Form.Item>

                    <Form.Item name="ayah_from" label="من آية">
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item name="surah_to" label="إلى سورة" rules={[{ required: true }]}>
                        <Input placeholder="اسم السورة" />
                    </Form.Item>

                    <Form.Item name="ayah_to" label="إلى آية">
                        <Input type="number" />
                    </Form.Item>

                    <Form.Item name="quality_rating" label="التقييم (1-5)" rules={[{ required: true }]}>
                        <Rate />
                    </Form.Item>

                    <Form.Item name="notes" label="ملاحظات">
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            حفظ الإنجاز
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Memorization;
