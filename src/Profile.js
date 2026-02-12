import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinsIcon from './imgs/coins.png'
import coinIcon from './imgs/coin.png'
import box1icon from './imgs/box1.png'
import cupsIcon from './imgs/cups.png'
import awardsIcon from './imgs/awards.png'
import lockIcon from './imgs/lock.png'

export default function Profile({ id, goBack, user, balance, totalEarned, goToBalance }) {
  const achievements = [
    {
      id: 1,
      title: 'Первый вход',
      icon: <img src={box1icon} alt="box1" style={{ height: 80, width: 80 }} />,
      unlocked: true,
    },
    {
      id: 2,
      title: '10 очков',
      icon: <img src={coinsIcon} alt="coins" style={{ height: 80, width: 80 }} />,
      unlocked: totalEarned >= 10,
    },
    {
      id: 3,
      title: '100 очков',
      icon: <img src={cupsIcon} alt="cups" style={{ height: 80, width: 80 }} />,
      unlocked: totalEarned >= 100,
    },
    {
      id: 4,
      title: '1000 очков',
      icon: <img src={awardsIcon} alt="awards" style={{ height: 80, width: 80 }} />,
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

      {/* Баланс-капсула */}
      <div
        onClick={goToBalance}
        style={{
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '2px 18px 2px 2px',
          backgroundColor: '#f2f2f2',
          borderRadius: 999,
          cursor: 'pointer',
        }}
      >
        <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
        <CustomText
          weight="1"
          style={{
            fontSize: 14,
            color: '#8c64d7',
            lineHeight: '18px',
          }}
        >
          {balance}
        </CustomText>
      </div>
    </Div>

      <Div style={{ paddingTop: '20px', textAlign: 'center', backgroundColor: '#ceaeff', minHeight: '100vh', }}>
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

        <CustomText weight="1" style={{ fontSize: 18, color: '#000' }}>
          {user?.first_name} {user?.last_name}
        </CustomText>

        <Div 
            style={{
                backgroundColor: '#ceaeff',
                color: '#fff',
            }}
        >
            <CustomText
              weight="3"
              style={{
                marginBottom: 12,
                fontSize: 16,
                color: '#000',
                textAlign: 'center',
                paddingBottom: '12px',
              }}
            >
              Достижения
            </CustomText>

            <Div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
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
                    <div>
                      {ach.icon}
                    </div>

                    <CustomText
                      style={{
                        fontSize: 14,
                        color: '#000',
                        textAlign: 'center',
                      }}
                    >
                      {ach.title}
                    </CustomText>
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
                      <img src={lockIcon} alt="lock" style={{ height: 120, width: 120 }} />
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
