// AdminTasks.js
import { useState, useEffect } from 'react';
import { Panel, Div, Button, ModalRoot, ModalCard, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon16Search, Icon24Cancel, Icon24Attach, Icon16Attach } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import coinIcon from './imgs/coin.png'
import tasksIcon from './imgs/tasks.png'

export default function AdminTasks({ id, goBack, user, goToBalance, balance, goToArchive, goToAnswersFeed }) {
  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [reward, setReward] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [requireFile, setRequireFile] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreated, setIsCreated] = useState(false);
  const [archive, setArchive] = useState(false);

  const inputStyle = `
    .search-input::placeholder {
      color: #ceaeff;
      opacity: 1;
    }
  `;

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:3001/api/admin/tasks?userId=${user.id}`)
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error('Ошибка загрузки админ-заданий', err));
  }, [user]);

  function getTimeLeft(expiresAt) {
    if (!expiresAt) return 'бессрочно';

    const date = new Date(expiresAt);

    const formatted = date.toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow',
      day: 'numeric',
      month: 'long',
    });

    return `до ${formatted}`;
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

  function isTaskActive(task) {
    if (!task.expires_at) return true;
    const now = new Date();
    const expires = new Date(task.expires_at);

    const nowMoscow = new Date(
      now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
    );
    const expiresMoscow = new Date(
      expires.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
    );

    return expiresMoscow >= nowMoscow;
  }

  // Функции для сохранения редактирования и удаления
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

      // обновляем локально
      setTasks(prev =>
        prev.map(t => (t.id === editTask.id ? editTask : t))
      );

      setEditTask(null);
      setActiveModal(null);
    } catch (e) {
      console.error('Ошибка редактирования задания', e);
    }
  };

  const deleteTask = async () => {
    try {
      await fetch(`http://localhost:3001/api/admin/tasks/${deleteTaskTarget.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      setTasks(prev => prev.filter(t => t.id !== deleteTaskTarget.id));
      setDeleteTaskTarget(null);
      setActiveModal(null);
    } catch (e) {
      console.error('Ошибка удаления задания', e);
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
      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="createTask"
          onClose={() => setActiveModal(null)}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          {/* ЗАДАНИЕ */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginTop: 27, marginBottom: 10 }}
          >
            Задание
          </CustomText>

          <input
            type="text"
            placeholder="название задания..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="search-input"
            style={{
              width: '92%',
              padding: '6px 12px',
              borderRadius: 999,
              border: '1px solid #ceaeff',
              outline: 'none',
              fontSize: 12,
              color: '#ceaeff',
              marginBottom: 14,
            }}
          />

          {/* ВОПРОС */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 8 }}
          >
            Вопрос / условие
          </CustomText>

          <textarea
            placeholder={`1...
2...
......
*где нужно поле ответа - [answer], файл - [file], enter после не нажимаем!`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="search-input"
            style={{
              width: '92%',
              minHeight: '72px',
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

          {/* ФАЙЛ */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 30, marginLeft: 20 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              файл
            </CustomText>

            <div
              onClick={() => setRequireFile(!requireFile)}
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: requireFile ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: requireFile ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          {/* НАГРАДА */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 8 }}
          >
            Награда
          </CustomText>

          <input
            type="number"
            placeholder="количество баллов..."
            value={reward}
            onChange={(e) => setReward(e.target.value)}
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

          {/* СРОК */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 8 }}
          >
            Срок выполнения
          </CustomText>

          <div style={{ position: 'relative', marginBottom: 1 }}>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
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

          {/* БЕССРОЧНО */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 20 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              бессрочно
            </CustomText>

            <div
              onClick={() => setExpiresAt(expiresAt ? '' : new Date().toISOString())}
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: !expiresAt ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: !expiresAt ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          {/* АРХИВ */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 30, marginLeft: 20 }}>
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              архивировать
            </CustomText>

            <div
              onClick={() => setArchive(!archive)}
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: archive ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 2,
                  left: archive ? 9 : 2,
                  width: 7,
                  height: 7,
                  borderRadius: '30%',
                  backgroundColor: '#fff',
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          <div
            onClick={async () => {
              if (!title || !question || !reward || isCreated) return;

              try {
                await fetch('http://localhost:3001/api/admin/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userId: user.id,
                    title,
                    question,
                    reward: Number(reward),
                    expires_at: expiresAt || null,
                    require_file: requireFile ? 1 : 0,
                    archive: archive ? 1 : 0
                  })
                });

                const res = await fetch(
                  `http://localhost:3001/api/admin/tasks?userId=${user.id}`
                );
                const data = await res.json();
                setTasks(data);

                setIsCreated(true);

                setTimeout(() => {
                  setIsCreated(false);
                  setActiveModal(null);
                }, 3000);

              } catch (e) {
                console.error('Ошибка создания задания', e);
              }
            }}
            style={{
              width: '100%',
              backgroundColor: isCreated
                ? '#ceaeff'
                : (!title || !question || !reward)
                ? '#ceaeff'
                : '#8c64d7',
              borderRadius: 999,
              padding: '1px 0',
              textAlign: 'center',
              cursor: (!title || !question || !reward || isCreated)
                ? 'default'
                : 'pointer',
              marginTop: 16
            }}
          >
            <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
              {isCreated ? 'добавлено' : 'создать'}
            </CustomText>
          </div>
        </ModalCard>

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

        {/* Модалка редактирования */}
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
              marginBottom: 14,
            }}
          />

          {/* ВОПРОС */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 8 }}
          >
            Вопрос / условие
          </CustomText>

          <textarea
            placeholder={`1...
2...
......
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
              gap: 30,
              marginLeft: 20
            }}
          >
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              файл
            </CustomText>

            <div
              onClick={() =>
                setEditTask({
                  ...editTask,
                  require_file: editTask?.require_file ? 0 : 1
                })
              }
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: editTask?.require_file ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
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
                  transition: '0.2s'
                }}
              />
            </div>
          </div>
          {/* НАГРАДА */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 8 }}
          >
            Награда
          </CustomText>
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
          {/* СРОК */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 8 }}
          >
            Срок выполнения
          </CustomText>
          <div style={{ position: 'relative', marginBottom: 1 }}>
            <input
              type="datetime-local"
              value={editTask?.expires_at || ''}
              onChange={e => setEditTask({ ...editTask, expires_at: e.target.value })}
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
          {/* БЕССРОЧНО */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginLeft: 20
            }}
          >
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              бессрочно
            </CustomText>

            <div
              onClick={() =>
                setEditTask({
                  ...editTask,
                  expires_at: editTask?.expires_at ? null : new Date().toISOString()
                })
              }
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: !editTask?.expires_at ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
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
                  transition: '0.2s'
                }}
              />
            </div>
          </div>
          {/* АРХИВ */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: 16,
              gap: 30,
              marginLeft: 20
            }}
          >
            <CustomText style={{ fontSize: 10, color: '#000' }}>
              архивировать
            </CustomText>

            <div
              onClick={() =>
                setEditTask({
                  ...editTask,
                  archive: editTask?.archive ? 0 : 1
                })
              }
              style={{
                width: 18,
                height: 11,
                borderRadius: '30%',
                backgroundColor: editTask?.archive ? '#8c64d7' : '#ceaeff',
                position: 'relative',
                cursor: 'pointer',
                transition: '0.2s'
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
                  transition: '0.2s'
                }}
              />
            </div>
          </div>

          <div
            onClick={async () => {
              if (
                !editTask?.title ||
                !editTask?.question ||
                !editTask?.reward ||
                isCreated
              ) return;

              try {
                await saveEditTask();

                setIsCreated(true);

                setTimeout(() => {
                  setIsCreated(false);
                  setActiveModal(null);
                }, 3000);

              } catch (e) {
                console.error('Ошибка сохранения задания', e);
              }
            }}
            style={{
              width: '100%',
              backgroundColor: isCreated
                ? '#ceaeff'
                : (!editTask?.title || !editTask?.question || !editTask?.reward)
                ? '#ceaeff'
                : '#8c64d7',
              borderRadius: 999,
              padding: '1px 0',
              textAlign: 'center',
              cursor:
                (!editTask?.title || !editTask?.question || !editTask?.reward || isCreated)
                  ? 'default'
                  : 'pointer',
            }}
          >
            <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
              {isCreated ? 'сохранено' : 'сохранить'}
            </CustomText>
          </div>
        </ModalCard>

        {/* Модалка удаления */}
        <ModalCard
          id="deleteTask"
          onClose={() => setActiveModal(null)}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />
          <CustomText weight="1" style={{ marginBottom: 20 }}>
            Удалить <b style={{ color: '#8c64d7' }}>{deleteTaskTarget?.title}</b>?
          </CustomText>

          <div style={{ display: 'flex', gap: 6 }}>
            {/* Кнопка Подтвердить */}
            <div
              onClick={deleteTask}
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
                удалить
              </CustomText>
            </div>

            {/* Кнопка Отмена */}
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
        {/* Кастомный хедер */}
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
            {/* Кнопка назад */}
            <Button
                mode="tertiary"
                size="l"
                before={<Icon28ChevronBack />}
                onClick={goBack}
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
                  Задания (админка)
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
            <Card
              mode="shadow"
              style={{
                borderRadius: 10,
                padding: '12px',
                backgroundColor: '#ffffff',
              }}
            >
              <div style={{ position: 'relative', marginBottom: 16 }}>
                <Icon16Search
                  fill="#ceaeff"
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 14,
                    height: 14,
                    pointerEvents: 'none'
                  }}
                />
                <input
                  className="search-input"
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 12px 6px 34px',
                    borderRadius: 999,
                    border: '1px solid #ceaeff',
                    outline: 'none',
                    fontSize: 12,
                    color: '#ceaeff',
                  }}
                />
              </div>
              <div style={{ gap: 6, marginBottom: 12 }}>
                {/* Выполненные */}
                <div
                  onClick={() => goToAnswersFeed()}
                  style={{
                    flex: 1,
                    backgroundColor: '#ceaeff',
                    borderRadius: 999,
                    padding: '1px 0',
                    textAlign: 'center',
                    marginBottom: 6,
                  }}
                >
                  <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                    выполненные задания
                  </CustomText>
                </div>

                <div
                  onClick={() => {
                    setTitle('');
                    setQuestion('');
                    setReward('');
                    setExpiresAt('');
                    setRequireFile(false);
                    setActiveModal('createTask');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: '#8c64d7',
                    borderRadius: 999,
                    padding: '1px 0',
                    textAlign: 'center',
                    cursor: 'pointer',
                    marginBottom: 6,
                  }}
                >
                  <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                    + добавить задание
                  </CustomText>
                </div>

                {/* Архив */}
                <div
                  onClick={() => goToArchive()}
                  style={{
                    flex: 1,
                    border: '1px solid #8c64d7',
                    borderRadius: 999,
                    padding: '1px 0',
                    textAlign: 'center',
                    marginBottom: 16,
                    cursor: 'pointer'
                  }}
                >
                  <CustomText style={{ color: '#8c64d7', fontSize: 10, fontWeight: 600 }}>
                    архив заданий
                  </CustomText>
                </div>
              </div>

            {tasks.length === 0 ? (
              <CustomText style={{ marginTop: 16, color: '#999' }}>
                Заданий пока нет
              </CustomText>
            ) : (
              tasks
                .filter(task =>
                  task.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
                  isTaskActive(task)
                )
                .map(task => (
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
                      <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                    </CustomText>

                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTask(task);
                          setActiveModal('editTask');
                        }}
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

                      {/* Удалить */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTaskTarget(task);
                          setActiveModal('deleteTask');
                        }}
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
                          удалить
                        </CustomText>
                      </div>

                    </div>

                    <div
                      style={{
                        position: 'absolute',
                          top: 12,
                          right: 12,
                        }}
                      >
                        <div
                          style={{
                            padding: '4px 10px',
                            borderRadius: 999,
                            backgroundColor: '#ffffff',
                            color: '#8c64d7',
                            fontSize: 10,
                            fontWeight: 600,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {getTimeLeft(task.expires_at)}
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
