import React, { useState, useEffect } from 'react';
import {
    PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined,
    CloseCircleOutlined, EyeOutlined, UserOutlined, PhoneOutlined,
    MailOutlined, LockOutlined, IdcardOutlined, EnvironmentOutlined,
    GlobalOutlined, SafetyCertificateOutlined, HomeOutlined, BookOutlined
} from '@ant-design/icons';
import { getTeachers, createTeacher, updateTeacher, deleteTeacher } from '../../services/teacherService';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Select, Tag, Switch, Row, Col, Divider, Typography, App } from 'antd';

const { Option } = Select;
const { Text, Title } = Typography;

const Teachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isDetailsVisible, setIsDetailsVisible] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [form] = Form.useForm();
    const { message: messageApi, notification: notificationApi } = App.useApp();

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
            messageApi.error('خطأ في تحميل بيانات المعلمين والموظفين');
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
                    messageApi.success('تم تحديث بيانات الموظف بنجاح');
                }
            } else {
                const result = await createTeacher(values);
                if (result.success) {
                    messageApi.success('تم إضافة الموظف بنجاح');
                }
            }
            setIsModalVisible(false);
            loadTeachers();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'حدث خطأ ما';
            notificationApi.error({
                message: 'فشل في العملية',
                description: errorMsg,
                duration: 5
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteTeacher(id);
            if (result.success) {
                messageApi.success('تم حذف الموظف بنجاح');
                loadTeachers();
            }
        } catch (error) {
            messageApi.error('خطأ في عملية الحذف');
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
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        {editingTeacher ? <EditOutlined /> : <PlusOutlined />}
                        <span style={{ marginRight: 8 }}>
                            {editingTeacher ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
                        </span>
                    </Title>
                }
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
                width={800}
                style={{ top: 20 }}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ staff_type: 'teacher', is_mujaz: false, is_active: true }}
                    requiredMark="optional"
                >
                    <Divider orientation="right" plain>
                        <Text type="secondary"><UserOutlined /> المعلومات الشخصية</Text>
                    </Divider>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="full_name"
                                label="الاسم الكامل"
                                rules={[{ required: true, message: 'يرجى إدخال الاسم الكامل' }]}
                            >
                                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="أدخل الاسم الرباعي" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="phone"
                                label="رقم الهاتف"
                                rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
                            >
                                <Input prefix={<PhoneOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="7xxxxxxx" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="email"
                                label="البريد الإلكتروني"
                                rules={[{ type: 'email', message: 'البريد الإلكتروني غير صالح' }]}
                            >
                                <Input prefix={<MailOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="example@mail.com" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="staff_type"
                                label="نوع الموظف"
                                rules={[{ required: true }]}
                            >
                                <Select>
                                    <Option value="teacher">معلم</Option>
                                    <Option value="admin">إداري</Option>
                                    <Option value="both">معلم وإداري</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="address"
                                label="العنوان السكني"
                            >
                                <Input.TextArea placeholder="المحافظة - المديرية - المنطقة" rows={2} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="right" plain>
                        <Text type="secondary"><BookOutlined /> المعلومات الوظيفية</Text>
                    </Divider>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="current_job"
                                label="الوظيفة الحالية"
                            >
                                <Input prefix={<IdcardOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="مثل: مدرس قرآن، مدير حلقة..." />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="qualification"
                                label="المؤهل العلمي"
                            >
                                <Input prefix={<SafetyCertificateOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="بكالوريوس، ماجستير..." />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="specialization"
                                label="التخصص"
                            >
                                <Input prefix={<GlobalOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="دراسيات إسلامية، لغة عربية..." />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Item
                                name="is_mujaz"
                                label="هل هو مجاز؟"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="نعم" unCheckedChildren="لا" />
                            </Form.Item>
                        </Col>
                        <Col xs={12} sm={6}>
                            <Form.Item
                                name="is_active"
                                label="الحالة"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="نشط" unCheckedChildren="غير نشط" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="right" plain>
                        <Text type="secondary"><LockOutlined /> بيانات الحساب (لتسجيل الدخول)</Text>
                    </Divider>

                    <Row gutter={16}>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="username"
                                label="اسم المستخدم"
                                rules={[{ required: !editingTeacher, message: 'يرجى إدخال اسم المستخدم' }]}
                            >
                                <Input prefix={<UserOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="username" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Form.Item
                                name="password"
                                label={editingTeacher ? "كلمة المرور (اتركها فارغة لعدم التغيير)" : "كلمة المرور"}
                                rules={[{ required: !editingTeacher, message: 'يرجى إدخال كلمة المرور' }]}
                            >
                                <Input.Password prefix={<LockOutlined style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="********" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
                        <Button type="primary" htmlType="submit" block size="large" icon={editingTeacher ? <EditOutlined /> : <PlusOutlined />}>
                            {editingTeacher ? 'تحديث بيانات الموظف' : 'إضافة الموظف الجديد'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={
                    <Title level={4} style={{ margin: 0 }}>
                        <EyeOutlined /> <span style={{ marginRight: 8 }}>تفاصيل الموظف</span>
                    </Title>
                }
                open={isDetailsVisible}
                onCancel={() => setIsDetailsVisible(false)}
                footer={[
                    <Button key="close" type="primary" onClick={() => setIsDetailsVisible(false)}>
                        إغلاق
                    </Button>
                ]}
                width={700}
            >
                {selectedTeacher && (
                    <div className="staff-details">
                        <Row gutter={[16, 24]}>
                            <Col span={12}>
                                <Text type="secondary"><UserOutlined /> الاسم الكامل:</Text>
                                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedTeacher.full_name}</div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary"><PhoneOutlined /> رقم الهاتف:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.phone}</div>
                            </Col>

                            <Col span={12}>
                                <Text type="secondary"><MailOutlined /> البريد الإلكتروني:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.email || 'غير متوفر'}</div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary"><UserOutlined /> اسم المستخدم:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.username || '-'}</div>
                            </Col>

                            <Col span={12}>
                                <Text type="secondary"><IdcardOutlined /> نوع الموظف:</Text>
                                <div>
                                    {selectedTeacher.staff_type === 'teacher' ? <Tag color="blue">معلم</Tag> :
                                        selectedTeacher.staff_type === 'admin' ? <Tag color="orange">إداري</Tag> :
                                            <Tag color="purple">معلم وإداري</Tag>}
                                </div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary"><BookOutlined /> الوظيفة الحالية:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.current_job || '-'}</div>
                            </Col>

                            <Col span={12}>
                                <Text type="secondary"><SafetyCertificateOutlined /> المؤهل العلمي:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.qualification || '-'}</div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary"><GlobalOutlined /> التخصص:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.specialization || '-'}</div>
                            </Col>

                            <Col span={12}>
                                <Text type="secondary">مجاز؟:</Text>
                                <div>{selectedTeacher.is_mujaz ? <Tag color="success">نعم</Tag> : <Tag>لا</Tag>}</div>
                            </Col>
                            <Col span={12}>
                                <Text type="secondary">الحالة:</Text>
                                <div>{selectedTeacher.is_active ? <Tag color="processing">نشط</Tag> : <Tag color="error">غير نشط</Tag>}</div>
                            </Col>

                            <Col span={24}>
                                <Text type="secondary"><EnvironmentOutlined /> العنوان:</Text>
                                <div style={{ fontSize: '16px' }}>{selectedTeacher.address || '-'}</div>
                            </Col>
                        </Row>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default Teachers;
