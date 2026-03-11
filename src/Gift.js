import { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'

const rewards = [
        1,1,1,1,2,
        2,2,2,2,3,
        3,3,3,3,4,
        4,4,4,4,5,
        5,5,5,5,6,
        6,6,6,6,7,
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

        setGiftDay(prev => prev + 1);
        setCanClaim(false);
        setTimeLeft(calculateTimeLeft());
    };

    function calculateTimeLeft() {
        const now = new Date();
        const tomorrow = new Date();

        tomorrow.setHours(24, 0, 0, 0);

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
        <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
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

            <Div style={{ padding: '10px 0px 0px 0px', backgroundColor: '#ceaeff' }}>
            <Card
                mode="shadow"
                style={{
                    borderRadius: 12,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#ffffff',
                    marginLeft: 16,
                    marginRight: 16,
                }}
            >
                {/* Левый блок: заголовок */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <CustomText style={{ fontSize: 12, color: '#000', fontWeight: 600 }}>
                        Заходи 30 дней подряд
                    </CustomText>
                    <CustomText style={{ fontSize: 10, color: '#000', lineHeight: 1 }}>
                        и получай капиталы
                    </CustomText>
                </div>

                {/* Правый блок: вертикальный таймер */}
                <CustomText
                    weight="3"
                    style={{
                        fontSize: 22,
                        color: '#8c64d7',
                        fontWeight: 1000,
                        textAlign: 'center',
                    }}
                >
                    {timeLeft}
                </CustomText>
            </Card>

            <Div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 3,
                    backgroundColor: '#ceaeff',
                }}
                >
                {rewards.map((reward, index) => {
                    const day = index + 1;
                    const isCurrent = day === giftDay;
                    const isDone = day < giftDay;
                    const isLocked = day > giftDay;
                    const isFifth = day % 5 === 0;

                    const cardBg = isFifth ? '#8c64d7' : '#ffffff';
                    const textColor = isFifth ? '#ffffff' : '#8c64d7';

                    return (
                        <Card
                        key={day}
                        mode="shadow"
                        style={{
                            borderRadius: 12,
                            textAlign: 'center',
                            backgroundColor: cardBg,
                            filter: isLocked ? 'blur(2px)' : 'none',
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1 / 1',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                        >
                        <CustomText weight="1" style={{ fontSize: 8, color: isFifth ? '#fff' : '#000' }}>
                            День {day}
                        </CustomText>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <CustomText style={{ fontWeight: 1000, fontSize: 14, color: textColor }}>
                            +{reward}
                            </CustomText>
                            <img src={coinIcon} alt="coins" style={{ width: 20, height: 20 }} />
                        </div>

                        {/* Кнопка или галочка */}
                        {isDone ? (
                            <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                backgroundColor: isFifth ? '#ffffff' : '#8c64d7',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: 2,
                            }}
                            >
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke={isFifth ? '#8c64d7' : '#ffffff'}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                        ) : isCurrent && canClaim ? (
                            <div
                            onClick={claimGift}
                            style={{
                                marginTop: 2,
                                padding: '0px 5px',
                                backgroundColor: isFifth ? '#ffffff' : '#8c64d7',
                                color: isFifth ? '#8c64d7' : '#fff',
                                borderRadius: 999,
                                cursor: 'pointer',
                            }}
                            >
                            <CustomText weight="1" style={{ fontSize: 8 }}>
                                получить
                            </CustomText>
                            </div>
                        ) : (
                            <div
                            style={{
                                marginTop: 2,
                                padding: '0px 5px',
                                backgroundColor: isFifth ? '#ffffff' : '#8c64d7',
                                borderRadius: 999,
                                opacity: 0.5,
                                cursor: 'not-allowed',
                            }}
                            >
                            <CustomText weight="1" style={{ fontSize: 8, color: isFifth ? '#8c64d7' : '#fff' }}>
                                получить
                            </CustomText>
                            </div>
                        )}
                        </Card>
                    );
                    })}
                </Div>
            </Div>
        </Panel>
    );
}