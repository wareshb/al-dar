import React, { useState, useEffect } from 'react';
import { Layout, Menu, Drawer, Grid, Button, Avatar } from 'antd';
import {
    DashboardOutlined,
    TeamOutlined,
    UserOutlined,
    BookOutlined,
    CheckSquareOutlined,
    ReadOutlined,
    WarningOutlined,
    FileTextOutlined,
    LogoutOutlined,
    MenuOutlined,
    SettingOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { getSettings } from '../../services/settingsService';
import './MainLayout.css';

const { Header, Sider, Content, Footer } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = ({ children }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [settings, setSettings] = useState(null);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const result = await getSettings();
            if (result.success) {
                setSettings(result.data);
            }
        } catch (error) {
            console.error('Error loading settings in layout:', error);
        }
    };

    const getFullUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const baseUrl = import.meta.env?.VITE_API_URL || 'http://localhost:5000';
        return `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const menuItems = [
        {
            key: '/',
            icon: <DashboardOutlined />,
            label: 'لوحة التحكم',
        },
        user.role === 'admin' && {
            key: '/teachers',
            icon: <TeamOutlined />,
            label: 'الموظفين والمعلمون',
        },
        {
            key: '/students',
            icon: <UserOutlined />,
            label: 'الطلاب',
        },
        {
            key: '/halaqat',
            icon: <BookOutlined />,
            label: 'الحلقات',
        },
        {
            key: '/attendance',
            icon: <CheckSquareOutlined />,
            label: 'حضور الطلاب',
        },
        user.role === 'admin' && {
            key: '/staff-attendance',
            icon: <TeamOutlined />,
            label: 'حضور المعلمين',
        },
        {
            key: '/memorization',
            icon: <ReadOutlined />,
            label: 'الحفظ',
        },
        {
            key: '/violations',
            icon: <WarningOutlined />,
            label: 'المخالفات',
        },
        {
            key: '/reports',
            icon: <FileTextOutlined />,
            label: 'التقارير',
        },
        user.role === 'admin' && {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'إعدادات النظام',
        }
    ].filter(Boolean);

    const menu = (
        <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            onClick={({ key }) => {
                navigate(key);
                if (isMobile) setDrawerVisible(false);
            }}
            items={menuItems}
        />
    );

    return (
        <Layout style={{ minHeight: '100vh', direction: 'rtl' }}>
            {!isMobile && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    theme="dark"
                    width={250}
                    className="desktop-sider"
                >
                    <div className="logo">
                        {settings?.dar_logo ? (
                            <Avatar
                                src={getFullUrl(settings.dar_logo)}
                                size={collapsed ? 32 : 48}
                                style={{ marginLeft: collapsed ? 0 : 8 }}
                            />
                        ) : (
                            '🕌 '
                        )}
                        {!collapsed && (settings?.dar_name || 'دار البرهان')}
                    </div>
                    {menu}
                </Sider>
            )}

            <Drawer
                title={
                    <div style={{ color: '#fff', display: 'flex', alignItems: 'center' }}>
                        {settings?.dar_logo ? (
                            <Avatar src={getFullUrl(settings.dar_logo)} size={32} style={{ marginLeft: 8 }} />
                        ) : '🕌 '}
                        {settings?.dar_name || 'دار البرهان'}
                    </div>
                }
                placement="right"
                onClose={() => setDrawerVisible(false)}
                open={drawerVisible}
                styles={{ body: { padding: 0, background: '#001529' }, header: { background: '#001529', borderBottom: '1px solid #1f1f1f' } }}
                headerStyle={{ color: '#fff' }}
                width={250}
                closable={false}
            >
                {menu}
            </Drawer>

            <Layout style={{
                marginRight: isMobile ? 0 : (collapsed ? 80 : 250),
                transition: 'all 0.2s',
                minHeight: '100vh'
            }}>
                <Header className="site-header">
                    <div className="header-content">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                onClick={() => setDrawerVisible(true)}
                                style={{ fontSize: '18px', marginRight: -12 }}
                            />
                        )}
                        <h2 style={{ display: 'flex', alignItems: 'center', margin: 0 }}>
                            {settings?.dar_logo && (
                                <Avatar
                                    src={getFullUrl(settings.dar_logo)}
                                    size={80}
                                    style={{ marginLeft: 12 }}
                                />
                            )}
                            {isMobile ? (settings?.dar_name || 'دار البرهان') : `نظام إدارة ${settings?.dar_name || 'دار البرهان'}`}
                        </h2>
                        <div className="user-info">
                            <span className="user-name">{user.full_name || user.username}</span>
                            <LogoutOutlined
                                onClick={handleLogout}
                                style={{ marginRight: 16, cursor: 'pointer', fontSize: 18 }}
                                title="تسجيل الخروج"
                            />
                        </div>
                    </div>
                </Header>

                <Content className="main-content">
                    {children}
                </Content>
                <Footer style={{ textAlign: 'center', background: '#f0f2f5', padding: '10px 0' }}>
                    حقوق النشر محفوظة للمبرمج بشار الوريش © {new Date().getFullYear()}
                </Footer>
            </Layout>
        </Layout>
    );
};

export default MainLayout;
