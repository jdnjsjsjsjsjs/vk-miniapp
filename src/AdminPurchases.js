import { useEffect, useState } from 'react';
import { Div, Button, Panel, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import shopIcon from './imgs/shop2.png'

export default function AdminPurchases({ id, goToProfile, user, balance }) {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch(`https://ivanovskiystyle.ru/api/admin/purchases?userId=${user.id}`)
      .then(res => res.json())
      .then(setPurchases);
  }, [user.id]);

  const markReceived = async (orderId) => {
    try {
      // Отмечаем заказ полученным на сервере
      await fetch('https://ivanovskiystyle.ru/api/admin/purchases/mark-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, orderId }),
      });

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
      <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />
        {/* Header */}
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
            zIndex: 1000
          }}
        >
          <Button
            mode="tertiary"
            size="l"
            before={<Icon28ChevronBack />}
            onClick={goToProfile}
            style={{ 
                paddingLeft: 0,
                paddingRight: 8,
                marginRight: 4,
                color: '#ceaeff' 
            }}
          >
            Назад
          </Button>
        </Div>

        <Div style={{ padding: '12px', backgroundColor: '#ceaeff' }}>
        
        <Card
            mode="shadow"
            style={{
                borderRadius: 10,
                padding: '20px 15px',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: '#ffffff',
                marginBottom: 15,
                position: 'relative'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CustomText
                    weight="1"
                    style={{
                        fontSize: 16,
                        color: '#000',
                    }}
                >
                    Выдача артефактов (админка)
                </CustomText>
            </div>
            <img
                src={shopIcon}
                alt="tasks"
                style={{
                    width: 75,
                    height: 75,
                    objectFit: 'contain',
                    position: 'absolute',
                    right: -5,
                }}
            />
        </Card>

        <Card
          mode="shadow"
          style={{
            borderRadius: 10,
            padding: '12px',
            backgroundColor: '#ffffff',
          }}
        >
          {Object.values(groupedByOrder).map(group => {
            const totalPrice = group.items.reduce((sum, item) => sum + item.price, 0);
            const isReceived = group.items.every(item => item.received);
            const groupedItems = Object.values(
              group.items.reduce((acc, item) => {
                if (!acc[item.item_id]) {
                  acc[item.item_id] = {
                    title: item.title,
                    count: 0,
                    price: item.price
                  };
                }
                acc[item.item_id].count += 1;
                return acc;
              }, {})
            );

            return (
              <Card
                key={group.items[0].order_id}
                style={{
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  backgroundColor: '#fff',
                  border: '1px solid #ceaeff',
                }}
              >
                <CustomText style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 800 }}>
                    ID: {group.items[0].order_id}
                  </span> - {group.items[0].first_name} {group.items[0].last_name}
                </CustomText>

                <CustomText style={{ fontSize: 12, color: '#8c64d7', lineHeight: 1 }}>
                  <span style={{ fontWeight: 600 }}>Время заказа:</span> {new Date(group.purchasedAt).toLocaleString()}
                </CustomText>

                <CustomText style={{ fontSize: 12, color: '#8c64d7', lineHeight: 1 }}>
                  <span style={{ fontWeight: 600 }}>Покупка: </span>
                  {groupedItems
                    .map(i => `${i.title} (капиталов - ${i.price}) - ${i.count} шт.`)
                    .join(', ')}
                </CustomText>

                <CustomText style={{ fontSize: 12, color: '#8c64d7', lineHeight: 1 }}>
                  <span style={{ fontWeight: 600 }}>Потрачено капиталов: </span> {totalPrice}
                </CustomText>

                {/* КНОПКА */}
                <div
                  onClick={() => {
                    if (!isReceived) markReceived(group.items[0].order_id);
                  }}
                  style={{
                    marginTop: 10,
                    flex: 1,
                    borderRadius: 999,
                    padding: '1px 0',
                    textAlign: 'center',
                    cursor: isReceived ? 'default' : 'pointer',

                    backgroundColor: isReceived ? '#fff' : '#8c64d7',
                    border: isReceived ? '1px solid #8c64d7' : 'none',
                  }}
                >
                  <CustomText
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      color: isReceived ? '#8c64d7' : '#fff',
                    }}
                  >
                    {isReceived ? 'выдано' : 'выдать'}
                  </CustomText>
                </div>
              </Card>
            );
          })}
        </Card>
      </Div>
    </Panel>
  );
}