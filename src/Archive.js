import { useEffect, useState } from 'react';
import { Panel, Div, Card, Button, ModalRoot, ModalCard } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Cancel, Icon24Attach, Icon16Attach } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png';
import coinIcon from './imgs/coin.png';

export default function ArchiveTasks({ id, goBack, user, goToTasks }) {
  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [restoreTask, setRestoreTask] = useState(null);
  const [newExpires, setNewExpires] = useState('');
  const [activeTask, setActiveTask] = useState(null);

  const inputStyle = `
    .search-input::placeholder {
      color: #ceaeff;
      opacity: 1;
    }
  `;

  function getMoscowTime() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
  }

  function formatDateTime(dateString) {
    if (!dateString) return 'бессрочно';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:3001/api/admin/tasks/archive?userId=${user.id}`)
      .then(res => res.json())
      .then(data => {
        const moscowNow = getMoscowTime();

        const filtered = data.filter(task => {
          if (task.archive !== 1) return false;
          if (!task.expires_at) return false;

          const taskDeadline = new Date(
            new Date(task.expires_at).toLocaleString("en-US", { timeZone: "Europe/Moscow" })
          );

          return taskDeadline < moscowNow;
        });

        setTasks(filtered);
      })
      .catch(err => console.error('Ошибка архива', err));
  }, [user]);

  const saveEditTask = async () => {
    try {
      await fetch(`http://localhost:3001/api/admin/tasks/${editTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: editTask.title,
          question: editTask.question,
          reward: Number(editTask.reward),
          expires_at: editTask.expires_at || null,
          require_file: editTask.require_file ? 1 : 0,
          archive: editTask.archive ? 1 : 0
        }),
      });

      setTasks(prev => prev.map(t => (t.id === editTask.id ? editTask : t)));
      setEditTask(null);
      setActiveModal(null);
    } catch (e) {
      console.error('Ошибка редактирования задания', e);
    }
  };

  const restoreTaskDeadline = async () => {
    try {
      const expiresISOString = newExpires
        ? new Date(newExpires).toISOString()
        : null; // ← бессрочно

      await fetch(`http://localhost:3001/api/admin/tasks/${restoreTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          title: restoreTask.title,
          question: restoreTask.question,
          reward: restoreTask.reward,
          expires_at: expiresISOString,
          require_file: restoreTask.require_file,
          archive: 0
        })
      });

      setTasks(prev => prev.filter(t => t.id !== restoreTask.id));
      setRestoreTask(null);
      setActiveModal(null);

    } catch (e) {
      console.error('Ошибка восстановления задания', e);
    }
  };

  const ModalCloseButton = ({ onClick }) => (
    <div
      onClick={onClick}
      style={{
        position: 'absolute',
        top: 10,
        right: 18,
        width: 24,
        height: 24,
        borderRadius: '50%',
        border: '1px solid #d9d9d9',
        backgroundColor: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 10,
      }}
    >
        <Icon24Cancel width={16} height={16} fill="#000" />
    </div>
  );

  return (
    <>
      {/* МОДАЛКИ */}
      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="taskInfo"
          onClose={() => {
            setActiveModal(null);
            setActiveTask(null);
          }}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          {/* Название */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 12 }}
          >
            Задание - {activeTask?.title}
          </CustomText>

          {/* Описание */}
          <CustomText
            style={{
              fontSize: 10,
              lineHeight: 1,
              color: '#000',
              marginBottom: 12,
              whiteSpace: 'pre-wrap'
            }}
          >
            {activeTask?.question}
          </CustomText>

          {/* Файл */}
          {activeTask?.require_file ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 3}}>
              <Icon24Attach width={12} height={12} fill="#8c64d7" />
              <CustomText style={{ fontSize: 10, color: '#000' }}>
                требуется файл
              </CustomText>
            </div>
          ) : null}

          {/* Награда */}
          <CustomText
            style={{
              fontSize: 10,
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              lineHeight: 1
            }}
          >
            <span style={{ color: '#8c64d7', fontWeight: 700 }}>
              Награда:
            </span>{' '}
            {activeTask?.reward}
          </CustomText>

          {/* Срок */}
          <CustomText style={{ fontSize: 10, color: '#000', lineHeight: 1, marginTop: 5 }}>
            <span style={{ color: '#8c64d7', fontWeight: 700 }}>
              Срок выполнения:
            </span>{' '}
            {formatDateTime(activeTask?.expires_at)}
          </CustomText>

          <div
            onClick={() => {
              setEditTask(activeTask);
              setActiveModal('editTask');
            }}
            style={{
              width: '100%',
              backgroundColor: '#8c64d7',
              borderRadius: 999,
              padding: '1px 0',
              textAlign: 'center',
              cursor: 'pointer',
              marginTop: 16
            }}
          >
            <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
              редактировать
            </CustomText>
          </div>
        </ModalCard>

        {/* Редактирование */}
        <ModalCard
          id="editTask"
          onClose={() => { setEditTask(null); setActiveModal(null); }}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginTop: 27, marginBottom: 10 }}
          >
            Редактировать
          </CustomText>

          {/* Название */}
          <input
            type="text"
            placeholder="название задания..."
            value={editTask?.title || ''}
            onChange={e => setEditTask({ ...editTask, title: e.target.value })}
            className="search-input"
            style={{
              width: '92%',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #ceaeff',
              outline: 'none',
              fontSize: 12,
              color: '#ceaeff',
              marginBottom: 14
            }}
          />

          {/* Вопрос / условие */}
          <CustomText weight="1" style={{ fontSize: 16, color: '#000', marginBottom: 8 }}>
            Вопрос / условие
          </CustomText>
          <textarea
            placeholder={`1...
2...
...
*где нужно поле ответа - [answer], файл - [file], enter после не нажимаем!`}
            value={editTask?.question || ''}
            onChange={e => setEditTask({ ...editTask, question: e.target.value })}
            className="search-input"
            style={{
              width: '92%',
              height: '72px',
              padding: '6px 12px',
              borderRadius: 12,
              border: '1px solid #ceaeff',
              outline: 'none',
              fontSize: 12,
              color: '#ceaeff',
              marginBottom: 1,
              resize: 'none'
            }}
          />

          {/* Файл */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginLeft: 20, marginBottom: 16 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>файл</CustomText>
            <div
              onClick={() => setEditTask({ ...editTask, require_file: editTask?.require_file ? 0 : 1 })}
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: editTask?.require_file ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: editTask?.require_file ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s',
                }}
              />
            </div>
          </div>

          {/* Награда */}
          <CustomText weight="1" style={{ fontSize: 16, color: '#000', marginBottom: 8 }}>Награда</CustomText>
          <input
            type="number"
            placeholder="количество баллов..."
            value={editTask?.reward || ''}
            onChange={e => setEditTask({ ...editTask, reward: e.target.value })}
            className="search-input"
            style={{
              width: '92%',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #ceaeff',
              outline: 'none',
              fontSize: 12,
              color: '#ceaeff',
              marginBottom: 14
            }}
          />

          {/* Срок */}
          <CustomText weight="1" style={{ fontSize: 16, color: '#000', marginBottom: 8 }}>Срок выполнения</CustomText>
          <input
            type="datetime-local"
            value={editTask?.expires_at || ''}
            onChange={e => setEditTask({ ...editTask, expires_at: e.target.value })}
            style={{
              width: '92%',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #ceaeff',
              outline: 'none',
              fontSize: 12,
              color: '#ceaeff'
            }}
          />

          {/* Бессрочно */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>бессрочно</CustomText>
            <div
              onClick={() =>
                setEditTask({
                  ...editTask,
                  expires_at: editTask?.expires_at ? null : new Date().toISOString(),
                })
              }
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: !editTask?.expires_at ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: !editTask?.expires_at ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s',
                }}
              />
            </div>
          </div>

          {/* Архив */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20, marginBottom: 16 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>архивировать</CustomText>
            <div
              onClick={() => setEditTask({ ...editTask, archive: editTask?.archive ? 0 : 1 })}
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: editTask?.archive ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: editTask?.archive ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s',
                }}
              />
            </div>
          </div>

          <div
            onClick={() => {
              if (!editTask?.title || !editTask?.question || !editTask?.reward) return;

              saveEditTask();
            }}
            style={{
              width: '100%',
              backgroundColor: (!editTask?.title || !editTask?.question || !editTask?.reward)
                ? '#ceaeff'
                : '#8c64d7',
              borderRadius: 999,
              padding: '1px 0',
              textAlign: 'center',
              cursor: (!editTask?.title || !editTask?.question || !editTask?.reward)
                ? 'default'
                : 'pointer'
            }}
          >
            <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
              сохранить
            </CustomText>
          </div>
        </ModalCard>

        {/* Восстановление */}
        <ModalCard
          id="restoreTask"
          onClose={() => setActiveModal(null)}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          <CustomText style={{ marginBottom: 12, marginTop: 27 }}>
            Выберите новый срок выполнения:
          </CustomText>

          {/* КАСТОМНЫЙ INPUT */}
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type="datetime-local"
              value={newExpires}
              onChange={e => setNewExpires(e.target.value)}
              className="search-input"
              style={{
                width: '92%',
                padding: '6px 12px',
                borderRadius: 999,
                border: '1px solid #ceaeff',
                outline: 'none',
                fontSize: 12,
                color: '#ceaeff'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20, marginBottom: 12 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              бессрочно
            </CustomText>

            <div
              onClick={() => setNewExpires(newExpires ? '' : new Date().toISOString())}
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: !newExpires ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: !newExpires ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          {/* КНОПКИ */}
          <div style={{ display: 'flex', gap: 6 }}>

            {/* ВОССТАНОВИТЬ */}
            <div
              onClick={() => {
                restoreTaskDeadline();
              }}
              style={{
                flex: 1,
                backgroundColor: '#8c64d7',
                borderRadius: 999,
                padding: '1px 0',
                textAlign: 'center',
                cursor: 'pointer',
                opacity: 1
              }}
            >
              <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                восстановить
              </CustomText>
            </div>

            {/* ОТМЕНА */}
            <div
              onClick={() => setActiveModal(null)}
              style={{
                flex: 1,
                border: '1px solid #8c64d7',
                borderRadius: 999,
                padding: '1px 0',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              <CustomText style={{ color: '#8c64d7', fontSize: 10, fontWeight: 600 }}>
                отмена
              </CustomText>
            </div>

          </div>
        </ModalCard>
      </ModalRoot>
      <style>{inputStyle}</style>
      <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>
        <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />
        
        {/* HEADER */}
        <Div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: 56,
            backgroundColor: '#fff',
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px',
            zIndex: 1000,
          }}
        >
          <Button
            mode="tertiary"
            size="l"
            before={<Icon28ChevronBack />}
            onClick={goToTasks}
            style={{
              paddingLeft: 0,
              paddingRight: 8,
              marginRight: 4,
              color: '#ceaeff',
            }}
          >
            Назад
          </Button>
        </Div>

        <Div style={{ padding: '12px', backgroundColor: '#ceaeff' }}>

          {/* ВЕРХНЯЯ КАРТОЧКА */}
          <Card
            mode="shadow"
            style={{
              borderRadius: 10,
              padding: '20px 15px',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
              marginBottom: 15,
              position: 'relative'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CustomText
                weight="1"
                style={{
                  fontSize: 16,
                  color: '#000',
                }}
              >
                Архив заданий (админка)
              </CustomText>
            </div>

            <img
              src={tasksIcon}
              alt="tasks"
              style={{
                width: 75,
                height: 75,
                objectFit: 'contain',
                position: 'absolute',
                right: -5,
              }}
            />
          </Card>

          {/* СПИСОК */}
          <Card
            mode="shadow"
            style={{
              borderRadius: 10,
              padding: 12,
              backgroundColor: '#fff'
            }}
          >
            {tasks.length === 0 ? (
              <CustomText style={{ color: '#999' }}>
                Архив пуст
              </CustomText>
            ) : (
              tasks.map(task => (
                <Card
                  key={task.id}
                  style={{
                    borderRadius: 12,
                    padding: '14px',
                    marginBottom: 6,
                    backgroundColor: '#ffffff',
                    border: '1px solid #ceaeff',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onClick={() => {
                    setActiveTask(task);
                    setActiveModal('taskInfo');
                  }}
                >
                  <CustomText
                    weight="2"
                    style={{
                      fontSize: 10,
                      color: '#000',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {task.title}
                    {task.require_file && <Icon16Attach fill="#000" width={12} height={12} />}
                  </CustomText>

                  <CustomText style={{ fontSize: 16, color: '#8c64d7', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 1000 }}>
                    {task.reward}
                    <img alt="" src={coinIcon} style={{ height: 25, width: 25 }} />
                  </CustomText>

                  {/* КНОПКИ */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    
                    {/* РЕДАКТИРОВАТЬ */}
                    <div
                      onClick={(e) => { e.stopPropagation(); setEditTask(task); setActiveModal('editTask'); }}
                      style={{
                        flex: 1,
                        backgroundColor: '#8c64d7',
                        borderRadius: 999,
                        padding: '1px 0',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                        редактировать
                      </CustomText>
                    </div>

                    {/* ВОССТАНОВИТЬ */}
                    <div
                      onClick={(e) => { e.stopPropagation(); setRestoreTask(task); setNewExpires(''); setActiveModal('restoreTask'); }}
                      style={{
                        flex: 1,
                        border: '1px solid #8c64d7',
                        borderRadius: 999,
                        padding: '1px 0',
                        textAlign: 'center',
                        cursor: 'pointer'
                      }}
                    >
                      <CustomText style={{ color: '#8c64d7', fontSize: 10, fontWeight: 600 }}>
                        восстановить
                      </CustomText>
                    </div>

                  </div>
                </Card>
              ))
            )}
          </Card>
        </Div>
      </Panel>
    </>
  );
}