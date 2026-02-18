import { Panel, Div, Button, Card} from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import coinsIcon from './imgs/coins.png'

export default function Balance({ id, goBack, balance, goToTasks, totalEarned }) {
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
            borderRadius: 16,
            padding: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              zIndex: 2,
              width: '100%',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <CustomText
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 600,
                  }}
                >
                  Баланс капиталов
                </CustomText>

                <CustomText
                  weight="3"
                  style={{
                    marginTop: 6,
                    fontSize: 32,
                    color: '#8c64d7',
                    fontWeight: 900,
                  }}
                >
                  {balance}
                </CustomText>
              </div>

              <div style={{ textAlign: 'left', marginLeft: 50 }}>
                <CustomText
                  style={{
                    fontSize: 10,
                    color: '#000',
                    fontWeight: 300,
                  }}
                >
                  Заработано
                </CustomText>

                <CustomText
                  weight="3"
                  style={{
                    marginTop: 6,
                    fontSize: 22,
                    color: '#ceaeff',
                    fontWeight: 900,
                  }}
                >
                  {totalEarned}
                </CustomText>
              </div>
            </div>

            <div
              onClick={goToTasks}
              style={{
                marginTop: 15,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '4px 14px',
                backgroundColor: '#8c64d7',
                borderRadius: 999,
                cursor: 'pointer',
                width: 'fit-content',
              }}
            >
              <CustomText
                weight="1"
                style={{
                  fontSize: 10,
                  color: '#fff',
                }}
              >
                Перейти к заданиям
              </CustomText>
            </div>
          </div>

          <img
            src={coinsIcon}
            alt="coins"
            style={{
              height: 140,
              width: 140,
              position: 'absolute',
              objectFit: 'contain',
              right: -15,
              bottom: -15,
            }}
          />
        </Card>
      </Div>
    </Panel>
  );
}