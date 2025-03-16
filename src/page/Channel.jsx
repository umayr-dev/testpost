import { useState, useEffect } from 'react';
import { Button, Input, Space, Table, message, Modal, Radio } from 'antd';
import axios from 'axios';

const API_URL = "https://testpost.uz/chanel_groups/";

const Channel = () => {
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newChannel, setNewChannel] = useState({
    group_name: '',
    group_url: '',
    channel_type: 'id', // default 'id' selected
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data.map((item) => ({ key: item.id, ...item })));
    } catch (error) {
      console.error("kanal qo‘shishda xatolik:", error);
      message.warning("kanal qo‘shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    setIsAdding(false);
  };

  const handleAddNew = () => {
    setNewChannel({ group_name: '', group_url: '', channel_type: 'id' });
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    setIsAdding(false);
  };

  const handleSave = async () => {
    if (!newChannel.group_name) {
      message.warning("Kanal nomini kiriting!");
      return;
    }

    if (isAdding) {
      try {
        const response = await axios.post(API_URL, newChannel);
        setData([...data, response.data]);
        message.success("Yangi kanal qo‘shildi!");
      } catch (error) {
        console.error("kanal qo‘shishda xatolik:", error);
        message.warning("kanal qo‘shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
      }
    } else {
      try {
        await axios.put(`${API_URL}${editingRecord.id}/`, editingRecord);
        setData((prevData) =>
          prevData.map((item) => (item.id === editingRecord.id ? editingRecord : item))
        );
        message.success("Tahrirlangan kanal saqlandi!");
      } catch (error) {
        console.error("kanal qo‘shishda xatolik:", error);
        message.warning("kanal qo‘shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
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
      console.error("kanal qo‘shishda xatolik:", error);
      message.warning("kanal qo‘shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleInputChange = (e, field, isNew = false) => {
    if (isNew) {
      setNewChannel((prev) => ({ ...prev, [field]: e.target.value }));
    } else {
      setEditingRecord((prev) => ({ ...prev, [field]: e.target.value }));
    }
  };

  const handleRadioChange = (e) => {
    setNewChannel((prev) => ({ ...prev, channel_type: e.target.value }));
  };

  const columns = [
    {
      title: 'Kanal nomi',
      dataIndex: 'group_name',
      key: 'group_name',
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

  // Dynamic placeholder based on radio button selection
  const placeholderText = newChannel.channel_type === 'id' ? 'kanal yoki guruh ID sini yozing' : 'kanal yoki guruh username ni yozing';

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
          placeholder={placeholderText} // Dynamic placeholder
          value={isAdding ? newChannel.group_url : editingRecord?.group_url || ''}
          onChange={(e) => handleInputChange(e, 'group_url', isAdding)}
          style={{ marginBottom: 10 }}
        />
        <Radio.Group
          value={newChannel.channel_type}
          onChange={handleRadioChange}
          style={{ marginBottom: 10 }}
        >
          <Radio value="id">ID</Radio>
          <Radio value="username">Username</Radio>
        </Radio.Group>
      </Modal>
    </div>
  );
};

export default Channel;
