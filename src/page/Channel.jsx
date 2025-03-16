import {  useState, useEffect } from 'react';
import { Button, Input, Space, Table, message, Modal } from 'antd';

import axios from 'axios';

const API_URL = "https://testpost.uz/chanel_groups/";

const Channel = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newChannel, setNewChannel] = useState({ group_name: '', group_id: '', group_url: '' });
  

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data.map((item) => ({ key: item.id, ...item })));
    } catch (error) {
      message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setNewChannel({ group_name: '', group_id: '', group_url: '' });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (isAdding) {
      try {
        const response = await axios.post(API_URL, newChannel);
        setData([...data, response.data]);
        message.success("Yangi kanal qo‘shildi!");
      } catch (error) {
        message.error("Yangi kanal qo‘shishda xatolik yuz berdi");
      }
    } else {
      try {
        await axios.put(`${API_URL}${editingRecord.id}/`, editingRecord);
        setData((prevData) =>
          prevData.map((item) => (item.id === editingRecord.id ? editingRecord : item))
        );
        message.success("Tahrirlangan kanal saqlandi!");
      } catch (error) {
        message.error("Kanalni tahrirlashda xatolik yuz berdi");
      }
    }
    setIsModalOpen(false);
    setEditingRecord(null);
    setIsAdding(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}${id}/`);
      setData(data.filter((item) => item.id !== id));
      message.success("Kanal o‘chirildi!");
    } catch (error) {
      message.error("Kanalni o‘chirishda xatolik yuz berdi");
    }
  };

  const handleInputChange = (e, field, isNew = false) => {
    if (isNew) {
      setNewChannel((prev) => ({ ...prev, [field]: e.target.value }));
    } else {
      setEditingRecord((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const columns = [
    {
      title: 'Kanal nomi',
      dataIndex: 'group_name',
      key: 'group_name',
    },
    {
      title: 'Group ID',
      dataIndex: 'group_id',
      key: 'group_id',
    },
    {
      title: 'Kanal havolasi',
      dataIndex: 'group_url',
      key: 'group_url',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => handleEdit(record)}>✏️ Tahrirlash</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>🗑️ O‘chirish</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="header-menu">
        <p>Kanal yoki guruh qo‘shish</p>
        <Button type="primary" onClick={handleAddNew}>Qo‘shish</Button>
      </div>
      <Table columns={columns} dataSource={data} rowKey="id" />
      <Modal
        title={isAdding ? "Yangi kanal qo‘shish" : "Kanalni tahrirlash"}
        open={isModalOpen}
        onCancel={handleCancel}
        onOk={handleSave}
        okText={isAdding ? "Qo‘shish" : "Saqlash"}
        cancelText="Bekor qilish"
      >
        <Input
          placeholder="Kanal nomi"
          value={isAdding ? newChannel.group_name : editingRecord?.group_name || ''}
          onChange={(e) => handleInputChange(e, 'group_name', isAdding)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Group ID"
          value={isAdding ? newChannel.group_id : editingRecord?.group_id || ''}
          onChange={(e) => handleInputChange(e, 'group_id', isAdding)}
          style={{ marginBottom: 10 }}
        />
        <Input
          placeholder="Kanal havolasi"
          value={isAdding ? newChannel.group_url : editingRecord?.group_url || ''}
          onChange={(e) => handleInputChange(e, 'group_url', isAdding)}
        />
      </Modal>
    </div>
  );
};

export default Channel;
