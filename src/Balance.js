import { Panel, Div, Text, Button } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28CoinsOutline } from '@vkontakte/icons';

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
        {/* Назад */}
        <div
          onClick={goBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            marginRight: 12,
          }}
        >
          <Icon28ChevronBack color="#311f68" />
        </div>

        <Text weight="3" style={{ fontSize: 16, color: '#311f68' }}>
          Баланс
        </Text>
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
          <Icon28CoinsOutline width={40} height={40} color="#311f68" />

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