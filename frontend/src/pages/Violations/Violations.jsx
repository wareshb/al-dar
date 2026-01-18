import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Card, Select, DatePicker, Popconfirm, App } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getViolations, recordViolation, deleteViolation } from '../../services/violationService';
import { getStudents } from '../../services/studentService';
import dayjs from 'dayjs';

const { Option } = Select;

const Violations = () => {
    const [violations, setViolations] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { message: messageApi } = App.useApp();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [violationsRes, studentsRes] = await Promise.all([
                getViolations(),
                getStudents()
            ]);

            if (violationsRes.success) setViolations(violationsRes.data);
            if (studentsRes.success) setStudents(studentsRes.data);

        } catch (error) {
            messageApi.error('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const showModal = () => {
        form.resetFields();
        form.setFieldsValue({ violation_date: dayjs() });
        setIsModalVisible(true);
    };

    const onFinish = async (values) => {
        const data = {
            ...values,
            violation_date: values.violation_date.format('YYYY-MM-DD')
        };

        try {
            const result = await recordViolation(data);
            if (result.success) {
                messageApi.success('تم تسجيل المخالفة بنجاح');
                setIsModalVisible(false);
                loadData();
            }
        } catch (error) {
            messageApi.error('خطأ في التسجيل');
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteViolation(id);
            if (result.success) {
                messageApi.success('تم حذف المخالفة');
                loadData();
            }
        } catch (error) {
            messageApi.error('خطأ في الحذف');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 70,
            sorter: (a, b) => a.id - b.id,
        },
        {
            title: 'الطالب',
            dataIndex: 'student_name',
            key: 'student_name',
            sorter: (a, b) => (a.student_name || '').localeCompare(b.student_name || ''),
            filters: Array.from(new Set(violations.map(v => v.student_name).filter(Boolean))).map(name => ({ text: name, value: name })),
            onFilter: (value, record) => record.student_name === value,
        },
        {
            title: 'التاريخ',
            dataIndex: 'violation_date',
            key: 'violation_date',
            sorter: (a, b) => dayjs(a.violation_date).unix() - dayjs(b.violation_date).unix(),
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
        },
        {
            title: 'الوصف',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Popconfirm title="حذف؟" onConfirm={() => handleDelete(record.id)}>
                    <Button icon={<DeleteOutlined />} danger size="small" />
                </Popconfirm>
            ),
        },
    ];

    return (
        <Card title="إدارة المخالفات" extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
                تسجيل مخالفة
            </Button>
        }>
            <Table
                columns={columns}
                dataSource={violations}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title="تسجيل مخالفة جديدة"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item name="student_id" label="الطالب" rules={[{ required: true }]}>
                        <Select showSearch optionFilterProp="children" placeholder="اختر الطالب">
                            {students.map(s => (
                                <Option key={s.id} value={s.id}>{s.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="violation_date" label="التاريخ" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="description" label="وصف المخالفة" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            تسجيل
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Violations;
