import { useEffect, useState } from 'react';
import { Div, Button, Panel } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import coinIcon from './imgs/coin.png'

export default function AdminPurchases({ id, goBack, user, balance }) {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:3001/api/admin/purchases?userId=${user.id}`)
      .then(res => res.json())
      .then(setPurchases);
  }, [user.id]);

  const markReceived = async (targetUserId, itemId) => {
    await fetch('http://localhost:3001/api/admin/purchases/mark-received', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        targetUserId,
        itemId,
      }),
    });

    setPurchases(prev =>
      prev.map(p =>
        p.user_id === targetUserId && p.item_id === itemId
          ? { ...p, received: 1 }
          : p
      )
    );
  };

  return (
    <Panel id={id}>
      <Div style={{ height: 32, backgroundColor: '#ffffff' }} />
          <Div
              style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 56,
                  backgroundColor: '#ceaeff',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 16px',
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
                      color: '#ffffff',
                  }}
              >
                  Назад
              </Button>

              {/* Баланс-капсула */}
              <div
                  onClick={() => {}}
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
                      weight="3"
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

      <Div>
        {purchases.map(p => (
          <Div key={`${p.user_id}-${p.item_id}`} style={{ marginBottom: 12 }}>
            <CustomText>
              {p.first_name} {p.last_name} — {p.title} ({p.quantity})
            </CustomText>

            {!p.received ? (
              <Button
                size="s"
                style={{ marginTop: 6 }}
                onClick={() => markReceived(p.user_id, p.item_id)}
              >
                Получено
              </Button>
            ) : (
              <CustomText style={{ color: 'green', marginTop: 6 }}>
                ✔ Выдано
              </CustomText>
            )}
          </Div>
        ))}
      </Div>
    </Panel>
  );
}