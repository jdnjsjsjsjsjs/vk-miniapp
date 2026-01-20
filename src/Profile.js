import { Panel, Div, Text, Button } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28CoinsOutline } from '@vkontakte/icons';

export default function Profile({ id, goBack, user, balance, goToBalance }) {
  return (
    <Panel id={id}>
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

      {/* Баланс-капсула */}
      <div
        onClick={goToBalance}
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 12px',
          backgroundColor: '#f2f2f2',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        <Icon28CoinsOutline width={20} height={20} color="#311f68" />
        <Text
          weight="3"
          style={{
            fontSize: 14,
            color: '#4000ff',
            lineHeight: '18px',
          }}
        >
          {balance}
        </Text>
      </div>
    </Div>

      <Div style={{ paddingTop: '20px', textAlign: 'center', backgroundColor: '#ffffff' }}>
        {user?.photo_200 && (
          <img
            src={user.photo_200}
            alt="avatar"
            style={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: 12,
            }}
          />
        )}

        <Text weight="3" style={{ fontSize: 18, color: '#311f68' }}>
          {user?.first_name} {user?.last_name}
        </Text>

        <Div 
            style={{
                backgroundColor: '#ffffff',
                minHeight: '100vh',
                color: '#fff',
            }}
        >
            {/* Контент будет здесь */}
        </Div>
      </Div>
    </Panel>
  );
}
