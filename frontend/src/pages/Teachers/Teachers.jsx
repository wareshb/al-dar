import React, { useState, useEffect } from 'react';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/teacherService';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Select, Tag, Switch } from 'antd';

const { Option } = Select;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const result = await getTeachers();
            if (result.success) {
                setTeachers(result.data);
            }
        } catch (error) {
            message.error('خطأ في تحميل بيانات المعلمين والموظفين');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (teacher = null) => {
        setEditingTeacher(teacher);
        if (teacher) {
            form.setFieldsValue(teacher);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingTeacher(null);
    };

    const showDetails = (teacher) => {
        setSelectedTeacher(teacher);
        setIsDetailsVisible(true);
    };

    const onFinish = async (values) => {
        try {
            if (editingTeacher) {
                const result = await updateTeacher(editingTeacher.id, values);
                if (result.success) {
                    message.success('تم تحديث بيانات الموظف بنجاح');
                }
            } else {
                const result = await createTeacher(values);
                if (result.success) {
                    message.success('تم إضافة الموظف بنجاح');
                }
            }
            setIsModalVisible(false);
            loadTeachers();
        } catch (error) {
            message.error(error.response?.data?.message || 'حدث خطأ ما');
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteTeacher(id);
            if (result.success) {
                message.success('تم حذف الموظف بنجاح');
                loadTeachers();
            }
        } catch (error) {
            message.error('خطأ في عملية الحذف');
        }
    };

    const columns = [
        {
            title: 'الاسم الكامل',
            dataIndex: 'full_name',
            key: 'full_name',
        },
        {
            title: 'رقم الهاتف',
            dataIndex: 'phone',
            key: 'phone',
        },
        {
            title: 'نوع الموظف',
            dataIndex: 'staff_type',
            key: 'staff_type',
            render: (type) => {
                const map = { teacher: 'معلم', admin: 'إداري', both: 'معلم وإداري' };
                const colors = { teacher: 'blue', admin: 'orange', both: 'purple' };
                return <Tag color={colors[type]}>{map[type] || type}</Tag>;
            }
        },
        {
            title: 'الوظيفة الحالية',
            dataIndex: 'current_job',
            key: 'current_job',
        },
        {
            title: 'مجاز؟',
            dataIndex: 'is_mujaz',
            key: 'is_mujaz',
            render: (mujaz) => (
                mujaz ? <Tag color="success" icon={<CheckCircleOutlined />}>نعم</Tag> : <Tag color="default" icon={<CloseCircleOutlined />}>لا</Tag>
            ),
        },
        {
            title: 'الحالة',
            dataIndex: 'is_active',
            key: 'is_active',
            render: (active) => (
                active ? <Tag color="processing">نشط</Tag> : <Tag color="error">غير نشط</Tag>
            ),
        },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => showDetails(record)}
                        title="عرض التفاصيل"
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        title="تعديل"
                    />
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذا الموظف؟"
                        onConfirm={() => handleDelete(record.id)}
                        okText="نعم"
                        cancelText="لا"
                    >
                        <Button icon={<DeleteOutlined />} danger title="حذف" />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card title="إدارة المعلمين والإداريين" extra={
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
            >
                إضافة موظف جديد
            </Button>
        }>
            <Table
                columns={columns}
                dataSource={teachers}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingTeacher ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={700}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ staff_type: 'teacher', is_mujaz: false, is_active: true }}
                >
                    <Space style={{ display: 'flex', width: '100%' }} align="start">
                        <Form.Item
                            name="full_name"
                            label="الاسم الكامل"
                            rules={[{ required: true, message: 'يرجى إدخال الاسم الكامل' }]}
                            style={{ width: 320 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="phone"
                            label="رقم الهاتف"
                            rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
                            style={{ width: 320 }}
                        >
                            <Input />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: 'flex', width: '100%' }} align="start">
                        <Form.Item
                            name="email"
                            label="البريد الإلكتروني"
                            style={{ width: 320 }}
                        >
                            <Input type="email" />
                        </Form.Item>
                        <Form.Item
                            name="staff_type"
                            label="نوع الموظف"
                            rules={[{ required: true }]}
                            style={{ width: 320 }}
                        >
                            <Select>
                                <Option value="teacher">معلم</Option>
                                <Option value="admin">إداري</Option>
                                <Option value="both">معلم وإداري</Option>
                            </Select>
                        </Form.Item>
                    </Space>

                    <Space style={{ display: 'flex', width: '100%' }} align="start">
                        <Form.Item
                            name="current_job"
                            label="الوظيفة الحالية"
                            style={{ width: 320 }}
                        >
                            <Input placeholder="مثال: مدرس قرآن، مدير حلقة..." />
                        </Form.Item>
                        <Form.Item
                            name="qualification"
                            label="المؤهل العلمي"
                            style={{ width: 320 }}
                        >
                            <Input placeholder="مثال: بكالوريوس دراسات إسلامية" />
                        </Form.Item>
                    </Space>

                    <Space style={{ display: 'flex', width: '100%' }} align="start">
                        <Form.Item
                            name="specialization"
                            label="التخصص"
                            style={{ width: 320 }}
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="is_mujaz"
                            label="هل هو مجاز؟"
                            valuePropName="checked"
                            style={{ width: 320 }}
                        >
                            <Switch checkedChildren="نعم" unCheckedChildren="لا" />
                        </Form.Item>
                    </Space>

                    <Form.Item
                        name="address"
                        label="العنوان"
                    >
                        <Input.TextArea rows={2} />
                    </Form.Item>

                    <Form.Item
                        name="is_active"
                        label="الحالة"
                        valuePropName="checked"
                    >
                        <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingTeacher ? 'تحديث البيانات' : 'إضافة الموظف'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="تفاصيل الموظف"
                open={isDetailsVisible}
                onCancel={() => setIsDetailsVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setIsDetailsVisible(false)}>
                        إغلاق
                    </Button>
                ]}
                width={600}
            >
                {selectedTeacher && (
                    <div className="staff-details">
                        <p><strong>الاسم الكامل:</strong> {selectedTeacher.full_name}</p>
                        <p><strong>رقم الهاتف:</strong> {selectedTeacher.phone}</p>
                        <p><strong>البريد الإلكتروني:</strong> {selectedTeacher.email || 'غير متوفر'}</p>
                        <p><strong>نوع الموظف:</strong> {
                            selectedTeacher.staff_type === 'teacher' ? 'معلم' :
                                selectedTeacher.staff_type === 'admin' ? 'إداري' : 'معلم وإداري'
                        }</p>
                        <p><strong>الوظيفة الحالية:</strong> {selectedTeacher.current_job || '-'}</p>
                        <p><strong>المؤهل العلمي:</strong> {selectedTeacher.qualification || '-'}</p>
                        <p><strong>التخصص:</strong> {selectedTeacher.specialization || '-'}</p>
                        <p><strong>مجاز؟:</strong> {selectedTeacher.is_mujaz ? 'نعم' : 'لا'}</p>
                        <p><strong>العنوان:</strong> {selectedTeacher.address || '-'}</p>
                        <p><strong>الحالة:</strong> {selectedTeacher.is_active ? 'نشط' : 'غير نشط'}</p>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default Teachers;
