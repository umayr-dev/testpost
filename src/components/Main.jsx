import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "../page/Login";
import Channel from "../page/Channel";
import Tests from "../page/Tests";
import Dashboard from "../page/Dashboard";
import ProtectedRoute from "../page/ProtectedRoute"; // 🔥 Import qilish

import {
    AreaChartOutlined,
    DesktopOutlined,
    LogoutOutlined,
    PieChartOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { useState } from 'react';

const { Header, Content, Footer, Sider } = Layout;

function getItem(label, key, icon, onClick, children) {
    return {
        key,
        icon,
        children,
        label,
        onClick,
    };
}

const Main = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const items = [
        getItem('Dashboard', '7', <AreaChartOutlined />, () => navigate('/dashboard')),
        getItem('Kanal va Guruh', '1', <PieChartOutlined />, () => navigate('/channel')),
        getItem('Testlar', '2', <DesktopOutlined />, () => navigate('/tests')),
        getItem('User', 'sub1', <UserOutlined />, null, [
        ]),
        getItem('Chiqish', '10', <LogoutOutlined />, () => {
            localStorage.removeItem('token'); // 🔥 Tokenni o‘chirish (logout)
            navigate('/login'); // Login sahifasiga yo‘naltirish
        }),
    ];

    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
                <div className="demo-logo-vertical" />
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" items={items} />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }}>
                        <Breadcrumb.Item>User</Breadcrumb.Item>
                        <Breadcrumb.Item>Bill</Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{ padding: 24, minHeight: 360, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            
                            {/* 🔐 HIMOYALI ROUTE */}
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/channel"
                                element={
                                    <ProtectedRoute>
                                        <Channel />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/tests"
                                element={
                                    <ProtectedRoute>
                                        <Tests />
                                    </ProtectedRoute>
                                }
                            />
                            
                            {/* ❌ Noto‘g‘ri sahifa bo‘lsa, login sahifasiga yo‘naltirish */}
                            <Route path="*" element={<Navigate to="/login" replace />} />
                        </Routes>
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};

export default Main;
