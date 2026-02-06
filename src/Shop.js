import { useState, useEffect } from 'react'; 
import { Panel, Div, Text, Button, ModalCard, ModalRoot, Slider, Input } from '@vkontakte/vkui';
import { Icon28ChevronBack } from '@vkontakte/icons';

import coinsIcon from './imgs/coins.png'

const inputStyle = {
    width: '100%',
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
};

export default function Shop({ id, goBack, balance, goToBalance, user, initialFilter }) {
    const [items, setItems] = useState([]);
    const [ownedItems, setOwnedItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [priceBounds, setPriceBounds] = useState([0, 0]);
    const [priceRange, setPriceRange] = useState([0, 0]);
    const [uploading, setUploading] = useState(false);
    const [tempImage, setTempImage] = useState(null);

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
                const loadedItems = isAdmin ? data : data.items;
                const owned = isAdmin ? [] : data.ownedItems;

                setItems(loadedItems);
                setOwnedItems(owned);

                if (loadedItems.length) {
                    const prices = loadedItems.map(i => i.price);
                    const min = Math.min(...prices);
                    const max = Math.max(...prices);

                    setPriceBounds([min, max]);
                    setPriceRange([min, max]);

                    if (initialFilter) {
                        const filterMin = Math.max(initialFilter.min ?? min, min);
                        const filterMax =
                            initialFilter.max === Infinity
                            ? max
                            : Math.min(initialFilter.max, max);

                        setPriceRange([filterMin, filterMax]);
                    }
                }
            });
    }, [user.id, isAdmin, initialFilter]);

    useEffect(() => {
        const [min, max] = priceRange;

        const filtered = items.filter(
            item => item.price >= min && item.price <= max
        );

        setFilteredItems(filtered);
    }, [priceRange, items]);

    const saveNewItem = async () => {
        if (!newItem.title || !newItem.price) {
            alert('Заполни название и цену');
            return;
        }

        const res = await fetch('http://localhost:3001/api/admin/shop', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: newItem.title,
                description: newItem.description,
                price: Number(newItem.price),
                image: tempImage,
            }),
        });

        const data = await res.json();

        setItems(prev => [
            { id: data.id, ...newItem, image: tempImage },
            ...prev,
        ]);

        setNewItem({ title: '', description: '', price: '', image: '' });
        setTempImage(null);
        setActiveModal(null);
    };

    const saveEditItem = async () => {
        if (!editItem.title || !editItem.price) {
            alert('Заполни название и цену');
            return;
        }

        const oldImage = editItem.image;
        const newImage = tempImage;
        
        await fetch(`http://localhost:3001/api/admin/shop/${editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: editItem.title,
                description: editItem.description,
                price: Number(editItem.price),
                image: newImage,
            }),
        });
        if (oldImage !== newImage) {
            await fetch('http://localhost:3001/api/admin/delete-temp-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, imagePath: oldImage }),
            });
        }
        setItems(prev =>
            prev.map(i =>
                i.id === editItem.id ? { ...editItem, image: newImage } : i
            )
        );
        setEditItem(null);
        setTempImage(null);
        setActiveModal(null);
    };

    const deleteItem = async () => {
        if (activeItem?.image) {
            await fetch('http://localhost:3001/api/admin/delete-temp-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, imagePath: activeItem.image }),
            });
        }

        await fetch(`http://localhost:3001/api/admin/shop/${activeItem.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
        });

        setItems(prev => prev.filter(i => i.id !== activeItem.id));
        setActiveItem(null);
        setActiveModal(null);
    };

    const deleteTempImage = async () => {
        if (!tempImage) return;

        await fetch('http://localhost:3001/api/admin/delete-temp-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                imagePath: tempImage,
            }),
        });

        setTempImage(null);
    };

    const uploadImage = async (file, onSuccess) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', user.id);

        setUploading(true);

        try {
            const res = await fetch(
                'http://localhost:3001/api/admin/upload/shop-image',
                {
                    method: 'POST',
                    body: formData,
                }
            );

            const data = await res.json();

            if (data.imagePath) {
                onSuccess(data.imagePath);
            } else {
                alert('Ошибка загрузки изображения');
            }
        } catch (e) {
            console.error(e);
            alert('Ошибка загрузки');
        } finally {
            setUploading(false);
        }
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
                        src={`http://localhost:3001${activeItem?.image}`}
                        alt=""
                        style={{
                            width: '100%',
                            borderRadius: 8,
                            marginBottom: 8,
                        }}
                    />
                    <Text style={{ marginBottom: 12 }}>
                        {activeItem?.description}
                    </Text>
                    <Text weight="3"
                        style={{
                            fontSize: 18,
                            color: '#4000ff',
                            marginTop: 8,
                        }}    
                    >
                        Цена: {activeItem?.price}
                    </Text>

                    {isAdmin && (
                        <Div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                            <Button
                                mode="secondary"
                                onClick={() => {
                                    setEditItem(activeItem);
                                    setTempImage(activeItem.image);
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
                    onClose={() => {
                        deleteTempImage();
                        setActiveModal(null);
                    }}
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
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={e => {
                            const file = e.target.files[0];
                            if (!file) return;

                            uploadImage(file, imagePath => {
                                setTempImage(imagePath);
                            });
                        }}
                        style={{ marginBottom: 12 }}
                    />

                    {uploading && (
                        <Text style={{ marginBottom: 8 }}>Загрузка изображения…</Text>
                    )}

                    {tempImage && (
                        <img
                            src={`http://localhost:3001${tempImage}`}
                            alt=""
                            style={{
                                width: 120,
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 8,
                                marginBottom: 12,
                                border: '1px solid #ddd',
                            }}
                        />
                    )}

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
                    onClose={async () => {
                        // Если tempImage отличается от текущей картинки товара — удаляем её
                        if (tempImage && tempImage !== editItem?.image) {
                            await fetch('http://localhost:3001/api/admin/delete-temp-image', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ userId: user.id, imagePath: tempImage }),
                            });
                        }

                        setEditItem(null);
                        setTempImage(null);
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
                        type="file"
                        accept="image/png, image/jpeg"
                        onChange={async e => {
                            const file = e.target.files[0];
                            if (!file) return;
                            if (tempImage && tempImage !== editItem?.image) {
                                await fetch('http://localhost:3001/api/admin/delete-temp-image', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ userId: user.id, imagePath: tempImage }),
                                });
                            }
                            uploadImage(file, imagePath => setTempImage(imagePath));
                        }}
                    />

                    {uploading && (
                        <Text style={{ marginBottom: 8 }}>Загрузка изображения…</Text>
                    )}

                    {tempImage && (
                        <img
                            src={`http://localhost:3001${tempImage}`}
                            alt=""
                            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12, border: '1px solid #ddd' }}
                        />
                    )}

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
                        style={{ margin: 12, backgroundColor: '#fff', color: '#000' }}
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
                        <img src={coinsIcon} alt="coins" style={{ height: 25, width: 25 }} />
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

                <Div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: '16px' }}>
                    <Text weight="medium" style={{ marginBottom: 8, color: '#311f68' }}>
                        Фильтр по цене
                    </Text>

                    <Slider
                        min={priceBounds[0]}
                        max={priceBounds[1]}
                        value={priceRange}
                        onChange={setPriceRange}
                        step={1}
                        multiple
                    />

                    <Div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <Input
                            type="number"
                            value={priceRange[0]}
                            onChange={e =>
                                setPriceRange([Number(e.target.value), priceRange[1]])
                            }
                            placeholder="От"
                        />

                        <Input
                            type="number"
                            value={priceRange[1]}
                            onChange={e =>
                                setPriceRange([priceRange[0], Number(e.target.value)])
                            }
                            placeholder="До"
                        />
                    </Div>
                </Div>

                <Div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 12,
                        padding: 16,
                    }}
                >
                    {filteredItems.map(item => {
                        const isOwned = ownedItems.includes(item.id);
                        const cannotBuy = balance < item.price;

                        return (
                            <Div
                                key={item.id}
                                style={{
                                    backgroundColor: isOwned ? '#e8f5e9' : '#ffffff',
                                    borderRadius: 12,
                                    padding: 8,
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    opacity: isOwned ? 0.7 : 1,
                                    cursor: isOwned ? 'default' : 'pointer',
                                    border: '1px solid #e0e0e0',
                                }}
                                onMouseEnter={e => {
                                    if (isOwned) return;
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.12)';
                                }}
                                onMouseLeave={e => {
                                    if (isOwned) return;
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                                onClick={() => {
                                    if (isOwned) return;
                                    setActiveItem(item);
                                    setActiveModal('item');
                                }}
                            >
                                <img
                                    src={`http://localhost:3001${item.image}`} // <-- добавляем базовый адрес
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

                                <Text weight='3' style={{ fontSize: 16, color: '#4000ff', marginBottom: 6 }}>
                                    {item.price}
                                </Text>

                                {isOwned ? (
                                    <Text style={{ color: '#4caf50', fontWeight: 600 }}>
                                        ✔ Куплено
                                    </Text>
                                ) : (
                                    <Button
                                        size="m"
                                        mode="primary"
                                        stretched
                                        disabled={cannotBuy}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (cannotBuy) return;

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
                                        {cannotBuy ? 'Не хватает монет' : 'Купить'}
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