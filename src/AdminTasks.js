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

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:3001/api/admin/tasks/${user.id}`)
      .then(res => res.json())
      .then(setTasks)
      .catch(err => console.error('Ошибка загрузки админ-заданий', err));
  }, [user]);

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
              onClick={() => {
                // пока без логики
                console.log({
                  title,
                  question,
                  reward,
                  expiresAt
                });

                setActiveModal(null);
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
