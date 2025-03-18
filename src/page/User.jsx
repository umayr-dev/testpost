import { useState, useEffect } from 'react';
import {  DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Input,  Table, message, Modal, Form } from 'antd';
import axios from 'axios';

const API_URL = "https://testpost.uz/users/";

const User = () => {
  const [data, setData] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form] = Form.useForm();
  // const searchInput = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data.map((user) => ({ key: user.id, username: user.username, status: user.status })));
    } catch (error) {
      console.error("Foydalanuvchi yuklashda xatolik:", error);
    message.warning("Foydalanuvchi yuklashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.")
    }
  };

  const handleDeleteUser = async () => {
    try {
      await axios.delete(`${API_URL}${deleteUserId}/`);
      message.success("Foydalanuvchi o‘chirildi");
      fetchData();
    } catch (error) {
      console.error("Foydalanuvchi ochirishda xatolik:", error);
    message.warning("Foydalanuvchi ochirishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.")
    }
    setIsDeleteModalOpen(false);
  };

  const showDeleteConfirm = (userId) => {
    setDeleteUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const handleAddUser = async (values) => {
    try {
      await axios.post(API_URL, values);
      message.success("Yangi admin qo‘shildi");
      fetchData();
      setIsAddModalOpen(false);
      form.resetFields();
    } catch (error) {
      console.error("Admin qo‘shishda xatolik:", error);
    message.warning("Admin qo‘shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.")
    }
  };

  const columns = [
    {
      title: 'User Name',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.key)} />
      ),
    },
  ];

  return (
    <div>
      <div className='header-user'>
        <p>Foydalanuvchi qo`shish</p>
      {/* <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsAddModalOpen(true); }} style={{ marginBottom: 16 }}>
        Admin qo‘shish
      </Button> */}
      </div>
      <Table columns={columns} dataSource={data} rowKey="key" />
      
      <Modal
        title="Foydalanuvchini o‘chirish"
        open={isDeleteModalOpen}
        onOk={handleDeleteUser}
        onCancel={() => setIsDeleteModalOpen(false)}
        okText="Ha, o‘chirish"
        cancelText="Bekor qilish"
      >
        <p>Haqiqatan ham bu foydalanuvchini o‘chirmoqchimisiz?</p>
      </Modal>
      
      <Modal
        title="Yangi admin qo‘shish"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddUser}>
          <Form.Item name="username" label="Login" rules={[{ required: true, message: 'Loginni kiriting' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Parol" rules={[{ required: true, message: 'Parolni kiriting' }]}> 
            <Input.Password />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Qo‘shish</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default User;
