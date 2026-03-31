const sb = supabase.createClient(
    'https://htgimjbopofvupwfcqpb.supabase.co',
    'sb_publishable_IF-RqN8NsEyw4bWKz47XVA_3mDRA17z'
);

const bgImages = ['1.jpg', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg'];
let lastImg = null;

const scene = document.getElementById('scene');
const cardBg = document.getElementById('cardBg');
const citySelect = document.getElementById('citySelect');
const dateSelect = document.getElementById('dateSelect');

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    scene.addEventListener('mousemove', (e) => {
        const rect = scene.getBoundingClientRect();
        const x = (e.clientX - rect.left - rect.width / 2) / 15;
        const y = (e.clientY - rect.top - rect.height / 2) / 15;
        cardBg.style.transform = `translate(${-x}px, ${-y}px) scale(1.1)`;
    });

    scene.addEventListener('mouseleave', () => {
        cardBg.style.transform = 'translate(0, 0) scale(1.1)';
    });
}

function setBg() {
    let img;

    do {
        img = bgImages[Math.floor(Math.random() * bgImages.length)];
    } while (img === lastImg && bgImages.length > 1);

    lastImg = img;
    cardBg.style.backgroundImage = `url('image/${img}')`;
}

async function loadDates(city) {
    const { data, error } = await sb
        .from('Мероприятия')
        .select('Дата')
        .eq('Город', city)
        .order('Дата', { ascending: true });

    if (error) {
        console.error('Ошибка загрузки дат:', error);
        return [];
    }

    dateSelect.innerHTML = '';

    if (data && data.length > 0) {
        const uniqueDates = [...new Set(data.map(item => item.Дата))];

        uniqueDates.forEach(date => {
            const parts = date.split('-');
            const formatted = `${parts[2]}.${parts[1]}`;
            dateSelect.appendChild(new Option(formatted, date));
        });

        return uniqueDates;
    }

    return [];
}

async function getEvent(city, date) {
    const { data, error } = await sb
        .from('Мероприятия')
        .select('*')
        .eq('Город', city)
        .eq('Дата', date)
        .single();

    if (error) {
        console.error('Ошибка загрузки мероприятия:', error);
        return null;
    }

    return data;
}

function update(item) {
    if (!item) return;

    document.getElementById('uiCity').innerText = item.Город || 'ГОРОД';
    document.getElementById('uiAddr').innerText = item.Адрес || 'ЛОКАЦИЯ НЕ УКАЗАНА';

    const p = item.Дата.split('-');
    document.getElementById('uiDate').innerText = `${p[2]}.${p[1]}`;
    document.getElementById('uiYear').innerText = p[0];

    citySelect.value = item.Город;
    dateSelect.value = item.Дата;

    setBg();

    const anims = document.querySelectorAll('.animate-text');
    anims.forEach(el => {
        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = null;
    });
}

async function updateCardBySelection() {
    const city = citySelect.value;
    const date = dateSelect.value;

    if (!city || !date) return;

    const item = await getEvent(city, date);
    if (item) update(item);
}

citySelect.addEventListener('change', async (e) => {
    const dates = await loadDates(e.target.value);

    if (dates.length > 0) {
        dateSelect.value = dates[0];
        await updateCardBySelection();
    }
});

dateSelect.addEventListener('change', async () => {
    await updateCardBySelection();
});

async function init() {
    const { data: all, error } = await sb
        .from('Мероприятия')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        console.error('Ошибка инициализации:', error);
        return;
    }

    if (all && all.length > 0) {
        citySelect.innerHTML = '';

        const uniqueCities = [...new Set(all.map(item => item.Город))];
        uniqueCities.forEach(city => {
            citySelect.appendChild(new Option(city, city));
        });

        const firstEvent = all[0];
        citySelect.value = firstEvent.Город;

        await loadDates(firstEvent.Город);
        dateSelect.value = firstEvent.Дата;

        update(firstEvent);
    }
}

init();