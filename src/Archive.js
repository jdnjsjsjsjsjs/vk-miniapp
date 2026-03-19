import { useEffect, useState } from 'react';
import { Panel, Div, Card, Button } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png';
import coinIcon from './imgs/coin.png';

export default function ArchiveTasks({ id, goBack, user }) {
  const [tasks, setTasks] = useState([]);

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

  function getExpiredLabel(date) {
    if (!date) return '';

    const d = new Date(date);
    return `истекло ${d.getDate()}.${d.getMonth() + 1}`;
  }

  return (
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
  );
}