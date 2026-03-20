import { useEffect, useState } from 'react';
import { Panel, Div, Card, Button, ModalRoot, ModalCard, Input, Textarea, Checkbox } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Cancel } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png';
import coinIcon from './imgs/coin.png';

export default function ArchiveTasks({ id, goBack, user }) {
  const [tasks, setTasks] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [restoreTask, setRestoreTask] = useState(null);
  const [newExpires, setNewExpires] = useState('');

  function getMoscowTime() {
    return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }));
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
    if (!newExpires) return alert('Выберите дату восстановления');

    try {
      const expiresDate = new Date(newExpires);
      const expiresISOString = expiresDate.toISOString();
      
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

      // Удаляем задание из списка локально
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
        {/* Редактирование */}
        <ModalCard
          id="editTask"
          header="Редактировать задание"
          onClose={() => { setEditTask(null); setActiveModal(null); }}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          <Input
            placeholder="Название"
            value={editTask?.title || ''}
            onChange={e => setEditTask({ ...editTask, title: e.target.value })}
            style={{ marginBottom: 12, marginTop: 27 }}
          />
          <Textarea
            placeholder={`Условие задания\n[answer] — поле ответа\n[file] — загрузка файла`}
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
            onChange={e => setEditTask({ ...editTask, require_file: e.target.checked ? 1 : 0 })}
            style={{ marginTop: 12 }}
          >
            Требуется загрузка файла
          </Checkbox>
          <Checkbox
            checked={!!editTask?.archive}
            onChange={e => setEditTask({ ...editTask, archive: e.target.checked ? 1 : 0 })}
            style={{ marginTop: 12 }}
          >
            Архивировать
          </Checkbox>
          <Div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button mode="primary" stretched onClick={saveEditTask}>Сохранить</Button>
            <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>Отмена</Button>
          </Div>
        </ModalCard>

        {/* Восстановление */}
        <ModalCard
          id="restoreTask"
          header="Восстановить задание"
          onClose={() => setActiveModal(null)}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          <CustomText style={{ marginBottom: 12, marginTop: 27 }}>Выберите новый срок выполнения:</CustomText>
          <Input
            type="datetime-local"
            value={newExpires}
            onChange={e => setNewExpires(e.target.value)}
          />
          <Div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button mode="primary" stretched onClick={restoreTaskDeadline}>Восстановить</Button>
            <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>Отмена</Button>
          </Div>
        </ModalCard>
      </ModalRoot>
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
                >
                  <CustomText weight="2" style={{ fontSize: 10, color: '#000' }}>
                    {task.title} {task.require_file ? '📎' : ''}
                  </CustomText>

                  <CustomText style={{ fontSize: 16, color: '#8c64d7', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 1000 }}>
                    {task.reward}
                    <img alt="" src={coinIcon} style={{ height: 25, width: 25 }} />
                  </CustomText>

                  {/* КНОПКИ */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    
                    {/* РЕДАКТИРОВАТЬ */}
                    <div
                      onClick={() => { setEditTask(task); setActiveModal('editTask'); }}
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
                      onClick={() => { setRestoreTask(task); setNewExpires(''); setActiveModal('restoreTask'); }}
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