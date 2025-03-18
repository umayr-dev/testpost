import { useState, useEffect } from 'react';
import { DeleteOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Input, Space, Table, message, Modal, Form, Select, Upload } from 'antd';
import axios from 'axios';

const API_URL = "https://testpost.uz/bot_messages/";
const SEND_MESSAGE_URL = "https://testpost.uz/send-message/";

const Tests = () => {
  const [data, setData] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [image, setImage] = useState(null); // Yuklangan rasm
  const [editImage, setEditImage] = useState(null); // Tahrirlash uchun rasm
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(API_URL);
      setData(response.data.map((item) => ({
        key: item.id,
        testName: item.command,
        text: item.text,
        photo: item.photo, // Rasmni qo'shish
      })));
    } catch (error) {
      console.error("Ma'lumotlarni yuklashda xatolik:", error);
      message.warning("Ma'lumotlarni yuklashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await axios.get('https://testpost.uz/chanel_groups/');
      setGroups(response.data.map((group) => ({ id: group.id, name: group.group_name })));
    } catch (error) {
      console.error("Guruhlarni yuklashda xatolik:", error);
      message.warning("Guruhlarni yuklashda muammo bo‘ldi.");
    }
  };

  const handleDeleteTest = async (key) => {
    try {
      await axios.delete(`${API_URL}${key}/`);
      message.success("Test o‘chirildi");
      fetchData();
    } catch (error) {
      console.error("Testni o‘chirishda xatolik:", error);
      message.warning("Testni o‘chirishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleImageUpload = (file) => {
    setImage(file); // Yuklangan rasmni holatda saqlash
    return false; // Ant Design `Upload` komponenti avtomatik yuklashni to'xtatadi
  };

  const handleEditImageUpload = (file) => {
    setEditImage(file); // Tahrirlash uchun yangi rasmni holatda saqlash
    return false; // Ant Design `Upload` komponenti avtomatik yuklashni to'xtatadi
  };

  const handleAddTest = async (values) => {
    const formData = new FormData();
    formData.append('command', values.testName);
    formData.append('text', values.text);
    if (image) {
      formData.append('photo', image); // Rasmni qo'shish
    }

    try {
      await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success("Yangi test qo‘shildi!");
      setIsModalOpen(false);
      setImage(null); // Rasmni tozalash
      fetchData();
    } catch (error) {
      console.error("Testni qo'shishda xatolik:", error);
      message.warning("Testni qo'shishda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleEditTest = (record) => {
    setEditRecord(record);
    editForm.setFieldsValue({
      testName: record.testName,
      text: record.text,
    });
    setEditImage(record.photo || null); // Mavjud rasmni holatda saqlash
    setIsEditModalOpen(true);
  };

  const handleUpdateTest = async (values) => {
    if (!editRecord) return;

    const formData = new FormData();
    formData.append('command', values.testName);
    formData.append('text', values.text);
    if (editImage && editImage instanceof File) {
      formData.append('photo', editImage); // Yangi rasmni qo'shish
    }

    try {
      await axios.put(`${API_URL}${editRecord.key}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success("Test yangilandi");
      setIsEditModalOpen(false);
      setEditImage(null); // Rasmni tozalash
      fetchData(); // Ma'lumotlarni qayta yuklash
    } catch (error) {
      console.error("Testni yangilashda xatolik:", error);
      message.warning("Testni yangilashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const handleSelectTest = (record, checked) => {
    if (checked) {
      setSelectedTests([...selectedTests, record.key]);
    } else {
      setSelectedTests(selectedTests.filter((id) => id !== record.key));
    }
  };

  const handleSelectAllTests = (checked) => {
    if (checked) {
      setSelectedTests(data.map((item) => item.key)); // Barcha testlarni tanlash
    } else {
      setSelectedTests([]); // Tanlashni bekor qilish
    }
  };

  const handleSubmit = async () => {
    if (selectedTests.length === 0) {
      message.warning("Hech qanday test tanlanmagan!");
      return;
    }
    if (selectedGroups.length === 0) {
      message.warning("Hech qanday guruh tanlanmagan!");
      return;
    }

    const payload = {
      testIds: selectedTests,
      channels: selectedGroups,
    };

    console.log("Yuborilayotgan ma'lumotlar:", payload);

    try {
      await axios.post(SEND_MESSAGE_URL, payload);
      message.success("Ma'lumotlar muvaffaqiyatli yuborildi!");
      setSelectedTests([]);
      setSelectedGroups([]);
    } catch (error) {
      console.error("Ma'lumotlarni yuborishda xatolik:", error);
      message.error("Ma'lumotlarni yuborishda muammo bo‘ldi.");
    }
  };

  const columns = [
    {
      title: (
        <input
          type="checkbox"
          checked={selectedTests.length === data.length && data.length > 0}
          onChange={(e) => handleSelectAllTests(e.target.checked)}
        />
      ),
      key: 'select',
      render: (_, record) => (
        <input
          type="checkbox"
          checked={selectedTests.includes(record.key)}
          onChange={(e) => handleSelectTest(record, e.target.checked)}
        />
      ),
    },
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
      <Table columns={columns} dataSource={data} rowKey="key" />

      {/* Footer */}
      {selectedTests.length > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#fff',
            padding: '16px 24px',
            boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
            {selectedTests.length} ta test tanlandi
          </span>
          <Select
            mode="multiple"
            placeholder="Guruhlarni tanlang"
            style={{ width: '50%', minWidth: '200px' }}
            value={selectedGroups}
            onChange={(value) => setSelectedGroups(value)}
          >
            {groups.map((group) => (
              <Select.Option key={group.id} value={group.id}>
                {group.name}
              </Select.Option>
            ))}
          </Select>
          <Button type="primary" onClick={handleSubmit}>
            Yuborish
          </Button>
        </div>
      )}

      {/* Modal for adding a new test */}
      <Modal title="Test qo‘shish" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} onFinish={handleAddTest}>
          <Form.Item name="testName" label="Test nomi" rules={[{ required: true, message: 'Test nomini kiriting!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="text" label="Savol" rules={[{ required: true, message: 'Savol kiriting!' }]}>
            <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 4, maxRows: 4 }} />
          </Form.Item>
          <Form.Item label="Rasm yuklash">
            <Upload
              beforeUpload={handleImageUpload}
              maxCount={1}
              accept="image/*"
              listType="picture"
            >
              <Button>Rasm tanlang</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Saqlash</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for editing a test */}
      <Modal title="Testni tahrirlash" open={isEditModalOpen} onCancel={() => setIsEditModalOpen(false)} footer={null}>
        <Form form={editForm} onFinish={handleUpdateTest}>
          <Form.Item name="testName" label="Test nomi" rules={[{ required: true, message: 'Test nomini kiriting!' }]}>
            <Input maxLength={200} />
          </Form.Item>
          <Form.Item name="text" label="Savol" rules={[{ required: true, message: 'Textni kiriting!' }]}>
            <Input.TextArea maxLength={200} showCount autoSize={{ minRows: 4, maxRows: 4 }} />
          </Form.Item>
          <Form.Item label="Rasmni tahrirlash">
            <Upload
              beforeUpload={handleEditImageUpload}
              maxCount={1}
              accept="image/*"
              listType="picture"
              defaultFileList={
                editImage
                  ? [
                      {
                        uid: '-1',
                        name: 'Mavjud rasm',
                        status: 'done',
                        url: typeof editImage === 'string' ? editImage : URL.createObjectURL(editImage),
                      },
                    ]
                  : []
              }
            >
              <Button>Rasmni tanlang</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Yangilash</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tests;