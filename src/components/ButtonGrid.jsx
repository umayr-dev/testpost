import { useState, useEffect } from "react";
import { Switch, message } from "antd";
import axios from "axios";
import "../button.css";

const API_URL = "https://testpost.uz/inline_buttons/";

function ButtonGridManager({ onButtonChange }) {
  const [rows, setRows] = useState([]);
  const [totalButtons, setTotalButtons] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingButton, setEditingButton] = useState(null);
  const [editValues, setEditValues] = useState({ label: "", callbackData: "" });
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [isStatistics, setIsStatistics] = useState(false);
  const [isExplanation, setIsExplanation] = useState(false);
  const [explanationText, setExplanationText] = useState(""); // Izoh matni

  const MAX_BUTTONS = 30;
  const prepareButtonsForAPI = () => {
    return rows.flatMap((row, rowIndex) =>
      row.buttons.map((button, index) => ({
        id: button.id,
        text: button.label,
        text_response: button.isStatistics
          ? `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
          : button.callbackData,
        callback_data: button.isStatistics ? "static" : "None",  // Statistika tugmalari uchun "static"
        row: rowIndex,
        position: index,
        is_correct: button.isCorrect,
        is_comment: button.isExplanation,
        static: button.isStatistics, // Statistika tugmasi
        message: 3, // Kerakli o'zgartirishni amalga oshiring
      }))
    );
  };
  
  const handleSwitchChange = (name) => (checked) => {
    if (name === "correctAnswer") {
      if (checked) {
        setIsCorrectAnswer(true);
        setIsStatistics(false);
        setIsExplanation(false);
      } else {
        setIsCorrectAnswer(false);
      }
    } else if (name === "statistics") {
      if (checked) {
        setIsStatistics(true);
        setIsCorrectAnswer(false);
        setIsExplanation(false);
      } else {
        setIsStatistics(false);
      }
    } else if (name === "explanation") {
      if (checked) {
        setIsExplanation(true);
        setIsCorrectAnswer(false);
        setIsStatistics(false);
      } else {
        setIsExplanation(false);
      }
    }
  };

  const generateId = () => {
    return `btn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  };

  const addRow = () => {
    const newRow = {
      id: generateId(),
      buttons: [
        {
          id: generateId(),
          label: `Tugma ${totalButtons + 1}`,
          callbackData: "text_response",
          isCorrect: false,
          position: 0,
        },
      ],
    };

    if (totalButtons < MAX_BUTTONS) {
      setRows([...rows, newRow]);
      setTotalButtons(totalButtons + 1);
    }
  };

  const addButton = (rowId) => {
    if (totalButtons >= MAX_BUTTONS) return;

    const updatedRows = rows.map((row) => {
      if (row.id === rowId && row.buttons.length < 10) {
        return {
          ...row,
          buttons: [
            ...row.buttons,
            {
              id: generateId(),
              label: `Tugma ${totalButtons + 1}`,
              callbackData: "text_response",
              isCorrect: false,
              position: row.buttons.length,
            },
          ],
        };
      }
      return row;
    });

    setRows(updatedRows);
    setTotalButtons(totalButtons + 1);
  };

  const removeButton = (rowId, buttonId) => {
    const updatedRows = rows
      .map((row) => {
        if (row.id === rowId) {
          const updatedButtons = row.buttons.filter((button) => button.id !== buttonId);

          if (updatedButtons.length === 0) {
            return null;
          }

          return {
            ...row,
            buttons: updatedButtons,
          };
        }
        return row;
      })
      .filter((row) => row !== null);

    setRows(updatedRows);
    setTotalButtons(totalButtons - 1);
  };

  const openEditModal = (rowId, button) => {
    setEditingButton({ rowId, buttonId: button.id });
    setEditValues({
      label: button.label,
      callbackData: button.callbackData,
    });
    setIsCorrectAnswer(button.isCorrect);
    setIsStatistics(button.isStatistics);
    setIsExplanation(button.isExplanation);
    setExplanationText(button.explanationText || "");
    setShowModal(true);
  };

  const saveButtonEdit = async () => {
    if (!editingButton) return;
  
    const updatedCallbackData = isStatistics
      ? `📊 Статистика\n\n{buttons_info}\n\n👥 Всего участников: {all_count}`
      : editValues.callbackData;
  
    const updatedRows = rows.map((row) => {
      if (row.id === editingButton.rowId) {
        const updatedButtons = row.buttons.map((button) => {
          if (button.id === editingButton.buttonId) {
            return {
              ...button,
              label: editValues.label,
              callbackData: updatedCallbackData,
              isCorrect: isCorrectAnswer,
              isStatistics,
              isExplanation,
              explanationText: isExplanation ? explanationText : "",
            };
          }
          return button;
        });
        return {
          ...row,
          buttons: updatedButtons,
        };
      }
      return row;
    });
  
    setRows(updatedRows);
    closeModal();
  
    // API'ga ma'lumotlarni yuborish
    try {
      const payload = prepareButtonsForAPI();
      const response = await axios.post(API_URL, payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      console.log("API javobi:", response);
      message.success("Tugmalar muvaffaqiyatli saqlandi!");
    } catch (error) {
      console.error("Tugmalarni saqlashda xatolik:", error);
      message.warning("Tugmalarni saqlashda muammo bo‘ldi. Iltimos, qayta urinib ko‘ring.");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingButton(null);
  };

  const toggleCorrectAnswer = (rowId, buttonId) => {
    const updatedRows = rows.map((row) => {
      if (row.id === rowId) {
        const updatedButtons = row.buttons.map((button) => {
          if (button.id === buttonId) {
            button.isCorrect = !button.isCorrect;
            if (button.isCorrect) {
              row.buttons.forEach((btn) => {
                if (btn.id !== buttonId) btn.isCorrect = false;
              });
            }
          }
          return button;
        });
        return {
          ...row,
          buttons: updatedButtons,
        };
      }
      return row;
    });

    setRows(updatedRows);
  };

//   const prepareButtonsForAPI = () => {
//     return rows.flatMap((row, rowIndex) =>
//       row.buttons.map((button, index) => ({
//         id: button.id,
//         text: button.label,
//         text_response: button.isStatistics ? `{count_people} человек выбрали этот ответ ({percent}%)` : button.callbackData,
//         callback_data: "None",
//         row: rowIndex,
//         position: index,
//         is_correct: button.isCorrect,
//         is_comment: button.isExplanation,
//         static: button.isStatistics,
//         message: 3, // O'zgartiring, kerak bo'lsa
//       }))
//     );
//   };

  // Call the onButtonChange prop whenever the rows state changes
  useEffect(() => {
    onButtonChange(prepareButtonsForAPI());
  }, [rows]);

  return (
    <div className="button-grid-container">
      <div className="button-grid-header">
        <button className="add-row-button" onClick={addRow} disabled={totalButtons >= MAX_BUTTONS}>
          Add Row
        </button>
        <div className="button-count">
          {totalButtons}/{MAX_BUTTONS} buttons
        </div>
      </div>

      <div className="button-grid">
        {rows.map((row) => (
          <div key={row.id} className="button-row">
            <div className="button-row-content">
              {row.buttons.map((button) => (
                <div
                  key={button.id}
                  className={`button-item ${button.isCorrect ? "correct" : ""}`}
                  onClick={() => openEditModal(row.id, button)}
                >
                  <div className="button-label">{button.label}</div>
                  <div className="button-callback">{button.callbackData}</div>
                </div>
              ))}
            </div>
            <div className="button-row-controls">
              <button
                className="control-button add"
                onClick={() => addButton(row.id)}
                disabled={row.buttons.length >= 10 || totalButtons >= MAX_BUTTONS}
              >
                +
              </button>
              <button
                className="control-button remove"
                onClick={() => row.buttons.length > 0 && removeButton(row.id, row.buttons[row.buttons.length - 1].id)}
              >
                -
              </button>
            </div>
          </div>
        ))}
      </div>

      {rows.length === 0 && <div className="empty-state">Click "Add Row" to start creating your button grid</div>}
        
      {/* Edit Button Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Tugma qo`shish</h3>
              <button className="modal-close" onClick={closeModal}>
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="label">Tugma nomi</label>
                <input
                  type="text"
                  id="label"
                  name="label"
                  value={editValues.label}
                  onChange={(e) => setEditValues({ ...editValues, label: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="callbackData">Tugma matni</label>
                <input
                  type="text"
                  id="callbackData"
                  name="callbackData"
                  value={editValues.callbackData}
                  onChange={(e) => setEditValues({ ...editValues, callbackData: e.target.value })}
                  className="modal-input"
                />
              </div>
              <div className="switch-group">
                <div className="form-group">
                  <label htmlFor="correctAnswer">Correct Answer</label>
                  <Switch
                    checked={isCorrectAnswer}
                    onChange={handleSwitchChange("correctAnswer")}
                    className="modal-switch"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="statistics">Statistics</label>
                  <Switch
                    checked={isStatistics}
                    onChange={handleSwitchChange("statistics")}
                    className="modal-switch"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="explanation">Explanation</label>
                  <Switch
                    checked={isExplanation}
                    onChange={handleSwitchChange("explanation")}
                    className="modal-switch"
                  />
                </div>
              </div>

              {isExplanation && (
                <div className="form-group">
                  <label htmlFor="explanationText">Izoh</label>
                  <textarea
                    id="explanationText"
                    name="explanationText"
                    value={explanationText}
                    onChange={(e) => setExplanationText(e.target.value)}
                    className="modal-input"
                    placeholder="Izohni kiriting..."
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="save-button" onClick={saveButtonEdit}>Save</button>
              <button className="cancel-button" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ButtonGridManager;
