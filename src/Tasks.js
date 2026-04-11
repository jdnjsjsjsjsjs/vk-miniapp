import { useState, useEffect } from 'react';
import { Panel, Div, Button, ModalRoot, ModalCard, Textarea, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon16Search } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import tasksIcon from './imgs/tasks.png'

export default function Tasks({ id, goBack, balance, goToBalance, user, goToTask }) {
    const [tasks, setTasks] = useState([]);
    const [activeTask, setActiveTask] = useState(null);
    const [answer, setAnswer] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

        const date = new Date(expiresAt);

        const formatted = date.toLocaleString('ru-RU', {
        timeZone: 'Europe/Moscow',
        day: 'numeric',
        month: 'long',
        });

        return `до ${formatted}`;
    }

    function isTaskActive(task) {
        if (!task.expires_at) return true;
        const now = new Date();
        const expires = new Date(task.expires_at);

        const nowMoscow = new Date(
        now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
        );
        const expiresMoscow = new Date(
        expires.toLocaleString('en-US', { timeZone: 'Europe/Moscow' })
        );

        return expiresMoscow >= nowMoscow;
    }

    const inputStyle = `
        .search-input::placeholder {
            color: #ceaeff;
            opacity: 1;
        }
    `;
    
    return (
        <>
            <style>{inputStyle}</style>
            <ModalRoot activeModal={activeTask ? 'task' : null}>
                <ModalCard
                    id="task"
                    onClose={() => {
                        setActiveTask(null);
                        setAnswer('');
                        setSelectedFile(null);
                    }}
                    actions={
                        <Button
                            size="l"
                            mode="primary"
                            loading={isSubmitting}
                            onClick={async () => {
                                if (isSubmitting) return;
                                if (!answer.trim()) return;

                                // если требуется файл, но он не выбран
                                if (activeTask.require_file === 1 && !selectedFile) {
                                    alert('Необходимо загрузить файл');
                                    return;
                                }

                                setIsSubmitting(true);

                                try {
                                    if (activeTask.require_file === 1) {
                                        const formData = new FormData();
                                        formData.append('userId', user.id);
                                        formData.append('answer', answer);
                                        formData.append('file', selectedFile);

                                        await fetch(
                                            `http://localhost:3001/api/tasks/${activeTask.id}/answer-with-file`,
                                            {
                                                method: 'POST',
                                                body: formData
                                            }
                                        );
                                    } else {
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
                                    }

                                    setActiveTask(null);
                                    setAnswer('');
                                    setSelectedFile(null);

                                    const res = await fetch(`http://localhost:3001/api/tasks/${user.id}`);
                                    const data = await res.json();
                                    setTasks(data);

                                } catch (err) {
                                    console.error('Ошибка отправки', err);
                                }

                                setIsSubmitting(false);
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

                        {activeTask?.require_file === 1 && (
                            <div style={{ marginTop: 12 }}>
                                <input
                                    type="file"
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                />

                                {selectedFile && (
                                    <div style={{ marginTop: 6, fontSize: 12, color: '#8c64d7' }}>
                                        Выбран файл: {selectedFile.name}
                                    </div>
                                )}
                            </div>
                        )}
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
                            position: 'relative'
                        }}
                    >
                        {/* Текст */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <CustomText
                                weight="1"
                                style={{
                                    fontSize: 16,
                                    color: '#000',
                                }}
                            >
                                Задания
                            </CustomText>
                        </div>

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
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Icon16Search
                                fill="#ceaeff"
                                style={{
                                    position: 'absolute',
                                    left: 12,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 14,
                                    height: 14,
                                    pointerEvents: 'none'
                                }}
                            />

                            <input
                                className="search-input"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Поиск..."
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    padding: '6px 12px 6px 34px',
                                    borderRadius: 999,
                                    border: '1px solid #ceaeff',
                                    outline: 'none',
                                    fontSize: 12,
                                    color: '#ceaeff',
                                }}
                            />
                        </div>
                        {tasks.length === 0 && (
                            <CustomText style={{ textAlign: 'center', color: '#000' }}>
                                Заданий пока нет
                            </CustomText>
                        )}

                        {tasks
                        .filter(task => task.title.toLowerCase().includes(searchQuery.toLowerCase()) && isTaskActive(task))
                        .sort((a, b) => {
                            if (a.status === 'accepted' && b.status !== 'accepted') return 1;
                            if (a.status !== 'accepted' && b.status === 'accepted') return -1;
                            return 0;
                        })
                        .map(task => (
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
                                    {task.title} {task.require_file === 1 && '📎'}
                                </CustomText>

                                <CustomText style={{ fontSize: 16, color: '#8c64d7', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 1000 }}>
                                    {task.reward}
                                    <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                                </CustomText>

                                {task.status === null && (
                                    <div
                                        onClick={() => goToTask(task)}
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
                                        onClick={() => goToTask(task)}
                                        style={{
                                            marginTop: 8,
                                            width: '100%',
                                            backgroundColor: '#ccaaff',
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