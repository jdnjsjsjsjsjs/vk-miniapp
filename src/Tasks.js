import { useState, useEffect } from 'react';
import { Panel, Div, Text, Button, ModalRoot, ModalCard, Textarea } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28CoinsOutline } from '@vkontakte/icons';

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
    
    return (
        <>
            <ModalRoot activeModal={activeTask ? 'task' : null}>
                <ModalCard
                    id="task"
                    onClose={() => {setActiveTask(null); setAnswer('');}}
                    header={activeTask?.title}
                    subheader={activeTask?.question}
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
                    <Textarea
                        placeholder="Введите ответ"
                        value={answer}
                        onChange={e => setAnswer(e.target.value)}
                    />
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

                {/* Контент */}
                <Div style={{ paddingTop: 10, backgroundColor: '#ffffff' }}>
                    <Div
                        style={{
                            paddingBottom: 20,
                            textAlign: 'left',
                        }}
                    >
                        <Text
                            weight="2"
                            style={{
                                fontSize: 20,
                                color: '#311f68',
                            }}
                        >
                            Задания
                        </Text>
                    </Div>

                    {tasks.length === 0 && (
                        <Text style={{ textAlign: 'center', color: '#999' }}>
                            Заданий пока нет
                        </Text>
                    )}

                    {tasks.map(task => (
                        <Div
                            key={task.id}
                            style={{
                                marginBottom: 12,
                                padding: 16,
                                borderRadius: 12,
                                backgroundColor: '#f5f5f5',
                            }}
                        >
                            <Text weight="medium" style={{ fontSize: 16, color: '#311f68' }}>
                                {task.title}
                            </Text>

                            <Text style={{ marginTop: 4, fontSize: 14, color: '#666' }}>
                                Награда: {task.reward}
                            </Text>

                            <Div style={{ marginTop: 12 }}>
                                {task.status === null && (
                                    <Button
                                        size="s"
                                        mode="primary"
                                        onClick={() => {
                                            setActiveTask(task);
                                            setAnswer('');
                                        }}
                                    >
                                        Выполнить
                                    </Button>
                                )}

                                {task.status === 'pending' && (
                                    <Text style={{ color: '#ff9800', fontSize: 13 }}>
                                        ⏳ На проверке
                                    </Text>
                                )}

                                {task.status === 'accepted' && (
                                    <Text style={{ color: '#4caf50', fontSize: 13 }}>
                                        ✅ Принято
                                    </Text>
                                )}

                                {task.status === 'rejected' && (
                                    <Button
                                        size="s"
                                        mode="secondary"
                                        onClick={() => {
                                            setActiveTask(task);
                                            setAnswer('');
                                        }}
                                    >
                                        Переделать
                                    </Button>
                                )}
                            </Div>
                        </Div>
                    ))}
                </Div>
            </Panel>
        </>
    );
}