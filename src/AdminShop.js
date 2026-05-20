import { useState, useEffect } from 'react';
import { Panel, Div, Button, Card, ModalRoot, ModalCard } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Cancel, Icon16Attach } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';
import API_URL from './config';

import coinIcon from './imgs/coin.png'
import boxIcon from './imgs/box1.png'

export default function AdminShop({ id, user, goToAdminShopArchive, goToProfile }) {
    const [items, setItems] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [successArchive, setSuccessArchive] = useState(false);
    const [successState, setSuccessState] = useState({
        add: false,
        edit: false,
    });

    const activeItems = items.filter(i => i.archived !== 1);

    const groups = [
        {
            title: 'Артефакты от 100 капиталов',
            items: activeItems
                .filter(i => i.price >= 0 && i.price < 500)
                .sort((a, b) => a.price - b.price)
        },
        {
            title: 'Артефакты от 500 капиталов',
            items: activeItems
                .filter(i => i.price >= 500 && i.price < 1000)
                .sort((a, b) => a.price - b.price)
        },
        {
            title: 'Артефакты от 1000 капиталов',
            items: activeItems
                .filter(i => i.price >= 1000)
                .sort((a, b) => a.price - b.price)
        }
    ];

    const inputStyle = `
    .search-input::placeholder {
      color: #ceaeff;
      opacity: 1;
    }
  `;

    const ModalCloseButton = ({ onClick }) => (
        <div
            onClick={onClick}
            style={{
                position: 'absolute',
                top: 12,
                right: 20,
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 10,
            }}
        >
            <Icon24Cancel width={18} height={18} fill="#000" />
        </div>
    );

    const [newItem, setNewItem] = useState({
        title: '',
        quantity: '',
        price: '',
        image: '',
    });

    const loadShop = async () => {
        const res = await fetch(`${API_URL}/api/admin/shop?userId=${user.id}`);
        const data = await res.json();
        setItems(data);
    };

    useEffect(() => {
        loadShop();
    }, [user.id]);

    const archiveItem = async () => {
        await fetch(`${API_URL}/api/admin/shop/${activeItem.id}/archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                archived: true, // лучше boolean
            }),
        });

        setItems(prev =>
            prev.map(i =>
                i.id === activeItem.id ? { ...i, archived: 1 } : i
            )
        );

        setSuccessArchive(true);

        setTimeout(() => {
            setSuccessArchive(false);
            setActiveItem(null);
            setActiveModal(null);
        }, 3000);
    };

    const deleteTempImage = async () => {
        if (!tempImage) return;

        await fetch(`${API_URL}/api/admin/delete-temp-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                imagePath: tempImage,
            }),
        });

        setTempImage(null);
    };

    const saveNewItem = async () => {
        const res = await fetch(`${API_URL}/api/admin/shop`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            userId: user.id,
            title: newItem.title,
            quantity: Number(newItem.quantity),
            price: Number(newItem.price),
            image: tempImage,
        }),
    });

    const data = await res.json();

    setItems(prev => [
        { id: data.id, ...newItem, image: tempImage },
        ...prev,
    ]);

    setNewItem({ title: '', quantity: '', price: '' });
        setSuccessState(prev => ({ ...prev, add: true }));

        setTimeout(() => {
            setSuccessState(prev => ({ ...prev, add: false }));
            setTempImage(null);
            setActiveModal(null);
        }, 3000);
    };

    const saveEditItem = async () => {
        await fetch(`${API_URL}/api/admin/shop/${editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: editItem.title,
                quantity: editItem.quantity,
                price: Number(editItem.price),
                image: tempImage,
            }),
        });

        setItems(prev =>
            prev.map(i =>
                i.id === editItem.id ? { ...editItem, image: tempImage } : i
            )
        );

        setSuccessState(prev => ({ ...prev, edit: true }));

        setTimeout(() => {
            setSuccessState(prev => ({ ...prev, edit: false }));
            setEditItem(null);
            setTempImage(null);
            setActiveModal(null);
        }, 3000);
    };

    const deleteItem = async () => {
        await fetch(`${API_URL}/api/admin/shop/${activeItem.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id }),
        });

        setItems(prev => prev.filter(i => i.id !== activeItem.id));
        setActiveItem(null);
        setActiveModal(null);
    };

    const uploadImage = async (file, onSuccess) => {
        const formData = new FormData();
        formData.append('image', file);
        formData.append('userId', user.id);

        setUploading(true);

        try {
            const res = await fetch(
                `${API_URL}/api/admin/upload/shop-image`,
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
            <ModalCard
                id="view"
                onClose={() => {
                    setActiveModal(null);
                    setActiveItem(null);
                }}
            >
                <ModalCloseButton
                    onClick={() => {
                        setActiveModal(null);
                        setActiveItem(null);
                    }}
                />
                {/* Фото */}
                {activeItem?.image ? (
                    <img
                        src={`${API_URL}${activeItem.image}`}
                        alt=""
                        style={{
                            width: '100%',
                            borderRadius: 12,
                            marginBottom: 12,
                            marginTop: 27,
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
                            marginTop: 27,
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

                {/* Название + описание + цена */}
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
                                Количество: {activeItem?.quantity}
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
                    
                <div
                    onClick={archiveItem}
                    style={{
                        width: '100%',
                        backgroundColor: successArchive ? '#ceaeff' : '#8c64d7',
                        borderRadius: 999,
                        padding: '1px 0',
                        textAlign: 'center',
                        cursor: 'pointer',
                        marginTop: 7
                    }}
                >
                    <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                        {successArchive ? 'перенесено в архив' : 'в архив'}
                    </CustomText>
                </div>
            </ModalCard>
            {/* Модалка добавления */}
                <ModalCard
                    id="add"
                    onClose={() => {
                        deleteTempImage();
                        setActiveModal(null);
                    }}
                >
                    <ModalCloseButton onClick={() => setActiveModal(null)} />
                    <CustomText
                        weight="1"
                        style={{ fontSize: 14, color: '#000', marginTop: 27, marginBottom: 3 }}
                    >
                        Артефакт
                    </CustomText>
                    
                    <input
                        type="text"
                        placeholder="название артефакта..."
                            value={newItem.title}
                            onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                            className="search-input"
                            style={{
                                width: '92%',
                                padding: '6px 12px',
                                borderRadius: 999,
                                border: '1px solid #ceaeff',
                                outline: 'none',
                                fontSize: 12,
                                color: '#000',
                                marginBottom: 7,
                            }}
                    />

                    <CustomText
                        weight="1"
                        style={{ fontSize: 14, color: '#000', marginBottom: 3 }}
                    >
                        Количество
                    </CustomText>
                    
                    <input
                        type="number"
                        placeholder="количество артефактов..."
                            value={newItem.quantity}
                            onChange={e => setNewItem({ ...newItem, quantity: e.target.value })}
                            className="search-input"
                            style={{
                                width: '92%',
                                padding: '6px 12px',
                                borderRadius: 999,
                                border: '1px solid #ceaeff',
                                outline: 'none',
                                fontSize: 12,
                                color: '#000',
                                marginBottom: 7,
                            }}
                    />

                    <CustomText
                        weight="1"
                        style={{ fontSize: 14, color: '#000', marginBottom: 3 }}
                    >
                        Цена
                    </CustomText>
                    
                    <input
                        type="number"
                        placeholder="количество капиталов за 1 штуку..."
                            value={newItem.price}
                            onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                            className="search-input"
                            style={{
                                width: '92%',
                                padding: '6px 12px',
                                borderRadius: 999,
                                border: '1px solid #ceaeff',
                                outline: 'none',
                                fontSize: 12,
                                color: '#000',
                                marginBottom: 7,
                            }}
                    />

                    {/* КНОПКА ЗАГРУЗКИ */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            onClick={() => document.getElementById('fileInputAdd').click()}
                            style={{
                                width: '100px',
                                backgroundColor: '#ceaeff',
                                borderRadius: 999,
                                padding: '1px 5px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginTop: 7,

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                            }}
                        >
                            <Icon16Attach fill="#fff" style={{ width: 12, height: 12 }}/>
                            <CustomText style={{ color: '#fff', fontSize: 10 }}>
                                прикрепить фото
                            </CustomText>
                        </div>
                        <input
                            id="fileInputAdd"
                            type="file"
                            accept="image/png, image/jpeg"
                            style={{ display: 'none' }}
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;

                                uploadImage(file, imagePath => {
                                    setTempImage(imagePath);
                                });
                            }}
                        />
                    </div>

                    {uploading && (
                        <CustomText style={{ marginBottom: 8 }}>Загрузка изображения…</CustomText>
                    )}

                    {tempImage && (
                        <img
                            src={`${API_URL}${tempImage}`}
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

                    <div
                        onClick={saveNewItem}
                        style={{
                            width: '100%',
                            backgroundColor: successState.add ? '#ceaeff' : '#8c64d7',
                            borderRadius: 999,
                            padding: '1px 0',
                            textAlign: 'center',
                            cursor: 'pointer',
                            marginTop: 7
                        }}
                    >
                        <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                            {successState.add ? 'добавлено' : 'добавить'}
                        </CustomText>
                    </div>
                </ModalCard>

                <ModalCard
                    id="edit"
                    header="Редактировать товар"
                    onClose={async () => {
                        if (tempImage && tempImage !== editItem?.image) {
                            await fetch(`${API_URL}/api/admin/delete-temp-image`, {
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
                    <ModalCloseButton onClick={() => setActiveModal(null)} />
                    <CustomText
                        weight="1"
                        style={{ fontSize: 14, color: '#000', marginTop: 27, marginBottom: 3 }}
                    >
                        Артефакт
                    </CustomText>
                    
                    <input
                        type="text"
                        placeholder="название артефакта..."
                            value={editItem?.title || ''}
                            onChange={e => setEditItem({ ...editItem, title: e.target.value })}
                            className="search-input"
                            style={{
                                width: '92%',
                                padding: '6px 12px',
                                borderRadius: 999,
                                border: '1px solid #ceaeff',
                                outline: 'none',
                                fontSize: 12,
                                color: '#000',
                                marginBottom: 7,
                            }}
                    />

                    <CustomText
                        weight="1"
                        style={{ fontSize: 14, color: '#000', marginBottom: 3 }}
                    >
                        Количество
                    </CustomText>
                    
                    <input
                        type="number"
                        placeholder="количество артефактов..."
                            value={editItem?.quantity || ''}
                            onChange={e => setEditItem({ ...editItem, quantity: e.target.value })}
                            className="search-input"
                            style={{
                                width: '92%',
                                padding: '6px 12px',
                                borderRadius: 999,
                                border: '1px solid #ceaeff',
                                outline: 'none',
                                fontSize: 12,
                                color: '#000',
                                marginBottom: 7,
                            }}
                    />

                    <CustomText
                        weight="1"
                        style={{ fontSize: 14, color: '#000', marginBottom: 3 }}
                    >
                        Цена
                    </CustomText>
                    
                    <input
                        type="number"
                        placeholder="количество капиталов за 1 штуку..."
                            value={editItem?.price || ''}
                            onChange={e => setEditItem({ ...editItem, price: e.target.value })}
                            className="search-input"
                            style={{
                                width: '92%',
                                padding: '6px 12px',
                                borderRadius: 999,
                                border: '1px solid #ceaeff',
                                outline: 'none',
                                fontSize: 12,
                                color: '#000',
                                marginBottom: 7,
                            }}
                    />

                    {/* КНОПКА ЗАГРУЗКИ */}
                    <div style={{ marginBottom: 12 }}>
                        <div
                            onClick={() => document.getElementById('fileInputEdit').click()}
                            style={{
                                width: '100px',
                                backgroundColor: '#ceaeff',
                                borderRadius: 999,
                                padding: '1px 5px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                marginTop: 7,

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 4,
                            }}
                        >
                            <Icon16Attach fill="#fff" style={{ width: 12, height: 12 }}/>
                            <CustomText style={{ color: '#fff', fontSize: 10 }}>
                                прикрепить фото
                            </CustomText>
                        </div>

                        <input
                            id="fileInputEdit"
                            type="file"
                            accept="image/png, image/jpeg"
                            style={{ display: 'none' }}
                            onChange={async e => {
                                const file = e.target.files[0];
                                if (!file) return;

                                if (tempImage && tempImage !== editItem?.image) {
                                    await fetch(`${API_URL}/api/admin/delete-temp-image`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            userId: user.id,
                                            imagePath: tempImage
                                        }),
                                    });
                                }

                                uploadImage(file, imagePath => setTempImage(imagePath));
                            }}
                        />
                    </div>

                    {uploading && (
                        <CustomText style={{ marginBottom: 8 }}>Загрузка изображения…</CustomText>
                    )}

                    {tempImage && (
                        <img
                            src={`${API_URL}${tempImage}`}
                            alt=""
                            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 12, border: '1px solid #ddd' }}
                        />
                    )}

                    <div
                        onClick={saveEditItem}
                        style={{
                            width: '100%',
                            backgroundColor: successState.edit ? '#ceaeff' : '#8c64d7',
                            borderRadius: 999,
                            padding: '1px 0',
                            textAlign: 'center',
                            cursor: 'pointer',
                            marginTop: 7
                        }}
                    >
                        <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                            {successState.edit ? 'сохранено' : 'сохранить'}
                        </CustomText>
                    </div>
                </ModalCard>

                <ModalCard
                    id="delete"
                    onClose={() => setActiveModal(null)}
                >
                    <ModalCloseButton onClick={() => setActiveModal(null)} />
                    <CustomText weight="1" style={{ marginBottom: 20 }}>
                        Удалить <b style={{ color: '#8c64d7' }}>{activeItem?.title}</b> навсегда?
                    </CustomText>

                    <div style={{ display: 'flex', gap: 6 }}>
                        <div
                            onClick={deleteItem}
                            style={{
                            flex: 1,
                            backgroundColor: '#8c64d7',
                            borderRadius: 999,
                            padding: '1px 0',
                            textAlign: 'center',
                            cursor: 'pointer'
                            }}
                        >
                            <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                            удалить
                            </CustomText>
                        </div>

                        <div
                            onClick={() => setActiveModal(null)}
                            style={{
                            flex: 1,
                            border: '1px solid #8c64d7',
                            borderRadius: 999,
                            padding: '1px 0',
                            textAlign: 'center',
                            cursor: 'pointer'
                            }}
                        >
                            <CustomText style={{ color: '#8c64d7', fontSize: 10, fontWeight: 600 }}>
                                отмена
                            </CustomText>
                        </div>
                    </div>
                </ModalCard>
        </ModalRoot>
        <style>{inputStyle}</style>
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
                onClick={goToProfile}
                style={{
                    paddingLeft: 0,
                    paddingRight: 8,
                    marginRight: 4,
                    color: '#ceaeff',
                }}
            >
                Назад
            </Button>
        </Div>

        <Div style={{ padding: '12px', backgroundColor: '#ceaeff' }}>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CustomText
                  weight="1"
                  style={{
                    fontSize: 16,
                    color: '#000',
                  }}
                >
                  Магазин артефактов (админка)
                </CustomText>
              </div>
              <img
                src={boxIcon}
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

            <Card mode="shadow" style={{ padding: 12, borderRadius: 10 }}>
                <div style={{ gap: 6, marginBottom: 12 }}>
                <div
                  onClick={() => setActiveModal('add')}
                  style={{
                    flex: 1,
                    backgroundColor: '#8c64d7',
                    borderRadius: 999,
                    padding: '1px 0',
                    textAlign: 'center',
                    marginBottom: 6,
                  }}
                >
                  <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                    + добавить артефакт
                  </CustomText>
                </div>

                {/* Архив */}
                <div
                  onClick={goToAdminShopArchive}
                  style={{
                    flex: 1,
                    border: '1px solid #8c64d7',
                    borderRadius: 999,
                    padding: '1px 0',
                    textAlign: 'center',
                    marginBottom: 16,
                    cursor: 'pointer'
                  }}
                >
                  <CustomText style={{ color: '#8c64d7', fontSize: 10, fontWeight: 600 }}>
                    архив артефактов
                  </CustomText>
                </div>
                </div>
                {groups.map(group => (
                    group.items.length > 0 && (
                        <div key={group.title} style={{ marginBottom: 16 }}>
                            <CustomText
                                weight="1"
                                style={{
                                    fontSize: 14,
                                    color: '#000',
                                    marginBottom: 8,
                                    marginLeft: 4
                                }}
                            >
                                {group.title}
                            </CustomText>

                            {/* Список товаров */}
                            {group.items.map(item => (
                                <Card
                                    key={item.id}
                                    onClick={() => {
                                        setActiveItem(item);
                                        setActiveModal('view');
                                    }}
                                    style={{
                                        borderRadius: 12,
                                        padding: '14px',
                                        marginBottom: 6,
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #ceaeff',
                                    }}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 8,
                                        }}
                                    >
                                        <CustomText
                                            weight="2"
                                            style={{
                                                fontSize: 10,
                                                color: '#000',
                                            }}
                                        >
                                            {item.title}
                                        </CustomText>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <CustomText
                                                style={{
                                                    fontSize: 16,
                                                    color: '#8c64d7',
                                                    fontWeight: 1000,
                                                }}
                                            >
                                                {item.price}
                                            </CustomText>

                                            <img
                                                src={coinIcon}
                                                alt="coins"
                                                style={{ height: 20, width: 20 }}
                                            />
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditItem(item);
                                                setTempImage(item.image);
                                                setActiveModal('edit');
                                            }}
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#8c64d7',
                                                borderRadius: 999,
                                                padding: '1px 0',
                                                textAlign: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <CustomText style={{ color: '#fff', fontSize: 10, fontWeight: 600 }}>
                                                редактировать
                                            </CustomText>
                                        </div>

                                        <div
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveItem(item);
                                                setActiveModal('delete');
                                            }}
                                            style={{
                                                flex: 1,
                                                border: '1px solid #8c64d7',
                                                borderRadius: 999,
                                                padding: '1px 0',
                                                textAlign: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <CustomText style={{ color: '#8c64d7', fontSize: 10, fontWeight: 600 }}>
                                                удалить
                                            </CustomText>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )
                ))}
            </Card>
        </Div>
      </Panel>
    </>
  );
}
