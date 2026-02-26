import { useEffect, useState } from 'react';
import { Panel, Div, CustomScrollView } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

export default function Purchases({ id, goBack, user }) {
    const [purchases, setPurchases] = useState([]);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const loadPurchases = async () => {
            // Получаем покупки пользователя
            const resPurchases = await fetch(`http://localhost:3001/api/user/${user.id}/purchases`);
            const purchasesData = await resPurchases.json();
            setPurchases(purchasesData);

            // Получаем товары магазина (чтобы отобразить картинки и названия)
            const resItems = await fetch('http://localhost:3001/api/shop');
            const itemsData = await resItems.json();
            setItems(itemsData.items || itemsData);
        };

        loadPurchases();
    }, [user.id]);

    // Разделяем покупки
    const notReceived = purchases.filter(p => !p.received);
    const received = purchases.filter(p => p.received);

    // Группируем полученные по item_id и считаем количество
    const mergedReceived = {};
    received.forEach(p => {
        if (!mergedReceived[p.item_id]) {
            mergedReceived[p.item_id] = { ...p, quantity: 1 };
        } else {
            mergedReceived[p.item_id].quantity += 1;
        }
    });

    // Группируем невыданные покупки по item_id
    const mergedNotReceived = {};
    notReceived.forEach(p => {
        if (!mergedNotReceived[p.item_id]) {
            mergedNotReceived[p.item_id] = { ...p, quantity: 1 };
        } else {
            mergedNotReceived[p.item_id].quantity += 1;
        }
    });

    return (
        <Panel id={id} style={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
            {/* Хедер */}
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
                    padding: '0 12px',
                    zIndex: 1000,
                    borderBottom: '1px solid #ddd'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Icon28ChevronBack style={{ cursor: 'pointer' }} onClick={goBack} />
                    <CustomText weight="3" style={{ fontSize: 16 }}>Мои покупки</CustomText>
                </div>
            </Div>

            <CustomScrollView style={{ paddingTop: 56 }}>
                <Div style={{ padding: 16 }}>
                    {/* Куплено, но не получено */}
                    {Object.values(mergedNotReceived).length > 0 && (
                        <>
                            <CustomText weight="medium" style={{ marginBottom: 8, color: '#311f68', fontSize: 15 }}>
                                Куплено
                            </CustomText>
                            <Div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                                marginBottom: 24
                            }}>
                                {Object.values(mergedNotReceived).map(p => {
                                    const item = items.find(i => i.id === p.item_id);
                                    if (!item) return null;
                                    return (
                                        <Div
                                            key={p.item_id}
                                            style={{
                                                backgroundColor: '#fff8e1',
                                                borderRadius: 12,
                                                padding: 8,
                                                border: '1px solid #e0e0e0',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <img
                                                src={`http://localhost:3001${item.image}`}
                                                alt={item.title}
                                                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                                            />
                                            <CustomText weight="medium" style={{ textAlign: 'center' }}>
                                                {item.title} {p.quantity > 1 && `(x${p.quantity})`}
                                            </CustomText>
                                            <CustomText style={{ color: '#ff9800', fontWeight: 600, textAlign: 'center' }}>
                                                ⏳ Ожидает выдачи
                                            </CustomText>
                                        </Div>
                                    );
                                })}
                            </Div>
                        </>
                    )}

                    {/* Получено */}
                    {Object.values(mergedReceived).length > 0 && (
                        <>
                            <CustomText weight="medium" style={{ marginBottom: 8, color: '#311f68', fontSize: 15 }}>
                                Получено
                            </CustomText>
                            <Div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                                marginBottom: 24
                            }}>
                                {Object.values(mergedReceived).map(p => {
                                    const item = items.find(i => i.id === p.item_id);
                                    if (!item) return null;
                                    return (
                                        <Div
                                            key={p.item_id}
                                            style={{
                                                backgroundColor: '#e0f7fa',
                                                borderRadius: 12,
                                                padding: 8,
                                                border: '1px solid #b2ebf2',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <img
                                                src={`http://localhost:3001${item.image}`}
                                                alt={item.title}
                                                style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                                            />
                                            <CustomText weight="medium" style={{ textAlign: 'center' }}>
                                                {item.title} {p.quantity > 1 && `(x${p.quantity})`}
                                            </CustomText>
                                            <CustomText weight="medium" style={{ textAlign: 'center', color: '#388e3c' }}>
                                                Получено!
                                            </CustomText>
                                        </Div>
                                    );
                                })}
                            </Div>
                        </>
                    )}

                    {notReceived.length === 0 && Object.values(mergedReceived).length === 0 && (
                        <CustomText style={{ textAlign: 'center', marginTop: 32, color: '#777' }}>
                            У вас ещё нет покупок.
                        </CustomText>
                    )}
                </Div>
            </CustomScrollView>
        </Panel>
    );
}