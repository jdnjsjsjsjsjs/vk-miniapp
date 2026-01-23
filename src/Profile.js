import { Panel, Div, Text, Button, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack, 
  Icon28CoinsOutline,
  Icon28GiftOutline,
  Icon28CupOutline,
  Icon28CrownOutline,
  Icon28LockOutline } from '@vkontakte/icons';

export default function Profile({ id, goBack, user, balance, totalEarned, goToBalance }) {
  const achievements = [
    {
      id: 1,
      title: 'Первый вход',
      icon: <Icon28GiftOutline />,
      unlocked: true,
    },
    {
      id: 2,
      title: '10 очков',
      icon: <Icon28CoinsOutline />,
      unlocked: totalEarned >= 10,
    },
    {
      id: 3,
      title: '100 очков',
      icon: <Icon28CupOutline />,
      unlocked: totalEarned >= 100,
    },
    {
      id: 4,
      title: '1000 очков',
      icon: <Icon28CrownOutline />,
      unlocked: totalEarned >= 1000,
    },
  ];

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
            <Text
              weight="3"
              style={{
                marginBottom: 12,
                fontSize: 16,
                color: '#311f68',
                textAlign: 'center',
                paddingTop: '25px',
                paddingBottom: '12px',
              }}
            >
              Достижения
            </Text>

            <Div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '20px',
                padding: 0,
              }}
            >
              {achievements.map((ach) => (
                <Card
                  key={ach.id}
                  mode="shadow"
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 12,
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                  }}
                >
                  <Div
                    style={{
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      filter: ach.unlocked ? 'none' : 'blur(1px)',
                      opacity: ach.unlocked ? 1 : 0.5,
                      transition: '0.2s ease',
                    }}
                  >
                    <div style={{ color: '#311f68' }}>
                      {ach.icon}
                    </div>

                    <Text
                      style={{
                        marginTop: 6,
                        fontSize: 18,
                        color: '#311f68',
                        textAlign: 'center',
                        lineHeight: '20px',
                      }}
                    >
                      {ach.title}
                    </Text>
                  </Div>

                  {!ach.unlocked && (
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        borderRadius: 12,
                        zIndex: 2,
                      }}
                    >
                      <Icon28LockOutline width={50} height={50} color="#311f68" />
                    </div>
                  )}
                </Card>
              ))}
            </Div>
        </Div>
      </Div>
    </Panel>
  );
}
