import { useState, useEffect } from 'react'; 
import { Panel, Div, Button, ModalCard, ModalRoot, Slider, Input, Badge } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon28ShoppingCartOutline } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'

const inputStyle = {
    padding: 10,
    paddingRight: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
};

export default function Shop({ id, goBack, balance, goToBalance, user, initialFilter }) {
    const [items, setItems] = useState([]);
    const [ownedItems, setOwnedItems] = useState({});
    const [activeItem, setActiveItem] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [filteredItems, setFilteredItems] = useState([]);
    const [priceBounds, setPriceBounds] = useState([0, 0]);
    const [priceRange, setPriceRange] = useState([0, 0]);
    const [uploading, setUploading] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [cart, setCart] = useState({});
    const [cartItemsFull, setCartItemsFull] = useState([]);

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        image: '',
    });

    const isAdmin = user?.role === 'admin';

    const loadShop = async () => {
        const url = isAdmin
            ? `http://localhost:3001/api/admin/shop?userId=${user.id}`
            : `http://localhost:3001/api/shop?userId=${user.id}`;

        const res = await fetch(url);
        const data = await res.json();

        const loadedItems = isAdmin ? data : data.items;
        setItems(loadedItems);

        if (!isAdmin) {
            const owned = {};
            data.ownedItems?.forEach(item => {
                owned[String(item.item_id)] = item.quantity;
            });
            setOwnedItems(owned);
        }

        if (loadedItems.length) {
            const prices = loadedItems.map(i => i.price);
            const min = Math.min(...prices);
            const max = Math.max(...prices);
            setPriceBounds([min, max]);
            setPriceRange([min, max]);
        }
    };

    useEffect(() => {
        loadShop();
    }, [user.id, isAdmin]);

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

    const addToCart = async (itemId) => {
        await fetch('http://localhost:3001/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, itemId, quantity: 1 }),
        });
    };

    const removeFromCart = async (itemId) => {
        await fetch('http://localhost:3001/api/cart/decrease', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, itemId }),
        });
    };

    const loadCart = async () => {
        const res = await fetch(`http://localhost:3001/api/cart/${user.id}`);
        const data = await res.json();

        const cartObj = {};
        data.cart?.forEach(item => {
            cartObj[String(item.item_id)] = item.quantity;
        });

        setCart(cartObj);
        setCartItemsFull(data.cart || []);
    };

    const checkout = async () => {
        const res = await fetch('http://localhost:3001/api/cart/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.error || 'Ошибка покупки');
            return;
        }

        await loadCart();

        // Обновляем купленные
        const shopRes = await fetch(`http://localhost:3001/api/shop?userId=${user.id}`);
        const shopData = await shopRes.json();

        const owned = {};
        shopData.ownedItems?.forEach(item => {
            owned[String(item.item_id)] = item.quantity;
        });

        setOwnedItems(owned);

        alert('Покупка успешна!');
        await loadCart();
        await loadShop();
        setActiveModal(null);
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
                    <CustomText style={{ marginBottom: 12 }}>
                        {activeItem?.description}
                    </CustomText>
                    <CustomText weight="3"
                        style={{
                            fontSize: 18,
                            color: '#4000ff',
                            marginTop: 8,
                        }}    
                    >
                        Цена: {activeItem?.price}
                    </CustomText>

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
                        <CustomText style={{ marginBottom: 8 }}>Загрузка изображения…</CustomText>
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
                        <CustomText style={{ marginBottom: 8 }}>Загрузка изображения…</CustomText>
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
                    <CustomText style={{ marginBottom: 12 }}>
                        Товар <b>{activeItem?.title}</b> будет удалён навсегда.
                    </CustomText>

                    <Div style={{ display: 'flex', gap: 8 }}>
                        <Button mode="destructive" stretched onClick={deleteItem}>
                            Удалить
                        </Button>
                        <Button mode="secondary" stretched onClick={() => setActiveModal(null)}>
                            Отмена
                        </Button>
                    </Div>
                </ModalCard>

                <ModalCard
                    id="cart"
                    header="Корзина"
                    onClose={() => setActiveModal(null)}
                >
                    {/* БЛОК КУПЛЕННОЕ */}
                    {Object.keys(ownedItems).length > 0 && (
                        <Div style={{ marginBottom: 16 }}>
                            <CustomText weight="medium" style={{ marginBottom: 8 }}>
                                Купленное
                            </CustomText>

                            {Object.entries(ownedItems).map(([itemId, qty]) => {
                                const item = items.find(i => i.id === Number(itemId));
                                if (!item) return null;

                                return (
                                    <Div
                                        key={itemId}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            padding: 8,
                                            background: '#f1f8e9',
                                            borderRadius: 8,
                                            marginBottom: 6,
                                        }}
                                    >
                                        <CustomText>{item.title}</CustomText>
                                        <CustomText weight="3">
                                            {qty} шт.
                                        </CustomText>
                                    </Div>
                                );
                            })}
                        </Div>
                    )}

                    {/* ЕСЛИ КОРЗИНА ПУСТА */}
                    {cartItemsFull.length === 0 ? (
                        <CustomText>Корзина пуста</CustomText>
                    ) : (
                        <>
                            {cartItemsFull.map(item => (
                                <Div
                                    key={item.item_id}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        marginBottom: 12,
                                    }}
                                >
                                    <img
                                        src={`http://localhost:3001${item.image}`}
                                        alt=""
                                        style={{
                                            width: 50,
                                            height: 50,
                                            objectFit: 'cover',
                                            borderRadius: 8,
                                        }}
                                    />

                                    <div style={{ flex: 1 }}>
                                        <CustomText weight="medium">
                                            {item.title}
                                        </CustomText>
                                        <CustomText style={{ color: '#4000ff' }}>
                                            {item.price} × {item.quantity}
                                        </CustomText>
                                    </div>

                                    <Div style={{ display: 'flex', gap: 4 }}>
                                        <Button
                                            size="s"
                                            mode="secondary"
                                            onClick={async () => {
                                                await removeFromCart(item.item_id);
                                                await loadCart();
                                            }}
                                        >
                                            -
                                        </Button>

                                        <Button
                                            size="s"
                                            mode="secondary"
                                            onClick={async () => {
                                                await addToCart(item.item_id);
                                                await loadCart();
                                            }}
                                        >
                                            +
                                        </Button>
                                    </Div>
                                </Div>
                            ))}

                            <Div style={{ marginTop: 16 }}>
                                <CustomText weight="3" style={{ fontSize: 16 }}>
                                    Итого:{" "}
                                    {cartItemsFull.reduce(
                                        (sum, i) => sum + i.price * i.quantity,
                                        0
                                    )}
                                </CustomText>
                            </Div>

                            <Button
                                mode="primary"
                                stretched
                                style={{ marginTop: 12 }}
                                onClick={checkout}
                            >
                                Оплатить
                            </Button>
                        </>
                    )}
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

                    {/* Контейнер для корзины и баланса */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                        {/* Кнопка корзины */}
                        <div style={{ position: 'relative' }}>
                            <Button
                                mode="tertiary"
                                size="l"
                                onClick={async () => {
                                    await loadCart();
                                    setActiveModal('cart');
                                }}
                                style={{ color: '#fff' }}
                            >
                                <Icon28ShoppingCartOutline />
                            </Button>

                            {Object.values(cart).reduce((a, b) => a + b, 0) > 0 && (
                                <Badge
                                    style={{ position: 'absolute', top: -4, right: -4 }}
                                    mode="prominent"
                                >
                                    {Object.values(cart).reduce((a, b) => a + b, 0)}
                                </Badge>
                            )}
                        </div>

                        {/* Баланс-капсула */}
                        <div
                            onClick={goToBalance}
                            style={{
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
                    </div>
                </Div>

                <Div style={{ backgroundColor: '#fff', borderRadius: 12, padding: 16, margin: '16px' }}>
                    <CustomText weight="medium" style={{ marginBottom: 8, color: '#311f68' }}>
                        Фильтр по цене
                    </CustomText>

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

                {/* КУПЛЕННОЕ */}
                {Object.keys(ownedItems).length > 0 && (
                    <Div style={{ padding: 16 }}>
                        <CustomText weight="medium" style={{ marginBottom: 8, color: '#311f68' }}>
                            Купленное
                        </CustomText>

                        <Div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 12,
                            }}
                        >
                            {Object.entries(ownedItems).map(([itemId, qty]) => {
                                const item = items.find(i => i.id === Number(itemId));
                                if (!item) return null;
                                return (
                                    <Div
                                        key={itemId}
                                        style={{
                                            backgroundColor: '#e8f5e9',
                                            borderRadius: 12,
                                            padding: 8,
                                            opacity: 0.8,
                                            cursor: 'default',
                                            border: '1px solid #e0e0e0',
                                        }}
                                    >
                                        <img
                                            src={`http://localhost:3001${item.image}`}
                                            alt=""
                                            style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                                        />
                                        <CustomText weight="medium">{item.title}</CustomText>
                                        <CustomText style={{ color: '#4caf50', fontWeight: 600 }}>
                                            ✔ Куплено {ownedItems[item.id] || 0} шт.
                                        </CustomText>
                                    </Div>
                                );
                            })}
                        </Div>
                    </Div>
                )}

                {/* МАГАЗИН */}
                <Div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: 12,
                        padding: 16,
                    }}
                >
                    {filteredItems.map(item => {
                        const isOwned = !!ownedItems[item.id]; 

                        return (
                            <Div key={item.id} style={{
                                backgroundColor: isOwned ? '#f0f0ff' : '#ffffff',
                                borderRadius: 12,
                                padding: 8,
                                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                cursor: 'pointer',
                                border: '1px solid #e0e0e0',
                            }}>
                                <img
                                    src={`http://localhost:3001${item.image}`}
                                    alt=""
                                    style={{ width: '100%', borderRadius: 8, marginBottom: 8 }}
                                />
                                <CustomText weight="medium">{item.title}</CustomText>
                                <CustomText weight="3" style={{ fontSize: 16, color: '#4000ff', marginBottom: 6 }}>
                                    {item.price}
                                </CustomText>

                                {(cart[String(item.id)] || 0) === 0 ? (
                                    <div
                                        onClick={() => addToCart(item.id)}
                                        style={{
                                            backgroundColor: '#4000ff',
                                            color: '#fff',
                                            padding: '6px 0',
                                            borderRadius: 8,
                                            textAlign: 'center',
                                            fontWeight: 600,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        В корзину
                                    </div>
                                ) : (
                                    <Div style={{ display: 'flex', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
                                        <div
                                            onClick={() => removeFromCart(item.id)}
                                            style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: '#eee', textAlign: 'center', lineHeight: '32px',
                                                cursor: 'pointer', fontWeight: 600
                                            }}
                                        >
                                            -
                                        </div>
                                        <CustomText style={{ width: 32, textAlign: 'center', fontWeight: 600 }}>
                                            {cart[String(item.id)]}
                                        </CustomText>
                                        <div
                                            onClick={() => addToCart(item.id)}
                                            style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: '#eee', textAlign: 'center', lineHeight: '32px',
                                                cursor: 'pointer', fontWeight: 600
                                            }}
                                        >
                                            +
                                        </div>
                                    </Div>
                                )}
                            </Div>
                        );
                    })}
                </Div>
            </Panel>
        </>
    );
}