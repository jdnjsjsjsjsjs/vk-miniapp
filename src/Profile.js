import { Panel, Div, Text } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';

export default function Profile({ id, goBack, user }) {
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

        {/* Заголовок */}
        <Text weight="3" style={{ fontSize: 16, color: '#311f68' }}>
            Профиль
        </Text>
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
