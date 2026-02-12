import { useState, useEffect } from 'react';
import { Panel, Div, Button, ModalRoot, ModalCard, Textarea, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon28FavoriteOutline, Icon28Favorite } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'

export default function Tasks({ id, goBack, balance, goToBalance, user }) {
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        fetch(`http://localhost:3001/api/tasks/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setTasks(data);
            })
            .catch(err => {
                console.error('Ошибка загрузки заданий', err);
            });
    }, [user]);

    function getTimeLeft(expiresAt) {
        if (!expiresAt) return 'Бессрочно';

        const now = new Date();
        const end = new Date(expiresAt);

        const diffMs = end - now;

        if (diffMs <= 0) return 'Истекло';

        const minutes = Math.floor(diffMs / 1000 / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days} дн.`;
        if (hours > 0) return `${hours} ч.`;
        return `${minutes} мин.`;
    }
    
    return (
        <>
            <ModalRoot activeModal={activeTask ? 'task' : null}>
                <ModalCard
                    id="task"
                    onClose={() => { setActiveTask(null); setAnswer(''); }}
                    actions={
                        <Button
                            size="l"
                            mode="primary"
                            loading={isSubmitting}
                            onClick={async () => {
                                if (isSubmitting) return;
                                if (!answer.trim()) return;

                                setIsSubmitting(true);

                                await fetch(`http://localhost:3001/api/tasks/${activeTask.id}/answer`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: user.id,
                                    answer
                                })
                            });

                            setIsSubmitting(false);
                            setActiveTask(null);

                            // перезагружаем задания
                            fetch(`http://localhost:3001/api/tasks/${user.id}`)
                            .then(res => res.json())
                            .then(setTasks);
                        }}
                    >
                        Отправить
                        </Button>
                    }
                    >
                    {/* Динамический контент */}
                    <Div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <CustomText weight="2">{activeTask?.title}</CustomText>
                        <CustomText style={{ color: '#666', paddingBottom: '16px' }}>{activeTask?.question}</CustomText>
                        <Textarea
                            placeholder="Введите ответ"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                        />
                    </Div>
                    </ModalCard>
            </ModalRoot>

            <Panel id={id}>
                <Div style={{ height: 32, backgroundColor: '#ffffff' }}/>
                            
                {/* Кастомный хедер */}
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
                            color: '#fff',
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
                                color: '#4000ff',
                                lineHeight: '18px',
                            }}
                        >
                            {balance}
                        </CustomText>
                    </div>
                </Div>

                {/* Контент */}
                <Div style={{ paddingTop: 10, backgroundColor: '#ffffff', minHeight: '100vh' }}>
                    <Div
                        style={{
                            paddingBottom: 20,
                            textAlign: 'left',
                        }}
                    >
                        <CustomText
                            weight="2"
                            style={{
                                fontSize: 20,
                                color: '#311f68',
                            }}
                        >
                            Задания
                        </CustomText>
                    </Div>

                    {tasks.length === 0 && (
                        <CustomText style={{ textAlign: 'center', color: '#999' }}>
                            Заданий пока нет
                        </CustomText>
                    )}

                    {tasks.map(task => (
                        <Card
                            key={task.id}
                            mode="shadow"
                            style={{
                                position: 'relative',
                                borderRadius: 12,
                                padding: '16px',
                                marginBottom: 12,
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            }}
                        >
                            <CustomText weight="medium" style={{ fontSize: 16, color: '#311f68' }}>
                                {task.title}
                            </CustomText>

                            <CustomText style={{ fontSize: 14, color: '#666', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                                {task.reward}
                            </CustomText>

                            {task.status === null && (
                                <Button
                                size="l"
                                mode="primary"
                                style={{ marginTop: 8 }}
                                onClick={() => { setActiveTask(task); setAnswer(''); }}
                                >
                                    Выполнить
                                </Button>
                            )}

                            {task.status === 'pending' && (
                                <CustomText style={{ color: '#ff9800', fontSize: 13, marginTop: 8 }}>
                                ⏳ На проверке
                                </CustomText>
                            )}

                            {task.status === 'accepted' && (
                                <CustomText style={{ color: '#4caf50', fontSize: 13, marginTop: 8 }}>
                                ✅ Принято
                                </CustomText>
                            )}

                            {task.status === 'rejected' && (
                                <Button
                                size="l"
                                mode="primary"
                                style={{ marginTop: 8 }}
                                onClick={() => { setActiveTask(task); setAnswer(''); }}
                                >
                                Переделать
                                </Button>
                            )}

                            <div
                                style={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                }}
                            >
                                {/* Капсула дедлайна */}
                                <div
                                    style={{
                                    padding: '4px 10px',
                                    borderRadius: 999,
                                    backgroundColor: task.expires_at ? '#ede7ff' : '#e0e0e0',
                                    color: '#311f68',
                                    fontSize: 12,
                                    fontWeight: 600,
                                    whiteSpace: 'nowrap',
                                    }}
                                >
                                    {getTimeLeft(task.expires_at)}
                                </div>

                                {/* Кнопка избранного */}
                                <button
                                    onClick={async (e) => {
                                    e.stopPropagation();

                                    const res = await fetch('http://localhost:3001/api/favorites/toggle', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                        userId: user.id,
                                        taskId: task.id
                                        })
                                    });

                                    const data = await res.json();

                                    setTasks(prev =>
                                        prev.map(t =>
                                        t.id === task.id
                                            ? { ...t, isFavorite: data.isFavorite }
                                            : t
                                        )
                                    );
                                    }}
                                    style={{
                                    background: 'transparent',
                                    border: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    }}
                                >
                                    {task.isFavorite ? (
                                    <Icon28Favorite fill="#ff9800" />
                                    ) : (
                                    <Icon28FavoriteOutline />
                                    )}
                                </button>
                            </div>
                        </Card>
                    ))}
                </Div>
            </Panel>
        </>
    );
}