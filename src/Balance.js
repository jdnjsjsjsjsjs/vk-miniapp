import { useState, useEffect } from 'react';
import { Panel, Div, Button, Card} from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';
import API_URL from './config';

import coinsIcon from './imgs/coins.png'
import coinicon from './imgs/coin.png'

export default function Balance({ id, goBack, balance, goToTasks, totalEarned, userId, totalSpent }) {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch(`${API_URL}/api/user/${userId}/transactions`);
        const data = await res.json();

        const grouped = data.reduce((acc, tx) => {
          const date = new Date(tx.created_at).toLocaleDateString('ru-RU'); // 17.02.2026
          if (!acc[date]) acc[date] = [];
          acc[date].push(tx);
          return acc;
        }, {});

        setTransactions(grouped);
      } catch (error) {
        console.error('Ошибка загрузки транзакций', error);
      }
    }

    if (userId) {
      fetchTransactions();
    }
  }, [userId]);

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
            alignItems: 'left',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Левый блок: Баланс + кнопка */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <CustomText style={{ fontSize: window.innerWidth < 768 ? 12 : 13, color: '#000', fontWeight: 700 }}>
              Баланс капиталов
            </CustomText>
            <CustomText
              style={{ marginTop: 16, fontSize: 50, color: '#8c64d7', fontWeight: 1000, marginBottom: 14 }}
            >
              {balance}
            </CustomText>

            {/* Кнопка под балансом */}
            <div
              onClick={goToTasks}
              style={{
                marginTop: 12,
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
              <CustomText weight="1" style={{ fontSize: 11, color: '#fff' }}>
                перейти к заданиям
              </CustomText>
            </div>
          </div>

          {/* Правый блок: Заработано + Потрачено */}
          <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', marginLeft: window.innerWidth < 425 ? 20 : window.innerWidth > 500 ? 100 : 60 }}>
            <div>
              <CustomText style={{ fontSize: window.innerWidth < 768 ? 12 : 13, color: '#000', fontWeight: 300 }}>
                Заработано
              </CustomText>
              <CustomText
                weight="3"
                style={{ marginTop: 5, fontSize: 32, color: '#ceaeff', fontWeight: 900 }}
              >
                {totalEarned}
              </CustomText>
            </div>
            <div style={{ marginTop: 14 }}>
              <CustomText style={{ fontSize: window.innerWidth < 768 ? 12 : 13, color: '#000', fontWeight: 300 }}>
                Потрачено
              </CustomText>
              <CustomText
                weight="3"
                style={{ marginTop: 5, fontSize: 32, color: '#ceaeff', fontWeight: 900 }}
              >
                {totalSpent}
              </CustomText>
            </div>
          </div>

          {/* Монетки */}
          <img
            src={coinsIcon}
            alt="coins"
            style={{
              height: 140,
              width: 140,
              position: 'absolute',
              objectFit: 'contain',
              right: -15,
              bottom: 0,
            }}
          />
        </Card>

        <Card
          mode="shadow"
          style={{
            borderRadius: 16,
            padding: '12px',
            backgroundColor: '#ffffff',
            marginTop: 20,
            overflow: 'hidden',
          }}
        >
          <CustomText style={{ fontSize: window.innerWidth < 768 ? 13 : 14, color: '#000', fontWeight: 700, marginBottom: 5 }}>
            История
          </CustomText>

          {Object.keys(transactions).length === 0 ? (
            <CustomText style={{ fontSize: 12, color: '#555' }}>
              Транзакций пока нет
            </CustomText>
          ) : (
            Object.entries(transactions).map(([date, txs]) => (
              <div key={date} style={{ marginBottom: 12 }}>
                <CustomText style={{ fontSize: 9, fontWeight: 300, marginBottom: 2, color: '#555' }}>
                  {date === new Date().toLocaleDateString('ru-RU') ? 'Сегодня' : date}
                </CustomText>
                {txs.map(tx => (
                  <Div
                    key={tx.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '3px 0',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <CustomText style={{ fontSize: 10, color: '#000' }}>
                      {tx.description || 'Транзакция'}
                    </CustomText>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CustomText
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#8c64d7',
                        }}
                      >
                        {tx.type === 'income' ? '+' : '-'}{tx.amount}
                      </CustomText>
                      <img src={coinicon} alt="coin" style={{ width: 23, height: 23 }} />
                    </div>
                  </Div>
                ))}
              </div>
            ))
          )}
        </Card>
      </Div>
    </Panel>
  );
}