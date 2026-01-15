import React, { useState } from 'react';
import { Layout, Menu, Drawer, Grid, Button } from 'antd';
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
    MenuOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import './MainLayout.css';

const { Header, Sider, Content } = Layout;
const { useBreakpoint } = Grid;

const MainLayout = ({ children }) => {
    const screens = useBreakpoint();
    const isMobile = !screens.md;
    const [collapsed, setCollapsed] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
        {
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
            label: 'الحضور',
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
    ];

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
                        {!collapsed ? '🕌 دار البرهان' : '🕌'}
                    </div>
                    {menu}
                </Sider>
            )}

            <Drawer
                title="🕌 دار البرهان"
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

            <Layout>
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
                        <h2>{isMobile ? 'دار البرهان' : 'نظام إدارة دار البرهان'}</h2>
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
            </Layout>
        </Layout>
    );
};

export default MainLayout;
