import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon28ChevronRightOutline } from '@vkontakte/icons';

export default function Profile({ id, goBack, user, balance, goToPurchases, goToGuide, goToAchievements, goToBalance, goToTasks, goToAdminPurchases, goToAdminShop }) {
  const isAdmin = user?.role === 'admin';

  return (
    <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>

      {/* HEADER */}
      <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />

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
          style={{ color: '#ceaeff' }}
        >
          Назад
        </Button>
      </Div>

      <Div style={{ backgroundColor: '#ceaeff' }}>
        {/* ПРОФИЛЬ КАРТОЧКА */}
        <Card mode="shadow" style={{ marginBottom: 16, borderRadius: 10, padding: 0 }}>
          <Div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>

            {/* Аватар */}
            <Div
              style={{
                width: 80,
                height: 80,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {user?.photo_200 && (
                <img
                  src={user.photo_200}
                  alt=""
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                  }}
                />
              )}
            </Div>

            {/* Инфа */}
            <Div style={{ padding: 4 }}>
              <div>
                <CustomText weight="1" style={{ fontSize: 15, lineHeight: 1 }}>
                  {user?.first_name}
                </CustomText>

                <CustomText weight="1" style={{ fontSize: 15, marginBottom: 5 }}>
                  {user?.last_name}
                </CustomText>
              </div>

              {!isAdmin && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'flex',
                    }}
                  >
                    {/* Баланс */}
                    <div style={{ padding: 0 }}>
                      <CustomText weight="1" style={{ fontSize: 9 }}>
                        Баланс капиталов
                      </CustomText>
                      <CustomText weight="1" style={{ fontSize: 26, color: '#8c64d7', fontWeight: 1000 }} onClick={goToBalance} >
                        {balance}
                      </CustomText>
                    </div>

                    {/* Достижения */}
                    <div style={{ padding: 0, marginLeft: 15 }}>
                      <CustomText weight="1" style={{ fontSize: 9 }}>
                        Достижения
                      </CustomText>
                      <CustomText weight="1"  style={{ fontSize: 26, color: '#8c64d7', fontWeight: 1000 }} onClick={goToAchievements} >
                        {user?.achievementCount}
                      </CustomText>
                    </div>
                  </div>
                </>
              )}
            </Div>
          </Div>
        </Card>

        {isAdmin && (
          <Card mode="shadow" style={{ marginBottom: 16, borderRadius: 10, padding: 10 }}>
            {['Выдача артефактов', 'Задания', 'Магазин артефактов'].map((item, index) => {
              let handleClick;
              if (item === 'Выдача артефактов') handleClick = goToAdminPurchases;
              else if (item === 'Задания') handleClick = goToTasks;
              else if (item === 'Магазин артефактов') handleClick = goToAdminShop;

              return (
                <div
                  key={index}
                  onClick={handleClick}
                  style={{
                    marginTop: 5,
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 999,
                    padding: '2px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: '1px solid #f2f2f2'
                  }}
                >
                  <CustomText style={{ color: '#000', fontSize: 10, marginLeft: 10 }}>{item}</CustomText>
                  <Icon28ChevronRightOutline style={{ color: '#ceaeff', width: 22, height: 22 }} />
                </div>
              );
            })}
          </Card>
        )}

        {!isAdmin && (
          <Card mode="shadow" style={{ marginBottom: 16, borderRadius: 10, padding: 10 }}>
            {['Купленные артефакты', 'Справочник', 'Сообщество ВКонтакте'].map((item, index) => {
              let handleClick;
              if (item === 'Купленные артефакты') handleClick = goToPurchases;
              else if (item === 'Справочник') handleClick = goToGuide;
              else if (item === 'Сообщество ВКонтакте') handleClick = () => window.open('https://vk.com/', '_blank');

              return (
                <div
                  key={index}
                  onClick={handleClick}
                  style={{
                    marginTop: 5,
                    width: '100%',
                    backgroundColor: '#fff',
                    borderRadius: 999,
                    padding: '2px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    border: '1px solid #f2f2f2'
                  }}
                >
                  <CustomText style={{ color: '#000', fontSize: 10, marginLeft: 10 }}>{item}</CustomText>
                  <Icon28ChevronRightOutline style={{ color: '#ceaeff', width: 22, height: 22 }} />
                </div>
              );
            })}
          </Card>
        )}
      </Div>
    </Panel>
  );
}