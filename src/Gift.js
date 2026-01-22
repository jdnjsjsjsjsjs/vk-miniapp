import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Panel, Div, Text, Button, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28CoinsOutline } from '@vkontakte/icons';

const rewards = [
        5,5,5, 10,10,10,
        15,15,15,
        20,20,20,
        25,25,25,
        30,30,30,
        40,40,40,
        50,50,50,
        75,75,75,
        100,100,100
    ];

export default function Gift({ id, goBack, balance, goToBalance}) {
    const [userId, setUserId] = useState(null);
    const [giftDay, setGiftDay] = useState(1);
    const [timeLeft, setTimeLeft] = useState('00:00:00');
    const [canClaim, setCanClaim] = useState(false);

    useEffect(() => {
        bridge.send('VKWebAppGetUserInfo').then(user => {
            setUserId(user.id);
        });
    }, []);

    useEffect(() => {
        if (!userId) return;

        fetch(`http://localhost:3001/api/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                setGiftDay(data.gift_day);

                const today = new Date().toISOString().slice(0, 10);
                setCanClaim(data.last_gift_date !== today);
            });
    }, [userId]);

    const claimGift = async () => {
        const res = await fetch(
            `http://localhost:3001/api/user/${userId}/claimGift`,
            { method: 'POST' }
        );

        if (!res.ok) return;

        const data = await res.json();

        setGiftDay(prev => prev + 1);
        setCanClaim(false);
        setTimeLeft(calculateTimeLeft());
    };

    function calculateTimeLeft() {
        const now = new Date();
        const tomorrow = new Date();

        tomorrow.setHours(24, 0, 0, 0); // следующая полночь

        const diff = tomorrow - now;

        if (diff <= 0) return '00:00:00';

        const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
        const minutes = String(Math.floor(diff / 1000 / 60) % 60).padStart(2, '0');
        const seconds = String(Math.floor(diff / 1000) % 60).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    useEffect(() => {
        if (canClaim) {
            setTimeLeft('00:00:00');
            return;
        }

        setTimeLeft(calculateTimeLeft());

        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(interval);
    }, [canClaim]);
    
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

            <Div style={{ padding: 16, backgroundColor: '#ffffff', }}>
            <Text
                weight="2"
                style={{
                marginBottom: 12,
                color: '#311f68',
                textAlign: 'center',
                }}
            >
                {canClaim ? '🎁 Заберите приз!' : '⏳ Приходите завтра'}
            </Text>

            <Text
                style={{
                    textAlign: 'center',
                    fontSize: 16,
                    color: '#6d6d6d',
                    marginBottom: 12,
                }}
            >
                {timeLeft}
            </Text>

            <Div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 12,
                    backgroundColor: '#ffffff',
                }}
            >
                {rewards.map((reward, index) => {
                    const day = index + 1;
                    const isCurrent = day === giftDay;
                    const isLocked = day > giftDay;
                    const isDone = day < giftDay;

                    return (
                        <Card
                            key={day}
                            mode="shadow"
                            style={{
                                borderRadius: 12,
                                padding: '14px 10px',
                                textAlign: 'center',
                                backgroundColor: isCurrent ? '#f0edff' : '#ffffff',
                                opacity: isDone ? 0.5 : 1,
                                filter: isLocked ? 'blur(2px)' : 'none',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <Div style={{ padding: 0 }}>
                                <Icon28CoinsOutline
                                    width={28}
                                    height={28}
                                    color={isCurrent ? '#4000ff' : '#311f68'}
                                />

                                <Text
                                    weight="3"
                                    style={{
                                        marginTop: 6,
                                        fontSize: 14,
                                        color: '#311f68',
                                    }}
                                >
                                    День {day}
                                </Text>

                                <Text
                                    weight="3"
                                    style={{
                                        marginTop: 2,
                                        fontSize: 18,
                                        color: '#4000ff',
                                    }}
                                >
                                    +{reward}
                                </Text>
                            </Div>
                        </Card>
                    );
                })}
            </Div>

            {canClaim && (
                <Button
                size="l"
                stretched
                style={{ marginTop: 20 }}
                onClick={claimGift}
                >
                Забрать награду
                </Button>
            )}
            </Div>
        </Panel>
    );
}