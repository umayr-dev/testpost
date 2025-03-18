import { useState, useEffect } from 'react';
import { Space, Table, Button, Modal, Form, Input, message, Select, Switch } from 'antd';
import axios from 'axios';

const { Column } = Table;

const AddButton = () => {
  const [data, setData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditButtonModalOpen, setIsEditButtonModalOpen] = useState(false);
  const [rows, setRows] = useState([{ id: Date.now().toString(), buttons: [] }]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingButton, setEditingButton] = useState(null); // Tahrirlanayotgan tugma
  const MAX_BUTTONS = 30;
  const MAX_BUTTONS_PER_ROW = 10;
  const MAX_ROWS = 10;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get('https://testpost.uz/botmessages/');
        setQuestions(response.data.map((item) => ({ id: item.id, name: item.command })));
      } catch (error) {
        console.error("Savollarni yuklashda xatolik:", error);
        message.error("Savollarni yuklashda muammo bo‘ldi.");
      }
    };

    fetchQuestions();
  }, []);

  const resetModal = () => {
    setRows([{ id: Date.now().toString(), buttons: [] }]); // Qatorlarni tozalash
    setSelectedQuestion(null); // Tanlangan savolni tozalash
  };

  const handleAdd = async () => {
    if (!selectedQuestion) {
      message.error('Savolni tanlang!');
      return;
    }
  
    const totalButtons = rows.reduce((acc, row) => acc + row.buttons.length, 0);
    if (totalButtons === 0) {
      message.error('Hech qanday tugma qo‘shilmagan!');
      return;
    }
  
    // API'ga yuboriladigan ma'lumotlarni tayyorlash
    const buttons = rows.flatMap((row) =>
      row.buttons.map((button) => ({
        text: button.label, // Tugma nomi
        callback_data: button.callbackData || 'None', // Callback ma'lumot
      }))
    );
  
    const payload = {
      id: selectedQuestion, // Tanlangan savol ID'si
      command: questions.find((q) => q.id === selectedQuestion)?.name || '', // Savol matni
      text: questions.find((q) => q.id === selectedQuestion)?.name || '', // Savol matni
      photo: null, // Test rasmi (agar kerak bo'lsa, bu yerda rasmni boshqarishingiz mumkin)
      buttons, // Tugmalar
    };
  
    console.log('POST yuborilayotgan ma\'lumotlar:', payload);
  
    try {
      // API'ga yuborish
      await axios.post('https://testpost.uz/botmessages/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      message.success('Ma\'lumotlar muvaffaqiyatli yuborildi!');
      setData([...data, payload]); // Yangi ma'lumotlarni mahalliy holatga qo'shish
      setIsAddModalOpen(false); // Modalni yopish
      resetModal(); // Modalni tozalash
    } catch (error) {
      console.error('Ma\'lumotlarni yuborishda xatolik:', error.response?.data || error.message);
      message.error('Ma\'lumotlarni yuborishda muammo bo‘ldi.');
    }
  };
  

  const addRow = () => {
    if (rows.length >= MAX_ROWS) {
      message.warning('Maksimal qatorlar soniga yetdingiz!');
      return;
    }
    setRows((prevRows) => [
      ...prevRows,
      { id: Date.now().toString(), buttons: [], row: prevRows.length }, // Qatorning `row` qiymati indeksga teng
    ]);
  };

  const addButton = (rowId) => {
    const totalButtons = rows.reduce((acc, row) => acc + row.buttons.length, 0);
    if (totalButtons >= MAX_BUTTONS) {
      message.warning('Maksimal tugmalar soniga yetdingiz!');
      return;
    }
  
    setRows(
      rows.map((row) => {
        if (row.id === rowId && row.buttons.length < MAX_BUTTONS_PER_ROW) {
          const newButton = {
            id: Date.now().toString(), // Yangi tugma uchun vaqtga asoslangan ID
            label: `Tugma ${row.buttons.length + 1}`,
            callbackData: '',
            row: row.row, // Tugmaning `row` qiymati qatorning `row` qiymatiga teng
            position: row.buttons.length, // Tugmaning pozitsiyasi
            is_correct: false,
            is_comment: false,
            static: false,
            message: selectedQuestion,
          };
  
          return {
            ...row,
            buttons: [...row.buttons, newButton],
          };
        }
        return row;
      })
    );
  };
  

  const removeLastButton = (rowId) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId && row.buttons.length > 0) {
          return {
            ...row,
            buttons: row.buttons.slice(0, -1), // Oxirgi tugmani o'chirish
          };
        }
        return row;
      })
    );
  };

  const handleEditButton = (rowId, button) => {
    setEditingButton({ rowId, ...button });
    setIsEditButtonModalOpen(true);
  };

  const saveEditedButton = async (values) => {
    const isStatic = editingButton?.static || false;

    const updatedButton = {
      text: values.label,
      text_response: values.callbackData || (isStatic
        ? `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
        : `{count_people} человек выбрали этот ответ ({percent}%)`),
      callback_data: values.callbackData || 'None',
      row: editingButton.row,
      position: editingButton.position,
      is_correct: editingButton.is_correct || false,
      is_comment: editingButton.is_comment || false,
      static: isStatic,
      message: selectedQuestion,
    };
  
    console.log('PUT yuborilayotgan ma\'lumotlar:', updatedButton);
  
    try {
      await axios.post('https://testpost.uz/inline_buttons/', updatedButton, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setRows(
        rows.map((row) => {
          if (row.id === editingButton.rowId) {
            return {
              ...row,
              buttons: row.buttons.map((button) => {
                if (button.id === editingButton.id) {
                  return { ...button, ...updatedButton }; // Tugmani yangilash
                }
                return button; // Boshqa tugmalar o'z holatida qoladi
              }),
            };
          }
          return row; // Boshqa qatorlar o'z holatida qoladi
        })
      );
      setIsEditButtonModalOpen(false);
      setEditingButton(null);
      message.success('Tugma muvaffaqiyatli tahrirlandi!');
    } catch (error) {
      console.error('Tugmani tahrirlashda xatolik:', error.response?.data || error.message);
      message.error('Tugmani tahrirlashda muammo bo‘ldi.');
    }
  };
  

  const deleteRow = (rowId) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const handleEdit = (record) => {
    setSelectedQuestion(record.questionId);
    setRows([
      {
        id: record.id,
        buttons: record.buttons.map((button) => ({
          ...button,
        })),
      },
    ]);
    setIsAddModalOpen(true);
  };

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setIsAddModalOpen(true)}
      >
        Tugma qo‘shish
      </Button>
      <Table dataSource={data} rowKey="id">
        <Column
          title="Savol Nomi"
          dataIndex="questionId"
          key="questionId"
          render={(questionId) =>
            questions.find((q) => q.id === questionId)?.name || 'Noma’lum'
          }
        />
        <Column
          title="Tugmalar soni"
          dataIndex="buttons"
          key="buttons"
          render={(buttons) => buttons?.length || 0}
        />
        <Column
          title="Action"
          key="action"
          render={(_, record) => (
            <Space size="middle">
              <Button
                type="link"
                onClick={() => handleEdit(record)}
              >
                Edit
              </Button>
              <Button
                type="link"
                danger
                onClick={() => {
                  setData(data.filter((item) => item.id !== record.id));
                  message.success('Tugma muvaffaqiyatli o‘chirildi!');
                }}
              >
                Delete
              </Button>
            </Space>
          )}
        />
      </Table>

      {/* Add Modal */}
      <Modal
        title="Tugma qo‘shish"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          resetModal(); // Modalni tozalash
        }}
        footer={null}
      >
        <Form onFinish={handleAdd}>
          <Form.Item
            label="Savolni tanlang"
            rules={[{ required: true, message: 'Savolni tanlang!' }]}
          >
            <Select
              placeholder="Savolni tanlang"
              value={selectedQuestion}
              onChange={(value) => setSelectedQuestion(value)}
            >
              {questions.map((question) => (
                <Select.Option key={question.id} value={question.id}>
                  {question.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Tugmalarni qo'shish */}
          <div>
            {rows.map((row) => (
              <div key={row.id} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  {row.buttons.map((button) => (
                    <Button
                      key={button.id}
                      onClick={() => handleEditButton(row.id, button)}
                    >
                      {button.label}
                    </Button>
                  ))}
                  {row.buttons.length < MAX_BUTTONS_PER_ROW && (
                    <Button onClick={() => addButton(row.id)}>+</Button>
                  )}
                  {row.buttons.length > 0 && (
                    <Button onClick={() => removeLastButton(row.id)}>-</Button> 
                  )}
                </div>
                <Button
                  type="link"
                  danger
                  onClick={() => deleteRow(row.id)}
                  style={{ marginTop: 8 }}
                >
                  Qatorni o‘chirish
                </Button>
              </div>
            ))}
            {rows.length < MAX_ROWS && (
              <Button onClick={addRow} style={{ marginTop: 16 }}>
                Qator qo‘shish
              </Button>
            )}
          </div>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginTop: 16 }}>
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Button Modal */}
      <Modal
        title="Tugmani qo'shish"
        open={isEditButtonModalOpen}
        onCancel={() => setIsEditButtonModalOpen(false)}
        footer={null}
      >
        <Form
          initialValues={editingButton}
          onFinish={saveEditedButton}
        >
          <Form.Item
            name="label"
            label="Tugma nomi"
            rules={[{ required: true, message: 'Tugma nomini kiriting!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Javob to'g'ri">
            {rows.some((row) =>
              row.buttons.some((button) => button.is_correct && button.id !== editingButton?.id)
            ) && !editingButton?.is_correct ? (
              <span>Faqat bitta tugma "Javob to'g'ri" bo'lishi mumkin</span>
            ) : (
              <Switch
                checked={editingButton?.is_correct}
                onChange={(checked) => {
                  setEditingButton((prev) => ({
                    ...prev,
                    is_correct: checked,
                    is_static: checked ? false : prev.is_static, // Agar is_correct true bo'lsa, is_static false bo'ladi
                  }));
                }}
              />
            )}
          </Form.Item>

          <Form.Item label="Statistik">
            <Switch
              checked={editingButton?.static}
              onChange={(checked) => {
                setEditingButton((prev) => ({
                  ...prev,
                  static: checked,
                  is_comment: checked ? false : prev.is_comment, // Agar is_static true bo'lsa, is_comment false bo'ladi
                  is_correct: checked ? false : prev.is_correct, // Agar is_static true bo'lsa, is_correct false bo'ladi
                  callbackData: checked
                    ? `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
                    : '', // Agar static bo'lsa, avtomatik qiymat o'rnatiladi
                }));
              }}
            />
          </Form.Item>

          <Form.Item label="Izoh">
            <Switch
              checked={editingButton?.is_comment}
              onChange={(checked) => {
                setEditingButton((prev) => ({
                  ...prev,
                  is_comment: checked,
                  is_correct: checked ? false : prev.is_correct, // Agar is_comment true bo'lsa, is_correct false bo'ladi
                  static: checked ? false : prev.static, // Agar is_comment true bo'lsa, is_static false bo'ladi
                  callbackData: checked ? '' : prev.callbackData, // Agar is_comment true bo'lsa, callbackData tozalanadi
                }));
              }}
            />
          </Form.Item>

          {/* Bosilganda chiqadigan matn yoki izoh */}
          {editingButton?.is_comment ? (
            <Form.Item
              name="comment"
              label="Izoh"
              rules={[
                { required: true, message: 'Izohni kiriting!' },
                { max: 200, message: 'Izoh 200 belgidan oshmasligi kerak!' },
              ]}
            >
              <Input.TextArea
                rows={4}
                maxLength={200}
                placeholder="Izohni kiriting..."
                style={{ resize: 'none' }} // O'lchamini o'zgartirishni o'chirish
              />
            </Form.Item>
          ) : (
            <Form.Item
              name="callbackData"
              label="Bosilganda chiqadigan matn"
              rules={[{ required: false }]} // Majburiy emas
            >
              <Input
                placeholder={
                  editingButton?.static
                    ? `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
                    : `{count_people} человек выбрали этот ответ ({percent}%)`
                } // Avtomatik qiymat
                value={
                  editingButton?.static
                    ? `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
                    : editingButton?.callbackData
                }
                onChange={(e) => {
                  if (!editingButton?.static) {
                    setEditingButton((prev) => ({
                      ...prev,
                      callbackData: e.target.value,
                    }));
                  }
                }}
                onFocus={(e) => {
                  if (
                    e.target.value === `{count_people} человек выбрали этот ответ ({percent}%)` ||
                    e.target.value === `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
                  ) {
                    e.target.value = ''; // Foydalanuvchi yozmoqchi bo'lsa, qiymatni tozalash
                  }
                }}
                disabled={editingButton?.static} // Agar static bo'lsa, inputni o'chirish
              />
            </Form.Item>
          )}
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Saqlash
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddButton;