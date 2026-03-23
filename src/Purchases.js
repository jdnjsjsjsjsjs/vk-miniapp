import { useEffect, useState } from 'react';
import { Panel, Div, Card, Button } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import shopIcon from './imgs/shop1.png'
import shopFilledIcon from './imgs/shop2.png'

export default function Purchases({ id, goBack, user, balance, goToBalance, goToProfile }) {
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
        <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
            <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />
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
                    onClick={goToProfile}
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
                        padding: '2px 14px 2px 2px',
                        marginRight: 8,
                        backgroundColor: '#fff',
                        border: '1px solid #ceaeff',
                        borderRadius: 999,
                        cursor: 'pointer',
                    }}
                >
                    <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                    <CustomText
                        style={{
                            fontSize: 14,
                            color: '#8c64d7',
                            lineHeight: '18px',
                            fontWeight: 1000,
                        }}
                    >
                        {balance}
                    </CustomText>
                </div>
            </Div>

            <Div style={{ backgroundColor: '#ceaeff', padding: 0 }}>
                <Div style={{ padding: 0 }}>
                    {/* Куплено, но не получено */}
                    {Object.values(mergedNotReceived).length > 0 && (
                        <>
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
                                    margin: '10px 16px 0px 16px',
                                }}
                            >
                                <CustomText
                                    weight="1"
                                    style={{
                                        fontSize: 16,
                                        color: '#000',
                                    }}
                                >
                                    Купленные артефакты
                                </CustomText>

                                <img
                                    src={shopFilledIcon}
                                    alt="gift"
                                    style={{
                                        width: 75,
                                        height: 75,
                                        objectFit: 'contain',
                                        position: 'absolute',
                                        right: 5,
                                    }}
                                />
                            </Card>
                            <Div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                gap: 8,
                            }}>
                                {Object.values(mergedNotReceived).map(p => {
                                    const item = items.find(i => i.id === p.item_id);
                                    if (!item) return null;
                                    return (
                                        <Div
                                            key={p.item_id}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: 12,
                                                padding: 8,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {item.image ? (
                                                <img
                                                    src={`http://localhost:3001${item.image}`}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1 / 1',
                                                        objectFit: 'cover',
                                                        borderRadius: 8,
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1 / 1',
                                                        backgroundColor: '#e5e5e5',
                                                        borderRadius: 8,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <CustomText
                                                        weight="1"
                                                        style={{
                                                            fontSize: 10,
                                                            color: '#ffffff',
                                                            textAlign: 'center',
                                                            lineHeight: '10px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <span>фото</span>
                                                        <span>появится</span>
                                                        <span>позже</span>
                                                    </CustomText>
                                                </div>
                                            )}
                                            <CustomText weight="3" style={{ fontSize: 12, paddingTop: 3 }}>
                                                {item.title}
                                            </CustomText>
                                            <CustomText
                                                weight="1"
                                                style={{
                                                    fontSize: 14,
                                                    color: '#8c64d7',
                                                    lineHeight: '18px',
                                                }}
                                            >
                                                {p.quantity >= 1 && `${p.quantity} шт.`}
                                            </CustomText>
                                            <div
                                                style={{
                                                    width: '95%',
                                                    height: 1,
                                                    backgroundColor: '#969696',
                                                    margin: '2px auto 2px auto',
                                                    borderRadius: 1,
                                                }}
                                            />
                                            <CustomText
                                                weight="1"
                                                style={{
                                                    color: '#ceaeff',
                                                    fontSize: 14,
                                                }}
                                            >
                                                ожидает
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
                                    margin: '10px 16px 0px 16px',
                                }}
                            >
                                <CustomText
                                    weight="1"
                                    style={{
                                        fontSize: 16,
                                        color: '#000',
                                    }}
                                >
                                    Полученные артефакты
                                </CustomText>

                                <img
                                    src={shopIcon}
                                    alt="gift"
                                    style={{
                                        width: 75,
                                        height: 75,
                                        objectFit: 'contain',
                                        position: 'absolute',
                                        right: 5,
                                    }}
                                />
                            </Card>
                            <Div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                                gap: 8,
                            }}>
                                {Object.values(mergedReceived).map(p => {
                                    const item = items.find(i => i.id === p.item_id);
                                    if (!item) return null;
                                    return (
                                        <Div
                                            key={p.item_id}
                                            style={{
                                                backgroundColor: '#ffffff',
                                                borderRadius: 12,
                                                padding: 8,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                            }}
                                        >
                                            {item.image ? (
                                                <img
                                                    src={`http://localhost:3001${item.image}`}
                                                    alt=""
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1 / 1',
                                                        objectFit: 'cover',
                                                        borderRadius: 8,
                                                    }}
                                                />
                                            ) : (
                                                <div
                                                    style={{
                                                        width: '100%',
                                                        aspectRatio: '1 / 1',
                                                        backgroundColor: '#e5e5e5',
                                                        borderRadius: 8,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <CustomText
                                                        weight="1"
                                                        style={{
                                                            fontSize: 10,
                                                            color: '#ffffff',
                                                            textAlign: 'center',
                                                            lineHeight: '10px',
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                        }}
                                                    >
                                                        <span>фото</span>
                                                        <span>появится</span>
                                                        <span>позже</span>
                                                    </CustomText>
                                                </div>
                                            )}
                                            <CustomText weight="3" style={{ fontSize: 12, paddingTop: 3 }}>
                                                {item.title}
                                            </CustomText>
                                            <CustomText
                                                weight="1"
                                                style={{
                                                    fontSize: 14,
                                                    color: '#8c64d7',
                                                    lineHeight: '18px',
                                                }}
                                            >
                                                {p.quantity >= 1 && `${p.quantity} шт.`}
                                            </CustomText>
                                            <div
                                                style={{
                                                    width: '95%',
                                                    height: 1,
                                                    backgroundColor: '#969696',
                                                    margin: '2px auto 2px auto',
                                                    borderRadius: 1,
                                                }}
                                            />
                                            <CustomText
                                                weight="1"
                                                style={{
                                                    color: '#8c64d7',
                                                    fontSize: 14,
                                                }}
                                            >
                                                получено
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
            </Div>
        </Panel>
    );
}