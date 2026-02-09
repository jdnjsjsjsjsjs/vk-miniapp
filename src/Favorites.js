import { useState, useEffect } from 'react';
import { Panel, Div, Text, Button, ModalRoot, ModalCard, Textarea, Card } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28Favorite } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png';

export default function Favorites({ id, goBack, balance, goToBalance, user }) {
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [answer, setAnswer] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    /* ---------- Загрузка избранных ---------- */
    useEffect(() => {
        if (!user?.id) return;

        fetch(`http://localhost:3001/api/favorites/${user.id}`)
            .then(res => res.json())
            .then(setTasks)
            .catch(err => console.error('Ошибка загрузки избранных', err));
    }, [user]);

    /* ---------- Дедлайн ---------- */
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
            {/* ---------- Модалка задания ---------- */}
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
                                if (!answer.trim() || isSubmitting) return;

                                setIsSubmitting(true);

                                await fetch(
                                    `http://localhost:3001/api/tasks/${activeTask.id}/answer`,
                                    {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userId: user.id,
                                            answer
                                        })
                                    }
                                );

                                setIsSubmitting(false);
                                setActiveTask(null);

                                // перезагрузка избранных
                                fetch(`http://localhost:3001/api/favorites/${user.id}`)
                                    .then(res => res.json())
                                    .then(setTasks);
                            }}
                        >
                            Отправить
                        </Button>
                    }
                >
                    <Div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <Text weight="2">{activeTask?.title}</Text>
                        <Text style={{ color: '#666' }}>{activeTask?.question}</Text>
                        <Textarea
                            placeholder="Введите ответ"
                            value={answer}
                            onChange={e => setAnswer(e.target.value)}
                        />
                    </Div>
                </ModalCard>
            </ModalRoot>

            <Panel id={id}>
                <Div style={{ height: 32, backgroundColor: '#fff' }} />

                {/* ---------- Хедер ---------- */}
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
                    <Button
                        mode="tertiary"
                        size="l"
                        before={<Icon28ChevronBack />}
                        onClick={goBack}
                        style={{ paddingLeft: 0, color: '#311f68' }}
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
                            padding: '2px 15px',
                            backgroundColor: '#f2f2f2',
                            borderRadius: 999,
                            cursor: 'pointer',
                        }}
                    >
                        <img src={coinIcon} alt="coins" style={{ height: 25 }} />
                        <Text weight="3" style={{ color: '#4000ff' }}>
                            {balance}
                        </Text>
                    </div>
                </Div>

                {/* ---------- Контент ---------- */}
                <Div style={{ paddingTop: 20, minHeight: '100vh', backgroundColor: '#fff' }}>
                    <Text weight="2" style={{ fontSize: 20, color: '#311f68', marginLeft: 18, marginBottom: 20 }}>
                        Избранное
                    </Text>

                    {tasks.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#999' }}>
                            В избранном пока пусто ⭐
                        </Text>
                    )}

                    {tasks.map(task => (
                        <Card
                            key={task.id}
                            mode="shadow"
                            style={{
                                position: 'relative',
                                borderRadius: 12,
                                padding: 16,
                                marginBottom: 12,
                                backgroundColor: '#f5f5f5',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                            }}
                        >
                            <Text weight="medium">{task.title}</Text>

                            <Text style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <img src={coinIcon} alt="coins" style={{ height: 25 }} />
                                {task.reward}
                            </Text>

                            {/* ---------- Статусы ---------- */}
                            {task.status === null && (
                                <Button size="l" onClick={() => setActiveTask(task)}>
                                    Выполнить
                                </Button>
                            )}

                            {task.status === 'pending' && (
                                <Text style={{ color: '#ff9800' }}>⏳ На проверке</Text>
                            )}

                            {task.status === 'accepted' && (
                                <Text style={{ color: '#4caf50' }}>✅ Принято</Text>
                            )}

                            {task.status === 'rejected' && (
                                <Button size="l" onClick={() => setActiveTask(task)}>
                                    Переделать
                                </Button>
                            )}

                            {/* ---------- Дедлайн + избранное ---------- */}
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    display: 'flex',
                                    gap: 6,
                                }}
                            >
                                <div
                                    style={{
                                        padding: '4px 10px',
                                        borderRadius: 999,
                                        backgroundColor: '#ede7ff',
                                        fontSize: 12,
                                        fontWeight: 600,
                                    }}
                                >
                                    {getTimeLeft(task.expires_at)}
                                </div>

                                <button
                                    onClick={async () => {
                                        await fetch(
                                            'http://localhost:3001/api/favorites/toggle',
                                            {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    userId: user.id,
                                                    taskId: task.id
                                                })
                                            }
                                        );

                                        // удаляем из списка
                                        setTasks(prev =>
                                            prev.filter(t => t.id !== task.id)
                                        );
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <Icon28Favorite fill="#ff9800" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </Div>
            </Panel>
        </>
    );
}