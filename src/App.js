import bridge from '@vkontakte/vk-bridge';
import { useState, useEffect } from 'react';
import { View, 
  Panel,
  Div, 
  Gallery,
  Card,
  Accordion,
  Separator } from '@vkontakte/vkui';
import { CustomText } from './CustomTypography';

import Balance from './Balance';
import Gift from './Gift';
import Tasks from './Tasks';
import Rating from './Rating';
import ShopLow from './ShopLow';
import ShopMedium from './ShopMedium';
import ShopHigh from './ShopHigh';
import Profile from './Profile';
import AdminTasks from './AdminTasks';
import AdminPurchases from './AdminPurchases';
import Purchases from './Purchases';
import Guide from './Guide';
import Achievements from './Achievements';

import image1 from './imgs/1.png'
import coinsIcon from './imgs/coins.png'
import coinIcon from './imgs/coin.png'
import giftImg from './imgs/gift.png'
import tasksIcon from './imgs/tasks.png'
import awardsIcon from './imgs/awards.png'
import cupsIcon from './imgs/cups.png'
import box1icon from './imgs/box1.png'
import box2icon from './imgs/box2.png'
import box3icon from './imgs/box3.png'

export default function App() {
  const images = [image1];
  
  const [activePanel, setActivePanel] = useState('main');
  const [openedFaq, setOpenedFaq] = useState(null);
  const [user, setUser] = useState(null);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [canClaimGift, setCanClaimGift] = useState(false);
  const [giftTimeLeft, setGiftTimeLeft] = useState('00:00:00');
  const [usersList, setUsersList] = useState([]);
  const [lastTasks, setLastTasks] = useState([]);

  const getPlaceStyles = (place) => {
    switch (place) {
      case 1:
        return { backgroundColor: '#8c64d7', color: '#fff', fontWeight: 700 };
      case 2:
        return { backgroundColor: '#ceaeff', color: '#000', fontWeight: 600 };
      case 3:
        return { backgroundColor: '#eaddff', color: '#000' };
      default:
        return { backgroundColor: '#f2f2f2', color: '#000' };
    }
  };

  const go = (panel) => setActivePanel(panel);

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const userInfo = await bridge.send('VKWebAppGetUserInfo');
        setUser(userInfo);

        await fetch(`http://localhost:3001/api/user/${userInfo.id}/updateName`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            first_name: userInfo.first_name,
            last_name: userInfo.last_name
          })
        });
      } catch (error) {
        console.error('Ошибка получения данных пользователя', error);
      }
    }

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    async function fetchAll() {
      const res = await fetch(`http://localhost:3001/api/user/${user.id}`);
      const data = await res.json();

      setUser(prev => (
        {
          ...prev,
          role: data.role,
          achievementCount: data.achievementCount
        }
      ));

      setBalance(data.balance);
      setTotalEarned(data.totalEarned);
      setTotalSpent(data.totalSpent || 0);

      const today = new Date().toISOString().slice(0, 10);
      const canClaim = data.last_gift_date !== today;

      setCanClaimGift(canClaim);

      if (!canClaim) {
        setGiftTimeLeft(calculateTimeLeft());
      } else {
        setGiftTimeLeft('00:00:00');
      }
    }

    fetchAll();
  }, [user]);

  useEffect(() => {
    if (canClaimGift) return;

    const interval = setInterval(() => {
      setGiftTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, [canClaimGift]);

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/users');
      const data = await res.json();
      setUsersList(data);
    } catch (error) {
      console.error('Ошибка получения списка пользователей', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchLastTasks() {
      try {
        const res = await fetch(`http://localhost:3001/api/tasks/${user.id}`);
        const data = await res.json();

        // сортируем по дате создания (НОВЫЕ СВЕРХУ)
        const sorted = [...data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        setLastTasks(sorted.slice(0, 3));
      } catch (e) {
        console.error('Ошибка загрузки заданий для превью', e);
      }
    }

    fetchLastTasks();
  }, [user]);

  function calculateTimeLeft() {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setHours(24, 0, 0, 0);

    const diff = tomorrow - now;

    if (diff <= 0) return '00:00:00';

    const hours = String(Math.floor(diff / 1000 / 60 / 60)).padStart(2, '0');
    const minutes = String(Math.floor(diff / 1000 / 60) % 60).padStart(2, '0');
    const seconds = String(Math.floor(diff / 1000) % 60).padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  }

  const goBack = () => {
    setActivePanel('main');
  };
  const goToBalance = () => setActivePanel('balance');
  const goToGift = () => setActivePanel('gift');
  const goToRating = () => setActivePanel('rating');
  const goToShopLow = () => setActivePanel('shoplow');
  const goToShopMedium = () => setActivePanel('shopmedium');
  const goToShopHigh = () => setActivePanel('shophigh');
  const goToProfile = () => setActivePanel('profile');
  const goToTasks = () => {
    if (user?.role === 'admin') {
      setActivePanel('adminTasks');
    } else {
      setActivePanel('tasks');
    }
  }
  const goToPurchases = () => setActivePanel('purchases');
  const goToGuide = () => setActivePanel('guide');
  const goToAchievements = () => setActivePanel('achievements');

  useEffect(() => {
    if (user) {
      fetchUsers();
    }
  }, [user, balance, totalEarned]);

  const isUserInTop3 = (() => {
    if (!user || usersList.length === 0) return false;

    const sorted = [...usersList].sort(
      (a, b) => b.totalEarned - a.totalEarned
    );

    const index = sorted.findIndex(u => u.id === user.id);
    return index >= 0 && index < 3;
  })();

  return (
    <div style={{ fontFamily: "'Noto Sans Lao', sans-serif" }}>
    <View activePanel={activePanel}>
      <Panel id="main">

        <Div style={{ height: 20, backgroundColor: '#ceaeff' }} />

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
            transform: showHeader ? 'translateY(0)' : 'translateY(-100%)',
            transition: 'transform 0.25s ease',
          }}
        >
          {/* Аватар */}
          {user?.photo_200 && (
            <img
              src={user.photo_200}
              alt="avatar"
              onClick={goToProfile}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                objectFit: 'cover',
                marginRight: 12,
                cursor: 'pointer',
              }}
            />
          )}

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
            weight='1'
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

        { /* Галерея с 2 картинками сверху */ }
        <Div style={{ padding: 0 }}>
          <Gallery
            slideWidth="100%"
            bullets="light"
            style={{ height: window.innerWidth < 768 ? 250 : 400 }}
            timeout={4000}
            looped
          >
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`Slide ${i + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            ))}
          </Gallery>
        </Div>

        <Div style={{ 
          padding: '16px 16px 0px 16px',
          backgroundColor: '#ceaeff',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gridTemplateRows: 'auto auto',
          gap: '12px',
          position: 'relative',
          marginTop: '-40px',
          zIndex: 10,
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
         }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Баланс */}
            <Card
              mode="shadow"
              style={{
                borderRadius: 12,
                padding: '8px 10px 20px 18px',
                display: 'flex',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={goToBalance}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div>
                  <CustomText weight="1" style={{ fontSize: window.innerWidth < 768 ? 9 : 12, color: '#000', paddingBottom: 3 }}>
                    Баланс
                  </CustomText>
                  <CustomText style={{ fontSize: window.innerWidth < 768 ? 25 : 30, fontWeight: 1000, color: '#8c64d7' }}>
                    {balance}
                  </CustomText>
                </div>
                <img
                  src={coinsIcon}
                  alt="coins"
                  style={{ width: window.innerWidth < 768 ? 70 : 80, height: window.innerWidth < 768 ? 70 : 80, objectFit: 'contain', paddingLeft: '100px', position: 'absolute', right: window.innerWidth < 768 ? 3 : 0, bottom: window.innerWidth < 768 ? 1 : -4 }}
                />
              </div>
            </Card>

            {/* Награда за вход */}
            <Card
              mode="shadow"
              style={{
                borderRadius: 12,
                padding: '8px 10px 14px 18px',
                display: 'flex',
                backgroundColor: '#ffffff',
                cursor: 'pointer',
              }}
              onClick={goToGift}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  zIndex: 2,
                }}
              >
                <CustomText weight="1" style={{ fontSize: window.innerWidth < 768 ? 9 : 12, color: '#000', paddingBottom: 2 }}>
                  Ежедневный вход
                </CustomText>

                {canClaimGift ? (
                  <div
                    onClick={goToGift}
                    style={{
                      display: 'flex',
                      padding: '2px 15px',
                      backgroundColor: '#8c64d7',
                      borderRadius: 999,
                      cursor: 'pointer',
                    }}
                  >
                    <CustomText
                      weight="1"
                      style={{
                        fontSize: window.innerWidth < 768 ? 9 : 12,
                        color: '#fff',
                      }}
                    >
                      получить
                    </CustomText>
                  </div>
                ) : (
                  <CustomText
                    style={{
                      fontSize: window.innerWidth < 768 ? 19 : 30,
                      color: '#8c64d7',
                      fontWeight: 1000,
                    }}
                  >
                    {giftTimeLeft}
                  </CustomText>
                )}
              </div>

              <img
                src={giftImg}
                alt="gift"
                style={{ width: window.innerWidth < 768 ? 75 : 90, height: window.innerWidth < 768 ? 75 : 90, objectFit: 'contain', paddingLeft: '100px', position: 'absolute', right: -3, bottom: window.innerWidth < 768 ? -5 : -11 }}
              />
            </Card>
          </div>
          
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              padding: '12px 12px 7px 12px',
              backgroundColor: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              cursor: 'pointer',
              overflow: 'hidden',
            }}
            onClick={goToAchievements}
          >
            <img
              src={awardsIcon}
              alt="awards"
              style={{
                position: 'absolute',
                top: -20,
                right: -30,
                width: window.innerWidth < 768 ? 180 : 200,
                height: window.innerWidth < 768 ? 180 : 200,
                objectFit: 'contain',
                pointerEvents: 'none',
                transform: 'rotate(15deg)',
              }}
            />

            <CustomText
              weight="1"
              style={{
                fontSize: window.innerWidth < 768 ? 10 : 12,
                color: '#000',
                marginTop: 109,
                marginLeft: 4,
              }}
            >
              Достижения
            </CustomText>
          </Card>
        </Div>

        <Div
          style={{
            padding: '16px 16px 16px 16px',
            backgroundColor: '#ceaeff',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '12px',
          }}
        >
          <Card
            mode="shadow"
            style={{
                borderRadius: 12,
                padding: '8px 5px 0px 18px',
                display: 'flex',
                backgroundColor: '#ffffff',
                overflow: 'hidden',
              }}
          >
            <img
              src={tasksIcon}
              alt="tasks"
              style={{
                position: 'absolute',
                top: window.innerWidth < 768 ? -5 : -5,
                right: -25,
                width: window.innerWidth < 768 ? 170 : 220,
                height: window.innerWidth < 768 ? 170 : 220,
                objectFit: 'contain',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            <div style={{ zIndex: 2, position: 'relative', width: '66%' }}>
              {/* Заголовок */}
              <CustomText
                weight="1"
                style={{ fontSize: window.innerWidth < 768 ? 9 : 12, color: '#000', paddingBottom: 3 }}
              >
                Задания
              </CustomText>

              <div
                style={{
                  position: 'absolute',
                  top: window.innerWidth < 768 ? 0 : 2,
                  right: window.innerWidth < 768 ? 5 : 10,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  height: window.innerWidth < 768 ? 18 : 22,
                  padding: '0 8px',

                  backgroundColor: '#8c64d7',
                  borderRadius: 999,
                  cursor: 'pointer',
                }}
                onClick={goToTasks}
              >
                <span
                  style={{
                    fontSize: window.innerWidth < 768 ? 8 : 10,
                    color: '#fff',
                    fontWeight: 600,
                    lineHeight: 1,
                  }}
                >
                  все
                </span>
              </div>

              {/* Последние задания */}
              <div style={{ marginTop: window.innerWidth < 768 ? 3 : 10, display: 'flex', flexDirection: 'column', gap: 6, width: '100%', paddingBottom: 15 }}>
                {lastTasks.length === 0 ? (
                  <CustomText weight='1' style={{ fontSize: 14, color: '#000', textAlign: 'center', marginTop: 35 }}>
                    Заданий пока нет
                  </CustomText>
                ) : (
                  lastTasks.map(task => (
                    <div
                      key={task.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: window.innerWidth < 768 ? '0px 7px' : '6px 10px',
                        borderRadius: 999,
                        backgroundColor: '#ffffff',
                        border: '1px solid #8c64d7',
                        fontSize: window.innerWidth < 768 ? 9 : 12,
                      }}
                    >
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '70%',
                          fontWeight: 300,
                          color: '#000',
                        }}
                      >
                        {task.title}
                      </span>

                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: window.innerWidth < 768 ? 12 : 14,
                          fontWeight: 600,
                          color: '#8c64d7',               // цвет награды остаётся фиолетовым
                        }}
                      >
                        <img
                          src={coinIcon}
                          alt="coins"
                          style={{ width: 25, height: 25, objectFit: 'contain' }}
                        />
                        {task.reward}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </Div>

        <Div
          style={{
            padding: '16px 16px 16px 16px',
            backgroundColor: '#ceaeff',
          }}
        >
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '8px 18px 18px 18px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={goToRating}
          >
            <img
                src={cupsIcon}
                alt="cups"
                style={{
                  position: 'absolute',
                  top: isUserInTop3 ? 63 : 70,
                  left: isUserInTop3 ? 74 : 77,
                  transform: 'translate(-50%, -50%)',
                  width: isUserInTop3 ? 150 : 150,
                  height: isUserInTop3 ? 150 : 150,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />

            <div style={{ position: 'relative', marginLeft: isUserInTop3 ? 130 : 135 }}>
              {/* Заголовок */}
              <CustomText
                weight="1"
                style={{
                  fontSize: window.innerWidth < 768 ? 10 : 12,
                  color: '#000',
                }}
              >
                Рейтинг
              </CustomText>

              {/* Таблица рейтинга */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: window.innerWidth < 768 ? 3 : 6 }}>
                {usersList
                  .sort((a, b) => b.totalEarned - a.totalEarned)
                  .slice(0, 3)
                  .map((u, index) => {
                    const place = index + 1;
                    const PlaceStyle = getPlaceStyles(place);

                    return (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 12px',
                          borderRadius: 999,
                          backgroundColor: user && user.id === u.id ? '#f0edff' : '#f7f7f7',
                          color: '#8c64d7',
                          fontSize: window.innerWidth < 768 ? 9 : 11,
                          ...PlaceStyle,
                          
                        }}
                      >
                        <span>{index + 1}.</span>
                        <span>{u.first_name} {u.last_name}</span>
                        <span>{u.totalEarned}</span>
                      </div>
                    );
                  })}

                {/* Текущий пользователь */}
                {user && (() => {
                  const allSorted = [...usersList].sort((a, b) => b.totalEarned - a.totalEarned);
                  const currentIndex = allSorted.findIndex(u => u.id === user.id);
                  if (currentIndex >= 3) {
                    const currentUser = allSorted[currentIndex];
                    return (
                      <div
                        key={currentUser.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '4px 12px',
                          borderRadius: 999,
                          fontWeight: 600,
                          fontSize: window.innerWidth < 768 ? 9 : 11,
                          ...getPlaceStyles(currentIndex + 1),
                        }}
                      >
                        <span>{currentIndex + 1}.</span>
                        <span>{currentUser.first_name} {currentUser.last_name}</span>
                        <span>{currentUser.totalEarned}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </Card>
        </Div>

        <Div style={{ padding: '16px', backgroundColor: '#ceaeff' }}>
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '12px',
            }}
          >
            <CustomText weight="1" style={{ fontSize: window.innerWidth < 768 ? 10 : 12, color: '#000', lineHeight: window.innerWidth < 768 ? '12px' : '16px' }}>
              Магазин артефактов
            </CustomText>

            <CustomText
              style={{
                fontSize: window.innerWidth < 768 ? 9 : 10,
                color: '#000',
                lineHeight: window.innerWidth < 768 ? '14px' : '16px'
              }}
            >
              выбирай и покупай за капиталы
            </CustomText>
          </Card>
          {/* Карточки */}
          <Div
            style={{
              display: 'grid',
              gridTemplateColumns: window.innerWidth < 768 ? '2fr 3fr 3fr' :'1fr 2fr 3fr',
              gap: '12px',
              marginTop: 12,
              padding: 0,
            }}
          >

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer', 
                overflow: 'hidden',
                height: window.innerWidth < 768 ? '100px' : '120px',
              }} 
              onClick={() => goToShopLow()}
            >
              <img
                src={box1icon}
                alt="box1"
                style={{
                  position: 'absolute',
                  right: window.innerWidth < 768 ? -22 : -24,
                  bottom: -15,
                  width: window.innerWidth < 768 ? 120 : 140,
                  height: window.innerWidth < 768 ? 120 : 140,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <CustomText weight='1' style={{fontSize: window.innerWidth < 768 ? 10 : 14, color: '#000', lineHeight: window.innerWidth < 768 ? '11px' : '14px' }} >от 100</CustomText>
              <CustomText style={{fontSize: window.innerWidth < 768 ? 9 : 12, color: '#000', lineHeight: window.innerWidth < 768 ? '11px' : '14px' }}>капиталов</CustomText>
            </Card>

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer', 
                overflow: 'hidden',
                height: window.innerWidth < 768 ? '100px' : '120px', }} 
              onClick={() => goToShopMedium()}
            >
              <img
                src={box2icon}
                alt="box2"
                style={{
                  position: 'absolute',
                  right: window.innerWidth < 768 ? -10 : 3,
                  bottom: window.innerWidth < 768 ? -25 : -31,
                  width: window.innerWidth < 768 ? 140 : 180,
                  height: window.innerWidth < 768 ? 140 : 180,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <CustomText weight='1' style={{fontSize: window.innerWidth < 768 ? 10 : 14, color: '#000', lineHeight: window.innerWidth < 768 ? '11px' : '14px' }} >от 500</CustomText>
              <CustomText style={{fontSize: window.innerWidth < 768 ? 9 : 12, color: '#000', lineHeight: window.innerWidth < 768 ? '11px' : '14px' }}>капиталов</CustomText>
            </Card>

            <Card mode="shadow" 
              style={{ borderRadius: 14,
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer', 
                overflow: 'hidden',
                height: window.innerWidth < 768 ? '100px' : '120px', }} 
              onClick={() => goToShopHigh()}
            >
              <img
                src={box3icon}
                alt="box3"
                style={{
                  position: 'absolute',
                  right: window.innerWidth < 768 ? -7 : -5,
                  bottom: window.innerWidth < 768 ? -18 : -27,
                  width: window.innerWidth < 768 ? 130 : 190,
                  height: window.innerWidth < 768 ? 130 : 190,
                  objectFit: 'contain',
                  pointerEvents: 'none',
                }}
              />
              <CustomText weight='1' style={{fontSize: window.innerWidth < 768 ? 10 : 14, color: '#000', lineHeight: window.innerWidth < 768 ? '11px' : '14px' }} >от 1000</CustomText>
              <CustomText style={{fontSize: window.innerWidth < 768 ? 10 : 12, color: '#000', lineHeight: window.innerWidth < 768 ? '11px' : '14px' }}>капиталов</CustomText>
            </Card>
          </Div>
        </Div>

        <Div style={{ padding: '16px', backgroundColor: '#ceaeff' }}>
          <Card
            mode="shadow"
            style={{
              borderRadius: 12,
              backgroundColor: '#ffffff',
              padding: '16px',
            }}
          >
            <CustomText weight="1" style={{ fontSize: window.innerWidth < 768 ? 11 : 14, color: '#000' }}>
              Вопросы и ответы
            </CustomText>
            {/* Вопрос 1 */}
            <Accordion
              expanded={openedFaq === 1}
              onChange={() => setOpenedFaq(openedFaq === 1 ? null : 1)}
            >
              <Accordion.Summary>
                <CustomText weight="3" style={{ fontSize: window.innerWidth < 768 ? 10 : 13, color: '#000' }}>
                  Как получить капиталы?
                </CustomText>
              </Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <CustomText style={{ fontSize: window.innerWidth < 768 ? 9 : 11, color: '#000', lineHeight: '12px' }}>
                    Капиталы начисляются за выполнение заданий и активность в приложении.
                  </CustomText>
                </Div>
              </Accordion.Content>
            </Accordion>

            <Separator
              style={{ margin: '0 16px 0 16px' }}
            />

            {/* Вопрос 2 */}
            <Accordion
              expanded={openedFaq === 2}
              onChange={() => setOpenedFaq(openedFaq === 2 ? null : 2)}
            >
              <Accordion.Summary>
                <CustomText weight="3" style={{ fontSize: window.innerWidth < 768 ? 10 : 13, color: '#000' }}>
                  где посмотреть мои достижения?
                </CustomText>
              </Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <CustomText style={{ fontSize: window.innerWidth < 768 ? 9 : 11, color: '#000', lineHeight: '12px' }}>
                    Твои достижения в профиле!
                  </CustomText>
                </Div>
              </Accordion.Content>
            </Accordion>

            <Separator
              style={{ margin: '0 16px 0 16px' }}
            />

            {/* Вопрос 3 */}
            <Accordion
              expanded={openedFaq === 3}
              onChange={() => setOpenedFaq(openedFaq === 3 ? null : 3)}
            >
              <Accordion.Summary>
                <CustomText weight="3" style={{ fontSize: window.innerWidth < 768 ? 10 : 13, color: '#000' }}>
                  как обменять капиталы на подарки?
                </CustomText>
              </Accordion.Summary>
              <Accordion.Content>
                <Div>
                  <CustomText style={{ fontSize: window.innerWidth < 768 ? 9 : 11, color: '#000', lineHeight: '12px' }}>
                    Выберите подарок и следуйте инструкции по обмену капиталов.
                  </CustomText>
                </Div>
              </Accordion.Content>
            </Accordion>

            <Separator
              style={{ margin: '0 16px 0 16px' }}
            />
          </Card>
        </Div>
      </Panel>

      {/* Панель Баланс */}
      <Balance id="balance" goBack={goBack} balance={balance} goToTasks={goToTasks} totalEarned={totalEarned} userId={user?.id} totalSpent={totalSpent} />

      {/* Панель подарок за вход*/}
      <Gift id="gift" goBack={goBack} balance={balance} goToBalance={goToBalance} />

      {/* Панель Список заданий */}
      <Tasks id="tasks" goBack={goBack} balance={balance} goToBalance={goToBalance} user={user} />

      {/* Панель Админка заданий */}
      <AdminTasks id="adminTasks" goBack={goBack} user={user} goToBalance={goToBalance} balance={balance} />

      {/* Панель Рейтинг */}
      <Rating id="rating" goBack={goBack} balance={balance} goToBalance={goToBalance} />

      {/* Панель Магазина от 100 до 500*/}
      <ShopLow id="shoplow" goBack={goBack} go={go} balance={balance} goToBalance={goToBalance} user={user} />

      {/* Панель Магазина от 500 до 1000*/}
      <ShopMedium id="shopmedium" goBack={goBack} go={go} balance={balance} goToBalance={goToBalance} user={user} />

      {/* Панель Магазина от 1000*/}
      <ShopHigh id="shophigh" goBack={goBack} go={go} balance={balance} goToBalance={goToBalance} user={user} />

      {/* Панель профиля */}
      <Profile id="profile" goBack={goBack} user={user} balance={balance} goToPurchases={goToPurchases} goToGuide={goToGuide} goToAchievements={goToAchievements} goToBalance={goToBalance} />

      {/* Панель админ-получения */}
      <AdminPurchases id="adminPurchases" goBack={goBack} user={user} balance={balance} />

      {/* Панель настроек */}
      <Purchases id="purchases" goBack={goBack} user={user}/>

      {/* Панель Справочника */}
      <Guide id="guide" goBack={goBack}/>

      {/* Панель достижения */}
      <Achievements id="achievements" goBack={goBack} balance={balance} goToBalance={goToBalance} user={user} totalEarned={totalEarned} />
    </View>
    </div>
  )
}