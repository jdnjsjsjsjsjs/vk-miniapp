// AdminTasks.js
import { useState, useEffect } from 'react';
import { Panel, Div, Button, ModalRoot, ModalCard, Input, Textarea, Checkbox } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons'
import { CustomText } from './CustomTypography';

import coinIcon from './imgs/coin.png'

export default function AdminTasks({ id, goBack, user, goToBalance, balance }) {
  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [reward, setReward] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [requireFile, setRequireFile] = useState(false);
  const [activeTask, setActiveTask] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [deleteTaskTarget, setDeleteTaskTarget] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:3001/api/admin/tasks?userId=${user.id}`)
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error('Ошибка загрузки админ-заданий', err));
  }, [user]);

  async function handleAnswer(action) {
    await fetch(
      `http://localhost:3001/api/admin/answers/${activeAnswer.id}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          action
        })
      }
    );

    setActiveAnswer(null);
    setActiveModal('task');

    const res = await fetch(
      `http://localhost:3001/api/admin/tasks/${activeTask.id}/answers?userId=${user.id}`
    );
    const data = await res.json();
    setAnswers(data);
  }

  function getTimeLeft(expiresAt) {
    if (!expiresAt) return 'Бессрочно';

    const now = new Date();
    const end = new Date(expiresAt);

    const diffMs = end - now;

    if (diffMs <= 0) return 'Истекло';

    const minutes = Math.floor(diffMs / 1000 / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} дн.`;
    if (hours > 0) return `${hours} ч.`;
    return `${minutes} мин.`;
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
          require_file: editTask.require_file ? 1 : 0
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

  return (
    <>
      <ModalRoot activeModal={activeModal}>
        <ModalCard
          id="createTask"
          onClose={() => setActiveModal(null)}
          header="Новое задание"
          actions={
            <Button
              size="l"
              mode="primary"
              disabled={!title || !question || !reward}
              onClick={async () => {
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
                      require_file: requireFile ? 1 : 0
                    })
                  });

                  // перезагружаем список заданий
                  const res = await fetch(
                    `http://localhost:3001/api/admin/tasks?userId=${user.id}`
                  );
                  const data = await res.json();
                  setTasks(data);

                  setActiveModal(null);
                } catch (e) {
                  console.error('Ошибка создания задания', e);
                }
              }}
            >
              Создать
            </Button>
          }
        >
          <Input
            placeholder="Название задания"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          <Textarea
            placeholder="Вопрос / условие"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          <Input
            type="number"
            placeholder="Награда (баллы)"
            value={reward}
            onChange={e => setReward(e.target.value)}
            style={{ marginBottom: 12 }}
          />

          <Input
            type="datetime-local"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
          />

          <Checkbox
            checked={requireFile}
            onChange={e => setRequireFile(e.target.checked)}
            style={{ marginTop: 12 }}
          >
            Требуется загрузка файла
          </Checkbox>
        </ModalCard>

        <ModalCard
          id="task"
          onClose={() => {
            setActiveModal(null);
            setActiveTask(null);
            setAnswers([]);
          }}
        >
          {answers.length === 0 ? (
            <CustomText style={{ color: '#999' }}>
              Ответов пока нет
            </CustomText>
          ) : (
            answers.map(a => (
              <Div
                key={a.id}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: '#f5f5f5',
                  marginBottom: 8,
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setActiveAnswer(a);
                  setActiveModal('answer');
                }}
              >
                <CustomText style={{ color: '#8c64d7' }}>
                  {a.first_name} {a.last_name}
                </CustomText>
                <CustomText
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color:
                      a.status === 'accepted'
                        ? '#4caf50'
                        : a.status === 'rejected'
                        ? '#f44336'
                        : '#ff9800',
                  }}
                >
                  {a.status === 'pending' && '⏳ На проверке'}
                  {a.status === 'accepted' && '✅ Принято'}
                  {a.status === 'rejected' && '❌ Отклонено'}
                </CustomText>
              </Div>
            ))
          )}
        </ModalCard>

        <ModalCard
          id="answer"
          onClose={() => {
            setActiveModal('task');
            setActiveAnswer(null);
          }}
          header={`${activeAnswer?.first_name} ${activeAnswer?.last_name}`}
          subheader="Ответ пользователя"
          actions={
            activeAnswer?.status === 'pending' && (
              <Div style={{ display: 'flex', gap: 8 }}>
                <Button
                  mode="primary"
                  onClick={() => {
                    setConfirmAction('accept');
                    setActiveModal('confirm');
                  }}
                >
                  Принять
                </Button>
                <Button
                  mode="destructive"
                  onClick={() => {
                    setConfirmAction('reject');
                    setActiveModal('confirm');
                  }}
                >
                  Отклонить
                </Button>
              </Div>
            )
          }
        >
          <CustomText>{activeAnswer?.answer}</CustomText>
          {activeAnswer?.file_path && (
            <Div style={{ marginTop: 12 }}>
              {activeAnswer.file_path.endsWith('.pdf') ? (
                <a
                  href={`http://localhost:3001${activeAnswer.file_path}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📄 Открыть PDF
                </a>
              ) : (
                <img
                  src={`http://localhost:3001${activeAnswer.file_path}`}
                  alt="Ответ"
                  style={{
                    width: '100%',
                    borderRadius: 12,
                    marginTop: 8
                  }}
                />
              )}
            </Div>
          )}
        </ModalCard>

        <ModalCard
          id="confirm"
          onClose={() => setActiveModal('answer')}
          actions={
            <Div style={{ display: 'flex', gap: 8 }}>
              <Button
                mode={confirmAction === 'accept' ? 'primary' : 'destructive'}
                onClick={() => {
                  handleAnswer(confirmAction);
                  setConfirmAction(null);
                }}
              >
                Подтвердить
              </Button>
              <Button
                mode="secondary"
                onClick={() => setActiveModal('answer')}
              >
                Отмена
              </Button>
            </Div>
          }
        >
          {/* Динамический контент вместо header/subheader */}
          <CustomText weight="2" style={{ marginBottom: 8 }}>
            {confirmAction === 'accept'
              ? 'Подтвердить принятие'
              : confirmAction === 'reject'
              ? 'Подтвердить отклонение'
              : ''}
          </CustomText>
          <CustomText style={{ color: '#666' }}>
            {confirmAction === 'accept'
              ? 'Пользователю будут начислены баллы'
              : confirmAction === 'reject'
              ? 'Ответ пользователя будет отклонён'
              : ''}
          </CustomText>
        </ModalCard>

        {/* Модалка редактирования */}
        <ModalCard
          id="editTask"
          header="Редактировать задание"
          onClose={() => { setEditTask(null); setActiveModal(null); }}
        >
          <Input
            placeholder="Название"
            value={editTask?.title || ''}
            onChange={e => setEditTask({ ...editTask, title: e.target.value })}
            style={{ marginBottom: 12 }}
          />
          <Textarea
            placeholder="Вопрос / условие"
            value={editTask?.question || ''}
            onChange={e => setEditTask({ ...editTask, question: e.target.value })}
            style={{ marginBottom: 12 }}
          />
          <Input
            type="number"
            placeholder="Награда"
            value={editTask?.reward || ''}
            onChange={e => setEditTask({ ...editTask, reward: e.target.value })}
            style={{ marginBottom: 12 }}
          />
          <Input
            type="datetime-local"
            value={editTask?.expires_at || ''}
            onChange={e => setEditTask({ ...editTask, expires_at: e.target.value })}
          />
          <Checkbox
            checked={!!editTask?.require_file}
            onChange={e =>
              setEditTask({
                ...editTask,
                require_file: e.target.checked ? 1 : 0
              })
            }
            style={{ marginTop: 12 }}
          >
            Требуется загрузка файла
          </Checkbox>
          <Div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button mode="primary" stretched onClick={saveEditTask}>
              Сохранить
            </Button>
            <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>
              Отмена
            </Button>
          </Div>
        </ModalCard>

        {/* Модалка удаления */}
        <ModalCard
          id="deleteTask"
          header="Удалить задание?"
          onClose={() => setActiveModal(null)}
        >
          <CustomText style={{ marginBottom: 12 }}>
            Задание <b>{deleteTaskTarget?.title}</b> будет удалено навсегда.
          </CustomText>
          <Div style={{ display: 'flex', gap: 8 }}>
            <Button mode="destructive" stretched onClick={deleteTask}>
              Удалить
            </Button>
            <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>
              Отмена
            </Button>
          </Div>
        </ModalCard>
      </ModalRoot>
      <Panel id={id}>
        <Div style={{ height: 32, backgroundColor: '#ffffff' }} />
        {/* Кастомный хедер */}
        <Div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                backgroundColor: '#ceaeff',
                display: 'flex',
                alignItems: 'center',
                padding: '0 16px',
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
                    color: '#ffffff',
                }}
            >
                Назад
            </Button>

            {/* Баланс-капсула */}
            <div
                onClick={() => {}}
                style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '2px 18px 2px 2px',
                    backgroundColor: '#f2f2f2',
                    borderRadius: 999,
                    cursor: 'pointer',
                }}
            >
                <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                <CustomText
                    weight="3"
                    style={{
                        fontSize: 14,
                        color: '#8c64d7',
                        lineHeight: '18px',
                    }}
                >
                    {balance}
                </CustomText>
            </div>
        </Div>
        <Div style={{ paddingTop: 56, padding: 16, backgroundColor: '#ffffff', minHeight: '100vh' }}>
          <CustomText weight="2" style={{ fontSize: 20, color: '#8c64d7' }}>Админка заданий</CustomText>
            <Button
              size="l"
              mode="primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                setTitle('');
                setQuestion('');
                setReward('');
                setExpiresAt('');
                setRequireFile(false);
                setActiveModal('createTask');
              }}
            >
              ➕ Добавить задание
            </Button>
            {tasks.length === 0 ? (
              <CustomText style={{ marginTop: 16, color: '#999' }}>
                Заданий пока нет
              </CustomText>
            ) : (
              tasks.map(task => (
                <Div
                  key={task.id}
                  style={{
                    position: 'relative',
                    marginTop: 12,
                    padding: 16,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 12,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                  }}
                  onClick={async () => {
                    setActiveTask(task);
                    setActiveModal('task');

                    const res = await fetch(
                      `http://localhost:3001/api/admin/tasks/${task.id}/answers?userId=${user.id}`
                    );
                    const data = await res.json();
                    setAnswers(data);
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 50,
                      padding: '4px 10px',
                      borderRadius: 999,
                      backgroundColor:
                        getTimeLeft(task.expires_at) === 'Истекло'
                          ? '#fdecea'
                          : task.expires_at
                          ? '#ede7ff'
                          : '#e0e0e0',
                      color:
                        getTimeLeft(task.expires_at) === 'Истекло'
                          ? '#d32f2f'
                          : '#8c64d7',
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getTimeLeft(task.expires_at)}
                  </div>

                  <div
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      minWidth: 22,
                      height: 22,
                      padding: '0 6px',
                      backgroundColor: '#f44336',
                      color: '#fff',
                      borderRadius: 999,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 600,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {task.pendingCount}
                  </div>

                  <CustomText weight="medium" style={{ fontSize: 16, color: '#8c64d7' }}>
                    {task.title} {task.require_file ? '📎' : ''}
                  </CustomText>
                  <CustomText weight="medium" style={{ fontSize: 12, color: '#8c64d7', whiteSpace: 'pre-line' }}>{task.question}</CustomText>
                  <CustomText style={{ fontSize: 14, color: '#666', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} /> {task.reward}
                  </CustomText>

                  <Button
                    mode="tertiary"
                    size="s"
                    style={{  }}
                    onClick={(e) => {
                      e.stopPropagation(); // чтобы не открывалась модалка просмотра ответов
                      setEditTask(task);
                      setActiveModal('editTask');
                    }}
                  >
                    ✏️ Редактировать
                  </Button>

                  <Button
                    mode="tertiary"
                    size="s"
                    style={{  }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTaskTarget(task);
                      setActiveModal('deleteTask');
                    }}
                  >
                    🗑️ Удалить
                  </Button>
                </Div>
              ))
            )}
        </Div>
      </Panel>
    </>
  );
}
