// AdminTasks.js
import { useState, useEffect } from 'react';
import { Panel, Div, Text, Button, ModalRoot, ModalCard, Input, Textarea } from '@vkontakte/vkui';

export default function AdminTasks({ id, goBack, user }) {
  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [reward, setReward] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [activeTask, setActiveTask] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

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
                      expires_at: expiresAt || null
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
        </ModalCard>

        <ModalCard
          id="task"
          onClose={() => {
            setActiveModal(null);
            setActiveTask(null);
            setAnswers([]);
          }}
          header={activeTask?.title}
          subheader={activeTask?.question}
        >
          {answers.length === 0 ? (
            <Text style={{ color: '#999' }}>
              Ответов пока нет
            </Text>
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
                <Text weight="medium">
                  {a.first_name} {a.last_name}
                </Text>
                <Text
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
                </Text>
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
          <Text>{activeAnswer?.answer}</Text>
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
          <Text weight="2" style={{ marginBottom: 8 }}>
            {confirmAction === 'accept'
              ? 'Подтвердить принятие'
              : confirmAction === 'reject'
              ? 'Подтвердить отклонение'
              : ''}
          </Text>
          <Text style={{ color: '#666' }}>
            {confirmAction === 'accept'
              ? 'Пользователю будут начислены баллы'
              : confirmAction === 'reject'
              ? 'Ответ пользователя будет отклонён'
              : ''}
          </Text>
        </ModalCard>
      </ModalRoot>
      <Panel id={id}>
        <Div style={{ height: 32, backgroundColor: '#ffffff' }} />
        <Div style={{ paddingTop: 56, padding: 16 }}>
          <Text weight="2" style={{ fontSize: 20 }}>Админка заданий</Text>
            <Button
              size="m"
              mode="primary"
              style={{ marginTop: 12 }}
              onClick={() => {
                setTitle('');
                setQuestion('');
                setReward('');
                setExpiresAt('');
                setActiveModal('createTask');
              }}
            >
              ➕ Добавить задание
            </Button>
            {tasks.length === 0 ? (
              <Text style={{ marginTop: 16, color: '#999' }}>
                Заданий пока нет
              </Text>
            ) : (
              tasks.map(task => (
                <Div
                  key={task.id}
                  style={{
                    marginTop: 12,
                    padding: 12,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 12,
                    cursor: 'pointer'
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
                  <Text weight="medium">{task.title}</Text>
                  <Text style={{ fontSize: 13, color: '#666' }}>
                    Награда: {task.reward}
                  </Text>
                </Div>
              ))
            )}
        </Div>
      </Panel>
    </>
  );
}
