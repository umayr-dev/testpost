import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import Login from "../page/Login";
import Channel from "../page/Channel";
import Tests from "../page/Tests";
import ProtectedRoute from "../page/ProtectedRoute"; // 🔥 Import qilish

import {
    DesktopOutlined,
    LogoutOutlined,
    PieChartOutlined,
    UsergroupAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu, theme } from 'antd';
import { useState } from 'react';
import User from "../page/User";

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
        getItem('Kanal va Guruh', '1', <PieChartOutlined />, () => navigate('/channel')),
        getItem('Testlar', '2', <DesktopOutlined />, () => navigate('/tests')),
        getItem('User', '3', <UsergroupAddOutlined />,() =>navigate('/user')),
        getItem('Chiqish', '4', <LogoutOutlined />, () => {
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
                <Header style={{ padding: 20, display: "flex", alignItems: "center", background: colorBgContainer }}>
                    <div>
                        <h1 ><UserOutlined /><span className="logo">Welcome Admin</span></h1>
                    </div>
                </Header>
                <Content style={{ margin: '0 16px' }}>
                    <div style={{ padding: 24, marginTop: 50, minHeight: 560, background: colorBgContainer, borderRadius: borderRadiusLG }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            
                            {/* 🔐 HIMOYALI ROUTE */}
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
                             <Route
                                path="/user"
                                element={
                                    <ProtectedRoute>
                                        <User />
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
