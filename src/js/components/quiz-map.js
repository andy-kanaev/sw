export const initQuizMap = async () => {
    const mapContainer = document.getElementById('quiz-map');
    if (!mapContainer) return;

    // Проверяем, загружена ли Yandex Maps API
    if (typeof ymaps3 === 'undefined') {
        console.error('Yandex Maps API не загружен');
        return;
    }

    try {
        // Ждем загрузки API
        await ymaps3.ready;

        // Импортируем необходимые модули
        const { YMap, YMapDefaultSchemeLayer } = ymaps3;
        
        // Импортируем спутниковый слой
        let SatelliteLayer = null;
        
        // Пробуем найти спутниковый слой в основных классах
        if (ymaps3.YMapSatelliteLayer) {
            SatelliteLayer = ymaps3.YMapSatelliteLayer;
        } else {
            // Пытаемся импортировать через ymaps3.import
            try {
                // Пробуем разные варианты импорта модулей слоев
                const layersModule = await ymaps3.import('@yandex/ymaps3-layers');
                if (layersModule) {
                    SatelliteLayer = layersModule.YMapSatelliteLayer || 
                                   layersModule.YMapSatelliteSchemeLayer;
                }
            } catch (e) {
                // Если не удалось, пробуем другой путь
                try {
                    const satelliteModule = await ymaps3.import('@yandex/ymaps3-satellite');
                    if (satelliteModule) {
                        SatelliteLayer = satelliteModule.YMapSatelliteLayer;
                    }
                } catch (e2) {
                    console.warn('Спутниковый слой не найден, используем стандартный слой');
                }
            }
        }

        // Границы для показа только Сахалина и Курильских островов
        // Координаты: [долгота, широта]
        const sakhalinBounds = [
            [141, 44], // Юго-запад (южные Курилы)
            [157, 54]  // Северо-восток (север Сахалина)
        ];

        // Центр карты между Сахалином и Курильскими островами
        const center = [149, 48.5]; // [долгота, широта]

        // Создаем карту с ограниченной областью видимости
        const map = new YMap(
            mapContainer,
            {
                location: {
                    bounds: sakhalinBounds, // Устанавливаем границы для показа только Сахалина и Курил
                    // Карта автоматически подстроит зум под эти границы
                },
                // Отключаем зум колесом мыши
                behaviors: ['drag', 'pinchZoom'] // убираем scrollZoom
            }
        );

        const siteColors = {
            primaryBlue: '#3B6F7E',
            primaryGreen: '#3F9288',
            primaryGreenDark: '#00202B',
            accentOrange: '#EA7D40',
            accentOrangeLogo: '#FF3214',
            accentOrangeLogoDark: '#AB1109',
            mainBackground: '#3B6F7E', // primary-blue
            mainText: '#A8C4CE' // примерно lightness +55% от primary-blue
        };

        // Добавляем слой с кастомными стилями в палитре сайта
        const layerConfig = {
            customization: [
                // Скрываем воду
                {
                    tags: { all: ['water'] },
                    elements: 'geometry',
                    stylers: [ { color: siteColors.primaryBlue }]
                },
                
            ]
        };

        if (SatelliteLayer) {
            console.log('Используется спутниковый слой');
            const satelliteLayer = new SatelliteLayer(layerConfig);
            map.addChild(satelliteLayer);
        } else {
            console.log('Спутниковый слой недоступен, используем стандартный слой');
            // Используем стандартный слой с customization для скрытия воды
            const layer = new YMapDefaultSchemeLayer(layerConfig);
            map.addChild(layer);
        }

        // Устанавливаем границы для ограничения видимой области
        // Карта будет показывать только Сахалин и Курильские острова
        // При необходимости можно добавить обработчик событий для ограничения перемещения
        // Но для начала просто установим bounds - это уже ограничит видимую область
    } catch (error) {
        console.error('Ошибка инициализации карты:', error);
    }
};
