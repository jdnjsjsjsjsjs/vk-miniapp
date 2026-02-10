import { Panel, Div, Text, Button, Card} from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinsIcon from './imgs/coins.png'

export default function Balance({ id, goBack, balance, goToTasks }) {
  return (
    <Panel id={id}>
      {/* Отступ под фикс-хедер */}
      <Div style={{ height: 32, backgroundColor: '#ffffff' }} />

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

      {/* Контент */}
      <Div
        style={{
          padding: '16px',
          backgroundColor: '#ceaeff',
          minHeight: 'calc(100vh - 56px)',
          boxSizing: 'border-box',
        }}
      >
        <Card
          mode="shadow"
          style={{
            borderRadius: 12,
            padding: '16px 16px 26px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}
        >
          <img src={coinsIcon} alt="coins" style={{ height: 80, width: 80 }} />

          <Text
            weight="3"
            style={{
              marginTop: 8,
              fontSize: 16,
              color: '#000',
              paddingBottom: '8px',
            }}
          >
            Ваш баланс
          </Text>

          <Text
            weight="3"
            style={{
              marginTop: 4,
              marginBottom: 20,
              fontSize: 32,
              color: '#000',
            }}
          >
            {balance}
          </Text>

          <div
            onClick={goToTasks}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 20px',
              marginTop: 20,
              backgroundColor: '#8c64d7',
              borderRadius: 999,
              cursor: 'pointer',
            }}
          >
            <Text
              weight="1"
              style={{
                fontSize: 14,
                color: '#fff',
              }}
            >
              Перейти к заданиям
            </Text>
          </div>
        </Card>
      </Div>
    </Panel>
  );
}