// Настройка Supabase
const sb = supabase.createClient('https://htgimjbopofvupwfcqpb.supabase.co', 'sb_publishable_IF-RqN8NsEyw4bWKz47XVA_3mDRA17z');

// Массив фоновых картинок (должны лежать в папке image/)
const bgImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'];
let lastImg = null;

// Параллакс эффект для карточки
const scene = document.getElementById('scene');
const cardBg = document.getElementById('cardBg');

scene.onmousemove = (e) => {
    const rect = scene.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 15;
    const y = (e.clientY - rect.top - rect.height / 2) / 15;
    cardBg.style.transform = `translate(${-x}px, ${-y}px) scale(1.1)`;
};

// Функция выбора случайного фона
function setBg() {
    let img;
    do { 
        img = bgImages[Math.floor(Math.random() * bgImages.length)]; 
    } while (img === lastImg);
    lastImg = img;
    cardBg.style.backgroundImage = `url('image/${img}')`;
}

// Загрузка доступных дат для выбранного города из БД
async function loadDates(city) {
    const { data } = await sb.from('Мероприятия').select('Дата').eq('Город', city);
    const ds = document.getElementById('dateSelect');
    ds.innerHTML = ''; 
    
    if (data && data.length > 0) {
        data.forEach(d => {
            const fmt = d.Дата.split('-').reverse().slice(0, 2).join('.');
            ds.appendChild(new Option(fmt, d.Дата));
        });
    }
}

// Инициализация данных при загрузке страницы
async function init() {
    const { data: all } = await sb.from('Мероприятия').select('*').order('id', {ascending: true});
    
    if (all && all.length > 0) {
        const cs = document.getElementById('citySelect');
        cs.innerHTML = '';
        
        // Получаем список уникальных городов
        const uniqueCities = [...new Set(all.map(x => x.Город))];
        uniqueCities.forEach(c => cs.appendChild(new Option(c, c)));
        
        // По умолчанию выбираем первый город и загружаем его даты
        const firstEvent = all[0];
        cs.value = firstEvent.Город;
        await loadDates(firstEvent.Город);
        
        // Обновляем карточку данными первого мероприятия
        update(firstEvent);
    }
}

// Функция обновления интерфейса карточки
function update(item) {
    if (!item) return;

    document.getElementById('uiCity').innerText = item.Город;
    document.getElementById('uiAddr').innerText = item.Адрес || "ЛОКАЦИЯ НЕ УКАЗАНА";
    
    const p = item.Дата.split('-');
    document.getElementById('uiDate').innerText = `${p[2]}.${p[1]}`;
    document.getElementById('uiYear').innerText = p[0];
    
    // Синхронизируем выпадающий список даты
    document.getElementById('dateSelect').value = item.Дата;
    
    setBg();
    
    // Перезапуск анимации текста
    const anims = document.querySelectorAll('.animate-text');
    anims.forEach(el => { 
        el.style.animation = 'none'; 
        el.offsetHeight; // триггер перерисовки
        el.style.animation = null; 
    });
}

// Обработка смены города пользователем
document.getElementById('citySelect').onchange = async (e) => {
    await loadDates(e.target.value);
};

// Обработка клика по кнопке "Найти"
document.getElementById('searchBtn').onclick = async () => {
    const city = document.getElementById('citySelect').value;
    const date = document.getElementById('dateSelect').value;

    const { data } = await sb.from('Мероприятия').select('*')
        .eq('Город', city)
        .eq('Дата', date)
        .single();
        
    if (data) update(data);
};

// Запуск инициализации
init();