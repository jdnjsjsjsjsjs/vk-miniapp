import { useEffect, useState } from 'react';
import {
  Panel,
  Div,
  Card,
  Button,
  ModalRoot,
  ModalCard
} from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Cancel } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png'

export default function AdminAnswersFeed({ id, user, goBack }) {
  const [answers, setAnswers] = useState([]);
  const [activeModal, setActiveModal] = useState(null);
  const [activeAnswer, setActiveAnswer] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [comment, setComment] = useState('');
  const [actionMode, setActionMode] = useState(null); 

  const inputStyle = `
    .search-input::placeholder {
      color: #ceaeff;
      opacity: 1;
    }
  `;

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
          action,
          comment: action === 'reject' ? comment : null
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
    setComment('');
    setActionMode(null);
    setConfirmAction(null);
  }

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

        {/* Просмотр и принятие ответа пользователя */}
        <ModalCard
          id="answerInfo"
          onClose={() => {
            setActiveModal(null);
            setActiveAnswer(null);
          }}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />

          {/* ID и имя пользователя */}
          <CustomText
            weight="1"
            style={{ fontSize: 16, color: '#000', marginBottom: 5 }}
          >
            ID{activeAnswer?.user_id} - {activeAnswer?.first_name} {activeAnswer?.last_name}
          </CustomText>

          {/* Задание */}
          <CustomText
            style={{
              fontSize: 10,
              color: '#8c64d7',
              lineHeight: 1
            }}
          >
            <span style={{ fontWeight: 600 }}>Задание:</span> {activeAnswer?.task_title}
          </CustomText>

          {/* Дата выполнения */}
          <CustomText
            style={{
              fontSize: 10,
              color: '#8c64d7',
              lineHeight: 1,
              marginTop: 5, 
              marginBottom: 20
            }}
          >
            <span style={{ fontWeight: 600 }}>Выполнено:</span> {formatDate(activeAnswer?.created_at)}
          </CustomText>

          {/* Файл(ы) */}
          {activeAnswer?.file_path && (
            <div style={{ marginBottom: 12 }}>
              <CustomText style={{ fontWeight: 600, fontSize: 10, lineHeight: 1 }}>Файл:</CustomText>
              {Array.isArray(activeAnswer.file_path)
                ? activeAnswer.file_path.map((f, i) => (
                    <a
                      key={i}
                      href={`http://localhost:3001${f}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', marginBottom: 2, color: '#8c64d7', fontSize: 10 }}
                    >
                      {f.split('/').pop()}
                    </a>
                  ))
                : (
                  <a
                    href={`http://localhost:3001${activeAnswer.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'block', marginBottom: 2, color: '#8c64d7', fontSize: 10 }}
                  >
                    {activeAnswer.file_path.split('/').pop()}
                  </a>
                )}
            </div>
          )}

          {/* Сообщение пользователя */}
          <div>
            <CustomText style={{ fontWeight: 600, fontSize: 10, lineHeight: 1 }}>Текстовое сообщение:</CustomText>
            <CustomText
              style={{
                fontSize: 10,
                color: '#8c64d7',
                lineHeight: 1,
                whiteSpace: 'pre-wrap',
                marginTop: 5,
                marginLeft: 2
              }}
            >
              {activeAnswer?.answer}
            </CustomText>
          </div>

          {actionMode === 'reject' && (
            <div style={{ marginTop: 12 }}>
              <CustomText style={{ fontSize: 10, fontWeight: 600 }}>
                Комментарий:
              </CustomText>

              <textarea
                placeholder="напишите комментарий..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="search-input"
                style={{
                  width: '92%',
                  minHeight: '72px',
                  borderRadius: 12,
                  border: '1px solid #ceaeff',
                  padding: '6px 12px',
                  outline: 'none',
                  fontSize: 12,
                  color: '#000',
                  resize: 'none'
                }}
              />
            </div>
          )}

          {/* Кнопка принять */}
          {activeAnswer?.status === 'pending' && (
            <div
              onClick={() => {
                if (actionMode === 'reject' && !comment.trim()) {
                  alert('Введите комментарий');
                  return;
                }

                setConfirmAction(actionMode);
                setActiveModal('confirm');
              }}
              style={{
                width: '100%',
                backgroundColor: '#8c64d7',
                borderRadius: 999,
                padding: '1px 0',
                textAlign: 'center',
                cursor: 'pointer',
                marginTop: 16,
                opacity:
                  actionMode === 'reject' && !comment.trim() ? 0.5 : 1
              }}
            >
              <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                {actionMode === 'reject' ? 'отклонить' : 'принять'}
              </CustomText>
            </div>
          )}
        </ModalCard>

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
          onClose={() => {
            setActiveModal('answerInfo');
            setConfirmAction(null);
          }}
        >
          <ModalCloseButton onClick={() => setActiveModal(null)} />
          <CustomText weight="1" style={{ marginBottom: 20 }}>
            {confirmAction === 'accept'
              ? 'Подтвердить принятие'
              : 'Подтвердить отклонение'}
          </CustomText>

          <div style={{ display: 'flex', gap: 6 }}>
            {/* Кнопка Подтвердить */}
            <div
              onClick={() => {
                if (confirmAction === 'reject' && !comment.trim()) {
                  alert('Введите комментарий');
                  return;
                }

                handleAnswer(confirmAction);
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
                подтвердить
              </CustomText>
            </div>

            {/* Кнопка Отмена */}
            <div
              onClick={() => setActiveModal('answerInfo')}
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
            answers
              .filter(a => a.status !== 'accepted') 
              .map(a => (
              <Card
                key={a.id}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  backgroundColor: '#fff',
                  border: '1px solid #ceaeff',
                  position: 'relative'
                }}
              >
                {a.status === 'rejected' && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#ff3b30'
                  }} />
                )}

                {a.status === 'pending' && Boolean(a.was_rejected) && (
                  <div style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#34c759' 
                  }} />
                )}
                <CustomText style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 600 }}>ID{a.user_id}</span> — {a.first_name} {a.last_name}
                </CustomText>

                <CustomText style={{ marginTop: 4, fontSize: 12, color: '#8c64d7', lineHeight: 1 }}>
                    <span style={{ fontWeight: 600 }}>Задание:</span> {a.task_title}
                </CustomText>

                <CustomText style={{ fontSize: 12, color: '#8c64d7' }}>
                  <span style={{ fontWeight: 600 }}>Выполнено:</span> {formatDate(a.created_at)}
                </CustomText>

                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  {a.status === 'pending' ? (
                    <>
                      <div
                        onClick={() => {
                          setActiveAnswer(a);
                          setActionMode('accept');
                          setActiveModal('answerInfo');
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
                          принять
                        </CustomText>
                      </div>

                      <div
                        onClick={() => {
                          setActiveAnswer(a);
                          setActionMode('reject');
                          setComment('');
                          setActiveModal('answerInfo');
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
                          отклонить
                        </CustomText>
                      </div>
                    </>
                  ) : a.status === 'rejected' ? (
                    null
                  ) : null}
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