import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png'

export default function AdminTasks({ id, user, goBack }) {
  return (
    <>
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
        </Div>
      </Panel>
    </>
  );
}
