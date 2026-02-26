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

  const markReceived = async (orderId) => {
    try {
      // Отмечаем заказ полученным на сервере
      await fetch('http://localhost:3001/api/admin/purchases/mark-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, orderId }),
      });

      // Обновляем локальный стейт — все позиции заказа получают received = 1
      setPurchases(prev =>
        prev.map(p =>
          p.order_id === orderId ? { ...p, received: 1 } : p
        )
      );
    } catch (err) {
      console.error('Ошибка при отметке "Получено":', err);
    }
  };

  const groupedByOrder = {};
    purchases.forEach(p => {
      if (!groupedByOrder[p.order_id]) {
        groupedByOrder[p.order_id] = { 
          items: [p], 
          received: p.received, 
          purchasedAt: p.purchased_at // сохраняем дату
        };
      } else {
        groupedByOrder[p.order_id].items.push(p);
      }
    });

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
        {Object.values(groupedByOrder).map(group => (
          <Div key={group.items[0].order_id} style={{ borderBottom: '1px solid #eee', marginBottom: 12, paddingBottom: 8 }}>
            
            {/* ID и время заказа */}
            <CustomText weight="3">
              <strong>Заказ ID:</strong> {group.items[0].order_id}
            </CustomText>
            <CustomText weight="2" style={{ fontSize: 12, color: '#666', marginBottom: 6 }}>
              <strong>Время заказа:</strong> {new Date(group.purchasedAt).toLocaleString()}
            </CustomText>

            {group.items.map(p => (
              <CustomText key={p.item_id} style={{ marginLeft: 8 }}>
                {p.first_name} {p.last_name} — {p.title}
              </CustomText>
            ))}

            {!group.items.every(item => item.received) ? (
              <Button
                size="s"
                style={{ marginTop: 6 }}
                onClick={() => markReceived(group.items[0].order_id)}
              >
                Получено
              </Button>
            ) : (
              <CustomText style={{ color: 'green', marginTop: 6 }}>✔ Выдано</CustomText>
            )}
          </Div>
        ))}
      </Div>
    </Panel>
  );
}