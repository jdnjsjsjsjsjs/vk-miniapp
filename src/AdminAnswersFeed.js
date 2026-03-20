import { useEffect, useState } from 'react';
import {
  Panel,
  Div,
  Card,
  Button,
  ModalRoot,
  ModalCard
} from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png'

export default function AdminAnswersFeed({ id, user, goBack }) {
  const [answers, setAnswers] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    fetch(`http://localhost:3001/api/admin/answers-feed?userId=${user.id}`)
      .then(res => res.json())
      .then(setAnswers)
      .catch(err => console.error('Ошибка загрузки ответов', err));
  }, [user]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString('ru-RU', {
      timeZone: 'Europe/Moscow'
    });
  };

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

    // обновляем список
    const res = await fetch(
      `http://localhost:3001/api/admin/answers-feed?userId=${user.id}`
    );
    const data = await res.json();
    setAnswers(data);

    setActiveModal(null);
    setActiveAnswer(null);
  }

  return (
    <>
      <ModalRoot activeModal={activeModal}>

        {/* Просмотр ответа */}
        <ModalCard
          id="answer"
          onClose={() => setActiveModal(null)}
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

        {/* Подтверждение */}
        <ModalCard
          id="confirm"
          onClose={() => setActiveModal('answer')}
          actions={
            <Div style={{ display: 'flex', gap: 8 }}>
              <Button
                mode={confirmAction === 'accept' ? 'primary' : 'destructive'}
                onClick={() => handleAnswer(confirmAction)}
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
          <CustomText weight="2">
            {confirmAction === 'accept'
              ? 'Подтвердить принятие'
              : 'Подтвердить отклонение'}
          </CustomText>
        </ModalCard>

      </ModalRoot>

      <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>
        <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />
        {/* Header */}
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
            zIndex: 1000
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
                color: '#ceaeff' 
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
                    Выполненные задания
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
          {answers.length === 0 ? (
            <CustomText style={{ color: '#999' }}>
              Ответов пока нет
            </CustomText>
          ) : (
            answers.map(a => (
              <Card
                key={a.id}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  backgroundColor: '#fff',
                  border: '1px solid #ceaeff'
                }}
              >
                <CustomText weight="2">
                  ID{a.user_id} — {a.first_name} {a.last_name}
                </CustomText>

                <CustomText style={{ marginTop: 6 }}>
                  Задание: {a.task_title}
                </CustomText>

                <CustomText style={{ marginTop: 4, color: '#666' }}>
                  Выполнено: {formatDate(a.created_at)}
                </CustomText>

                <Div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <Button
                    mode="primary"
                    size="s"
                    disabled={a.status !== 'pending'}
                    onClick={() => {
                      setActiveAnswer(a);
                      setConfirmAction('accept');
                      setActiveModal('confirm');
                    }}
                  >
                    Принять
                  </Button>

                  <Button
                    mode="destructive"
                    size="s"
                    disabled={a.status !== 'pending'}
                    onClick={() => {
                      setActiveAnswer(a);
                      setConfirmAction('reject');
                      setActiveModal('confirm');
                    }}
                  >
                    Отклонить
                  </Button>

                  <Button
                    mode="secondary"
                    size="s"
                    onClick={() => {
                      setActiveAnswer(a);
                      setActiveModal('answer');
                    }}
                  >
                    Открыть
                  </Button>
                </Div>
              </Card>
            ))
          )}
        </Card>
        </Div>
      </Panel>
    </>
  );
}