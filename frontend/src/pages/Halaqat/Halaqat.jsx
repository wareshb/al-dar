import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Select, notification, App } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UserAddOutlined, TeamOutlined } from '@ant-design/icons';
import { getHalaqat, createHalaqa, updateHalaqa, deleteHalaqa, enrollStudents, getHalaqaById, removeStudent } from '../../services/halaqaService';
import { getTeachers } from '../../services/teacherService';
import { getStudents } from '../../services/studentService';

const { Option } = Select;

const Halaqat = () => {
    const [halaqat, setHalaqat] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEnrollModalVisible, setIsEnrollModalVisible] = useState(false);
    const [isStudentsListVisible, setIsStudentsListVisible] = useState(false);
    const [editingHalaqa, setEditingHalaqa] = useState(null);
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [currentHalaqaStudents, setCurrentHalaqaStudents] = useState([]);
    const [form] = Form.useForm();
    const [enrollForm] = Form.useForm();
    const { message: messageApi, notification: notificationApi, modal: modalApi } = App.useApp();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [halaqatRes, teachersRes, studentsRes] = await Promise.all([
                getHalaqat(),
                getTeachers(),
                getStudents()
            ]);

            if (halaqatRes.success) setHalaqat(halaqatRes.data);
            if (teachersRes.success) setTeachers(teachersRes.data);
            if (studentsRes.success) setStudents(studentsRes.data);

        } catch (error) {
            messageApi.error('خطأ في تحميل البيانات');
        } finally {
            setLoading(false);
        }
    };

    const showModal = (halaqa = null) => {
        setEditingHalaqa(halaqa);
        if (halaqa) {
            form.setFieldsValue(halaqa);
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingHalaqa(null);
    };

    const showEnrollModal = (halaqa) => {
        setSelectedHalaqa(halaqa);
        enrollForm.resetFields();
        setIsEnrollModalVisible(true);
    };

    const handleEnroll = async (values) => {
        try {
            const result = await enrollStudents(selectedHalaqa.id, values.studentIds);
            if (result.success) {
                messageApi.success('تم إضافة الطلاب إلى الحلقة بنجاح');
                setIsEnrollModalVisible(false);
                loadData(); // لتحديث عدد الطلاب في الجدول الرئيسي
            }
        } catch (error) {
            console.error('Enroll Error Detail:', error);
            console.error('Enroll Error Response Data:', error.response?.data);

            const errorMessage = error.response?.data?.message || error.message || 'حدث خطأ غير متوقع أثناء إضافة الطلاب';

            notificationApi.error({
                message: 'فشل في إضافة الطلاب',
                description: errorMessage,
                duration: 10,
                placement: 'topRight'
            });
        }
    };

    const showStudentsList = async (halaqa) => {
        setSelectedHalaqa(halaqa);
        try {
            const result = await getHalaqaById(halaqa.id);
            if (result.success) {
                setCurrentHalaqaStudents(result.data.students);
                setIsStudentsListVisible(true);
            }
        } catch (error) {
            messageApi.error('خطأ في تحميل قائمة الطلاب');
        }
    };

    const handleRemoveStudent = async (studentId) => {
        try {
            const result = await removeStudent(selectedHalaqa.id, studentId);
            if (result.success) {
                messageApi.success('تم إزالة الطالب من الحلقة');
                // تحديث القائمة الحالية
                const res = await getHalaqaById(selectedHalaqa.id);
                if (res.success) setCurrentHalaqaStudents(res.data.students);
                loadData(); // لتحديث العدد في الجدول الرئيسي
            }
        } catch (error) {
            messageApi.error('خطأ في إزالة الطالب');
        }
    };

    const onFinish = async (values) => {
        try {
            if (editingHalaqa) {
                const result = await updateHalaqa(editingHalaqa.id, values);
                if (result.success) {
                    messageApi.success('تم تحديث بيانات الحلقة بنجاح');
                }
            } else {
                const result = await createHalaqa(values);
                if (result.success) {
                    messageApi.success('تم إضافة الحلقة بنجاح');
                }
            }
            setIsModalVisible(false);
            loadData();
        } catch (error) {
            messageApi.error(error.response?.data?.message || 'حدث خطأ ما');
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteHalaqa(id);
            if (result.success) {
                messageApi.success('تم حذف الحلقة بنجاح');
                loadData();
            }
        } catch (error) {
            messageApi.error('خطأ في عملية الحذف');
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
            title: 'اسم الحلقة',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: 'المعلم المسئول',
            dataIndex: 'teacher_name',
            key: 'teacher_name',
            sorter: (a, b) => (a.teacher_name || '').localeCompare(b.teacher_name || ''),
        },
        {
            title: 'عدد الطلاب',
            dataIndex: 'students_count',
            key: 'students_count',
            sorter: (a, b) => (a.students_count || 0) - (b.students_count || 0),
            render: (count) => count || 0
        },
        {
            title: 'المستوى',
            dataIndex: 'level',
            key: 'level',
            sorter: (a, b) => (a.level || '').localeCompare(b.level || ''),
            filters: Array.from(new Set(halaqat.map(h => h.level).filter(Boolean))).map(level => ({ text: level, value: level })),
            onFilter: (value, record) => record.level === value,
        },
        {
            title: 'وصف',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<TeamOutlined />}
                        onClick={() => showStudentsList(record)}
                        title="عرض الطلاب"
                        type="default"
                    />
                    <Button
                        icon={<UserAddOutlined />}
                        onClick={() => showEnrollModal(record)}
                        title="إضافة طالب"
                        type="primary"
                        ghost
                    />
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                    />
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذه الحلقة؟"
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
        <Card title="إدارة الحلقات" extra={
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
            >
                إضافة حلقة جديدة
            </Button>
        }>
            <Table
                columns={columns}
                dataSource={halaqat}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingHalaqa ? 'تعديل بيانات حلقة' : 'إضافة حلقة جديدة'}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="name"
                        label="اسم الحلقة"
                        rules={[{ required: true, message: 'يرجى إدخال اسم الحلقة' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="teacher_id"
                        label="المعلم"
                        rules={[{ required: true, message: 'يرجى اختيار المعلم' }]}
                    >
                        <Select placeholder="اختر المعلم">
                            {teachers.map(t => (
                                <Option key={t.id} value={t.id}>{t.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        name="level"
                        label="المستوى"
                    >
                        <Input placeholder="مثال: مبتدئ، متوسط، خاتم" />
                    </Form.Item>
                    <Form.Item
                        name="description"
                        label="الوصف"
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            {editingHalaqa ? 'تحديث' : 'إضافة'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`إضافة طلاب إلى حلقة: ${selectedHalaqa?.name}`}
                open={isEnrollModalVisible}
                onCancel={() => setIsEnrollModalVisible(false)}
                footer={null}
            >
                <Form
                    form={enrollForm}
                    layout="vertical"
                    onFinish={handleEnroll}
                >
                    <Form.Item
                        name="studentIds"
                        label="اختر الطلاب"
                        rules={[{ required: true, message: 'يرجى اختيار طالب واحد على الأقل' }]}
                    >
                        <Select
                            mode="multiple"
                            showSearch
                            placeholder="ابحث واختر الطلاب"
                            optionFilterProp="children"
                        >
                            {students.map(s => (
                                <Option key={s.id} value={s.id}>{s.full_name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block icon={<UserAddOutlined />}>
                            إضافة الطلاب المحددين
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={`الطلاب المسجلين في حلقة: ${selectedHalaqa?.name}`}
                open={isStudentsListVisible}
                onCancel={() => setIsStudentsListVisible(false)}
                width={700}
                footer={null}
            >
                <Table
                    dataSource={currentHalaqaStudents}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 'max-content' }}
                    columns={[
                        { title: 'اسم الطالب', dataIndex: 'full_name', key: 'full_name' },
                        {
                            title: 'تاريخ الانتساب',
                            dataIndex: 'enroll_date',
                            key: 'enroll_date',
                            render: (date) => date ? new Date(date).toLocaleDateString('ar-EG') : '-'
                        },
                        {
                            title: 'إجراءات',
                            key: 'action',
                            render: (_, record) => (
                                <Popconfirm
                                    title="هل أنت متأكد من إزالة الطالب من الحلقة؟"
                                    onConfirm={() => handleRemoveStudent(record.id)}
                                    okText="نعم"
                                    cancelText="لا"
                                >
                                    <Button type="link" danger>إزالة</Button>
                                </Popconfirm>
                            )
                        }
                    ]}
                />
            </Modal>
        </Card >
    );
};

export default Halaqat;
