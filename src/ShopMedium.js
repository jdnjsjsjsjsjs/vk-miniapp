import { useState, useEffect } from 'react'; 
import { Panel, Div, Button, ModalCard, ModalRoot, Card } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';
import { Icon28ChevronBack, Icon28ShoppingCartOutline } from '@vkontakte/icons';

import coinIcon from './imgs/coin.png'
import box2Icon from './imgs/box2.png'

const inputStyle = {
    padding: 10,
    paddingRight: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
};

export default function Shop({ id, goBack, go, balance, goToBalance, user }) {
    const [items, setItems] = useState([]);
    const [activeItem, setActiveItem] = useState(null);
    const [activeModal, setActiveModal] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [cart, setCart] = useState({});
    const [cartItemsFull, setCartItemsFull] = useState([]);
    const [checkoutConfirm, setCheckoutConfirm] = useState(false);
    const [checkoutSuccess, setCheckoutSuccess] = useState(false);

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
    };

    useEffect(() => {
        loadShop();
    }, [user.id, isAdmin]);

    useEffect(() => {
        loadCart();
    }, [user.id]);

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

        await loadCart();
    };

    const removeFromCart = async (itemId) => {
        await fetch('http://localhost:3001/api/cart/decrease', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, itemId }),
        });

        await loadCart();
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
        await loadShop();

        setActiveModal(null);
    };

    const total = cartItemsFull.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
    );

    const notEnough = total > balance;
    const deficit = total - balance;

    const activeItemInCart = activeItem ? (cart[String(activeItem.id)] || 0) : 0;

    const totalWithActiveItem = activeItem
        ? total + (activeItem.price * (activeItemInCart === 0 ? 1 : 0))
        : total;

    const notEnoughForActive = activeItem
        ? totalWithActiveItem > balance
        : false;

    const lackAmountForActive = activeItem
        ? totalWithActiveItem - balance
        : 0;

    return (
        <>
            <ModalRoot activeModal={
                checkoutConfirm ? 'checkoutConfirm' :
                checkoutSuccess ? 'checkoutSuccess' :
                activeModal
            }>
                <ModalCard
                    id="item"
                    onClose={() => {
                        setActiveModal(null);
                        setActiveItem(null);
                    }}
                >
                    {/* Фото */}
                    {activeItem?.image ? (
                        <img
                        src={`http://localhost:3001${activeItem.image}`}
                        alt=""
                        style={{
                            width: '100%',
                            borderRadius: 12,
                            marginBottom: 12,
                        }}
                        />
                    ) : (
                        <div
                        style={{
                            width: '100%',
                            aspectRatio: '1 / 1',
                            backgroundColor: '#e5e5e5',
                            borderRadius: 12,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 12,
                        }}
                        >
                        <CustomText
                            weight="1"
                            style={{
                            fontSize: 12,
                            color: '#ffffff',
                            textAlign: 'center',
                            lineHeight: '14px',
                            }}
                        >
                            фото<br />появится<br />позже
                        </CustomText>
                        </div>
                    )}

                    {/* Верхняя строка: название — кнопки — цена */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 8,
                            marginBottom: 8,
                        }}
                    >
                        {/* Левая часть: название + описание */}
                        <div style={{ flex: 1 }}>
                            <CustomText
                                weight="3"
                                style={{
                                    fontSize: 14,
                                    marginBottom: 4,
                                    lineHeight: '20px',
                                }}
                            >
                                {activeItem?.title}
                            </CustomText>

                            <CustomText
                                style={{
                                    color: '#6f6f6f',
                                    fontSize: 14,
                                    lineHeight: '18px',
                                }}
                            >
                                {activeItem?.description}
                            </CustomText>
                        </div>

                        {/* Цена + монетка */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                marginLeft: 4,
                            }}
                        >
                            <CustomText
                                weight="1"
                                style={{
                                    fontSize: 18,
                                    color: '#8c64d7',
                                }}
                            >
                                {activeItem?.price}
                            </CustomText>

                            <img
                                src={coinIcon}
                                alt=""
                                style={{ width: 24, height: 24 }}
                            />
                        </div>
                    </div>

                    {/* КНОПКА */}
                    {cart[String(activeItem?.id)] ? (
                        <div
                            onClick={async () => {
                                await loadCart();
                                setActiveModal('cart');
                            }}
                            style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                                borderRadius: 999,
                                padding: '6px 0',
                                textAlign: 'center',
                                cursor: 'pointer',
                                border: '1px solid #8c64d7',
                            }}
                        >
                            <CustomText
                                weight="1"
                                style={{
                                    color: '#8c64d7',
                                    fontSize: 12,
                                }}
                            >
                                перейти в корзину
                            </CustomText>
                        </div>
                    ) : notEnoughForActive ? (
                        <div
                            style={{
                                width: '100%',
                                backgroundColor: '#ceaeff',
                                borderRadius: 999,
                                padding: '6px 0',
                                textAlign: 'center',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 4,
                                cursor: 'not-allowed',
                                opacity: 0.9,
                            }}
                        >
                            <CustomText
                                weight="1"
                                style={{
                                    color: '#ffffff',
                                    fontSize: 12,
                                }}
                            >
                                не хватает {lackAmountForActive}
                            </CustomText>
                            <img
                                src={coinIcon}
                                alt=""
                                style={{ width: 18, height: 18 }}
                            />
                        </div>
                    ) : (
                        <div
                            onClick={async () => {
                                await addToCart(activeItem.id);
                            }}
                            style={{
                                width: '100%',
                                backgroundColor: '#8c64d7',
                                borderRadius: 999,
                                padding: '6px 0',
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                        >
                            <CustomText
                                weight="1"
                                style={{
                                    color: '#ffffff',
                                    fontSize: 12,
                                }}
                            >
                                добавить в корзину
                            </CustomText>
                        </div>
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
                    onClose={() => setActiveModal(null)}
                >
                    {/* Заголовок */}
                    <CustomText
                        weight="1"
                        style={{
                            fontSize: 18,
                            marginBottom: 16,
                        }}
                    >
                        Корзина
                    </CustomText>

                    {cartItemsFull.length === 0 ? (
                        <CustomText style={{ color: '#777' }}>
                            Корзина пуста
                        </CustomText>
                    ) : (
                        <>
                            {/* Список товаров */}
                            <div
                                className="cart-scroll"
                                onTouchStart={(e) => e.stopPropagation()}
                                onTouchMove={(e) => e.stopPropagation()}
                                onTouchEnd={(e) => e.stopPropagation()}
                                style={{
                                    maxHeight: 280,
                                    overflowY: 'auto',
                                    paddingRight: 6,
                                    marginBottom: 12,
                                }}
                            >
                                {cartItemsFull.map(item => (
                                    <div
                                        key={item.item_id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 10,
                                            marginBottom: 14,
                                        }}
                                    >
                                        {/* Фото */}
                                        {item.image ? (
                                            <img
                                                src={`http://localhost:3001${item.image}`}
                                                alt=""
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    objectFit: 'cover',
                                                    borderRadius: 10,
                                                }}
                                            />
                                        ) : (
                                            <div
                                                style={{
                                                    width: 50,
                                                    height: 50,
                                                    backgroundColor: '#e5e5e5',
                                                    borderRadius: 10,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    textAlign: 'center',
                                                    fontSize: 10,
                                                    color: '#fff',
                                                }}
                                            >
                                                фото нет
                                            </div>
                                        )}

                                        {/* Название + количество */}
                                        <div style={{ flex: 1 }}>
                                            <CustomText
                                                weight="3"
                                                style={{
                                                    fontSize: 14,
                                                    lineHeight: '16px',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                {item.title}
                                            </CustomText>

                                            <div
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                }}
                                            >
                                                <div
                                                    onClick={async () => {
                                                        await removeFromCart(item.item_id);
                                                    }}
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: 999,
                                                        backgroundColor: '#ceaeff',
                                                        textAlign: 'center',
                                                        lineHeight: '22px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    -
                                                </div>

                                                <CustomText
                                                    weight="1"
                                                    style={{
                                                        minWidth: 20,
                                                        textAlign: 'center',
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    {item.quantity}
                                                </CustomText>

                                                <div
                                                    onClick={async () => {
                                                        await addToCart(item.item_id);
                                                    }}
                                                    style={{
                                                        width: 22,
                                                        height: 22,
                                                        borderRadius: 999,
                                                        backgroundColor: '#ceaeff',
                                                        textAlign: 'center',
                                                        lineHeight: '22px',
                                                        cursor: 'pointer',
                                                        fontWeight: 600
                                                    }}
                                                >
                                                    +
                                                </div>
                                            </div>
                                        </div>

                                        {/* Цена */}
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <CustomText
                                                weight="1"
                                                style={{
                                                    fontSize: 14,
                                                    color: '#8c64d7',
                                                }}
                                            >
                                                {item.price * item.quantity}
                                            </CustomText>

                                            <img
                                                src={coinIcon}
                                                alt=""
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* ИТОГО */}
                            <div style={{ marginTop: 8 }}>
                                <CustomText
                                    weight="1"
                                    style={{
                                        fontSize: 16,
                                        marginBottom: 12,
                                    }}
                                >
                                    Итого: {total}
                                </CustomText>
                            </div>

                            {/* Кнопка оплаты */}
                            <div
                                onClick={() => {
                                    if (!notEnough) setCheckoutConfirm(true);
                                }}
                                style={{
                                    width: '100%',
                                    backgroundColor: notEnough ? '#ceaeff' : '#8c64d7',
                                    borderRadius: 999,
                                    padding: '5px 0',
                                    textAlign: 'center',
                                    cursor: notEnough ? 'not-allowed' : 'pointer',
                                    opacity: notEnough ? 0.9 : 1,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <CustomText
                                    weight="1"
                                    style={{
                                        color: '#fff',
                                        fontSize: 14,
                                    }}
                                >
                                    {notEnough ? `не хватает ${deficit}` : 'купить'}
                                </CustomText>

                                {notEnough && (
                                    <img
                                        src={coinIcon}
                                        alt="coins"
                                        style={{ width: 20, height: 20 }}
                                    />
                                )}
                            </div>
                        </>
                    )}
                </ModalCard>

                <ModalCard
                    id="checkoutConfirm"
                    header="Подтвердить покупку?"
                    onClose={() => setCheckoutConfirm(false)}
                >
                    <CustomText style={{ marginBottom: 16 }}>
                        Вы подтверждаете покупку товаров?
                    </CustomText>

                    <Div style={{ display: 'flex', gap: 8 }}>
                        <Button
                            mode="primary"
                            stretched
                            onClick={async () => {
                                await checkout();
                                setCheckoutConfirm(false);
                                setCheckoutSuccess(true);
                            }}
                        >
                            Да
                        </Button>

                        <Button
                            mode="secondary"
                            stretched
                            onClick={() => setCheckoutConfirm(false)}
                        >
                            Отмена
                        </Button>
                    </Div>
                </ModalCard>

                <ModalCard
                    id="checkoutSuccess"
                    header="Покупка оформлена"
                    onClose={() => setCheckoutSuccess(false)}
                >
                    <CustomText>
                        🎉 Поздравляем тебя с приобретением!
                    </CustomText>

                    <CustomText style={{ marginTop: 12 }}>
                        Забрать покупку можно:
                        <br />
                        Пн–Чт: 9:00–18:00
                        <br />
                        Пт: 9:00–16:45
                        <br /><br />
                        Комитет Ивановской области по молодежной политике
                        <br />
                        Шереметьевский пр., 11
                        <br />
                        Центральная библиотека, каб. 6
                    </CustomText>

                    <Button
                        mode="primary"
                        stretched
                        style={{ marginTop: 16 }}
                        onClick={() => setCheckoutSuccess(false)}
                    >
                        Понятно
                    </Button>
                </ModalCard>
            </ModalRoot>

            <Panel id={id} style={{backgroundColor: '#ceaeff', minHeight: '100vh'}}>
                <Div style={{ height: 32, backgroundColor: '#ceaeff' }} />

                {isAdmin && (
                    <Div style={{ backgroundColor: '#ceaeff' }}>
                        <Button
                            size="s"
                            mode="secondary"
                            style={{ margin: 1, backgroundColor: '#fff', color: '#000' }}
                            onClick={() => setActiveModal('add')}
                        >
                            ➕ Добавить
                        </Button>

                        <Button
                            size="s"
                            mode="secondary"
                            style={{ margin: 1, backgroundColor: '#fff', color: '#000' }}
                            onClick={() => go('adminPurchases')}
                        >
                            📦 Купленные
                        </Button>
                    </Div>
                )}
                            
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
                    
                    {/* Контейнер для корзины и баланса */}
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
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
                    </div>
                </Div>

                {/* МАГАЗИН */}
                <Div style={{ backgroundColor: '#ceaeff', padding: 0 }}>
                    <Card
                        mode="shadow"
                        style={{
                            borderRadius: 10,
                            padding: '20px 15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            backgroundColor: '#ffffff',
                            margin: '10px 16px 0px 16px',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <CustomText
                                weight="1"
                                style={{
                                    fontSize: 14,
                                    color: '#000',
                                }}
                            >
                                Артефакты от 500 капиталов
                            </CustomText>

                            <div
                                onClick={async () => {
                                    await loadCart();
                                    setActiveModal('cart');
                                }}
                                style={{
                                    width: 22,
                                    height: 22,
                                    backgroundColor: '#8c64d7',
                                    borderRadius: 7,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <Icon28ShoppingCartOutline width={16} height={16} fill="#ffffff" />

                                {Object.values(cart).reduce((a, b) => a + b, 0) > 0 && (
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: -4,
                                            right: -7,
                                            backgroundColor: '#ff3b30',
                                            color: '#fff',
                                            fontSize: 7,
                                            borderRadius: 999,
                                            padding: '1px 5px',
                                            fontWeight: 600
                                        }}
                                    >
                                        {Object.values(cart).reduce((a, b) => a + b, 0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <img
                            src={box2Icon}
                            alt="gift"
                            style={{
                                width: 75,
                                height: 75,
                                objectFit: 'contain',
                                position: 'absolute',
                                right: 3,
                            }}
                        />
                    </Card>

                    <Div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
                            gap: 8,
                        }}
                    >
                        {[...items]
                        .filter(item => item.price >= 500 && item.price < 1000)
                        .sort((a, b) => a.price - b.price)
                        .map(item => {
                            const itemInCart = cart[String(item.id)] || 0;
                            const totalWithThisItem = total + item.price;
                            const notEnoughForThis = totalWithThisItem > balance;
                            const lackAmount = totalWithThisItem - balance;
                            return (
                                <Div key={item.id} style={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: 12,
                                    padding: 8,
                                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                }}
                                onClick={() => {
                                    setActiveItem(item);
                                    setActiveModal('item');
                                }}
                                >
                                    {item.image ? (
                                        <img
                                            src={`http://localhost:3001${item.image}`}
                                            alt=""
                                            style={{
                                                width: '100%',
                                                aspectRatio: '1 / 1',
                                                objectFit: 'cover',
                                                borderRadius: 8,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: '100%',
                                                aspectRatio: '1 / 1',
                                                backgroundColor: '#e5e5e5',
                                                borderRadius: 8,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <CustomText
                                                weight="1"
                                                style={{
                                                    fontSize: 10,
                                                    color: '#ffffff',
                                                    textAlign: 'center',
                                                    lineHeight: '10px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <span>фото</span>
                                                <span>появится</span>
                                                <span>позже</span>
                                            </CustomText>
                                        </div>
                                    )}
                                    <CustomText weight="3" style={{ fontSize: 12, paddingTop: 3 }}>{item.title}</CustomText>
                                    <div
                                        style={{                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <CustomText
                                            weight="1"
                                            style={{
                                                fontSize: 14,
                                                color: '#8c64d7',
                                                lineHeight: '18px',
                                            }}
                                        >
                                            {item.price}
                                        </CustomText>
                                        <img src={coinIcon} alt="coins" style={{ height: 25, width: 25 }} />
                                    </div>

                                    {itemInCart === 0 ? (
                                        notEnoughForThis ? (
                                            <div
                                                style={{
                                                    marginTop: 8,
                                                    width: '100%',
                                                    backgroundColor: '#ceaeff',
                                                    borderRadius: 999,
                                                    padding: '2px 2px',
                                                    textAlign: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'not-allowed',
                                                    opacity: 0.9,
                                                }}
                                            >
                                                <CustomText
                                                    weight="1"
                                                    style={{
                                                        color: '#ffffff',
                                                        fontSize: 10,
                                                    }}
                                                >
                                                    ещё {lackAmount}
                                                </CustomText>
                                                <img
                                                    src={coinIcon}
                                                    alt=""
                                                    style={{ height: 16, width: 16 }}
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item.id);
                                                }}
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
                                                    купить
                                                </CustomText>
                                            </div>
                                        )
                                    ) : (
                                        <Div style={{ display: 'flex', gap: 0, justifyContent: 'center', alignItems: 'center', padding: '9px 0px 0px 0px' }}>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeFromCart(item.id);
                                                }}
                                                style={{
                                                    width: 20, height: 20, borderRadius: 999,
                                                    backgroundColor: '#ceaeff', textAlign: 'center', lineHeight: '20px',
                                                    cursor: 'pointer', fontWeight: 600
                                                }}
                                            >
                                                -
                                            </div>
                                            <CustomText style={{ width: 32, textAlign: 'center', fontWeight: 600, fontSize: 14 }}>
                                                {cart[String(item.id)]}
                                            </CustomText>
                                            <div
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    addToCart(item.id);
                                                }}
                                                style={{
                                                    width: 20, height: 20, borderRadius: 999,
                                                    backgroundColor: '#ceaeff', textAlign: 'center', lineHeight: '20px',
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
                </Div>

                <style>
                    {`
                    /* ===== КАСТОМНЫЙ ПРЕМИУМ СКРОЛЛ ===== */

                    .cart-scroll {
                    scrollbar-width: thin;
                    scrollbar-color: #8c64d7 transparent;
                    }

                    /* Chrome / Edge / Safari */
                    .cart-scroll::-webkit-scrollbar {
                    width: 6px;
                    }

                    .cart-scroll::-webkit-scrollbar-track {
                    background: transparent;
                    }

                    .cart-scroll::-webkit-scrollbar-thumb {
                    background: linear-gradient(180deg, #ceaeff, #8c64d7);
                    border-radius: 999px;
                    box-shadow: 0 0 6px rgba(140, 100, 215, 0.4);
                    transition: 0.2s ease;
                    }

                    .cart-scroll::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(180deg, #b88cff, #6f3fd6);
                    box-shadow: 0 0 8px rgba(140, 100, 215, 0.6);
                    }
                    `}
                </style>
            </Panel>
        </>
    );
}