import { useState, useEffect } from 'react'; 
import { Panel, Div, Text, Button, ModalCard, ModalRoot } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28CoinsOutline } from '@vkontakte/icons';

export default function Shop({ id, goBack, balance, goToBalance, user }) {
    const [items, setItems] = useState([]);
    const [ownedItems, setOwnedItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);

    useEffect(() => {
        fetch(`http://localhost:3001/api/shop?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                setItems(data.items);
                setOwnedItems(data.ownedItems);
            });
    }, [user.id]);

    return (
        <>
            <ModalRoot activeModal={activeItem ? 'item' : null}>
                <ModalCard
                    id="item"
                    onClose={() => setActiveItem(null)}
                    header={activeItem?.title}
                >
                    <img
                        src={activeItem?.image}
                        alt=""
                        style={{ width: '100%', borderRadius: 12, marginBottom: 12 }}
                    />
                    <Text style={{ marginBottom: 12 }}>
                        {activeItem?.description}
                    </Text>
                    <Text weight="2">
                        Цена: {activeItem?.price}
                    </Text>
                </ModalCard>
            </ModalRoot>

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
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    zIndex: 1000,
                    boxShadow: '0 15px 15px rgba(0,0,0,0.08)',
                    borderBottom: '1px solid #bdbdbd',
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
                            color: '#311f68',
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
                            padding: '6px 12px',
                            backgroundColor: '#f2f2f2',
                            borderRadius: 999,
                            cursor: 'pointer',
                        }}
                    >
                        <Icon28CoinsOutline width={20} height={20} color="#311f68" />
                        <Text
                            weight="3"
                            style={{
                                fontSize: 14,
                                color: '#4000ff',
                                lineHeight: '18px',
                            }}
                        >
                            {balance}
                        </Text>
                    </div>
                </Div>

                <Div style={{ 
                    textAlign: 'center',
                    backgroundColor: '#ffffff',
                    padding: '32px 0 0 0', 
                }}>
                    <Text weight="medium" style={{ 
                        fontSize: 18,
                        color: '#311f68' 
                    }}>
                        Заготовочное окно для магазина
                    </Text>
                </Div>

                <Div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 12,
                        padding: 16,
                    }}
                >
                    {items.map(item => {
                        const isOwned = ownedItems.includes(item.id);

                        return (
                            <Div
                                key={item.id}
                                style={{
                                    backgroundColor: isOwned ? '#e8f5e9' : '#f5f5f5',
                                    borderRadius: 12,
                                    padding: 8,
                                    cursor: 'pointer',
                                }}
                                onClick={() => setActiveItem(item)}
                            >
                                <img
                                    src={item.image}
                                    alt=""
                                    style={{
                                    width: '100%',
                                    borderRadius: 8,
                                    marginBottom: 8,
                                    }}
                                />

                                <Text weight="medium" style={{ marginBottom: 4 }}>
                                    {item.title}
                                </Text>

                                <Text style={{ fontSize: 13, marginBottom: 8 }}>
                                    {item.price} 💰
                                </Text>

                                {isOwned ? (
                                    <Text style={{ color: '#4caf50', fontWeight: 600 }}>
                                        ✔ Куплено
                                    </Text>
                                ) : (
                                    <Button
                                        size="s"
                                        mode="primary"
                                        stretched
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (balance < item.price) {
                                                alert('Недостаточно средств');
                                                return;
                                            }
                                            fetch(`http://localhost:3001/api/shop/buy/${item.id}`, {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ userId: user.id }),
                                            })
                                                .then(res => res.json())
                                                .then(data => {
                                                    if (data.success) {
                                                    setOwnedItems(prev => [...prev, item.id]);
                                                } else {
                                                alert(data.error);
                                                }
                                            });
                                        }}
                                    >
                                        Купить
                                    </Button>
                                )}
                            </Div>
                        );
                    })}
                </Div>
            </Panel>
        </>
    );
}