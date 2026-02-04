import { Panel, Div, Text, Button } from '@vkontakte/vkui';
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
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          zIndex: 1000,
          boxShadow: '0 15px 15px rgba(0,0,0,0.08)',
          borderBottom: '1px solid #bdbdbd',
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
            color: '#311f68',
          }}
        >
          Назад
        </Button>
      </Div>

      {/* Контент */}
      <Div
        style={{
          padding: '16px',
          backgroundColor: '#ffffff',
          minHeight: 'calc(100vh - 56px)',
          boxSizing: 'border-box',
        }}
      >
        {/* Карточка баланса */}
        <Div
          style={{
            borderRadius: 16,
            padding: '24px',
            backgroundColor: '#f5f3ff',
            textAlign: 'center',
          }}
        >
          <img src={coinsIcon} alt="coins" style={{ height: 80, width: 80 }} />

          <Text
            weight="3"
            style={{
              marginTop: 8,
              fontSize: 16,
              color: '#6d6d6d',
              paddingBottom: '15px',
            }}
          >
            Ваш баланс
          </Text>

          <Text
            weight="3"
            style={{
              marginTop: 4,
              fontSize: 32,
              color: '#4000ff',
            }}
          >
            {balance}
          </Text>
        </Div>

        {/* Кнопка */}
        <Button
          size="l"
          stretched
          style={{ marginTop: 20 }}
          onClick={goToTasks}
        >
          Перейти к заданиям
        </Button>
      </Div>
    </Panel>
  );
}