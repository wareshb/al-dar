import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Upload, message, Divider, Space, Typography, Row, Col } from 'antd';
import { SaveOutlined, UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getSettings, updateSettings } from '../../services/settingsService';
import api from '../../services/api';

const { Title, Text } = Typography;

const Settings = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [logoUrl, setLogoUrl] = useState('');
    const [form] = Form.useForm();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const result = await getSettings();
            if (result.success) {
                form.setFieldsValue(result.data);
                if (result.data.dar_logo) {
                    setLogoUrl(result.data.dar_logo);
                }
            }
        } catch (error) {
            message.error('خطأ في تحميل الإعدادات');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        setSaving(true);
        try {
            const data = {
                ...values,
                dar_logo: logoUrl
            };
            const result = await updateSettings(data);
            if (result.success) {
                message.success('تم حفظ الإعدادات بنجاح');
            }
        } catch (error) {
            message.error('خطأ في حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    const handleUpload = async (info) => {
        if (info.file.status === 'uploading') {
            return;
        }
        if (info.file.status === 'done' || info.file.status === 'error') {
            // المحاكاة في حال لم يكن هناك API حقيقي للرفع أو استخدامه
            // لكن هنا سنستخدم api/upload/image إذا كان متاحاً
            const formData = new FormData();
            formData.append('image', info.file.originFileObj);

            try {
                const response = await api.post('/upload/image', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                if (response.data.success) {
                    setLogoUrl(response.data.url);
                    message.success('تم رفع الشعار بنجاح');
                }
            } catch (error) {
                message.error('خطأ في رفع الصورة');
            }
        }
    };

    return (
        <Card loading={loading}>
            <Title level={2}>إعدادات النظام</Title>
            <Text type="secondary">إدارة بيانات دار البرهان لتعليم القرآن الكريم التي تظهر في الواجهة والتقارير.</Text>
            <Divider />

            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ dar_name: '' }}
            >
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        <Title level={4}><InfoCircleOutlined /> البيانات الأساسية</Title>
                        <Row gutter={16}>
                            <Col span={24}>
                                <Form.Item
                                    name="dar_name"
                                    label="اسم الدار"
                                    rules={[{ required: true, message: 'يرجى إدخال اسم الدار' }]}
                                >
                                    <Input placeholder="مثال: دار البرهان لتعليم القرآن الكريم" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="dar_phone" label="رقم الهاتف">
                                    <Input placeholder="مثال: 777000000" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} sm={12}>
                                <Form.Item name="dar_address" label="العنوان">
                                    <Input placeholder="مثال: مأرب - حي الروضة" />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Divider />
                        <Title level={4}>الرؤية والرسالة</Title>
                        <Form.Item name="dar_vision" label="رؤية الدار">
                            <Input.TextArea rows={2} placeholder="تطلعات الدار المستقبلية..." />
                        </Form.Item>
                        <Form.Item name="dar_message" label="رسالة الدار">
                            <Input.TextArea rows={2} placeholder="الأهداف والقيم التي تسعى لتحقيقها..." />
                        </Form.Item>

                        <Divider />
                        <Title level={4}>إعدادات التقارير</Title>
                        <Form.Item
                            name="report_header_text"
                            label="نص ترويسة التقارير"
                            help="هذا النص سيظهر في أعلى كافة التقارير المستخرجة من النظام."
                        >
                            <Input.TextArea rows={3} placeholder="اكتب النص الذي تريده أن يظهر في أعلى التقارير..." />
                        </Form.Item>
                    </Col>

                    <Col xs={24} md={8}>
                        <Card title="شعار الدار (Logo)" style={{ textAlign: 'center' }}>
                            <div style={{ marginBottom: 16 }}>
                                {logoUrl ? (
                                    <img
                                        src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${logoUrl}`}
                                        alt="Logo"
                                        style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: 150, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Text type="secondary">لا يوجد شعار</Text>
                                    </div>
                                )}
                            </div>
                            <Upload
                                name="image"
                                showUploadList={false}
                                onChange={handleUpload}
                                customRequest={({ file, onSuccess }) => setTimeout(() => onSuccess("ok"), 0)}
                            >
                                <Button icon={<UploadOutlined />}>تغيير الشعار</Button>
                            </Upload>
                        </Card>
                    </Col>
                </Row>

                <Divider />
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        htmlType="submit"
                        loading={saving}
                        size="large"
                    >
                        حفظ كافة الإعدادات
                    </Button>
                </Space>
            </Form>
        </Card>
    );
};

export default Settings;
