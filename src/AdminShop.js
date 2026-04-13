import { useState, useEffect } from 'react';
import { Panel, Div, Button, Card, ModalRoot, ModalCard } from '@vkontakte/vkui';
import { Icon28ChevronBack, Icon24Cancel } from '@vkontakte/icons';
import { CustomText } from './CustomTypography';

import tasksIcon from './imgs/tasks.png'

const inputStyle = {
    padding: 10,
    paddingRight: 12,
    marginBottom: 12,
    borderRadius: 8,
    border: '1px solid #ccc',
    fontSize: 14,
};

export default function AdminShop({ id, user, goBack }) {
    const [items, setItems] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [activeItem, setActiveItem] = useState(null);
    const [editItem, setEditItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [tempImage, setTempImage] = useState(null);

    const [newItem, setNewItem] = useState({
        title: '',
        description: '',
        price: '',
        image: '',
    });

    const loadShop = async () => {
        const res = await fetch(`http://localhost:3001/api/admin/shop?userId=${user.id}`);
        const data = await res.json();
        setItems(data);
    };

    useEffect(() => {
        loadShop();
    }, [user.id]);

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

    const saveNewItem = async () => {
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

    setNewItem({ title: '', description: '', price: '' });
        setTempImage(null);
        setActiveModal(null);
    };

    const saveEditItem = async () => {
        await fetch(`http://localhost:3001/api/admin/shop/${editItem.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                title: editItem.title,
                description: editItem.description,
                price: Number(editItem.price),
                image: tempImage,
            }),
        });

        setItems(prev =>
            prev.map(i =>
                i.id === editItem.id ? { ...editItem, image: tempImage } : i
            )
        );

        setEditItem(null);
        setTempImage(null);
        setActiveModal(null);
    };

    const deleteItem = async () => {
        await fetch(`http://localhost:3001/api/admin/shop/${activeItem.id}`, {
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

        const res = await fetch('http://localhost:3001/api/admin/upload/shop-image', {
            method: 'POST',
            body: formData,
        });

        const data = await res.json();

        if (data.imagePath) {
            onSuccess(data.imagePath);
        }

        setUploading(false);
    };

  return (
    <>
        <ModalRoot activeModal={activeModal}>
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
                  Задания (админка)
                </CustomText>
              </div>
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
                    архив артефактов (пусто)
                  </CustomText>
                </div>
                </div>
                {items.map(item => (
                    <Card
                    key={item.id}
                    style={{
                        padding: 12,
                        marginBottom: 8,
                        border: '1px solid #ceaeff',
                        borderRadius: 12
                    }}
                    >
                    <CustomText weight="1">{item.title}</CustomText>

                    <CustomText style={{ fontSize: 12, color: '#8c64d7' }}>
                        Цена: {item.price}
                    </CustomText>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                        <Button
                        size="s"
                        onClick={() => {
                            setEditItem(item);
                            setTempImage(item.image);
                            setActiveModal('edit');
                        }}
                        >
                        ✏️ Редактировать
                        </Button>

                        <Button
                        size="s"
                        mode="destructive"
                        onClick={() => {
                            setActiveItem(item);
                            setActiveModal('delete');
                        }}
                        >
                        🗑 Удалить
                        </Button>
                    </div>
                    </Card>
                ))}
            </Card>
        </Div>
      </Panel>
    </>
  );
}
