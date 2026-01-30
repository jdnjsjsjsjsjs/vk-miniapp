import { useState, useEffect } from 'react'; 
import { Panel, Div, Text, Button, ModalCard, ModalRoot } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon28CoinsOutline } from '@vkontakte/icons';

const inputStyle = {
    width: '100%',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
};

export default function Shop({ id, goBack, balance, goToBalance, user }) {
    const [items, setItems] = useState([]);
    const [ownedItems, setOwnedItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [editItem, setEditItem] = useState(null);

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        image: '',
    });

    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const url = isAdmin
            ? `http://localhost:3001/api/admin/shop?userId=${user.id}`
            : `http://localhost:3001/api/shop?userId=${user.id}`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                if (isAdmin) {
                    setItems(data);
                    setOwnedItems([]);
                } else {
                    setItems(data.items);
                    setOwnedItems(data.ownedItems);
                }
            });
    }, [user.id, isAdmin]);

    const saveNewItem = () => {
        if (!newItem.title || !newItem.price) {
            alert('Заполни название и цену');
            return;
        }

        fetch('http://localhost:3001/api/admin/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: newItem.title,
                description: newItem.description,
                price: Number(newItem.price),
                image: newItem.image,
            }),
        })
            .then(res => res.json())
            .then(data => {
                setItems(prev => [{ id: data.id, ...newItem }, ...prev]);
                setNewItem({ title: '', description: '', price: '', image: '' });
                setActiveModal(null);
            });
    };

    const saveEditItem = () => {
        fetch(`http://localhost:3001/api/admin/shop/${editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: editItem.title,
                description: editItem.description,
                price: Number(editItem.price),
                image: editItem.image,
            }),
        })
            .then(res => res.json())
            .then(() => {
                setItems(prev =>
                    prev.map(i => (i.id === editItem.id ? editItem : i))
                );
                setEditItem(null);
                setActiveModal(null);
            });
    };

    const deleteItem = () => {
        fetch(`http://localhost:3001/api/admin/shop/${activeItem.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
        })
            .then(res => res.json())
            .then(() => {
                setItems(prev => prev.filter(i => i.id !== activeItem.id));
                setActiveItem(null);
                setActiveModal(null);
            });
    };

    return (
        <>
            <ModalRoot activeModal={activeModal}>
                {/* Модалка товара */}
                <ModalCard
                    id="item"
                    onClose={() => {
                        setActiveModal(null);
                        setActiveItem(null);
                    }}
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

                    {isAdmin && (
                        <Div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Button
                                mode="secondary"
                                onClick={() => {
                                    setEditItem(activeItem);
                                    setActiveModal('edit');
                                }}
                            >
                                ✏️ Редактировать
                            </Button>

                            <Button
                                mode="destructive"
                                onClick={() => setActiveModal('delete')}
                            >
                                🗑 Удалить
                            </Button>
                        </Div>
                    )}
                </ModalCard>

                {/* Модалка добавления */}
                <ModalCard
                    id="add"
                    header="Добавить товар"
                    onClose={() => setActiveModal(null)}
                >
                    <input
                        placeholder="Название"
                        value={newItem.title}
                        onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                        style={inputStyle}
                    />

                    <textarea
                        placeholder="Описание"
                        value={newItem.description}
                        onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        style={{ ...inputStyle, height: 80 }}
                    />

                    <input
                        placeholder="Цена"
                        type="number"
                        value={newItem.price}
                        onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                        style={inputStyle}
                    />

                    <input
                        placeholder="URL картинки"
                        value={newItem.image}
                        onChange={e => setNewItem({ ...newItem, image: e.target.value })}
                        style={inputStyle}
                    />

                    {/* КНОПКИ */}
                    <Div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <Button
                            mode="primary"
                            stretched
                            onClick={saveNewItem}
                        >
                            Сохранить
                        </Button>

                        <Button
                            mode="secondary"
                            stretched
                            onClick={() => setActiveModal(null)}
                        >
                            Отмена
                        </Button>
                    </Div>
                </ModalCard>

                <ModalCard
                    id="edit"
                    header="Редактировать товар"
                    onClose={() => {
                        setEditItem(null);
                        setActiveModal(null);
                    }}
                >
                    <input
                        placeholder="Название"
                        value={editItem?.title || ''}
                        onChange={e => setEditItem({ ...editItem, title: e.target.value })}
                        style={inputStyle}
                    />

                    <textarea
                        placeholder="Описание"
                        value={editItem?.description || ''}
                        onChange={e => setEditItem({ ...editItem, description: e.target.value })}
                        style={{ ...inputStyle, height: 80 }}
                    />

                    <input
                        type="number"
                        placeholder="Цена"
                        value={editItem?.price || ''}
                        onChange={e => setEditItem({ ...editItem, price: e.target.value })}
                        style={inputStyle}
                    />

                    <input
                        placeholder="URL картинки"
                        value={editItem?.image || ''}
                        onChange={e => setEditItem({ ...editItem, image: e.target.value })}
                        style={inputStyle}
                    />

                    <Div style={{ display: 'flex', gap: 8 }}>
                        <Button mode="primary" stretched onClick={saveEditItem}>
                            Сохранить
                        </Button>
                        <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>
                            Отмена
                        </Button>
                    </Div>
                </ModalCard>

                <ModalCard
                    id="delete"
                    header="Удалить товар?"
                    onClose={() => setActiveModal(null)}
                >
                    <Text style={{ marginBottom: 12 }}>
                        Товар <b>{activeItem?.title}</b> будет удалён навсегда.
                    </Text>

                    <Div style={{ display: 'flex', gap: 8 }}>
                        <Button mode="destructive" stretched onClick={deleteItem}>
                            Удалить
                        </Button>
                        <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>
                            Отмена
                        </Button>
                    </Div>
                </ModalCard>
            </ModalRoot>

            <Panel id={id}>
                <Div style={{ height: 32, backgroundColor: '#ffffff' }} />

                {isAdmin && (
                    <Button
                        size="s"
                        mode="secondary"
                        style={{ marginLeft: 12 }}
                        onClick={() => setActiveModal('add')}
                    >
                        ➕ Добавить
                    </Button>
                )}
                            
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
                                onClick={() => {setActiveItem(item); setActiveModal('item')}}
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