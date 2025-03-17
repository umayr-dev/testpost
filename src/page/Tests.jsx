import { useState, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, message, Modal, Form, Select } from 'antd';
import axios from 'axios';
import ButtonGridManager from '../components/ButtonGrid';

const API_URL = "https://testpost.uz/bot_messages/";
const Message_URL = "https://testpost.uz/send-message/";
const CHANNELS_API = "https://testpost.uz/chanel_groups/";

const Tests = () => {
  const [data, setData] = useState([]);
  const [channels, setChannels] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [buttonData, setButtonData] = useState([]);

  useEffect(() => {
    fetchData();
    fetchChannels();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data.map((item) => ({
        key: item.id,
        testName: item.command,
        text: item.text,
        image: item.photo,
        buttons: item.buttons, // New data for buttons
      })));
    } catch (error) {
      console.error("Malumotlarni yuklashda xatolik:", error);
      message.warning("Malumotlarni yuklashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await axios.get(CHANNELS_API);
      setChannels(response.data);
    } catch (error) {
      console.error("Kanallarni yuklashda xatolik:", error);
      message.warning("Kanallarni yuklashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleDeleteTest = async (key) => {
    try {
      await axios.delete(`${API_URL}${key}/`);
      message.success("Test o‘chirildi");
      fetchData();
    } catch (error) {
      console.error("Testni ochirishda xatolik:", error);
      message.warning("Testni ochirishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleAddTest = async (values) => {
    try {
      await axios.post(API_URL, {
        command: values.testName,
        text: values.text,
        buttons: buttonData, // Send button data as well
      });
      message.success("Yangi test qo‘shildi!");
      fetchData();
    } catch (error) {
      console.error("Testni qo'shishda xatolik:", error);
      message.warning("Testni qo'shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };
  const [editTestId, setEditTestId] = useState(null); // Tahrirlanayotgan test ID sini saqlash uchu
  const handleEditTest = (record) => {
    setEditRecord(record);
    setEditTestId(record.key);
    editForm.setFieldsValue({
      testName: record.testName,
      text: record.text,
    });
    setButtonData(record.buttons); // Set button data for editing
    setIsEditModalOpen(true);
  };

  const handleUpdateTest = async (values) => {
    if (!editRecord) return;
    try {
      await axios.put(`${API_URL}${editRecord.key}/`, {
        command: values.testName,
        text: values.text,
        buttons: buttonData, // Include button data in update request
      });
      message.success("Test yangilandi");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Testni yangilashda xatolik:", error);
      message.warning("Testni yangilashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleSendToChannels = async () => {
    if (!selectedRowKeys.length || !selectedChannels.length) {
      message.warning("Test va kanal tanlang!");
      return;
    }

    try {
      // API'ga test id'lari va kanal id'larini yuborish
      const payload = {
        testIds: selectedRowKeys,  // Tanlangan testlarning id'lari
        channels: selectedChannels  // Tanlangan kanallar
      };

      console.log("Yuborilayotgan ma'lumotlar:", payload);

      // Testlar va kanallarni yuborish
      const response = await axios.post(`${Message_URL}`, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("API javobi:", response);

      message.success("Testlar tanlangan kanallarga yuborildi");

      // Yuborishdan so'ng, tanlangan testlar va kanallarni tozalash
      setSelectedRowKeys([]);
      setSelectedChannels([]);
    } catch (error) {
      console.error("Testni yuborishda xatolik:", error);
      message.warning("Testni yuborishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const columns = [
    { title: 'Test nomi', dataIndex: 'testName', key: 'testName' },
    { title: 'Text', dataIndex: 'text', key: 'text' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEditTest(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => handleDeleteTest(record.key)} danger />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => { form.resetFields(); setIsModalOpen(true); }}>
          Test qo‘shish
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="key"
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      />

      {selectedRowKeys.length > 0 && (
        <div className="footer-menu" style={{ display: 'flex', gap: '10px', padding: '10px', background: '#f0f2f5' }}>
          <span>{selectedRowKeys.length} ta test tanlandi</span>
          <Select mode="multiple" placeholder="Kanallarni tanlang" style={{ width: 300 }} onChange={setSelectedChannels}>
            {channels.map(channel => <Select.Option key={channel.id} value={channel.id}>{channel.group_name}</Select.Option>)}
          </Select>
          <Button type="primary" onClick={handleSendToChannels }>Yuborish</Button>
        </div>
      )}

      {/* Modal for adding a new test */}
      <Modal
        className="fullscreen-modal"
        style={{ top: 0, bottom: 0 }}
        width="100vw"
        height="100vh"
        title="Test qo‘shish"
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields(); // Formani reset qilish
          fetchData(); // Sahifani yangilash
        }}
        footer={null}
      >
         <Form form={form} >
          <Form.Item name="testName" label="Test nomi" rules={[{ required: true, message: 'Test nomini kiriting!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="text" label="Savol" rules={[{ required: true, message: 'Savol kiriting!' }]}>
            <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 4, maxRows: 4 }} style={{ resize: 'none' }} />
          </Form.Item>
          <Form.Item>
            <ButtonGridManager onButtonChange={setButtonData} /> {/* ButtonGridManager qo‘shish */}
            <Button type="primary" onClick={handleAddTest}>Saqlash</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for editing a test */}
      <Modal title="Testni tahrirlash" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
        <Form form={editForm} onFinish={handleUpdateTest}>
          <Form.Item name="testName" label="Test nomi" rules={[{ required: true, message: 'Test nomini kiriting!' }]}>
            <Input maxLength={200}/>
          </Form.Item>
          <Form.Item name="text" label="Savol" rules={[{ required: true, message: 'Textni kiriting!' }]}>
            <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 4, maxRows: 4 }} style={{ resize: 'none' }} />
          </Form.Item>
          <Form.Item>
            <ButtonGridManager value={buttonData} testId={editTestId}  onButtonChange={setButtonData} /> {/* ButtonGridManager qo‘shish */}
            <Button type="primary" htmlType="submit">Yangilash</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tests;