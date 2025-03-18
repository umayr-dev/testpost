import { useState, useEffect } from 'react';
import {
  Space,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Select,
  Switch,
} from 'antd';
import { EditOutlined, } from '@ant-design/icons';
import axios from 'axios';

const { Column } = Table;

const AddButton = () => {
  const [data, setData] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditButtonModalOpen, setIsEditButtonModalOpen] = useState(false);
  const [rows, setRows] = useState([{ id: Date.now(), buttons: [] }]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [editingButton, setEditingButton] = useState(null); // Tahrirlanayotgan tugma
  const MAX_BUTTONS = 30;
  const MAX_BUTTONS_PER_ROW = 10;
  const MAX_ROWS = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://testpost.uz/botmessages/');
        setData(response.data);
        setQuestions(
          response.data.map((item) => ({ id: item.id, name: item.command })),
        );
      } catch (error) {
        console.error('Data yuklashda xatolik:', error);
        message.error("Data yuklashda muammo bo'ldi.");
      }
    };

    fetchData();
  }, []);

  const resetModal = () => {
    setRows([{ id: Date.now(), buttons: [] }]); // Qatorlarni tozalash
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
  
    // Format buttons according to the required structure
    const buttons = rows.flatMap((row) =>
      row.buttons.map((button) => ({
        message: selectedQuestion,
        text: button.label,
        callback_data: button.callbackData || 'None',
        row: button.row,
        position: button.position,
        is_correct: button.is_correct || false,
        is_comment: button.is_comment || false,
        static: button.static || false,
      }))
    );
  
    const payload = {
      message: selectedQuestion,
      buttons: buttons,
    };
  
    try {
      await axios.put('https://testpost.uz/update-buttons/', payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      message.success('Ma\'lumotlar muvaffaqiyatli saqlandi!');
      setIsAddModalOpen(false);
      resetModal();
      window.location.reload(); // Sahifani qayta yuklash
    } catch (error) {
      console.error('Ma\'lumotlarni saqlashda xatolik:', error.response?.data || error.message);
      message.error('Ma\'lumotlarni saqlashda muammo bo‘ldi.');
    }
  };
  

  const addRow = () => {
    if (rows.length >= MAX_ROWS) {
      message.warning('Maksimal qatorlar soniga yetdingiz!');
      return;
    }
    setRows((prevRows) => [
      ...prevRows,
      { id: Date.now(), buttons: [], row: prevRows.length }, // Qatorning `row` qiymati indeksga teng
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
      }),
    );
  };

  // const removeLastButton = (rowId) => {
  //   setRows(
  //     rows.map((row) => {
  //       if (row.id === rowId && row.buttons.length > 0) {
  //         return {
  //           ...row,
  //           buttons: row.buttons.slice(0, -1), // Oxirgi tugmani o'chirish
  //         };
  //       }
  //       return row;
  //     }),
  //   );
  // };

  const handleEditButton = (rowId, button) => {
    setEditingButton({ rowId, ...button });
    setIsEditButtonModalOpen(true);
  };

  const saveEditedButton = async (values) => {
    const isStatic = editingButton?.static || false;

    const updatedButton = {
      text: values.label,
      text_response:
        values.callbackData ??
        (isStatic
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

    console.log("PUT yuborilayotgan ma'lumotlar:", updatedButton);

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
        }),
      );
      setIsEditButtonModalOpen(false);
      setEditingButton(null);
      message.success('Tugma muvaffaqiyatli tahrirlandi!');
    } catch (error) {
      console.error(
        'Tugmani tahrirlashda xatolik:',
        error.response?.data || error.message,
      );
      message.error("Tugmani tahrirlashda muammo bo'ldi.");
    }
  };

  const deleteRow = (rowId) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const handleEdit = (record) => {
    setSelectedQuestion(record.id);
    setRows([
      {
        id: record.id,
        buttons: record.buttons.map((button) => ({
          ...button,
          label: button.text,
          callbackData: "",
          row: button.row,
          position: button.position,
          is_correct: button.is_correct,
          is_comment: button.is_comment,
          static: button.static,
          message: button.message,
        })),
      },
    ]);
    setIsAddModalOpen(true);
  };

  const handledeleteButton = async (buttonId) => {
    try {
      // API'ga DELETE so'rovini yuborish
      await axios.delete(`https://testpost.uz/inline_buttons/${buttonId}/`);
      message.success('Tugma muvaffaqiyatli o‘chirildi!');
  
      // Mahalliy holatdan tugmani o'chirish
      setRows(
        rows.map((row) => {
          if (row.id === editingButton.rowId) {
            return {
              ...row,
              buttons: row.buttons.filter((button) => button.id !== buttonId),
            };
          }
          return row;
        })
      );
  
      // Modalni yopish va tahrirlanayotgan tugmani tozalash
      setIsEditButtonModalOpen(false);
      setEditingButton(null);
    } catch (error) {
      console.error('Tugmani o‘chirishda xatolik:', error.response?.data || error.message);
      message.error('Tugmani o‘chirishda muammo bo‘ldi.');
    }
  };

  return (
    <div>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => setIsAddModalOpen(true)}
      >
        Tugma qo`shish
      </Button>
      <Table dataSource={data} rowKey="id">
        <Column title="Question" dataIndex="command" key="command" />
        <Column
          title="Buttons"
          dataIndex="buttons"
          key="buttons"
          render={(buttons) => buttons?.length || 0}
        />
        <Column
          title="Actions"
          key="actions"
          width={100}
          render={(_, record) => (
            <Space size="middle">
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Space>
          )}
        />
      </Table>

      {/* Add Modal */}
      <Modal
        title="Tugma qo'shish"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          resetModal(); // Modalni tozalash
          // window.location.reload()
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
                  {/* {row.buttons.length > 0 && (
                    <Button onClick={() => removeLastButton(row.id)}>-</Button>
                  )} */}
                </div>
                <Button
                  type="link"
                  danger
                  onClick={() => deleteRow(row.id)}
                  style={{ marginTop: 8 }}
                >
                  Qatorni o`chirish
                </Button>
              </div>
            ))}
            {rows.length < MAX_ROWS && (
              <Button onClick={addRow} style={{ marginTop: 16 }}>
                Qator qo`shish
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
        <Form initialValues={editingButton} onFinish={saveEditedButton}>
          <Form.Item
            name="label"
            label="Tugma nomi"
            rules={[{ required: true, message: 'Tugma nomini kiriting!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Javob to'g'ri">
            {rows.some((row) =>
              row.buttons.some(
                (button) =>
                  button.is_correct && button.id !== editingButton?.id,
              ),
            ) && !editingButton?.is_correct ? (
              <span>Faqat bitta tugma <b>Javob to`g`ri</b> bo`lishi mumkin</span>
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
                    e.target.value ===
                      `{count_people} человек выбрали этот ответ ({percent}%)` ||
                    e.target.value ===
                      `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
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
            <Button type='primary' danger onClick={()=> handledeleteButton(editingButton.id)}>
              O`chirish
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddButton;
