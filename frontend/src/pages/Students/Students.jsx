import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Popconfirm, Card, Select, DatePicker, Switch, Tag, App, Descriptions, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getStudents, createStudent, updateStudent, deleteStudent, getNextStudentId } from '../../services/studentService';
import { getHalaqat } from '../../services/halaqaService';
import { FilterOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const Students = () => {
    const [students, setStudents] = useState([]);
    const [halaqat, setHalaqat] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [viewingStudent, setViewingStudent] = useState(null);
    const [form] = Form.useForm();
    const { message: messageApi, notification: notificationApi } = App.useApp();

    // Filter states
    const [searchText, setSearchText] = useState('');
    const [selectedHalaqa, setSelectedHalaqa] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);

    useEffect(() => {
        loadStudents();
        loadHalaqat();
    }, []);

    const loadHalaqat = async () => {
        try {
            const result = await getHalaqat();
            if (result.success) {
                setHalaqat(result.data);
            }
        } catch (error) {
            console.error('Error loading halaqat:', error);
        }
    };

    const loadStudents = async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchText) params.search = searchText;
            if (selectedHalaqa) params.halaqa_id = selectedHalaqa;
            if (selectedStatus !== null && selectedStatus !== undefined) params.is_active = selectedStatus;

            const result = await getStudents(params);
            if (result.success) {
                setStudents(result.data);
            }
        } catch (error) {
            messageApi.error('خطأ في تحميل بيانات الطلاب');
        } finally {
            setLoading(false);
        }
    };

    const showModal = async (student = null) => {
        setEditingStudent(student);
        if (student) {
            form.setFieldsValue({
                ...student,
                birth_date: student.birth_date ? dayjs(student.birth_date) : null,
                registration_date: student.registration_date ? dayjs(student.registration_date) : null,
                // استخراج معرف الحلقة من البيانات إذا كان موجوداً
                halaqa_id: student.halaqa_id || null
            });
        } else {
            form.resetFields();

            // جلب المعرف التلقائي
            try {
                const idResult = await getNextStudentId();
                if (idResult.success) {
                    form.setFieldsValue({
                        identification_number: idResult.nextId
                    });
                }
            } catch (error) {
                console.error('Error fetching next ID:', error);
            }

            form.setFieldsValue({
                registration_date: dayjs(),
                is_active: true,
                gender: 'male'
            });
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsViewModalVisible(false);
        setEditingStudent(null);
        setViewingStudent(null);
    };

    const handleView = (student) => {
        setViewingStudent(student);
        setIsViewModalVisible(true);
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
                    messageApi.success('تم تحديث بيانات الطالب بنجاح');
                }
            } else {
                const result = await createStudent(data);
                if (result.success) {
                    messageApi.success('تم إضافة الطالب بنجاح');
                }
            }
            setIsModalVisible(false);
            loadStudents();
        } catch (error) {
            notificationApi.error({
                message: 'فشل في العملية',
                description: error.response?.data?.message || 'اسم المستخدم أو البيانات المدخلة قد تكون غير صحيحة',
                duration: 5
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            const result = await deleteStudent(id);
            if (result.success) {
                messageApi.success('تم حذف الطالب بنجاح');
                loadStudents();
            }
        } catch (error) {
            messageApi.error('خطأ في عملية الحذف');
        }
    };

    const handleSearch = () => {
        loadStudents();
    };

    const handleReset = () => {
        setSearchText('');
        setSelectedHalaqa(null);
        setSelectedStatus(null);
        setLoading(true);
        getStudents().then(result => {
            if (result.success) setStudents(result.data);
            setLoading(false);
        });
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
            title: 'الحلقة',
            dataIndex: 'halaqa_name',
            key: 'halaqa_name',
            render: (name) => name || <Tag color="default">غير مسجل</Tag>,
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
            render: (active) => (active ? <Tag color="success">نشط</Tag> : <Tag color="error">غير نشط</Tag>),
        },
        {
            title: 'إجراءات',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        title="تعديل"
                    />
                    <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleView(record)}
                        title="عرض التفاصيل"
                    />
                    <Popconfirm
                        title="هل أنت متأكد من حذف هذا الطالب؟"
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
        <Card title="إدارة الطلاب" extra={
            <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
            >
                إضافة طالب جديد
            </Button>
        }>
            <div style={{ marginBottom: 20 }}>
                <Space wrap>
                    <Input
                        placeholder="بحث بالاسم..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        style={{ width: 200 }}
                    />
                    <Select
                        placeholder="فلترة بالحلقة"
                        style={{ width: 180 }}
                        allowClear
                        value={selectedHalaqa}
                        onChange={setSelectedHalaqa}
                    >
                        {halaqat.map(h => (
                            <Option key={h.id} value={h.id}>{h.name}</Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="الحالة"
                        style={{ width: 120 }}
                        allowClear
                        value={selectedStatus}
                        onChange={setSelectedStatus}
                    >
                        <Option value="true">نشط</Option>
                        <Option value="false">غير نشط</Option>
                    </Select>
                    <Button type="primary" icon={<FilterOutlined />} onClick={loadStudents}>
                        تطبيق الفلتر
                    </Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>
                        إعادة تعيين
                    </Button>
                </Space>
            </div>

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
                        {editingStudent && (
                            <Form.Item
                                name="identification_number"
                                label="معرف الطالب / الرقم الوطني"
                            >
                                <Input disabled placeholder="مثال: 2024001" />
                            </Form.Item>
                        )}
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
                            name="academic_level"
                            label="المستوى الدراسي"
                        >
                            <Select placeholder="اختر المستوى">
                                <Option value="تمهيدي">تمهيدي</Option>
                                <Option value="أول ابتدائي">أول ابتدائي</Option>
                                <Option value="ثاني ابتدائي">ثاني ابتدائي</Option>
                                <Option value="ثالث ابتدائي">ثالث ابتدائي</Option>
                                <Option value="رابع ابتدائي">رابع ابتدائي</Option>
                                <Option value="خامس ابتدائي">خامس ابتدائي</Option>
                                <Option value="سادس ابتدائي">سادس ابتدائي</Option>
                                <Option value="أول إعدادي">أول إعدادي</Option>
                                <Option value="ثاني إعدادي">ثاني إعدادي</Option>
                                <Option value="ثالث إعدادي">ثالث إعدادي</Option>
                                <Option value="أول ثانوي">أول ثانوي</Option>
                                <Option value="ثاني ثانوي">ثاني ثانوي</Option>
                                <Option value="ثالث ثانوي">ثالث ثانوي</Option>
                                <Option value="جامعي">جامعي</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="hifz_amount"
                            label="مقدار الحفظ عند التسجيل"
                        >
                            <Input placeholder="مثال: 5 أجزاء" />
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
                        <Form.Item
                            name="halaqa_id"
                            label="الحلقة"
                        >
                            <Select placeholder="اختر الحلقة">
                                {halaqat.map(h => (
                                    <Option key={h.id} value={h.id}>{h.name}</Option>
                                ))}
                            </Select>
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

                    <h3 style={{ margin: '16px 0', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                        المعرفون / المزكون
                    </h3>
                    <div className="responsive-form-grid">
                        <Form.Item
                            name="recommender_name_1"
                            label="اسم المعرف الأول"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_job_1"
                            label="وظيفة المعرف الأول"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_phone_1"
                            label="رقم هاتف المعرف الأول"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_address_1"
                            label="عنوان سكن المعرف الأول"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_name_2"
                            label="اسم المعرف الثاني"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_job_2"
                            label="وظيفة المعرف الثاني"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_phone_2"
                            label="رقم هاتف المعرف الثاني"
                        >
                            <Input />
                        </Form.Item>
                        <Form.Item
                            name="recommender_address_2"
                            label="عنوان سكن المعرف الثاني"
                        >
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="address"
                        label="عنوان سكن اسره الطالب"
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

            <Modal
                title="تفاصيل الطالب"
                open={isViewModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="close" onClick={handleCancel}>
                        إغلاق
                    </Button>
                ]}
                width={800}
            >
                {viewingStudent && (
                    <div className="view-student-details">
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="الاسم الكامل">{viewingStudent.full_name}</Descriptions.Item>
                            <Descriptions.Item label="معرف الطالب">{viewingStudent.identification_number}</Descriptions.Item>
                            <Descriptions.Item label="رقم الهاتف">{viewingStudent.phone}</Descriptions.Item>
                            <Descriptions.Item label="الحلقة">{viewingStudent.halaqa_name || 'غير مسجل'}</Descriptions.Item>
                            <Descriptions.Item label="الجنس">{viewingStudent.gender === 'male' ? 'ذكر' : 'أنثى'}</Descriptions.Item>
                            <Descriptions.Item label="تاريخ التسجيل">{viewingStudent.registration_date ? dayjs(viewingStudent.registration_date).format('YYYY-MM-DD') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="العمر (تقريباً)">{viewingStudent.birth_date ? dayjs().diff(dayjs(viewingStudent.birth_date), 'year') : '-'}</Descriptions.Item>
                            <Descriptions.Item label="مكان الميلاد">{viewingStudent.birth_place}</Descriptions.Item>
                            <Descriptions.Item label="المستوى الدراسي">{viewingStudent.academic_level}</Descriptions.Item>
                            <Descriptions.Item label="مقدار الحفظ (عند التسجيل)">{viewingStudent.hifz_amount}</Descriptions.Item>
                            <Descriptions.Item label="العنوان" span={2}>{viewingStudent.address}</Descriptions.Item>
                            <Descriptions.Item label="الحالة">
                                {viewingStudent.is_active ? <Tag color="success">نشط</Tag> : <Tag color="error">غير نشط</Tag>}
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">بيانات ولي الأمر</Divider>
                        <Descriptions bordered column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}>
                            <Descriptions.Item label="الاسم">{viewingStudent.guardian_name}</Descriptions.Item>
                            <Descriptions.Item label="صلة القرابة">{viewingStudent.guardian_relationship}</Descriptions.Item>
                            <Descriptions.Item label="رقم الهاتف">{viewingStudent.guardian_phone}</Descriptions.Item>
                            <Descriptions.Item label="الوظيفة">{viewingStudent.guardian_job}</Descriptions.Item>
                        </Descriptions>

                        <Divider orientation="left">المعرفون / المزكون</Divider>
                        <Descriptions bordered column={1} title="المعرف الأول">
                            <Descriptions.Item label="الاسم">{viewingStudent.recommender_name_1}</Descriptions.Item>
                            <Descriptions.Item label="الوظيفة">{viewingStudent.recommender_job_1}</Descriptions.Item>
                            <Descriptions.Item label="رقم الهاتف">{viewingStudent.recommender_phone_1}</Descriptions.Item>
                            <Descriptions.Item label="العنوان">{viewingStudent.recommender_address_1}</Descriptions.Item>
                        </Descriptions>
                        <Descriptions bordered column={1} title="المعرف الثاني" style={{ marginTop: 16 }}>
                            <Descriptions.Item label="الاسم">{viewingStudent.recommender_name_2}</Descriptions.Item>
                            <Descriptions.Item label="الوظيفة">{viewingStudent.recommender_job_2}</Descriptions.Item>
                            <Descriptions.Item label="رقم الهاتف">{viewingStudent.recommender_phone_2}</Descriptions.Item>
                            <Descriptions.Item label="العنوان">{viewingStudent.recommender_address_2}</Descriptions.Item>
                        </Descriptions>
                    </div>
                )}
            </Modal>
        </Card>
    );
};

export default Students;
