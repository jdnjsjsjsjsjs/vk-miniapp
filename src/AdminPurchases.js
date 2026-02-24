import { useEffect, useState } from 'react';
import { Div, Button } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';

export default function AdminPurchases({ user, goBack }) {
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
    <Div>
      <Button onClick={goBack} style={{ marginBottom: 12 }}>
        Назад
      </Button>

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
  );
}