import { Panel, Div, Button, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import medalIcon from './imgs/awards.png'
import coinsIcon from './imgs/coins.png'
import box1icon from './imgs/box1.png'
import cupsIcon from './imgs/cups.png'
import awardsIcon from './imgs/awards.png'
import lockIcon from './imgs/lock.png'

export default function Achievements({ id, goBack, balance, goToBalance, user, totalEarned }) {
    const achievements = [
        {
            id: 1,
            title: 'Первый вход',
            icon: <img src={box1icon} alt="" style={{ height: 70, width: 70 }} />,
            unlocked: true,
        },
        {
            id: 2,
            title: '10 очков',
            icon: <img src={coinsIcon} alt="" style={{ height: 70, width: 70 }} />,
            unlocked: totalEarned >= 10,
        },
        {
            id: 3,
            title: '100 очков',
            icon: <img src={cupsIcon} alt="" style={{ height: 70, width: 70 }} />,
            unlocked: totalEarned >= 100,
        },
        {
            id: 4,
            title: '1000 очков',
            icon: <img src={awardsIcon} alt="" style={{ height: 70, width: 70 }} />,
            unlocked: totalEarned >= 1000,
        },
        {
            id: 5,
            title: '5000 очков',
            icon: <img src={awardsIcon} alt="" style={{ height: 70, width: 70 }} />,
            unlocked: totalEarned >= 5000,
        },
        ];
    return (
        <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
            <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />

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
                
                <div
                    onClick={goToBalance}
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
                        weight="1"
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

            <Div style={{ padding: '10px', backgroundColor: '#ceaeff' }}>
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
                    }}
                >
                    <CustomText
                        weight="1"
                        style={{
                            fontSize: 16,
                            color: '#000',
                        }}
                    >
                        Достижения
                    </CustomText>

                    <img
                        src={medalIcon}
                        alt="trophy"
                        style={{
                            width: 75,
                            height: 75,
                            objectFit: 'contain',
                            position: 'absolute',
                            right: -2,
                            transform: 'rotate(10deg)',
                        }}
                    />
                </Card>
                
                <Div style={{ marginTop: 20, padding: 0 }}>
                <Div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: 10,
                        width: '100%',
                        boxSizing: 'border-box',
                    }}
                >
                    {achievements.map((ach) => {
                        const targetPoints = [0,10,100,1000,5000][ach.id - 1]; // цель для прогресса
                        const progress = Math.min(1, totalEarned / targetPoints);

                        return (
                            <Card
                            key={ach.id}
                            mode="shadow"
                            style={{
                                borderRadius: 14,
                                aspectRatio: '1 / 1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                backgroundColor: '#ffffff',
                                height: '100%',
                                width: '100%',
                            }}
                            >
                            <div
                                style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                                }}
                            >
                                <div
                                style={{
                                    opacity: ach.unlocked ? 1 : 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                >
                                {ach.icon}
                                </div>

                                <CustomText
                                style={{
                                    fontSize: 10,
                                    textAlign: 'center',
                                    lineHeight: '12px',
                                }}
                                >
                                {ach.title}
                                </CustomText>

                                {!ach.unlocked && (
                                <div
                                    style={{
                                    width: 60,
                                    height: 5,
                                    borderRadius: 3,
                                    backgroundColor: '#e0e0e0',
                                    overflow: 'hidden',
                                    marginTop: 2,
                                    }}
                                >
                                    <div
                                    style={{
                                        width: `${progress * 100}%`,
                                        height: '100%',
                                        backgroundColor: '#8c64d7',
                                        borderRadius: 3,
                                        transition: 'width 0.3s',
                                    }}
                                    />
                                </div>
                                )}
                            </div>

                            {!ach.unlocked && (
                                <img
                                src={lockIcon}
                                alt=""
                                style={{
                                    position: 'absolute',
                                    width: 80,
                                    height: 80,
                                }}
                                />
                            )}
                            </Card>
                        );
                        })}
                </Div>
                </Div>
            </Div>
        </Panel>
    );
}