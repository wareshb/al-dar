import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Select, DatePicker, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/studentService';
import dayjs from 'dayjs';

const { Option } = Select;

const Students = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        try {
            const result = await getStudents();
            if (result.success) {
                setStudents(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل بيانات الطلاب');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (student = null) => {
        setEditingStudent(student);
        if (student) {
            form.setFieldsValue({
                ...student,
                birth_date: student.birth_date ? dayjs(student.birth_date) : null,
                registration_date: student.registration_date ? dayjs(student.registration_date) : null,
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                registration_date: dayjs(),
                is_active: true
            });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingStudent(null);
    };

    const onFinish = async (values) => {
        const data = {
            ...values,
            birth_date: values.birth_date ? values.birth_date.format('YYYY-MM-DD') : null,
            registration_date: values.registration_date ? values.registration_date.format('YYYY-MM-DD') : null,
        };

        try {
            if (editingStudent) {
                const result = await updateStudent(editingStudent.id, data);
                if (result.success) {
                    message.success('تم تحديث بيانات الطالب بنجاح');
                }
            } else {
                const result = await createStudent(data);
                if (result.success) {
                    message.success('تم إضافة الطالب بنجاح');
                }
            }
            setIsModalVisible(false);
            loadStudents();
        } catch (error) {
            message.error(error.response?.data?.message || 'حدث خطأ ما');
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteStudent(id);
            if (result.success) {
                message.success('تم حذف الطالب بنجاح');
                loadStudents();
            }
        } catch (error) {
            message.error('خطأ في عملية الحذف');
        }
    };

    const columns = [
        {
            title: 'المعرف',
            dataIndex: 'identification_number',
            key: 'identification_number',
        },
        {
            title: 'الاسم الكامل',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'الجنس',
            dataIndex: 'gender',
            key: 'gender',
            render: (gender) => (gender === 'male' ? 'ذكر' : 'أنثى'),
        },
        {
            title: 'رقم الهاتف',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'تاريخ التسجيل',
            dataIndex: 'registration_date',
            key: 'registration_date',
            render: (date) => (date ? dayjs(date).format('YYYY-MM-DD') : '-'),
        },
        {
            title: 'الحالة',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (active ? 'نشط' : 'غير نشط'),
        },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    />
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذا الطالب؟"
                        onConfirm={() => handleDelete(record.id)}
                        okText="نعم"
                        cancelText="لا"
                    >
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card title="إدارة الطلاب" extra={
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
            >
                إضافة طالب جديد
            </Button>
        }>
            <Table
                columns={columns}
                dataSource={students}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <div className="responsive-form-grid">
                        <Form.Item
                            name="identification_number"
                            label="معرف الطالب / الرقم الوطني"
                        >
                            <Input placeholder="مثال: 2024001" />
                        </Form.Item>
                        <Form.Item
                            name="full_name"
                            label="الاسم الكامل"
                            rules={[{ required: true, message: 'يرجى إدخال الاسم الكامل' }]}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="gender"
                            label="الجنس"
                            rules={[{ required: true, message: 'يرجى اختيار الجنس' }]}
                        >
                            <Select>
                                <Option value="male">ذكر</Option>
                                <Option value="female">أنثى</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            label="رقم هاتف الطالب"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="birth_date"
                            label="تاريخ الميلاد"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name="birth_place"
                            label="مكان الميلاد"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="registration_date"
                            label="تاريخ التسجيل"
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item
                            name="is_active"
                            label="الحالة"
                            valuePropName="checked"
                        >
                            <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                        </Form.Item>
                    </div>

                    <h3 style={{ margin: '16px 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        بيانات ولي الأمر
                    </h3>
                    <div className="responsive-form-grid">
                        <Form.Item
                            name="guardian_name"
                            label="اسم ولي الأمر"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="guardian_phone"
                            label="رقم هاتف ولي الأمر"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="guardian_relationship"
                            label="صلة القرابة"
                        >
                            <Select placeholder="اختر الصلة">
                                <Option value="أب">أب</Option>
                                <Option value="أم">أم</Option>
                                <Option value="أخ">أخ</Option>
                                <Option value="عم">عم</Option>
                                <Option value="خال">خال</Option>
                                <Option value="آخر">آخر</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="guardian_job"
                            label="وظيفة ولي الأمر"
                        >
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="العنوان"
                        style={{ marginTop: '16px' }}
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: '16px' }}>
                            {editingStudent ? 'تحديث' : 'إضافة'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default Students;
