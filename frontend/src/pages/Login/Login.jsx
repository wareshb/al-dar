import React, { useState } from 'react';
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const onFinish = async (values) => {
        setLoading(true);
        try {
            console.log('محاولة تسجيل الدخول...', values.username);
            const result = await loginApi(values.username, values.password);

            console.log('نتيجة تسجيل الدخول:', result);

            if (result.success) {
                console.log('Login successful, received user:', result.data.user);
                // حفظ البيانات في السياق العام
                login(result.data.user, result.data.token);

                message.success('تم تسجيل الدخول بنجاح');

                // التوجيه
                console.log('Navigating to dashboard...');
                navigate('/', { replace: true });
            } else {
                console.warn('Login failed based on response success property');
                message.error(result.message || 'فشل تسجيل الدخول');
            }
        } catch (error) {
            console.error('Login error detail:', {
                status: error.response?.status,
                data: error.response?.data,
                message: error.message
            });
            message.error(error.response?.data?.message || 'اسم المستخدم أو كلمة المرور غير صحيحة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card">
                <div className="login-header">
                    <h1>🕌 دار البرهان</h1>
                    <p>لتعليم القرآن الكريم</p>
                </div>

                <Form
                    name="login"
                    onFinish={onFinish}
                    autoComplete="off"
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'يرجى إدخال اسم المستخدم' }]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="اسم المستخدم"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'يرجى إدخال كلمة المرور' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="كلمة المرور"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                        >
                            تسجيل الدخول
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
