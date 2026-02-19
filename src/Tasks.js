import { useState, useEffect } from 'react';
import { Panel, Div, Button, ModalRoot, ModalCard, Textarea, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import tasksIcon from './imgs/tasks.png'

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
        if (!expiresAt) return 'бессрочно';

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

            <Panel id={id} style={{ backgroundColor: '#ceaeff', minHeight: '100vh' }}>
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

                <Div
                    style={{
                        padding: '12px',
                        backgroundColor: '#ceaeff'
                    }}
                >
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
                        {/* Текст */}
                        <CustomText
                            weight="1"
                            style={{
                                fontSize: 16,
                                color: '#000',
                            }}
                        >
                            Задания
                        </CustomText>

                        {/* Картинка справа */}
                        <img
                            src={tasksIcon}
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
                            paddingTop: 15,
                        }}
                    >
                        {tasks.length === 0 && (
                            <CustomText style={{ textAlign: 'center', color: '#000' }}>
                                Заданий пока нет
                            </CustomText>
                        )}

                        {tasks.map(task => (
                            <Card
                                key={task.id}
                                style={{
                                    position: 'relative',
                                    borderRadius: 12,
                                    padding: '14px',
                                    marginBottom: 6,
                                    backgroundColor: '#ffffff',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '1px solid #ceaeff'
                                }}
                            >
                                <CustomText weight="2" style={{ fontSize: 10, color: '#000' }}>
                                    {task.title}
                                </CustomText>

                                <CustomText style={{ fontSize: 16, color: '#8c64d7', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 1000 }}>
                                    {task.reward}
                                    <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                                </CustomText>

                                {task.status === null && (
                                    <div
                                        onClick={() => { setActiveTask(task); setAnswer(''); }}
                                        style={{
                                            marginTop: 8,
                                            width: '100%',
                                            backgroundColor: '#8c64d7',
                                            borderRadius: 999,
                                            padding: '2px 0',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CustomText
                                            weight="1"
                                            style={{
                                                color: '#ffffff',
                                                fontSize: 10,
                                            }}
                                        >
                                            выполнить
                                        </CustomText>
                                    </div>
                                )}

                                {task.status === 'pending' && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            width: '100%',
                                            backgroundColor: '#ceaeff',
                                            borderRadius: 999,
                                            padding: '2px 0',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CustomText
                                            weight="1"
                                            style={{
                                                color: '#ffffff',
                                                fontSize: 10,
                                            }}
                                        >
                                            на проверке
                                        </CustomText>
                                    </div>
                                )}

                                {task.status === 'accepted' && (
                                    <div
                                        style={{
                                            marginTop: 8,
                                            width: '100%',
                                            backgroundColor: '#eaddff',
                                            borderRadius: 999,
                                            padding: '2px 0',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CustomText
                                            weight="1"
                                            style={{
                                                color: '#8c64d7',
                                                fontSize: 10,
                                            }}
                                        >
                                            принято
                                        </CustomText>
                                    </div>
                                )}

                                {task.status === 'rejected' && (
                                    <div
                                        onClick={() => { setActiveTask(task); setAnswer(''); }}
                                        style={{
                                            marginTop: 8,
                                            width: '100%',
                                            backgroundColor: '#8c64d7',
                                            borderRadius: 999,
                                            padding: '2px 0',
                                            textAlign: 'center',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <CustomText
                                            weight="1"
                                            style={{
                                                color: '#ffffff',
                                                fontSize: 10,
                                            }}
                                        >
                                            переделать
                                        </CustomText>
                                    </div>
                                )}

                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 12,
                                        right: 12,
                                    }}
                                >
                                    <div
                                        style={{
                                            padding: '4px 10px',
                                            borderRadius: 999,
                                            backgroundColor: '#ffffff',
                                            color: '#8c64d7',
                                            fontSize: 10,
                                            fontWeight: 600,
                                            whiteSpace: 'nowrap',
                                        }}
                                    >
                                        {getTimeLeft(task.expires_at)}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </Card>
                </Div>
            </Panel>
        </>
    );
}